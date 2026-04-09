'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import apiClient, { ApiError } from '@/lib/api-client'
import { useAuth } from './useAuth'
import { UnreadCountResponse } from '@/types'

/**
 * ═══════════════════════════════════════════════════════════
 * HOOK CONTEGGIO NOTIFICHE NON LETTE
 * ═══════════════════════════════════════════════════════════
 * 
 * Conta le notifiche non lette in base al ruolo dell'utente:
 * - USER: messaggi non letti nelle conversazioni
 * - ADMIN: prenotazioni in attesa (PENDING + PENDING_MODIFICATION)
 */

interface UseUnreadCountReturn {
    // Conteggio notifiche non lette
    unreadCount: number
    // Stato di caricamento
    loading: boolean
    // Eventuale errore
    error: string | null
    // Ricarica il conteggio manualmente
    refetch: () => Promise<void>
}

/**
 * Hook per ottenere il conteggio delle notifiche non lette
 * 
 * @param autoFetch - Se true, carica il conteggio automaticamente (default: true)
 * @param pollInterval - Intervallo di polling in ms (opzionale, default: nessuno)
 * 
 * @example
 * ```tsx
 * function NotificationBadge() {
 *   const { unreadCount, refetch } = useUnreadCount()
 *   
 *   return (
 *     <Badge badgeContent={unreadCount} color="error">
 *       <Notifications />
 *     </Badge>
 *   )
 * }
 * ```
 */
export function useUnreadCount(autofetch: boolean = true, pollInterval?: number): UseUnreadCountReturn {
    const { user, isAuthenticated } = useAuth()
    const [unreadCount, setUnreadCount] = useState<number>(0)
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    // ═══════════════════════════════════════════════════════════
    // FETCH: Carica il conteggio dal server
    // ═══════════════════════════════════════════════════════════

    // Ref per evitare fetch multipli simultanei
    const isFetchingRef = useRef(false)

    // Determina ruolo utente (USER o ADMIN)
    const userRole = user?.role

    const fetchUnreadCount = useCallback(async () => {
        // Guard: se non autenticato o già in fetch, salta
        if (!isAuthenticated || !userRole || isFetchingRef.current) {
            if (!isAuthenticated || !userRole) {
                setUnreadCount(0)
            }
            return
        }

        try {
            isFetchingRef.current = true
            setLoading(true)
            setError(null)

            // Endpoint differente per USER e ADMIN
            const endpoint = userRole === 'ADMIN'
                ? '/admin/unread-count'
                : '/user/unread-count'

            const response = await apiClient.get<UnreadCountResponse>(endpoint)
            setUnreadCount(response.count)
        } catch (err) {
            const errorMessage = err instanceof ApiError ? err.message : 'Errore sconosciuto'
            setError(errorMessage)
            setUnreadCount(0)
        } finally {
            setLoading(false)
        }
    }, [isAuthenticated, userRole])

    // ═══════════════════════════════════════════════════════════
    // EFFECT: Auto-fetch iniziale
    // ═══════════════════════════════════════════════════════════
    useEffect(() => {
        if (autofetch && isAuthenticated) {
            fetchUnreadCount()
        }
    }, [fetchUnreadCount, autofetch, isAuthenticated])

    // ═══════════════════════════════════════════════════════════
    // EFFECT: Polling periodico (opzionale)
    // ═══════════════════════════════════════════════════════════
    useEffect(() => {
        if (!pollInterval || !isAuthenticated) {
            return
        }

        const intervalId = setInterval(() => {
            fetchUnreadCount()
        }, pollInterval)

        return () => clearInterval(intervalId)
    }, [fetchUnreadCount, pollInterval, isAuthenticated])

    return {
        unreadCount,
        loading,
        error,
        refetch: fetchUnreadCount
    }
}