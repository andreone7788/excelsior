/**
 * ==============================================
 * ADMIN USER DETAIL - GESTIONE SINGOLO UTENTE
 * ==============================================
 * GET    /api/admin/users/[id] => Dettaglio utente
 * PUT    /api/admin/users/[id] => Modifica utente
 * DELETE /api/admin/users/[id] => Elimina utente
 * ==============================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma.client';
import { handleAuthError, verifyAdmin } from '@/lib/auth-helpers';
import { updateUserSchema } from '@/lib/validations/user';
import { Prisma } from '@prisma/client';
import { logger } from '@/lib/logger';

/**
 * GET - Lista utenti con filtri
 * Query params: 
 *   - role: 'USER' | 'ADMIN'
 *   - search: string (cerca in name, surname, email)
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        // 1 - Verifica ruolo admin
        const adminUserId = await verifyAdmin(request);

        // 2 - Estrai ID utente da params
        const { id } = await params;
        const userId = parseInt(id);

        if (isNaN(userId) || userId <= 0) {
            return NextResponse.json(
                { error: 'ID utente non valido' },
                { status: 400 }
            );
        }

        // 3 - Recupera utente da DB
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                surname: true,
                email: true,
                phone: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                // Include prenotazioni
                bookings: {
                    select: {
                        id: true,
                        startDate: true,
                        endDate: true,
                        totalPrice: true,
                        status: true,
                        room: {
                            select: {
                                name: true,
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                },
                // Include conversazioni
                conversations: {
                    select: {
                        id: true,
                        createdAt: true,
                        _count: {
                            select: { messages: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                },
                // Aggregazioni
                _count: {
                    select: {
                        bookings: true,
                        conversations: true
                    }
                }
            }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Utente non trovato' },
                { status: 404 }
            );
        }

        logger.info(`Admin (ID: ${adminUserId}) ha visualizzato il dettaglio dell'utente ID: ${userId}`);

        // 4 - Risposta
        return NextResponse.json({ user }, { status: 200 });

    } catch (error) {
        const response = handleAuthError(error);
        return response;
    }
}

/**
 * PUT - Modifica utente
 * Body: { name?, surname?, email?, phone?, role? }
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        // 1 - Verifica ruolo admin
        const adminUserId = await verifyAdmin(request);

        // 2 - Estrai ID utente da params
        const { id } = await params;
        const userId = parseInt(id);

        if (isNaN(userId) || userId <= 0) {
            return NextResponse.json(
                { error: 'ID utente non valido' },
                { status: 400 }
            );
        }

        // 3 - Validazione input
        const body = await request.json();
        const validateData = updateUserSchema.parse(body);

        const { name, surname, email, phone, role } = validateData;

        // 4 - Verifica esistenza utente
        const existingUser = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!existingUser) {
            return NextResponse.json(
                { error: 'Utente non trovato' },
                { status: 404 }
            );
        }

        // 5 - Se cambia mail, verifica unicità
        if (email && email !== existingUser.email) {
            const emailExists = await prisma.user.findFirst({
                where: {
                    email,
                    id: { not: userId } // Esclude l'utente corrente
                }
            });

            if (emailExists) {
                return NextResponse.json(
                    { error: 'Email già in uso' },
                    { status: 409 }
                );
            }
        }

        // 6 - Update utente (solo campi forniti)
        const updateData: Prisma.UserUpdateInput = {};
        if (name !== undefined) updateData.name = name;
        if (surname !== undefined) updateData.surname = surname;
        if (email !== undefined) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;
        if (role !== undefined) updateData.role = role;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                name: true,
                surname: true,
                phone: true,
                email: true,
                role: true,
                updatedAt: true,
            }
        });

        logger.info(`Admin (ID: ${adminUserId}) ha modificato l'utente ID: ${userId}`);

        // 7 - Risposta
        return NextResponse.json({ user: updatedUser }, { status: 200 });

    } catch (error) {
        const response = handleAuthError(error);
        return response;
    }
}

/**
 * DELETE - Elimina utente
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        // 1 - Verifica ruolo admin
        const adminUserId = await verifyAdmin(request);

        // 2 - Estrai ID utente da params
        const { id } = await params;
        const userId = parseInt(id);

        if (isNaN(userId) || userId <= 0) {
            return NextResponse.json(
                { error: 'ID utente non valido' },
                { status: 400 }
            );
        }

        // 3 - Verifica esistenza utente
        const existingUser = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!existingUser) {
            return NextResponse.json(
                { error: 'Utente non trovato' },
                { status: 404 }
            );
        }

        // 4 - Elimina utente (cascade automatico da Prisma schema)
        await prisma.user.delete({
            where: { id: userId }
        });

        logger.info(`Admin (ID: ${adminUserId}) ha eliminato l'utente ID: ${userId}`);

        // 5 - Risposta
        return NextResponse.json({ message: 'Utente eliminato con successo' }, { status: 200 });

    } catch (error) {
        const response = handleAuthError(error);
        return response;
    }
}