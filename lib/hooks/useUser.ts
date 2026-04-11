'use client'

import { useState, useEffect, useCallback } from 'react'
import apiClient, { ApiError } from '@/lib/api-client'
import { User, UserStats, UpdateProfileInput, UpdatePasswordInput, Booking } from '@/types'

/**
 * ═══════════════════════════════════════════════════════════
 * HOOK GESTIONE PROFILO UTENTE
 * ═══════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════
// HOOK: useUserProfile (Profilo utente)
// ═══════════════════════════════════════════════════════════
interface UseUserProfileReturn {
    user: User | null
    loading: boolean
    updating: boolean
    error: string | null
    refetch: () => Promise<void>
    updateProfile: (data: UpdateProfileInput) => Promise<User>
    updatePassword: (data: UpdatePasswordInput) => Promise<void>
    clearError: () => void
}

export function useUserProfile(autoFetch: boolean = true): UseUserProfileReturn {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [updating, setUpdating] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    /**
   * Fetch dati utente
   */
    const fetchUser = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const data = await apiClient.get<{ user: User }>('/user/profile')
            setUser(data.user)

        } catch (err) {
            const errorMessage = err instanceof ApiError ? err.message : 'Errore sconosciuto'
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }, [])

    /**
  * Aggiorna profilo
  */
    const updateProfile = useCallback(async (data: UpdateProfileInput): Promise<User> => {
        try {
            setUpdating(true)
            setError(null)

            const response = await apiClient.put<{ user: User }>('/user/profile', JSON.stringify(data))
            setUser(response.user)
            return response.user

        } catch (err) {
            const errorMessage = err instanceof ApiError ? err.message : 'Errore sconosciuto'
            setError(errorMessage)
            throw err
        } finally {
            setUpdating(false)
        }
    }, [])

    /**
   * Aggiorna password
   */
    const updatePassword = async (data: UpdatePasswordInput): Promise<void> => {
        try {
            setUpdating(true)
            setError(null)

            // Validazione client side
            if (data.newPassword !== data.confirmPassword) {
                throw new Error('La nuova password e la conferma non corrispondono')
            }

            if (data.newPassword.length < 8) {
                throw new Error('La nuova password deve contenere almeno 8 caratteri')
            }

            await apiClient.put('/user/password', JSON.stringify({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword
            }))

        } catch (err) {
            const errorMessage = err instanceof ApiError ? err.message : 'Errore sconosciuto'
            setError(errorMessage)
            throw err
        } finally {
            setUpdating(false)
        }
    }

    /**
   * Clear error
   */
    const clearError = () => setError(null)

    // Auto-fetch al mount
    useEffect(() => {
        if (autoFetch) {
            fetchUser()
        }
    }, [fetchUser, autoFetch])

    return {
        user,
        loading,
        updating,
        error,
        refetch: fetchUser,
        updateProfile,
        updatePassword,
        clearError
    }
}

// ═══════════════════════════════════════════════════════════
// HOOK: useUserStats (Statistiche utente)
// ═══════════════════════════════════════════════════════════
interface UseUserStatsReturn {
    stats: UserStats | null
    loading: boolean
    error: string | null
    refetch: () => Promise<void>
}

export function useUserStats(autoFetch: boolean = true): UseUserStatsReturn {
    const [stats, setStats] = useState<UserStats | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    /**
   * Fetch statistiche (calcolate lato client da bookings)
   */
    const fetchStats = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            // Ottieni bookings utente
            const bookings = await apiClient.get<Booking[]>('/user/bookings')

            // Calcola statistiche
            const now = new Date()

            const calculatedStats: UserStats = {
                totalBookings: bookings.length,
                upcomingBookings: bookings.filter(
                    b => ['PENDING', 'CONFIRMED'].includes(b.status) &&
                        new Date(b.startDate) > now
                ).length,
                completedBookings: bookings.filter(
                    b => b.status === 'CONFIRMED' &&
                        new Date(b.endDate) < now
                ).length,
                cancelledBookings: bookings.filter(b => b.status === 'CANCELLED').length,
                totalSpent: bookings
                    .filter(b => b.status === 'CONFIRMED')
                    .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0)
            }

            setStats(calculatedStats)

        } catch (err) {
            const errorMessage = err instanceof ApiError ? err.message : 'Errore sconosciuto'
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }, [])

    // Auto-fetch al mount
    useEffect(() => {
        if (autoFetch) {
            fetchStats()
        }
    }, [fetchStats, autoFetch])

    return {
        stats,
        loading,
        error,
        refetch: fetchStats
    }
}

// ═══════════════════════════════════════════════════════════
// HOOK COMPOSITO: useUser (All-in-one)
// ═══════════════════════════════════════════════════════════
interface UseUserReturn extends UseUserProfileReturn {
    stats: UserStats | null
    statsLoading: boolean
    refreshAll: () => Promise<void>
    refreshProfile: () => Promise<void>
}

export function useUser(autoFetch: boolean = true): UseUserReturn {
    const {
        user,
        loading,
        updating,
        error: profileError,
        refetch: refetchProfile,
        updateProfile,
        updatePassword,
        clearError
    } = useUserProfile(autoFetch)

    const {
        stats,
        loading: statsLoading,
        error: statsError,
        refetch: refetchStats
    } = useUserStats(autoFetch)

    /**
   * Refresh tutto
   */
    const refreshAll = async () => {
        await Promise.all([refetchProfile(), refetchStats()])
    }

    // Combina errori
    const error = profileError || statsError

    return {
        user,
        loading,
        updating,
        error,
        refetch: refetchProfile,
        updateProfile,
        updatePassword,
        clearError,
        stats,
        statsLoading,
        refreshAll,
        refreshProfile: refetchProfile
    }
}