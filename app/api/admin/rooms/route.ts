import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma.client'
import { verifyAdmin, handleAuthError } from '@/lib/auth-helpers'
import { createRoomSchema } from '@/lib/validations/room'
import { z } from 'zod'

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
                }
            }
        })

        console.log(`Admin (ID: ${adminUserId}) ha visualizzato la lista delle camere. Camere trovate: ${rooms.length}`)

        return NextResponse.json({ rooms }, { status: 200 })
    } catch (error) {
        const { error: message, status } = handleAuthError(error)
        return NextResponse.json({ error: message }, { status })
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

        console.log(`Admin (ID: ${adminUserId}) crea una nuova camera:`, validatedData)

        const room = await prisma.room.create({
            data: {
                name: validatedData.name,
                description: validatedData.description ?? null,
                price: validatedData.price,
                capacity: validatedData.capacity,
                imageUrl: validatedData.imageUrl ?? null,
            }
        })

        console.log(`Admin (ID: ${adminUserId}) ha creato una nuova camera:`, room)

        return NextResponse.json({ room }, { status: 201 })

    } catch (error) {
        console.error('Error creating room:', error)

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    error: 'Dati non validi',
                    details: error.issues.map(e => ({
                        field: e.path.join('.'),
                        message: e.message
                    }))
                },
                { status: 400 }
            )
        }

        // Errori autenticazione
        const { error: message, status } = handleAuthError(error)
        return NextResponse.json({ error: message }, { status })
    }
}
