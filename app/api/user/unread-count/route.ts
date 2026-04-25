/**
 * ==============================================
 * 👤 USER - CONTEGGIO MESSAGGI NON LETTI
 * ==============================================
 * GET /api/user/unread-count → Conta messaggi non letti nelle conversazioni
 * ==============================================
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma.client'
import { verifyAuth, handleAuthError } from '@/lib/auth-helpers'
import type { UnreadCountResponse } from '@/types'

/**
 * GET - Conta i messaggi non letti dall'utente nelle sue conversazioni
 * 
 * Logica:
 * 1. Trova tutte le conversazioni dell'utente
 * 2. Conta i messaggi dove:
 *    - conversationId IN (conversazioni utente)
 *    - senderId != userId (messaggi ricevuti, non inviati)
 *    - isRead = false
 */
export async function GET(request: NextRequest) {
    try {
        // 1 - Verifica autenticazione
        const { userId } = await verifyAuth(request)

        if (!userId || userId <= 0) {
            return NextResponse.json(
                { error: 'Utente non autenticato' }, 
                { status: 401 }
            )
        }

        // 2 - Conta messaggi non letti
        const unreadCount = await prisma.message.count({
            where: {
                conversation: {
                    userId: userId
                },
                senderId: {
                    not: userId // Escludi i propri messaggi
                },
                isRead: false // Solo messaggi non letti
            }
        })

        // 3 - Rispondi con il conteggio
        const response: UnreadCountResponse = { count: unreadCount }

        return NextResponse.json(response)

    } catch (err) {
        logger.error('Errore in GET /api/user/unread-count:', err)
        return handleAuthError(err)
    }
}