import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma.client'
import { handleAuthError, verifyAuth } from '@/lib/auth-helpers'
import { createBookingSchema } from '@/lib/validations/booking'
import { sendBookingRequestToUser, sendBookingRequestToAdmin } from '@/lib/email/send'
import { logger } from '@/lib/logger'

/** 
 * POST: Crea una nuova prenotazione (solo utenti autenticati)
 * - Verifica autenticazione
 * - Valida input
 * - Verifica disponibilità camera
 * - Calcola prezzo totale
 * - Crea prenotazione
 */

export async function POST(request: NextRequest) {
    try {
        // 1 Verifica autenticazione
        const { userId, role } = await verifyAuth(request)

        if (!userId) {
            return NextResponse.json(
                { error: 'Autenticazione richiesta' },
                { status: 401 }
            )
        }

        if (role === 'ADMIN') {
            return NextResponse.json(
                { error: 'Solo gli utenti possono creare prenotazioni' },
                { status: 403 }
            )
        }

        // 2 Parse e valida body
        const body = await request.json()
        const validatedData = createBookingSchema.parse(body)

        const { roomId, startDate, endDate } = validatedData

        // Converti stringhe in Date
        const checkInDate = new Date(startDate)
        const checkOutDate = new Date(endDate)

        // 3 Verifica camera
        const room = await prisma.room.findUnique({
            where: { id: roomId }
        })

        if (!room) {
            return NextResponse.json(
                { error: 'Camera non trovata' },
                { status: 404 }
            )
        }

        // 4 Verifica disponibilità
        const existingBookings = await prisma.booking.findMany({
            where: {
                roomId: roomId,
                status: { in: ['PENDING', 'CONFIRMED'] },
                OR: [
                    {
                        startDate: {
                            gte: checkInDate,
                            lt: checkOutDate
                        }
                    },
                    {
                        endDate: {
                            gt: checkInDate,
                            lte: checkOutDate
                        }
                    },
                    {
                        AND: [
                            { startDate: { lte: checkInDate } },
                            { endDate: { gte: checkOutDate } }
                        ]
                    }
                ]
            }
        })

        if (existingBookings.length > 0) {
            return NextResponse.json(
                { error: 'Camera non disponibile per le date selezionate' },
                { status: 409 }
            )
        }

        // 5 Calcola notti e prezzo
        const nights = Math.ceil(
            (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
        )

        if (nights < 1) {
            return NextResponse.json(
                { error: 'Il check-out deve essere dopo il check-in' },
                { status: 400 }
            )
        }

        const totalPrice = room.price.toNumber() * nights

        // 6 Crea prenotazione
        const booking = await prisma.booking.create({
            data: {
                userId,
                roomId,
                startDate: checkInDate,
                endDate: checkOutDate,
                totalPrice,
                status: 'PENDING'
            },
            include: {
                room: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        surname: true,
                        email: true
                    }
                }
            }
        })

        logger.info('Prenotazione creata:', booking.id)

        // 7 Formatta date
        const formatDate = (date: Date) => {
            return new Intl.DateTimeFormat('it-IT', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            }).format(date)
        }

        const checkInFormatted = formatDate(checkInDate)
        const checkOutFormatted = formatDate(checkOutDate)

        // 8 Email utente
        await sendBookingRequestToUser({
            to: booking.user.email,
            userName: `${booking.user.name} ${booking.user.surname}`,
            roomName: booking.room.name,
            checkIn: checkInFormatted,
            checkOut: checkOutFormatted,
            bookingId: booking.id
        })

        // 9 Email admin
        await sendBookingRequestToAdmin({
            userName: `${booking.user.name} ${booking.user.surname}`,
            userEmail: booking.user.email,
            roomName: booking.room.name,
            checkIn: checkInFormatted,
            checkOut: checkOutFormatted,
            bookingId: booking.id
        })

        logger.info('Email inviate per prenotazione:', booking.id)

        // 10 Response
        return NextResponse.json(
            {
                booking: {
                    ...booking,
                    nights,
                    pricePerNight: room.price.toNumber()
                },
                message: 'Prenotazione creata. Riceverai una conferma via email.'
            },
            { status: 201 }
        )

    } catch (error) {
        const { error: errorMessage, status } = handleAuthError(error);
        return NextResponse.json({ error: errorMessage }, { status });
    }
}