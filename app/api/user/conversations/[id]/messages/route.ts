import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma.client';
import { verifyAuth, handleAuthError } from '@/lib/auth-helpers';
import { sendMessageSchema } from '@/lib/validations/chat';
import { logger } from '@/lib/logger';

/**
 * API POST /api/conversations/[id]/messages
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        // Verifica l'autenticazione dell'utente
        const { userId } = await verifyAuth(request);
        const { id } = await params;
        const conversationId = parseInt(id);

        if (isNaN(conversationId) || conversationId <= 0) {
            return NextResponse.json({ error: "ID conversazione non valido" }, { status: 400 });
        }

        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
        });

        if (!conversation) {
            return NextResponse.json({ error: "Conversazione non trovata" }, { status: 404 });
        }

        // User può scrivere solo messaggi nelle proprie conversazioni
        if (conversation.userId !== userId) {
            return NextResponse.json({ error: "Non autorizzato a scrivere in questa conversazione" }, { status: 403 });
        }

        if (conversation.status === "CLOSED") {
            return NextResponse.json({ error: "La conversazione è chiusa. Non è possibile inviare nuovi messaggi." }, { status: 403 });
        }

        // Leggi e valida i dati della richiesta
        const body = await request.json();
        const { content } = sendMessageSchema.parse(body);

        // Crea un nuovo messaggio nella conversazione
        const message = await prisma.message.create({
            data: {
                conversationId,
                senderId: userId,
                content,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        surname: true,
                        role: true,
                    },
                },
            },
        });

        // Aggiorna la data di aggiornamento della conversazione
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
        });

        logger.info("Nuovo messaggio inviato:", message);
        return NextResponse.json(message, { status: 201 });

    } catch (error) {
        const response = handleAuthError(error);
        return response;
    }
}

/**
 * API GET /api/conversations/[id]/messages - Recupera i messaggi di una conversazione
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        // Verifica l'autenticazione dell'utente
        const { userId } = await verifyAuth(request);
        const { id } = await params;
        const conversationId = parseInt(id);

        if (isNaN(conversationId) || conversationId <= 0) {
            return NextResponse.json({ error: "ID conversazione non valido" }, { status: 400 });
        }

        // Verifica che la conversazione esista e appartenga all'utente
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
        });

        if (!conversation) {
            return NextResponse.json({ error: "Conversazione non trovata" }, { status: 404 });
        }

        if (conversation.userId !== userId) {
            return NextResponse.json({ error: "Non autorizzato a visualizzare i messaggi di questa conversazione" }, { status: 403 });
        }

        // Recupera i messaggi della conversazione
        const messages = await prisma.message.findMany({
            where: { conversationId },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        surname: true,
                        role: true,
                    },
                },
            },
            orderBy: { createdAt: "asc" },
        });

        // Segna messaggi admin come letti
        await prisma.message.updateMany({
            where: {
                conversationId,
                senderId: { not: userId }, // Solo i messaggi non inviati dall'utente
                isRead: false,
            },
            data: { isRead: true },
        });

        logger.info(`Recuperati ${messages.length} messaggi per la conversazione ${conversationId}`);
        return NextResponse.json(messages, { status: 200 });

    } catch (error) {
        const response = handleAuthError(error);
        return response;
    }
}