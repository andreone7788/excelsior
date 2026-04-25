import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma.client';
import { verifyAuth, handleAuthError } from '@/lib/auth-helpers';
import { suggestAdminReply, handleAIError } from '@/lib/AI-helpers';
import { aiSuggestReplySchema } from '@/lib/validations/chat';
import { logger } from '@/lib/logger';

/**
 * ==============================================
 * ADMIN - AI SUGGEST REPLY
 * ==============================================
 * POST /api/admin/ai/suggest-reply → AI suggerisce risposta per admin
 * 
 * Body:
 * {
 *   "conversationId": 1
 * }
 * 
 * Response 200:
 * {
 *   "suggestedReply": "Gentile...",
 *   "conversationContext": {
 *     "subject": "Domanda camera",
 *     "userName": "Giulio Vandero",
 *     "lastMessage": "Vorrei sapere se..."
 *   }
 * }
 * ==============================================
 */
export async function POST(request: NextRequest) {
    try {
        await verifyAuth(request);

        const body = await request.json();
        const { conversationId } = aiSuggestReplySchema.parse(body);

        // Recupera contesto conversazione
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: {
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 10, // Prendiamo ultimi 10 messaggi per contesto
                    include: {
                        sender: {
                            select: { role: true }
                        }
                    }
                },
                user: {
                    select: { name: true, surname: true, email: true }
                }
            }
        });

        if (!conversation) {
            return NextResponse.json(
                { error: 'Conversazione non trovata' },
                { status: 404 }
            );
        }

        if (conversation.messages.length === 0) {
            return NextResponse.json(
                { error: 'La conversazione non contiene messaggi' },
                { status: 400 }
            );
        }

        // Ottieni ultimo messaggio
        const lastUserMessage = conversation.messages
            .reverse() // Invertiamo per avere ordine cronologico
            .find(m => m.sender.role === 'USER'); // Prendiamo ultimo messaggio dell'utente

        if (!lastUserMessage) {
            return NextResponse.json(
                { error: 'Nessun messaggio dell\'utente trovato' },
                { status: 400 }
            );
        }

        // Prepara history per AI
        const history = conversation.messages
            .reverse() // Rimetto in ordine cronologico
            .map(m => ({
                role: m.sender.role === 'USER' ? 'USER' as const : 'ADMIN' as const,
                content: m.content
            }));

        // AI genera suggerimento risposta
        const suggestedReply = await suggestAdminReply(
            history,
            lastUserMessage.content
        );

        logger.info(`Suggerimento AI per conversazione ${conversationId}: ${suggestedReply}`);

        // Rispondi con suggerimento e contesto
        return NextResponse.json({
            suggestedReply,
            conversationContext: {
                subject: conversation.subject,
                userName: `${conversation.user.name} ${conversation.user.surname}`,
                userEmail: conversation.user.email,
                lastMessage: lastUserMessage.content,
                messageCount: conversation.messages.length
            }
        }, { status: 200 });

    } catch (error) {
        // Gestione errori di autenticazione
        if (error instanceof Error &&
            ['NON_AUTENTICATO', 'TOKEN_INVALIDO', 'ACCESSO_NEGATO'].includes(error.message)) {
            const { error: errorMessage, status } = handleAuthError(error);
            return NextResponse.json({ error: errorMessage }, { status });
        }
        const { error: errorMessage, status } = handleAIError(error);
        return NextResponse.json({ error: errorMessage }, { status });
    }
}
