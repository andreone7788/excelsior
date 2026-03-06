/**
 * ==============================================
 * 🔐 ADMIN - GESTIONE PRENOTAZIONI (LISTA)
 * ==============================================
 * GET /api/admin/bookings → Lista tutte le prenotazioni
 * ==============================================
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma.client'
import { verifyAdmin, handleAuthError } from '@/lib/auth-helpers'
import type { Prisma } from '@prisma/client'

/**
 * GET - Lista tutte le prenotazioni
 * Query params: ?status=upcoming|past|cancelled&userId=123
 */
export async function GET(request: NextRequest) {
    try {
        // 1 Verifica autenticazione e autorizzazione admin
        const adminUserId = await verifyAdmin(request)

        // 2 Query params per filtro prenotazioni
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const roomId = searchParams.get('roomId')
        const userId = searchParams.get('userId')
        const upcoming = searchParams.get('upcoming')

        // 3 Costruisci filtri dinamici
        const where: Prisma.BookingWhereInput = {}

        // Filtro per status
        if (status && ['PENDING', 'CONFIRMED', 'CANCELLED'].includes(status.toUpperCase())) {
            where.status = status.toUpperCase() as 'PENDING' | 'CONFIRMED' | 'CANCELLED'
        }

        // Filtro per roomId
        if (roomId) {
            where.roomId = parseInt(roomId)
        }

        // Filtro per userId
        if (userId) {
            where.userId = parseInt(userId)
        }

        // Filtro per prenotazioni future
        if (upcoming === 'true') {
            where.startDate = {
                gte: new Date()
            }
        }

        // 4 Trova prenotazioni
        const bookings = await prisma.booking.findMany({
            where,
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
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        // 5 Arricchisci con info aggiuntive
        const bookingWithDetails = bookings.map((booking) => {
            const startDate = new Date(booking.startDate)
            const endDate = new Date(booking.endDate)
            const nights = Math.ceil(
                (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
            )
            return {
                ...booking,
                nights,
                totalPrice: booking.room.price.toNumber() * nights
            }
        })

        // 6 Statistiche rapide
        const stats = {
            total: bookingWithDetails.length,
            pending: bookingWithDetails.filter(b => b.status === 'PENDING').length,
            confirmed: bookingWithDetails.filter(b => b.status === 'CONFIRMED').length,
            cancelled: bookingWithDetails.filter(b => b.status === 'CANCELLED').length
        }

        console.log(`Admin (ID: ${adminUserId}) ha visualizzato la lista delle prenotazioni. Prenotazioni trovate: ${bookingWithDetails.length}, Stats:`, stats)

        return NextResponse.json({ bookings: bookingWithDetails, stats })
    } catch (error) {
        const { error: errorMessage, status } = handleAuthError(error);
        return NextResponse.json({ error: errorMessage }, { status });
    }
}