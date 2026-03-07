/**
 * ==============================================
 * ADMIN - GESTIONE CONVERSAZIONE SINGOLA
 * ==============================================
 * GET  /api/admin/conversations/:id → Dettaglio + messaggi
 * POST /api/admin/conversations/:id → Admin risponde
 * ==============================================
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma.client';
import { verifyAdmin, handleAuthError } from '@/lib/auth-helpers';
import { adminReplySchema } from '@/lib/validations/chat';

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
                    select: {
                        id: true,
                        content: true,
                        role: true,
                        createdAt: true,
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

        console.log(`💬 Admin (ID: ${adminUserId}) ha visualizzato conversazione ID: ${conversationId}`)

        return NextResponse.json({
            conversation
        }, { status: 200 });

    } catch (error) {
        const { error: errorMessage, status } = handleAuthError(error);
        return NextResponse.json({ error: errorMessage }, { status });
    }
}

/**
 * POST - Admin risponde nella conversazione
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

        // Validazione input
        const body = await request.json();
        const { content } = adminReplySchema.parse(body);

        // Verifica se la conversazione esiste
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            select: { id: true, userId: true }
        });

        if (!conversation) {
            return NextResponse.json(
                { error: 'Conversazione non trovata' },
                { status: 404 }
            );
        }

        // Crea nuovo messaggio con ruolo ADMIN
        const newMessage = await prisma.message.create({
            data: {
                conversationId,
                content,
                role: 'SYSTEM', // Usa 'SYSTEM' o 'ADMIN' a seconda di come hai definito i ruoli
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
            data: {
                updatedAt: new Date(),
            }
        });

        console.log(`Admin ${adminUserId} ha risposto alla conversazione ${conversationId} con il messaggio:`, newMessage);

        return NextResponse.json({
            message: 'Risposta inviata con successo',
            newMessage
        }, { status: 200 });

    } catch (error) {
        const { error: errorMessage, status } = handleAuthError(error);
        return NextResponse.json({ error: errorMessage }, { status });
    }
}