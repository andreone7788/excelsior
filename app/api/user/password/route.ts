/**
 * ==============================================
 * 🔐 USER PASSWORD - CAMBIO PASSWORD
 * ==============================================
 * PUT /api/user/password → Cambia password
 * ==============================================
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma.client';
import { verifyToken } from '@/lib/jwt';
import { handleAuthError } from '@/lib/auth-helpers';
import { updatePasswordSchema } from '@/lib/validations/user';
import bcrypt from 'bcrypt';

/**
 * PUT - Cambia password utente
 * Body: { currentPassword, newPassword }
 */
export async function PUT(request: NextRequest) {
    try {
        // 1 Verifica autenticazione
        const token = request.cookies.get('token')?.value;

        if (!token) {
            return NextResponse.json(
                { error: 'Autenticazione richiesta' },
                { status: 401 }
            );
        }

        const decoded = await verifyToken(token);

        if (!decoded || !decoded.userId) {
            return NextResponse.json(
                { error: 'Token non valido' },
                { status: 401 }
            );
        }

        // 2 Validazione input
        const body = await request.json();
        const validateData = updatePasswordSchema.parse(body);

        const { currentPassword, newPassword } = validateData;

        // 3 Verifica password corrente
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, password: true },
        })

        if (!user) {
            return NextResponse.json(
                { error: 'Utente non trovato' },
                { status: 404 }
            );
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'Password corrente errata' },
                { status: 400 }
            );
        }

        // Hash della nuova password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // 4 Aggiorna password
        await prisma.user.update({
            where: { id: decoded.userId },
            data: { password: hashedNewPassword },
        });

        return NextResponse.json(
            { message: 'Password aggiornata con successo' },
            { status: 200 }
        );

    } catch (error) {
        return handleAuthError(error);
    }
}