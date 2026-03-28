/**
 * ==============================================
 * 👤 USER PROFILE - GESTIONE PROFILO
 * ==============================================
 * GET  /api/user/profile → Ottieni profilo utente
 * PUT  /api/user/profile → Aggiorna profilo
 * ==============================================
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma.client';
import { handleAuthError, verifyAuth } from '@/lib/auth-helpers';
import { updateProfileSchema } from '@/lib/validations/user';

/**
 * GET - Ottieni profilo utente corrente
 */
export async function GET(request: NextRequest) {
    try {
        // 1 Verifica autenticazione
        const { userId } = await verifyAuth(request)

        if (!userId || userId <= 0) {
            return NextResponse.json(
                { error: 'Autenticazione richiesta' },
                { status: 401 }
            );
        }

        // 2 Trova utente
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                surname: true,
                phone: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                // Include statistiche
                _count: {
                    select: {
                        bookings: true,
                        conversations: true,
                    },
                },
            },
        })

        if (!user) {
            return NextResponse.json(
                { error: 'Utente non trovato' },
                { status: 404 }
            );
        }

        console.log('Profilo utente ottenuto:', user);

        return NextResponse.json({
            user: {
                ...user,
                stats: {
                    totalBookings: user._count.bookings,
                    totalConversations: user._count.conversations,
                },
            }
        }, { status: 200 });

    } catch (error) {
        const { error: errorMessage, status } = handleAuthError(error);
        return NextResponse.json({ error: errorMessage }, { status });
    }
}

/**
 * PUT - Aggiorna profilo utente
 * Body: { name?, surname?, email?, phone? }
 */
export async function PUT(request: NextRequest) {
    try {
        // 1 Verifica autenticazione
        const { userId } = await verifyAuth(request)

        if (!userId) {
            return NextResponse.json(
                { error: 'Autenticazione richiesta' },
                { status: 401 }
            );
        }

        // 2 Validazione dati
        const body = await request.json();
        const validatedData = updateProfileSchema.parse(body);

        const { name, surname, email, phone } = validatedData;

        // 3 Se cambia email, verifica che non sia già in uso
        if (email) {
            const existingUser = await prisma.user.findFirst({
                where: {
                    email,
                    id: { not: userId } // Esclude l'utente corrente
                },
            });

            if (existingUser) {
                return NextResponse.json(
                    { error: 'Email già in uso da un altro account' },
                    { status: 409 }
                );
            }
        }

        // 4 Aggiorna utente
        const updateUser = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(name && { name }),
                ...(surname && { surname }),
                ...(email && { email }),
                ...(phone && { phone }),
            },
            select: {
                id: true,
                name: true,
                surname: true,
                email: true,
                phone: true,
                role: true,
                updatedAt: true,
            },
        })

        console.log('Profilo utente aggiornato:', updateUser);

        return NextResponse.json({
            user: updateUser,
            message: 'Profilo aggiornato con successo'
        }, { status: 200 });

    } catch (error) {
        const { error: errorMessage, status } = handleAuthError(error);
        return NextResponse.json({ error: errorMessage }, { status });
    }
}