/**
 * ==============================================
 * ADMIN - GESTIONE CONVERSAZIONI
 * ==============================================
 * GET /api/admin/conversations → Lista tutte conversazioni
 * ==============================================
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma.client';
import { Prisma } from '@prisma/client';
import { verifyAdmin, handleAuthError } from '@/lib/auth-helpers';

/**
 * GET - Lista tutte le conversazioni (admin)
 */
export async function GET(request: NextRequest) {
    try {
        // Verifica autenticazione e ruolo admin
        const adminUserId = await verifyAdmin(request);
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');

        // Filtri dinamici con type Prisma
        const where: Prisma.ConversationWhereInput = {};
        if (userId) {
            const userIdNum = parseInt(userId);
            if (!isNaN(userIdNum) && userIdNum > 0) {
                where.userId = userIdNum;
            }
        }

        // Query parallele
        const [totalConversations, conversations] = await Promise.all([
            prisma.conversation.count({ where }),
            prisma.conversation.findMany({
                where,
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
                        orderBy: { createdAt: 'desc' },
                        take: 1,
                        select: {
                            content: true,
                            createdAt: true,
                            role: true,
                        },
                    },
                    _count: {
                        select: { messages: true },
                    },
                },
                orderBy: { updatedAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            })
        ]);

        // Formatta la risposta
        const formattedConversations = conversations.map(conv => ({
            id: conv.id,
            user: conv.user,
            createdAt: conv.createdAt,
            updatedAt: conv.updatedAt,
            messageCount: conv._count.messages,
            lastMessage: conv.messages[0] ? conv.messages[0] : null
        }));

        console.log(`Admin ${adminUserId} ha richiesto la lista delle conversazioni. Totale: ${totalConversations}`);

        return NextResponse.json({
            conversation: formattedConversations,
            pagination: {
                page,
                limit,
                total: totalConversations,
                totalPages: Math.ceil(totalConversations / limit),
            }
        }, { status: 200 });

    } catch (error) {
        const { error: errorMessage, status } = handleAuthError(error);
        return NextResponse.json({ error: errorMessage }, { status });
    }
}