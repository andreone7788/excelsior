/**
 * ==============================================
 * 📅 BOOKINGS - DETTAGLIO PRENOTAZIONE
 * ==============================================
 * GET /api/bookings/:id → Dettaglio (solo owner o admin)
 * ==============================================
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma.client'
import { verifyToken } from '@/lib/jwt'

/**
 * GET - Dettaglio prenotazione
 */

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        // 1 Verifica autenticazione
        const token = request.cookies.get('token')?.value

        if (!token) {
            return NextResponse.json(
                { error: 'Autenticazione richiesta' },
                { status: 401 }
            )
        }

        const decoded = await verifyToken(token)

        if (!decoded || !decoded.userId) {
            return NextResponse.json(
                { error: 'Token non valido' },
                { status: 401 }
            )
        }

        const userId = decoded.userId
        const userRole = decoded.role

        // 2 Ottieni ID prenotazione
        const { id } = await params
        const bookingId = parseInt(id)

        if (isNaN(bookingId)) {
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
        if (booking.userId !== userId && userRole !== 'ADMIN') {
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
        console.error('Errore nel dettaglio prenotazione:', error)
        return NextResponse.json(
            { error: 'Errore interno del server' },
            { status: 500 }
        )
    }
}
