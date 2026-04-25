/**
 * ==============================================
 * 📅 BOOKINGS - DETTAGLIO PRENOTAZIONE
 * ==============================================
 * GET /api/bookings/:id → Dettaglio (solo owner o admin)
 * PUT /api/bookings/:id → Modifica prenotazione (solo owner)
 * ==============================================
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma.client'
import { verifyAuth, handleAuthError } from '@/lib/auth-helpers'
import { requestBookingModificationSchema } from '@/lib/validations/booking'
import { sendModificationRequestToUser, sendModificationRequestToAdmin } from '@/lib/email/send'
import { logger } from '@/lib/logger'

/**
 * GET - Dettaglio prenotazione
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        // 1 Verifica autenticazione
        const { userId, role } = await verifyAuth(request)

        // 2 Ottieni ID prenotazione
        const { id } = await params
        const bookingId = parseInt(id)

        if (isNaN(bookingId) || bookingId <= 0) {
            return NextResponse.json(
                { error: 'ID prenotazione non valido' },
                { status: 400 }
            )
        }

        // 3 Trova prenotazione
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
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

        if (!booking) {
            return NextResponse.json(
                { error: 'Prenotazione non trovata' },
                { status: 404 }
            )
        }

        // 4 verifica permessi (solo owner o admin)
        if (booking.userId !== userId && role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Permessi insufficienti' },
                { status: 403 }
            )
        }

        // 5 Calcola info aggiuntive
        const startDate = new Date(booking.startDate)
        const endDate = new Date(booking.endDate)
        const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

        logger.info('Dettaglio prenotazione:', booking.id, 'Numero di notti:', nights)

        return NextResponse.json({
            booking: {
                ...booking,
                nights,
                totalPrice: booking.totalPrice.toNumber()
            }
        }, { status: 200 })

    } catch (error) {
        const { error: errorMessage, status } = handleAuthError(error);
        return NextResponse.json({ error: errorMessage }, { status });
    }
}

/**
 * PUT /api/bookings/:id
 * Richiesta modifica prenotazione (solo owner)
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // 1 Auth check
        const { userId } = await verifyAuth(request)

        if (!userId) {
            return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
        }

        // 2 Get booking ID
        const { id } = await params
        const bookingId = parseInt(id)

        if (isNaN(bookingId) || bookingId <= 0) {
            return NextResponse.json({ error: 'ID non valido' }, { status: 400 })
        }

        // 3 Trova prenotazione esistente
        const existingBooking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                room: true,
                user: {
                    select: { id: true, name: true, surname: true, email: true }
                }
            }
        })

        if (!existingBooking) {
            return NextResponse.json({ error: 'Prenotazione non trovata' }, { status: 404 })
        }

        // 4 Verifica owner
        if (existingBooking.userId !== userId) {
            return NextResponse.json({ error: 'Non puoi modificare prenotazioni altrui' }, { status: 403 })
        }

        // 5 Verifica status
        if (!['PENDING', 'CONFIRMED'].includes(existingBooking.status)) {
            return NextResponse.json(
                { error: 'Non puoi modificare prenotazioni cancellate o già in modifica' },
                { status: 400 }
            )
        }

        // 6 Parse e valida body
        const body = await request.json()
        const validation = requestBookingModificationSchema.parse(body)

        const { newStartDate, newEndDate, newRoomId, reason } = validation

        // 7 Prepara date
        const updatedStartDate = newStartDate ? new Date(newStartDate) : existingBooking.startDate
        const updatedEndDate = newEndDate ? new Date(newEndDate) : existingBooking.endDate
        const updatedRoomId = newRoomId || existingBooking.roomId

        // 8 Verifica disponibilità
        if (newRoomId || newStartDate || newEndDate) {
            const conflicts = await prisma.booking.findMany({
                where: {
                    id: { not: bookingId },
                    roomId: updatedRoomId,
                    status: { in: ['PENDING', 'CONFIRMED', 'PENDING_MODIFICATION'] },
                    OR: [
                        { startDate: { gte: updatedStartDate, lt: updatedEndDate } },
                        { endDate: { gt: updatedStartDate, lte: updatedEndDate } },
                        {
                            AND: [
                                { startDate: { lte: updatedStartDate } },
                                { endDate: { gte: updatedEndDate } }
                            ]
                        }
                    ]
                }
            })

            if (conflicts.length > 0) {
                return NextResponse.json(
                    { error: 'Camera non disponibile per le nuove date' },
                    { status: 409 }
                )
            }
        }

        // 9 Calcola differenza prezzo
        let priceDifference = 0

        if (newStartDate || newEndDate) {
            const oldNights = Math.ceil(
                (existingBooking.endDate.getTime() - existingBooking.startDate.getTime()) / (1000 * 60 * 60 * 24)
            )
            const newNights = Math.ceil(
                (updatedEndDate.getTime() - updatedStartDate.getTime()) / (1000 * 60 * 60 * 24)
            )

            const pricePerNight = existingBooking.totalPrice.toNumber() / oldNights
            priceDifference = (pricePerNight * newNights) - existingBooking.totalPrice.toNumber()
        }

        if (newRoomId && newRoomId !== existingBooking.roomId) {
            const newRoom = await prisma.room.findUnique({ where: { id: newRoomId } })
            if (newRoom) {
                const nights = Math.ceil(
                    (updatedEndDate.getTime() - updatedStartDate.getTime()) / (1000 * 60 * 60 * 24)
                )
                priceDifference += (newRoom.price.toNumber() - existingBooking.room.price.toNumber()) * nights
            }
        }

        // 10 Aggiorna prenotazione
        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: 'PENDING_MODIFICATION',
                isModification: true,
                originalStartDate: existingBooking.startDate,
                originalEndDate: existingBooking.endDate,
                originalRoomId: existingBooking.roomId,
                startDate: updatedStartDate,
                endDate: updatedEndDate,
                roomId: updatedRoomId,
                priceDifference,
                modificationReason: reason,
                totalPrice: existingBooking.totalPrice.toNumber() + priceDifference,
            },
            include: {
                room: true,
                user: { select: { id: true, name: true, surname: true, email: true } }
            }
        })

        // 11 Formatta date
        const formatDate = (date: Date) =>
            new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: 'long', year: 'numeric' }).format(date)

        // 12 Email utente
        await sendModificationRequestToUser({
            to: updatedBooking.user.email,
            userName: `${updatedBooking.user.name} ${updatedBooking.user.surname}`,
            roomName: updatedBooking.room.name,
            originalDates: `${formatDate(existingBooking.startDate)} - ${formatDate(existingBooking.endDate)}`,
            newDates: `${formatDate(updatedStartDate)} - ${formatDate(updatedEndDate)}`,
            bookingId: updatedBooking.id,
            priceDifference,
            reason
        })

        // 13 Email admin
        await sendModificationRequestToAdmin({
            userName: `${updatedBooking.user.name} ${updatedBooking.user.surname}`,
            userEmail: updatedBooking.user.email,
            roomName: updatedBooking.room.name,
            checkIn: formatDate(updatedStartDate),
            checkOut: formatDate(updatedEndDate),
            bookingId: updatedBooking.id,
        })

        logger.info(`Richiesta modifica prenotazione ${bookingId} da user ${userId}`)

        return NextResponse.json({
            booking: updatedBooking,
            message: 'Richiesta di modifica inviata! Riceverai conferma via email.'
        }, { status: 200 })

    } catch (error) {
        const { error: errorMessage, status } = handleAuthError(error)
        return NextResponse.json({ error: errorMessage }, { status })
    }
}