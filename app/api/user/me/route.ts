/**
 * ==============================================
 * 👤 USER ME - UTENTE CORRENTE
 * ==============================================
 * GET /api/user/me => Dati utente loggato
 * ==============================================
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, handleAuthError } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma.client'

/**
 * GET - Dati utente corrente
 * Usato da: useUser hook, navbar, dashboard
 */

export async function GET(request: NextRequest) {
    try {
        // 1 - Verifica autenticazione e ottieni userId
        const { userId } = await verifyAuth(request)

        if (!userId || userId <= 0) {
            return NextResponse.json(
                { error: 'Autenticazione richiesta' }, 
                { status: 401 }
            );
        }

        // 2 - Recupera dati utente da DB (escludendo password)
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                surname: true,
                email: true,
                role: true
            }
        })

        if (!user) {
            return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 })
        }

        // 3 - Restituisci dati utente al client (escludendo password)
        return NextResponse.json(user)
        
    } catch (error) {
        const { error: errorMessage, status } = handleAuthError(error);
        return NextResponse.json({ error: errorMessage }, { status });
    }
}