/**
 * ==============================================
 * CHAT - DETTAGLIO CONVERSAZIONE
 * ==============================================
 * GET    /api/chat/:id → Messaggi conversazione
 * DELETE /api/chat/:id → Elimina conversazione
 * ==============================================
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma.client';
import { verifyAuth, handleAuthError } from '@/lib/auth-helpers';

/**
 * GET - Lista messaggi conversazione
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

        // Trova conversazione e verifica ownership
        const conversation = await prisma.conversation.findFirst({
            where: { id: conversationId },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                    select: {
                        id: true,
                        content: true,
                        role: true,
                        createdAt: true,
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        surname: true,
                    }
                }
            }
        });

        if (!conversation) {
            return NextResponse.json(
                { error: 'Conversazione non trovata' },
                { status: 404 }
            );
        }

        // Verifica ownership
        if (conversation.userId !== userId) {
            return NextResponse.json(
                { error: 'Accesso negato' },
                { status: 403 }
            );
        }

        return NextResponse.json({
            conversation
        }, { status: 200 });

    } catch (error) {
        const { error: errorMessage, status } = handleAuthError(error);
        return NextResponse.json({ error: errorMessage }, { status });
    }
}

/**
 * DELETE - Elimina conversazione
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

        // Trova conversazione e verifica ownership
        const conversation = await prisma.conversation.findFirst({
            where: { id: conversationId },
            select: { userId: true }
        });

        // Verifica se conversazione esiste
        if (!conversation) {
            return NextResponse.json(
                { error: 'Conversazione non trovata' },
                { status: 404 }
            );
        }

        // Verifica ownership
        if (conversation.userId !== userId) {
            return NextResponse.json(
                { error: 'Accesso negato' },
                { status: 403 }
            );
        }

        // Elimina conversazione (cascata elimina anche messaggi)
        await prisma.conversation.delete({
            where: { id: conversationId }
        });

        console.log(`Conversazione ${conversationId} eliminata dall'utente ${userId}`);

        return NextResponse.json({
            message: 'Conversazione eliminata con successo'
        }, { status: 200 });

    } catch (error) {
        const { error: errorMessage, status } = handleAuthError(error);
        return NextResponse.json({ error: errorMessage }, { status });
    }
}