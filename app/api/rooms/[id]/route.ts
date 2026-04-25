import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma.client";
import { handleAuthError } from "@/lib/auth-helpers";
import { logger } from "@/lib/logger";

/**
 * GET /api/rooms/[id]
 * Dettaglio singola camera (PUBBLICO - nessuna autenticazione richiesta)
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const roomId = parseInt(id)

        if (isNaN(roomId) || roomId <= 0) {
            return NextResponse.json({ error: "Invalid room ID" }, { status: 400 });
        }

        const room = await prisma.room.findUnique({
            where: { id: roomId },
            include: {
                images: {
                    orderBy: { order: "asc" }, // Ordina per il campo 'order' (0, 1, 2...)
                },
                bookings: {
                    where: {
                        status: "CONFIRMED",
                        endDate: {
                            gte: new Date(),
                        },
                    },
                    orderBy: { startDate: "asc" },
                    select: {
                        id: true,
                        startDate: true,
                        endDate: true,
                        status: true,
                    },
                },
            },
        });

        if (!room) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }

        logger.info("Room details:", room); // Log dettagli camera

        return NextResponse.json({ room }, { status: 200 });

    } catch (error) {
        const { error: errorMessage, status } = handleAuthError(error);
        return NextResponse.json({ error: errorMessage }, { status });
    }
}