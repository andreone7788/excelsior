/**
 * ==============================================
 * 🔐 ADMIN - GESTIONE PRENOTAZIONE SINGOLA
 * ==============================================
 * PUT    /api/admin/bookings/:id → Aggiorna stato + Email
 * DELETE /api/admin/bookings/:id → Elimina prenotazione
 * ==============================================
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma.client'
import { verifyAdmin, handleAuthError } from '@/lib/auth-helpers'
import { updateBookingStatusSchema } from '@/lib/validations/booking'
import { sendBookingConfirmed, sendBookingRejected } from '@/lib/email/send'

/**
 * PUT - Aggiorna stato prenotazione (CONFERMA/RIFIUTA)
 * Invia email automatica all'utente
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        // 1 Verifica autenticazione e autorizzazione admin
        await verifyAdmin(request)

        // 2 Ottieni ID prenotazione da params
        const { id } = await params
        const bookingId = parseInt(id)

        if (isNaN(bookingId)) {
            return NextResponse.json({ error: 'ID prenotazione non valido' }, { status: 400 })
        }

        // 3 Verifica che la prenotazione esista
        const existingBooking = await prisma.booking.findUnique({
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

        if (!existingBooking) {
            return NextResponse.json(
                { error: 'Prenotazione non trovata' },
                { status: 404 }
            )
        }

        // 4 Parse e valida body
        const body = await request.json()
        const validateData = updateBookingStatusSchema.safeParse(body)

        if (!validateData.success) {
            return NextResponse.json(
                { error: 'Dati non validi', details: validateData.error.message },
                { status: 400 }
            )
        }

        const { status, reason } = validateData.data

        // 5 Aggiorna stato prenotazione
        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: { status },
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

        console.log(`Prenotazione ${bookingId} aggiornata a ${status}`)

        // 6 Formatta date per email
        const formatDate = (date: Date) => {
            return new Intl.DateTimeFormat('it-IT', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            }).format(date)
        }

        const checkInFormatted = formatDate(updatedBooking.startDate)
        const checkOutFormatted = formatDate(updatedBooking.endDate)

        // 7 Calcola prezzo totale
        const nights = Math.ceil(
            (new Date(updatedBooking.endDate).getTime() - new Date(updatedBooking.startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )

        // 8️ Invia email in base allo stato
        if (status === 'CONFIRMED') {
            // Prenotazione confermata
            await sendBookingConfirmed({
                to: updatedBooking.user.email,
                userName: `${updatedBooking.user.name} ${updatedBooking.user.surname}`,
                roomName: updatedBooking.room.name,
                checkIn: checkInFormatted,
                checkOut: checkOutFormatted,
                bookingId: updatedBooking.id,
                totalPrice: updatedBooking.totalPrice.toNumber()
            })

            console.log(`Email di conferma inviata a ${updatedBooking.user.email} per prenotazione ${bookingId}`)

        } else if (status === 'CANCELLED') {
            // Prenotazione rifiutata
            await sendBookingRejected({
                to: updatedBooking.user.email,
                userName: `${updatedBooking.user.name} ${updatedBooking.user.surname}`,
                roomName: updatedBooking.room.name,
                checkIn: checkInFormatted,
                checkOut: checkOutFormatted,
                bookingId: updatedBooking.id,
                reason: reason || 'Nessuna motivazione specificata'
            })

            console.log(`Email di rifiuto inviata a ${updatedBooking.user.email} per prenotazione ${bookingId}`)
        }
        return NextResponse.json({
            booking: {
                ...updatedBooking,
                nights,
                totalPrice: updatedBooking.room.price.toNumber() * nights
            },
            message: `Prenotazione ${status === 'CONFIRMED' ? 'confermata' : 'rifiutata'} con successo`
        }, { status: 200 })

    } catch (error) {
        console.error('Errore durante l\'aggiornamento della prenotazione:', error)
        return handleAuthError(error)
    }
}

/**
 * DELETE - Elimina prenotazione (solo admin)
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        // 1 Verifica autenticazione e autorizzazione admin
        await verifyAdmin(request)

        // 2 Ottieni ID prenotazione da params
        const { id } = await params
        const bookingId = parseInt(id)

        if (isNaN(bookingId)) {
            return NextResponse.json(
                { error: 'ID prenotazione non valido' },
                { status: 400 }
            )
        }

        // 3 Verifica che la prenotazione esista
        const existingBooking = await prisma.booking.findUnique({
            where: { id: bookingId }
        })

        if (!existingBooking) {
            return NextResponse.json(
                { error: 'Prenotazione non trovata' },
                { status: 404 }
            )
        }

        // 4 Elimina prenotazione
        await prisma.booking.delete({
            where: { id: bookingId }
        })

        console.log(`Prenotazione ${bookingId} eliminata`)

        return NextResponse.json(
            { message: 'Prenotazione eliminata con successo' },
            { status: 200 }
        )
    } catch (error) {
        console.error('Errore durante l\'eliminazione della prenotazione:', error)
        return handleAuthError(error)
    }
}