/**
 * ==============================================
 * ADMIN - MESSAGGI CONVERSAZIONE
 * ==============================================
 * GET  /api/admin/conversations/:id/messages => Leggi messaggi
 * POST /api/admin/conversations/:id/messages => Admin risponde
 * ==============================================
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma.client';
import { verifyAdmin, handleAuthError } from '@/lib/auth-helpers';
import { sendMessageSchema } from '@/lib/validations/chat';
import { logger } from '@/lib/logger';

/**
 * GET - Leggi messaggi conversazione (admin)
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        // Verifica autenticazione e ruolo admin
        const adminUserId = await verifyAdmin(request);
        const { id } = await params;
        const conversationId = parseInt(id);

        if (isNaN(conversationId) || conversationId <= 0) {
            return NextResponse.json(
                { error: 'ID conversazione non valido' },
                { status: 400 }
            );
        }

        // Trova messaggi della conversazione con info mittente
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        surname: true,
                        email: true,
                    }
                },
            },
        });

        if (!conversation) {
            return NextResponse.json(
                { error: 'Conversazione non trovata' },
                { status: 404 }
            );
        }

        const messages = await prisma.message.findMany({
            where: { conversationId },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        surname: true,
                        role: true,
                    }
                },
            },
            orderBy: { createdAt: 'asc' },
        });

        // Segna tutti i messaggi come letti
        await prisma.message.updateMany({
            where: {
                conversationId,
                senderId: { not: adminUserId }, // Solo i messaggi non inviati dall'admin
                isRead: false,
            },
            data: { isRead: true },
        });

        logger.info(`Admin ${adminUserId} ha letto i messaggi della conversazione ${conversationId}`);

        return NextResponse.json({
            conversation,
            messages,
        }, { status: 200 });

    } catch (error) {
        const response = handleAuthError(error);
        return response;
    }
}

/**
 * POST - Admin risponde al cliente
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        // Verifica autenticazione e ruolo admin
        const adminUserId = await verifyAdmin(request);
        const { id } = await params;
        const conversationId = parseInt(id);

        if (isNaN(conversationId) || conversationId <= 0) {
            return NextResponse.json(
                { error: 'ID conversazione non valido' },
                { status: 400 }
            );
        }

        // Trova conversazione
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
        });

        if (!conversation) {
            return NextResponse.json(
                { error: 'Conversazione non trovata' },
                { status: 404 }
            );
        }

        if (conversation.status === 'CLOSED') {
            return NextResponse.json(
                { error: 'Non è possibile rispondere a una conversazione chiusa' },
                { status: 400 }
            );
        }

        // Leggi e valida input
        const body = await request.json();
        const { content } = sendMessageSchema.parse(body);

        // Crea messaggio
        const message = await prisma.message.create({
            data: {
                conversationId,
                senderId: adminUserId,
                content,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        surname: true,
                        role: true,
                    }
                },
            },
        });

        // Aggiorna timestamp conversazione
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
        });

        logger.info(`Admin ${adminUserId} ha risposto alla conversazione ${conversationId} con il messaggio:`, message);

        return NextResponse.json({
            message: 'Risposta inviata con successo',
            newMessage: message,
        }, { status: 200 });

    } catch (error) {
        const response = handleAuthError(error);
        return response;
    }
}