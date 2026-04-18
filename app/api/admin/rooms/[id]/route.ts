import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma.client'
import { verifyAdmin, handleAuthError } from '@/lib/auth-helpers'
import { updateRoomSchema } from '@/lib/validations/room'

/**
 * GET /api/admin/rooms/[id] - Dettagli camera (SOLO ADMIN)
 */

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        // 1 Verifica autenticazione e autorizzazione admin
        const adminUserId = await verifyAdmin(request)

        // 2 Ottieni ID camera da params
        const { id } = await params
        const roomId = parseInt(id)

        if (isNaN(roomId) || roomId <= 0) {
            return NextResponse.json(
                { error: 'ID stanza non valido' },
                { status: 400 }
            )
        }

        // 3 Trova camera
        const room = await prisma.room.findUnique({
            where: { id: roomId },
            include: {
                _count: {
                    select: { bookings: true }
                },
                images: {
                    orderBy: { order: 'asc' }
                },
                bookings: {
                    take: 10,
                    orderBy: { startDate: 'desc' },
                    include: {
                        user: {
                            select: { id: true, name: true, surname: true, email: true }
                        }
                    }
                }
            }
        })

        if (!room) {
            return NextResponse.json(
                { error: 'Camera non trovata' },
                { status: 404 }
            )
        }

        console.log(`Admin (ID: ${adminUserId}) ha visualizzato i dettagli della camera ${roomId}:`, room)

        return NextResponse.json({ room }, { status: 200 })

    } catch (error) {
        const { error: message, status } = handleAuthError(error)
        return NextResponse.json({ error: message }, { status })
    }
}

/**
 * PUT /api/admin/rooms/[id]
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const adminUserId = await verifyAdmin(request)

        const { id } = await params
        const roomId = parseInt(id)

        if (isNaN(roomId) || roomId <= 0) {
            return NextResponse.json({ error: 'ID stanza non valido' }, { status: 400 })
        }

        const body = await request.json()
        const validatedData = updateRoomSchema.parse({ ...body, roomId })

        console.log(`Admin (ID: ${adminUserId}) aggiorna la camera ${roomId}:`, validatedData)

        const existingRoom = await prisma.room.findUnique({ where: { id: roomId } })

        if (!existingRoom) {
            return NextResponse.json({ error: 'Camera non trovata' }, { status: 404 })
        }

        const updatedRoom = await prisma.room.update({
            where: { id: roomId },
            data: {
                name: validatedData.name ?? existingRoom.name,
                description: validatedData.description ?? existingRoom.description,
                price: validatedData.price ?? existingRoom.price,
                capacity: validatedData.capacity ?? existingRoom.capacity,
                imageUrl: validatedData.imageUrl ?? existingRoom.imageUrl,
            }
        })

        console.log(`Admin (ID: ${adminUserId}) ha aggiornato la camera ${roomId}:`, updatedRoom)

        return NextResponse.json({ room: updatedRoom }, { status: 200 })

    } catch (error) {
        const { error: message, status } = handleAuthError(error)
        return NextResponse.json({ error: message }, { status })
    }
}

/**
 * DELETE /api/admin/rooms/[id]
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const adminUserId = await verifyAdmin(request)
        
        const { id } = await params
        const roomId = parseInt(id)

        if (isNaN(roomId)) {
            return NextResponse.json({ error: 'ID stanza non valido' }, { status: 400 })
        }

        const existingRoom = await prisma.room.findUnique({ 
            where: { id: roomId },
            include: { _count: { select: { bookings: true } } }
        })

        if (!existingRoom) {
            return NextResponse.json({ error: 'Camera non trovata' }, { status: 404 })
        }

        if (existingRoom._count.bookings > 0) {
            return NextResponse.json({ error: 'Impossibile eliminare la camera, ci sono prenotazioni attive', 
                bookingsCount: existingRoom._count.bookings }, { status: 400 })
        }

        await prisma.room.delete({ where: { id: roomId } })

        console.log(`Admin (ID: ${adminUserId}) ha eliminato la camera ${roomId}`)

        return NextResponse.json({ message: 'Camera eliminata con successo' }, { status: 200 })
        
    } catch (error) {
        const { error: message, status } = handleAuthError(error)
        return NextResponse.json({ error: message }, { status })
    }
}