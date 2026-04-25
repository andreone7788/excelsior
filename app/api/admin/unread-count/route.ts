/**
 * ==============================================
 * 🔐 ADMIN - CONTEGGIO PRENOTAZIONI IN ATTESA
 * ==============================================
 * GET /api/admin/unread-count => Conta prenotazioni da approvare
 * ==============================================
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma.client"
import { verifyAdmin, handleAuthError } from "@/lib/auth-helpers"
import type { UnreadCountResponse } from "@/types"

/**
 * GET - Conta le prenotazioni in attesa di approvazione
 * 
 * Logica:
 * Conta booking con status:
 * - PENDING (nuove prenotazioni)
 * - PENDING_MODIFICATION (richieste di modifica)
 */
export async function GET(request: NextRequest) {
    try {
        // 1 - Verifica autenticazione e ruolo admin
        await verifyAdmin(request)

        // 2 - Conta prenotazioni in attesa
        const pendingCount = await prisma.booking.count({
            where: {
                status: {
                    in: ['PENDING', 'PENDING_MODIFICATION']
                }
            }
        })

        // 3 - Restituisci conteggio
        const response: UnreadCountResponse = { count: pendingCount }

        return NextResponse.json(response)

    } catch (err) {
        logger.error('Errore in GET /api/admin/unread-count:', err)
        return handleAuthError(err)
    }
}