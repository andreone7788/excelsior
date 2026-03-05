/**
 * ==============================================
 * ADMIN USERS - GESTIONE UTENTI
 * ==============================================
 * GET /api/admin/users → Lista utenti (solo ADMIN)
 * ==============================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma.client';
import { verifyAdmin, handleAuthError } from '@/lib/auth-helpers';
import { Prisma } from '@prisma/client';

/**
 * GET - Lista utenti con filtri
 * Query params: 
 *   - role: 'USER' | 'ADMIN'
 *   - search: string (cerca in name, surname, email)
 */
export async function GET(request: NextRequest) {
    try {
        // 1 - Verifica ruolo admin
        const adminUserId = await verifyAdmin(request);

        // 2 - Estrai query params
        const { searchParams } = new URL(request.url);
        const roleFilter = searchParams.get('role');
        const searchQuery = searchParams.get('search');

        // 3 - Costruisci filtro per Prisma
        const where: Prisma.UserWhereInput = {};

        // Filtro per ruolo
        if (roleFilter && ['USER', 'ADMIN'].includes(roleFilter.toUpperCase())) {
            where.role = roleFilter.toUpperCase() as 'USER' | 'ADMIN';
        }

        // Filtro per ricerca
        if (searchQuery) {
            where.OR = [
                { name: { contains: searchQuery, mode: 'insensitive' } },
                { surname: { contains: searchQuery, mode: 'insensitive' } },
                { email: { contains: searchQuery, mode: 'insensitive' } }
            ];
        }

        // 4 - Recupera utenti dal database
        const users = await prisma.user.findMany({
            where: where,
            select: {
                id: true,
                name: true,
                surname: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                // Stats: conteggio bookings e conversations
                _count: {
                    select: {
                        bookings: true,
                        conversations: true
                    }
                }
            }
        });

        // 5 - Formatta e restituisci la risposta
        const formattedUsers = users.map(user => ({
            id: user.id,
            name: user.name,
            surname: user.surname,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
            stats: {
                totalBookings: user._count.bookings,
                totalConversations: user._count.conversations
            }
        }));

        console.log(`Admin (ID: ${adminUserId}) ha visualizzato la lista degli utenti. Utenti trovati: ${formattedUsers.length}`);

        return NextResponse.json(formattedUsers);
    } catch (error) {
        return handleAuthError(error);
    }
}
