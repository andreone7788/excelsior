/**
 * ==============================================
 * 📅 BOOKINGS - DETTAGLIO PRENOTAZIONE
 * ==============================================
 * GET /api/bookings/:id → Dettaglio (solo owner o admin)
 * ==============================================
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma.client'
import { verifyAuth, handleAuthError } from '@/lib/auth-helpers'

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

        console.log('Dettaglio prenotazione:', booking.id, 'Numero di notti:', nights)

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
