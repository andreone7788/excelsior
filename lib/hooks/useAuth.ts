'use client'

import { useContext } from 'react'
import { useRouter } from 'next/navigation'
import { AuthContext } from '@/lib/context/AuthContext'
import apiClient, { ApiError } from '@/lib/api-client'
import { User, LoginInput, RegisterInput } from '@/types'
import { logger } from '../logger'

/**
 * ═══════════════════════════════════════════════════════════
 * HOOK GESTIONE AUTENTICAZIONE
 * ═══════════════════════════════════════════════════════════
 * 
 * Wrapper elegante di AuthContext con funzionalità extra:
 * - Login/Logout/Register
 * - Route protection (useRequireAuth)
 * - Component guards (useAuthGuard)
 * - Role-based access control
 */

// ═══════════════════════════════════════════════════════════
// HOOK PRINCIPALE: useAuth
// ═══════════════════════════════════════════════════════════
interface UseAuthReturn {
    // Stato autenticazione
    user: User | null,
    isAuthenticated: boolean,
    isAdmin: boolean,
    isUser: boolean,
    loading: boolean,

    // Azioni
    login: (data: LoginInput) => Promise<User>,
    register: (data: RegisterInput) => Promise<User>,
    logout: () => Promise<void>,
    refreshUser: () => Promise<void>

    // Utility
    checkAuth: () => boolean,
    requireAuth: () => void,
    requireAdmin: () => void,
}

/**
 * Hook principale per gestione autenticazione
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, login, logout, isAdmin } = useAuth()
 *   
 *   const handleLogin = async () => {
 *     await login({ email: 'test@example.com', password: 'password' })
 *   }
 *   
 *   return (
 *     <div>
 *       {user ? `Ciao ${user.name}` : 'Non autenticato'}
 *       {isAdmin && <AdminPanel />}
 *     </div>
 *   )
 * }
 * ```
 */
export function useAuth(): UseAuthReturn {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error('useAuth deve essere usato all\'interno di un AuthProvider')
    }

    const { user, loading, login: contextLogin, logout: contextLogout } = context

    // ═══════════════════════════════════════════════════════════
    // COMPUTED VALUES
    // ═══════════════════════════════════════════════════════════

    const isAuthenticated = !!user
    const isAdmin = user?.role === 'ADMIN'
    const isUser = user?.role === 'USER'

    // ═══════════════════════════════════════════════════════════
    // ACTIONS
    // ═══════════════════════════════════════════════════════════

    /**
     * Login con email/password
     */
    const login = async (data: LoginInput): Promise<User> => {
        try {
            const response = await apiClient.post<{ user: User; token: string }>(
                '/auth/login', JSON.stringify(data)
            )

            // Salva token in localStorage
            localStorage.setItem('authToken', response.token)

            // Aggiorna context
            await contextLogin(response.user)

            return response.user

        } catch (err) {
            const errorMessage = err instanceof ApiError ? err.message : 'Errore sconosciuto'
            throw new Error(errorMessage)
        }
    }

    /**
     * Registrazione nuovo utente
     */
    const register = async (data: RegisterInput): Promise<User> => {
        try {
            const response = await apiClient.post<{ user: User; token: string }>(
                '/auth/register', JSON.stringify(data)
            )

            // Salva token in localStorage
            localStorage.setItem('token', response.token)

            // Aggiorna context
            await contextLogin(response.user)

            return response.user

        } catch (err) {
            const errorMessage = err instanceof ApiError ? err.message : 'Errore sconosciuto'
            throw new Error(errorMessage)
        }
    }

    /**
     * Logout utente
     */
    const logout = async (): Promise<void> => {
        try {
            // Chiama API logout (invalida token server-side se implementato)
            await apiClient.post('/auth/logout')

        } catch (err) {
            logger.error('Errore durante logout:', err)
        } finally {
            // Rimuovi token da localStorage
            localStorage.removeItem('token')

            // Aggiorna context
            await contextLogout()
        }
    }

    /**
     * Refresh dati utente corrente
     */
    const refreshUser = async (): Promise<void> => {
        try {
            const response = await apiClient.get<{ user: User }>('/user/me')
            await contextLogin(response.user) // Riutilizza login per aggiornare user nel context
        } catch (err) {
            logger.error('Errore durante refresh user:', err)
        }
    }

    // ═══════════════════════════════════════════════════════════
    // UTILITY
    // ═══════════════════════════════════════════════════════════

    /**
     * Check se utente è autenticato
     */
    const checkAuth = (): boolean => {
        return isAuthenticated
    }

    /**
     * Richiede autenticazione (throw se non loggato)
     * Utile per imperative checks
     */
    const requireAuth = (): void => {
        if (!isAuthenticated) {
            throw new Error('Autenticazione richiesta')
        }
    }

    /**
     * Richiede ruolo admin (throw se non admin)
     */
    const requireAdmin = (): void => {
        requireAuth() // Prima verifica autenticazione
        if (!isAdmin) {
            throw new Error('Accesso admin richiesto')
        }
    }

    return {
        // State
        user,
        isAuthenticated,
        isAdmin,
        isUser,
        loading,

        // Actions
        login,
        register,
        logout,
        refreshUser,

        // Utility
        checkAuth,
        requireAuth,
        requireAdmin,
    }
}

