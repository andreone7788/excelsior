/**
 * ==============================================
 * ADMIN - GESTIONE CAMERE
 * ==============================================
 * GET /api/admin/rooms => Lista tutte le camere con statistiche (SOLO ADMIN)
 * POST /api/admin/rooms => Crea nuova camera (SOLO ADMIN)
 * ==============================================
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma.client'
import { verifyAdmin, handleAuthError } from '@/lib/auth-helpers'
import { createRoomSchema } from '@/lib/validations/room'
import { logger } from '@/lib/logger'

/**
 * GET /api/admin/rooms
 * Lista TUTTE le camere con statistiche (SOLO ADMIN)
 */
export async function GET(request: NextRequest) {
    try {
        const adminUserId = await verifyAdmin(request)

        const rooms = await prisma.room.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { bookings: true }
                },
                images: {
                    orderBy: { order: 'asc' }
                }
            }
        })

        // Converti Decimal in number per evitare problemi nel frontend
        const roomsWithNumberPrice = rooms.map(room => ({
            ...room,
            price: parseFloat(room.price.toString())
        }))

        logger.info(`Admin (ID: ${adminUserId}) ha visualizzato la lista delle camere. Camere trovate: ${rooms.length}`)

        return NextResponse.json({ rooms: roomsWithNumberPrice }, { status: 200 })

    } catch (error) {
        const response = handleAuthError(error)
        return response;
    }
}

/**
 * POST /api/admin/rooms
 * Crea una nuova camera (SOLO ADMIN)
 */
export async function POST(request: NextRequest) {
    try {
        const adminUserId = await verifyAdmin(request)

        const body = await request.json()
        const validatedData = createRoomSchema.parse(body)

        logger.info(`Admin (ID: ${adminUserId}) crea una nuova camera:`, validatedData)

        const room = await prisma.room.create({
            data: {
                name: validatedData.name,
                description: validatedData.description ?? null,
                price: validatedData.price,
                capacity: validatedData.capacity,
                imageUrl: validatedData.imageUrl ?? null,
            }
        })

        logger.info(`Admin (ID: ${adminUserId}) ha creato una nuova camera:`, room)

        return NextResponse.json({ room }, { status: 201 })

    } catch (error) {
        const response = handleAuthError(error)
        return response;
    }
}
