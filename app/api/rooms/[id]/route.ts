import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma.client";

/**
 * GET /api/rooms/[id]
 * Dettaglio singola camera (PUBBLICO - nessuna autenticazione richiesta)
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const roomId = parseInt(params.id);

        if (isNaN(roomId)) {
            return NextResponse.json({ error: "Invalid room ID" }, { status: 400 });
        }

        const room = await prisma.room.findUnique({
            where: { id: roomId },
            include: {
                bookings: {
                    where: {
                        status: "CONFIRMED",
                        endDate: {
                            gte: new Date(), // Mostra solo prenotazioni future o in corso
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

        console.log("Room details:", room); // Log dettagli camera

        return NextResponse.json({room}, { status: 200 });

    } catch (error) {
        console.error("Error fetching room details:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}