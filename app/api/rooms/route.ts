import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma.client";
import type { Prisma } from "@prisma/client";
import { roomFiltersSchema } from "@/lib/validations/room";
import { handleAuthError } from "@/lib/auth-helpers";
import { logger } from "@/lib/logger";

/**
 * GET /api/rooms
 * Lista tutte le camere (PUBBLICO - nessuna autenticazione richiesta)
 * 
 * Query params opzionali:
 * - minPrice: number
 * - maxPrice: number
 * - capacity: number
 * - sortBy: 'price' | 'capacity' | 'name'
 * - sortOrder: 'asc' | 'desc'
 */

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Filtri opzionali
        const validation = roomFiltersSchema.safeParse({
            minPrice: searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined,
            maxPrice: searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined,
            capacity: searchParams.get("capacity") ? parseInt(searchParams.get("capacity")!) : undefined,
            sortBy: searchParams.get("sortBy") || undefined,
            sortOrder: searchParams.get("sortOrder") || undefined,
        });

        if (!validation.success) {
            return NextResponse.json({ error: "Invalid query parameters" }, { status: 400 });
        }

        const { minPrice, maxPrice, capacity, sortBy, sortOrder } = validation.data;

        // Costruzione dinamica del filtro
        const where: Prisma.RoomWhereInput = {}; // RoomWhereInput è il tipo generato da Prisma per i filtri sulla tabella Room
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = minPrice;
            if (maxPrice) where.price.lte = maxPrice;
        }

        if (capacity) {
            where.capacity = { gte: capacity };
        }

        // Ordinamento dinamico
        const orderByField = sortBy || "createdAt"; // Default ordinamento per data di creazione
        const orderByDirection = sortOrder || "desc"; // Default ordinamento decrescente

        // Recupero camere dal database
        const rooms = await prisma.room.findMany({
            where,
            // Cast necessario per compatibilità con tipi dinamici
            orderBy: { [orderByField]: orderByDirection } as Prisma.RoomOrderByWithRelationInput,
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                capacity: true,
                imageUrl: true,
                createdAt: true,
                _count: {
                    select: {
                        bookings: {
                            where: {
                                status: "CONFIRMED", // Solo prenotazioni confermate
                            }
                        }
                    }
                }
            }
        });

        logger.info(`GET /api/rooms - Retrieved ${rooms.length} rooms with filters:`, { minPrice, maxPrice, capacity, sortBy, sortOrder });

        return NextResponse.json({
            rooms,
            count: rooms.length
        }, { status: 200 });

    } catch (error) {
        const { error: errorMessage, status } = handleAuthError(error);
        return NextResponse.json({ error: errorMessage }, { status });
    }
}