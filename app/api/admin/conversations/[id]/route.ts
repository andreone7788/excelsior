/**
 * ==============================================
 * ADMIN - GESTIONE CONVERSAZIONE SINGOLA
 * ==============================================
 * GET  /api/admin/conversations/:id => Dettaglio + messaggi
 * PUT  /api/admin/conversations/:id => Admin risponde
 * DELETE /api/admin/conversations/:id => Elimina conversazione
 * ==============================================
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma.client';
import { verifyAdmin, handleAuthError } from '@/lib/auth-helpers';
import { updateConversationStatusSchema } from '@/lib/validations/conversation';
import { deleteConversationSchema } from '@/lib/validations/conversation';
import { logger } from '@/lib/logger';

/**
 * GET - Dettaglio conversazione (admin)
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

        // Trova conversazione con messaggi e info utente
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
                messages: {
                    orderBy: { createdAt: 'asc' },
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
                },
                _count: {
                    select: { messages: true }
                },
            },
        });

        if (!conversation) {
            return NextResponse.json(
                { error: 'Conversazione non trovata' },
                { status: 404 }
            );
        }

        // Segna tutti i messaggi come letti
        await prisma.message.updateMany({
            where: {
                conversationId,
                senderId: { not: conversation.userId }, // Solo messaggi non inviati dall'utente
                isRead: false,
            },
            data: { isRead: true },
        });

        logger.info(`💬 Admin (ID: ${adminUserId}) ha visualizzato conversazione ID: ${conversationId}`);

        return NextResponse.json({
            conversation
        }, { status: 200 });

    } catch (error) {
        const response = handleAuthError(error);
        return response;
    }
}

/**
 * PUT - Admin risponde nella conversazione
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

        const existing = await prisma.conversation.findUnique({
            where: { id: conversationId },
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'Conversazione non trovata' },
                { status: 404 }
            );
        }

        // Validazione input
        const body = await request.json();
        const { status } = updateConversationStatusSchema.parse(body);

        // Verifica se la conversazione esiste
        const conversation = await prisma.conversation.update({
            where: { id: conversationId },
            data: { status },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        surname: true,
                        email: true,
                    }
                },
                _count: {
                    select: { messages: true }
                },
            },
        });

        if (!conversation) {
            return NextResponse.json(
                { error: 'Conversazione non trovata' },
                { status: 404 }
            );
        }

        logger.info(`💬 Admin (ID: ${adminUserId}) ha aggiornato lo stato della conversazione ID: ${conversationId} a ${status}`);

        return NextResponse.json({
            conversation
        }, { status: 200 });

    } catch (error) {
        const response = handleAuthError(error);
        return response;
    }
}

/**
 * DELETE - Admin elimina una conversazione
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

        // Validazione input
        const body = await request.json();
        const { conversationId: validatedConversationId } = deleteConversationSchema.parse(body);

        if (validatedConversationId !== conversationId) {
            return NextResponse.json(
                { error: 'ID conversazione nel body non corrisponde a quello nei parametri' },
                { status: 400 }
            );
        }

        // Elimina conversazione (cascata elimina anche i messaggi)
        const deleted = await prisma.conversation.delete({
            where: { id: conversationId },
        });

        if (!deleted) {
            return NextResponse.json(
                { error: 'Conversazione non trovata' },
                { status: 404 }
            );
        }

        logger.info(`🗑️ Admin (ID: ${adminUserId}) ha eliminato la conversazione ID: ${conversationId}`);
        return NextResponse.json(
            { message: 'Conversazione eliminata con successo' },
            { status: 200 }
        );

    } catch (error) {
        const response = handleAuthError(error);
        return response;
    }
}