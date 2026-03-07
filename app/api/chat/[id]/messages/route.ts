/**
 * ==============================================
 * CHAT - INVIO MESSAGGI
 * ==============================================
 * POST /api/chat/:id/messages → Invia messaggio
 * ==============================================
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma.client';
import { verifyAuth, handleAuthError } from '@/lib/auth-helpers';
import { sendMessageSchema } from '@/lib/validations/chat';

/**
 * POST - Invia messaggio in conversazione
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        // Verifica autenticazione
        const { userId } = await verifyAuth(request);
        const { id } = await params;
        const conversationId = parseInt(id);

        if (isNaN(conversationId) || conversationId <= 0) {
            return NextResponse.json(
                { error: 'ID conversazione non valido' },
                { status: 400 }
            );
        }

        // Validazione input
        const body = await request.json();
        const { content } = sendMessageSchema.parse(body);

        // Trova conversazione e verifica ownership
        const conversation = await prisma.conversation.findFirst({
            where: { id: conversationId },
            select: { id: true, userId: true }
        });

        // Verifica se la conversazione esiste
        if (!conversation) {
            return NextResponse.json(
                { error: 'Conversazione non trovata' },
                { status: 404 }
            );
        }

        // Verifica ownership
        if (conversation.userId !== userId) {
            return NextResponse.json(
                { error: 'Accesso negato alla conversazione' },
                { status: 403 }
            );
        }

        // Crea nuovo messaggio
        const newMessage = await prisma.message.create({
            data: {
                conversationId,
                content,
                role: 'USER',
            },
            select: {
                id: true,
                content: true,
                role: true,
                createdAt: true,
            }
        });

        // Aggiorna updatedAt della conversazione
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
        });

        console.log(`Nuovo messaggio inviato in conversazione ${conversationId} da utente ${userId}`);

        return NextResponse.json({
            message: newMessage,
        }, { status: 201 });

    } catch (error) {
        const { error: errorMessage, status } = handleAuthError(error);
        return NextResponse.json({ error: errorMessage }, { status });
    }
}