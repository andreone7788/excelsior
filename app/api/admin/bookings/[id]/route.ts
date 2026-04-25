/**
 * ==============================================
 * 🔐 ADMIN - GESTIONE PRENOTAZIONE SINGOLA
 * ==============================================
 * PUT    /api/admin/bookings/:id => Aggiorna stato + Email
 * DELETE /api/admin/bookings/:id => Elimina prenotazione
 * ==============================================
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma.client'
import { verifyAdmin, handleAuthError } from '@/lib/auth-helpers'
import { updateBookingStatusSchema } from '@/lib/validations/booking'
import { sendBookingConfirmed, sendBookingRejected, sendModificationApproved, sendModificationRejected } from '@/lib/email/send'
import { logger } from '@/lib/logger'

/**
 * PUT - Aggiorna stato prenotazione (CONFERMA/RIFIUTA)
 * Invia email automatica all'utente
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        // 1 Verifica autenticazione e autorizzazione admin
        const adminUserId = await verifyAdmin(request)

        // 2 Ottieni ID prenotazione da params
        const { id } = await params
        const bookingId = parseInt(id)

        if (isNaN(bookingId) || bookingId <= 0) {
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

        // Verifica se è una modifica
        const isModification = existingBooking.status === 'PENDING_MODIFICATION'

        // 5 Aggiorna stato prenotazione
        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status,
                // Se approvata modifica, resetta flag
                ...(status === 'CONFIRMED' && isModification ? {
                    isModification: false,
                    originalStartDate: null,
                    originalEndDate: null,
                    originalRoomId: null,
                } : {})
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

        logger.info(`Admin (ID: ${adminUserId}) ha aggiornato la prenotazione ${bookingId} a ${status}`)

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
            if (isModification) {
                // Template modifica approvata
                await sendModificationApproved({
                    to: updatedBooking.user.email,
                    userName: `${updatedBooking.user.name} ${updatedBooking.user.surname}`,
                    roomName: updatedBooking.room.name,
                    newDates: `${checkInFormatted} - ${checkOutFormatted}`,
                    bookingId: updatedBooking.id,
                    priceDifference: existingBooking.priceDifference?.toNumber() || 0,
                })

                logger.info(`Email modifica approvata inviata a ${updatedBooking.user.email} per prenotazione ${bookingId}`)
            } else {
                // Template prenotazione normale confermata
                await sendBookingConfirmed({
                    to: updatedBooking.user.email,
                    userName: `${updatedBooking.user.name} ${updatedBooking.user.surname}`,
                    roomName: updatedBooking.room.name,
                    checkIn: checkInFormatted,
                    checkOut: checkOutFormatted,
                    bookingId: updatedBooking.id,
                    totalPrice: updatedBooking.totalPrice.toNumber()
                })

                logger.info(`Email di conferma inviata a ${updatedBooking.user.email} per prenotazione ${bookingId}`)
            }
        } else if (status === 'CANCELLED') {
            if (isModification) {
                // Template modifica rifiutata (ripristina originale)
                await prisma.booking.update({
                    where: { id: bookingId },
                    data: {
                        startDate: existingBooking.originalStartDate!,
                        endDate: existingBooking.originalEndDate!,
                        roomId: existingBooking.originalRoomId!,
                        totalPrice: updatedBooking.totalPrice.toNumber() - (existingBooking.priceDifference?.toNumber() || 0),
                        status: 'CONFIRMED', // Ripristina a confermata
                        isModification: false,
                        originalStartDate: null,
                        originalEndDate: null,
                        originalRoomId: null,
                        priceDifference: null,
                    }
                })

                await sendModificationRejected({
                    to: updatedBooking.user.email,
                    userName: `${updatedBooking.user.name} ${updatedBooking.user.surname}`,
                    roomName: updatedBooking.room.name,
                    bookingId: updatedBooking.id,
                    reason: reason || 'Non specificato'
                })

                logger.info(`Email modifica rifiutata inviata a ${updatedBooking.user.email} per prenotazione ${bookingId}`)
                logger.info(`Prenotazione ripristinata allo stato originale`)
            } else {
                // Template prenotazione normale rifiutata
                await sendBookingRejected({
                    to: updatedBooking.user.email,
                    userName: `${updatedBooking.user.name} ${updatedBooking.user.surname}`,
                    roomName: updatedBooking.room.name,
                    checkIn: checkInFormatted,
                    checkOut: checkOutFormatted,
                    bookingId: updatedBooking.id,
                    reason: reason || 'Nessuna motivazione specificata'
                })

                logger.info(`Email di rifiuto inviata a ${updatedBooking.user.email} per prenotazione ${bookingId}`)
            }
        }

        return NextResponse.json({
            booking: {
                ...updatedBooking,
                nights,
                totalPrice: updatedBooking.totalPrice.toNumber()
            },
            message: `${isModification ? 'Modifica' : 'Prenotazione'} ${status === 'CONFIRMED' ? 'confermata' : 'rifiutata'} con successo`
        }, { status: 200 })

    } catch (error) {
        const { error: errorMessage, status } = handleAuthError(error);
        return NextResponse.json({ error: errorMessage }, { status });
    }
}

/**
 * DELETE - Elimina prenotazione (solo admin)
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        // 1 Verifica autenticazione e autorizzazione admin
        const adminUserId = await verifyAdmin(request)

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

        logger.info(`Admin (ID: ${adminUserId}) ha eliminato la prenotazione ${bookingId}`)

        return NextResponse.json(
            { message: 'Prenotazione eliminata con successo' },
            { status: 200 }
        )
    } catch (error) {
        const { error: errorMessage, status } = handleAuthError(error);
        return NextResponse.json({ error: errorMessage }, { status });
    }
}