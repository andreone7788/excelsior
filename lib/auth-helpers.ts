import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma.client'
import { verifyToken } from '@/lib/jwt'
import { logger } from './logger'

/**
 * Verifica che l'utente sia autenticato e sia ADMIN
 * 
 * @throws Error con codice specifico:
 * - 'NON_AUTENTICATO': Token mancante
 * - 'TOKEN_INVALIDO': Token non valido o scaduto
 * - 'ACCESSO_NEGATO': Utente non è admin
 * 
 * @returns userId dell'admin autenticato
 */
export async function verifyAdmin(request: NextRequest): Promise<number> {
    const token = request.cookies.get('auth_token')?.value

    if (!token) {
        throw new Error('NON_AUTENTICATO')
    }

    const payload = await verifyToken(token)
    if (!payload) {
        throw new Error('TOKEN_INVALIDO')
    }

    const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { role: true }
    })

    if (!user || user.role !== 'ADMIN') {
        throw new Error('ACCESSO_NEGATO')
    }

    return payload.userId
}

/**
 * Verifica che l'utente sia autenticato (qualsiasi ruolo)
 * 
 * @throws Error con codice specifico
 * @returns userId e role dell'utente autenticato
 */
export async function verifyAuth(request: NextRequest): Promise<{ userId: number, role: 'USER' | 'ADMIN' }> {
    const token = request.cookies.get('auth_token')?.value

    if (!token) {
        throw new Error('NON_AUTENTICATO')
    }

    const payload = await verifyToken(token)
    if (!payload) {
        throw new Error('TOKEN_INVALIDO')
    }

    const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, role: true }
    })

    if (!user) {
        throw new Error('UTENTE_NON_TROVATO')
    }

    return { userId: user.id, role: user.role }
}

/**
 * Helper per gestire errori di autenticazione in modo consistente
 */
/**
 * Helper per gestire errori di autenticazione in modo consistente
 */
export function handleAuthError(error: unknown) {
    logger.error('Errore autenticazione:', error)

    if (error instanceof Error) {
        switch (error.message) {
            case 'NON_AUTENTICATO':
                return NextResponse.json(
                    { error: 'Non autenticato' },
                    { status: 401 }
                )
            case 'TOKEN_INVALIDO':
                return NextResponse.json(
                    { error: 'Token non valido o scaduto' },
                    { status: 401 }
                )
            case 'ACCESSO_NEGATO':
                return NextResponse.json(
                    { error: 'Accesso negato. Solo amministratori.' },
                    { status: 403 }
                )
            case 'UTENTE_NON_TROVATO':
                return NextResponse.json(
                    { error: 'Utente non trovato' },
                    { status: 404 }
                )
        }
    }

    // Errore generico
    return NextResponse.json(
        { error: 'Errore del server' },
        { status: 500 }
    )
}