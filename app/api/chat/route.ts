/**
 * ==============================================
 * 💬 CHAT - CONVERSAZIONI UTENTE
 * ==============================================
 * POST /api/chat → Crea nuova conversazione
 * GET  /api/chat → Lista conversazioni utente
 * ==============================================
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma.client';
import { verifyAuth, handleAuthError } from '@/lib/auth-helpers';
import { logger } from '@/lib/logger';

/**
 * GET - Lista conversazioni dell'utente
 */
export async function GET(request: NextRequest) {
    try {
        // Verifica autenticazione
        const { userId } = await verifyAuth(request);

        const conversations = await prisma.conversation.findMany({
            where: { userId },
            include: {
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1, // Prendi solo l'ultimo messaggio
                    select: {
                        content: true,
                        createdAt: true,
                        sender: {
                            select: { role: true }
                        },
                    },
                },
                _count: {
                    select: { messages: true },
                },
            },
            orderBy: { updatedAt: 'desc' },
        });

        // Formatta la risposta
        const formattedConversations = conversations.map(conv => ({
            id: conv.id,
            createdAt: conv.createdAt,
            updatedAt: conv.updatedAt,
            messageCount: conv._count.messages,
            lastMessage: conv.messages[0] ? {
                content: conv.messages[0].content,
                role: conv.messages[0].sender.role,
                createdAt: conv.messages[0].createdAt
            } : null
        }))

        return NextResponse.json({
            conversations: formattedConversations
        }, { status: 200 });

    } catch (error) {
        const { error: errorMessage, status } = handleAuthError(error);
        return NextResponse.json({ error: errorMessage }, { status });
    }
}

/**
 * POST - Crea nuova conversazione
 * (Opzionale: può essere creata automaticamente al primo messaggio)
 */
export async function POST(request: NextRequest) {
    try {
        // Verifica autenticazione
        const { userId } = await verifyAuth(request);

        // Verifica se utente ha già una conversazione aperta
        const existingConversation = await prisma.conversation.findFirst({
            where: { userId },
        });

        if (existingConversation) {
            return NextResponse.json({
                conversationId: existingConversation.id,
                message: 'Conversazione già esistente'
            }, { status: 200 });
        }

        // Crea nuova conversazione
        const newConversation = await prisma.conversation.create({
            data: { userId },
        });

        logger.info(`Nuova conversazione creata per utente ${userId} con ID ${newConversation.id}`);

        return NextResponse.json({
            conversationId: newConversation.id,
            message: 'Nuova conversazione creata'
        }, { status: 201 });

    } catch (error) {
        const { error: errorMessage, status } = handleAuthError(error);
        return NextResponse.json({ error: errorMessage }, { status });
    }
}