import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma.client";
import { verifyAuth, handleAuthError } from "@/lib/auth-helpers";
import { createConversationSchema } from "@/lib/validations/conversation";
import { logger } from "@/lib/logger";

/**
 * API POST /api/conversations
 */
export async function POST(request: NextRequest) {
    try {
        // Verifica l'autenticazione dell'utente
        const { userId } = await verifyAuth(request);

        // Leggi e valida i dati della richiesta
        const body = await request.json();
        const { subject, message } = createConversationSchema.parse(body);

        // Se ruolo admin, impedisci la creazione di conversazioni
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user?.role === 'ADMIN') {
            return NextResponse.json(
                { error: 'Gli amministratori non possono creare conversazioni' },
                { status: 403 }
            );
        }

        // Crea una nuova conversazione
        const conversation = await prisma.conversation.create({
            data: {
                userId,
                subject,
                messages: {
                    create: {
                        senderId: userId,
                        content: message,
                    },
                },
            },
            include: {
                messages: {
                    include: {
                        sender: {
                            select: {
                                id: true,
                                name: true,
                                surname: true,
                            },
                        },
                    },
                },
            },
        });

        logger.info("Nuova conversazione creata:", conversation);
        return NextResponse.json(conversation, { status: 201 });

    } catch (error) {
        const response = handleAuthError(error);
        return response;
    }
}

/**
GET /api/conversations - Lista conversazioni dell'utente
*/
export async function GET(request: NextRequest) {
    try {
        // Verifica l'autenticazione dell'utente
        const { userId } = await verifyAuth(request);

        // Recupera tutte le conversazioni dell'utente con i messaggi
        const conversations = await prisma.conversation.findMany({
            where: { userId },
            include: {
                messages: {
                    orderBy: { createdAt: "asc" },
                    take: 1, // Prendi solo l'ultimo messaggio
                    include: {
                        sender: {
                            select: {
                                id: true,
                                name: true,
                                surname: true,
                            },
                        },
                    },
                },
                _count: {
                    select: { messages: true },
                },
            },
            orderBy: { updatedAt: "desc" }, // Ordina le conversazioni per data di aggiornamento
        });

        logger.info("Conversazioni recuperate:", conversations);
        return NextResponse.json(conversations, { status: 200 });

    } catch (error) {
        const response = handleAuthError(error);
        return response;
    }

}