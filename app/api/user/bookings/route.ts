/**
 * ==============================================
 * 👤 USER - LE MIE PRENOTAZIONI
 * ==============================================
 * GET /api/user/bookings → Lista prenotazioni utente
 * ==============================================
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma.client'
import { handleAuthError, verifyAuth } from '@/lib/auth-helpers'
import type { Prisma } from '@prisma/client'
import { logger } from '@/lib/logger'

/**
 * GET - Lista prenotazioni utente
 * Query params: ?status=upcoming|past|cancelled
 */
export async function GET(request: NextRequest) {
    try {
        // 1 Verifica autenticazione
        const { userId } = await verifyAuth(request)

        if (!userId || userId <= 0) {
            return NextResponse.json(
                { error: 'Autenticazione richiesta' },
                { status: 401 }
            )
        }
        
        // 2 Query params per filtro prenotazioni
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const upcoming = searchParams.get('upcoming')

        // 3 Costruisci filtri dinamici
        const where: Prisma.BookingWhereInput = { userId }

        // FIltro per status
        if (status && ['PENDING', 'CONFIRMED', 'CANCELLED', 'PENDING_MODIFICATION', 'REPLACED'].includes(status.toUpperCase())) {
            where.status = status.toUpperCase() as 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'PENDING_MODIFICATION' | 'REPLACED'
        }

        // Filtro per status
        if (status && ['PENDING', 'CONFIRMED', 'CANCELLED'].includes(status.toUpperCase())) {
            where.status = status.toUpperCase() as 'PENDING' | 'CONFIRMED' | 'CANCELLED'
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
                room: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        // 5 Arricchisci con info aggiuntive
        const bookingsWithDetails = bookings.map((booking) => {
            const startDate = new Date(booking.startDate)
            const endDate = new Date(booking.endDate)

            const nights = Math.ceil(
                (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
            )

            return {
                ...booking,
                nights,
                totalPrice: booking.room.price.toNumber() * nights,
                // Info su modifiche pendenti o sostituzioni
                ...(booking.isModification && { 
                    modificationStatus: {
                        originalDates: {
                            start: booking.originalStartDate,
                            end: booking.originalEndDate
                        },
                        priceDifference: booking.priceDifference ? booking.priceDifference.toNumber() : null,
                        reason: booking.modificationReason || null
                    }
                }),
            }
        })

        logger.info(`Prenotazioni trovate per utente ${userId}: ${bookingsWithDetails.length}`)

        return NextResponse.json({
            bookings: bookingsWithDetails,
            total: bookingsWithDetails.length
        }, { status: 200 })

    } catch (error) {
        const response = handleAuthError(error);
        return response;
    }
}