// ═══════════════════════════════════════════════════════════
// 🛡️ HOOK: useRequireAuth (Route Protection)
// ═══════════════════════════════════════════════════════════
interface UseRequireAuthReturn {
    authorized: boolean,
    loading: boolean,
}

/**
 * Hook per proteggere route client-side
 * Redirige automaticamente se non autorizzato
 * 
 * @param requireAdmin - Se true, richiede ruolo admin
 * @param redirectTo - URL di redirect (default: /login)
 * 
 * @example
 * ```tsx
 * // In una page protetta
 * function DashboardPage() {
 *   const { authorized, loading } = useRequireAuth()
 *   
 *   if (loading) return <Loading />
 *   if (!authorized) return null // Sta già redirigendo
 *   
 *   return <Dashboard />
 * }
 * 
 * // Page solo admin
 * function AdminPage() {
 *   const { authorized, loading } = useRequireAuth(true)
 *   
 *   if (loading) return <Loading />
 *   if (!authorized) return null
 *   
 *   return <AdminPanel />
 * }
 * ```
 */
export function useRequireAuth(requireAdmin: boolean = false, redirectTo: string = '/login'): UseRequireAuthReturn {
    const { isAuthenticated, isAdmin, loading } = useAuth()
    const router = useRouter()

    // Check autorizzazione
    if (!loading && !isAuthenticated) {
        router.push(redirectTo)
        return { authorized: false, loading: false }
    }

    // Check admin se richiesto
    if (!loading && requireAdmin && !isAdmin) {
        router.push(redirectTo)
        return { authorized: false, loading: false }
    }

    return { authorized: isAuthenticated && (!requireAdmin || isAdmin), loading }
}

// ═══════════════════════════════════════════════════════════
// HOOK: useAuthGuard (Component-Level Protection)
// ═══════════════════════════════════════════════════════════
interface UseAuthGuardOptions {
    requiredAuth?: boolean,
    requiredAdmin?: boolean,
    redirectTo?: string,
    onUnauthorized?: () => void,
}

interface UseAuthGuardReturn {
    isAuthorized: boolean,
    loading: boolean,
    shouldRender: boolean,
}

/**
 * Hook per proteggere singoli componenti
 * Più granulare di useRequireAuth
 * 
 * @example
 * ```tsx
 * function SecretComponent() {
 *   const { shouldRender } = useAuthGuard({
 *     requireAuth: true,
 *     onUnauthorized: () => toast.error('Accesso negato')
 *   })
 *   
 *   if (!shouldRender) return null
 *   
 *   return <div>Contenuto segreto</div>
 * }
 * 
 * // Protezione condizionale
 * function ConditionalAdmin() {
 *   const { isAuthorized } = useAuthGuard({ requireAdmin: true })
 *   
 *   return isAuthorized ? <AdminTools /> : <UserTools />
 * }
 * ```
 */

export function useAuthGuard(options: UseAuthGuardOptions = {}): UseAuthGuardReturn {
    const {
        requiredAuth = true,
        requiredAdmin = false,
        redirectTo = '/login',
        onUnauthorized,
    } = options

    const { isAuthenticated, isAdmin, loading } = useAuth()
    const router = useRouter()

    // Check autorizzazione
    const isAuthorized =
        (!requiredAuth || isAuthenticated) &&
        (!requiredAdmin || isAdmin)

    // Gestisci non autorizzato
    if (!loading && !isAuthorized) {
        if (onUnauthorized) {
            onUnauthorized()
        } else {
            router.push(redirectTo)
        }
    }

    return {
        isAuthorized,
        loading,
        shouldRender: !loading && isAuthorized,
    }
}

// ═══════════════════════════════════════════════════════════
// HOOK UTILITY: useAuthStatus (Solo lettura stato)
// ═══════════════════════════════════════════════════════════
interface UseAuthStatusReturn {
    user: User | null,
    isAuthenticated: boolean,
    isAdmin: boolean,
    isUser: boolean,
    loading: boolean,
}

/**
 * Hook read-only per lo stato di autenticazione
 * Utile quando non servono le funzioni di login/logout
 * 
 * @example
 * ```tsx
 * function UserAvatar() {
 *   const { user, isAuthenticated } = useAuthStatus()
 *   
 *   return isAuthenticated ? (
 *     <Avatar src={user.avatar} name={user.name} />
 *   ) : (
 *     <Button href="/login">Login</Button>
 *   )
 * }
 * ```
 */
export function useAuthStatus(): UseAuthStatusReturn {
    const { user, isAuthenticated, isAdmin, isUser, loading } = useAuth()

    return {
        user,
        isAuthenticated,
        isAdmin,
        isUser,
        loading,
    }
}