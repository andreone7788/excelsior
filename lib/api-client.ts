type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface RequestOptions {
    method?: HttpMethod
    body?: undefined | string | FormData | URLSearchParams | ReadableStream<Uint8Array>
    headers?: Record<string, string>
    cache?: RequestCache
}

class ApiClient {
    private baseURL: string

    constructor(baseURL: string = '') {
        this.baseURL = baseURL
    }

    /**
     * Recupera il token JWT dal cookie
     */
    private getToken(): string | null {
        if (typeof window === 'undefined') return null

        const cookies = document.cookie.split(';')
        const tokenCookie = cookies.find(c => c.trim().startsWith('token='))

        if (!tokenCookie) return null

        return tokenCookie.split('=')[1]
    }

    /**
     * Esegue una richiesta HTTP
     */
    private async request<T>(
        endpoint: string,
        options: RequestOptions = {}
    ): Promise<T> {
        const { method = 'GET', body, headers = {}, cache = 'no-store' } = options

        const token = this.getToken()

        const config: RequestInit = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
                ...headers,
            },
            cache,
        }

        if (body && method !== 'GET') {
            config.body = JSON.stringify(body)
        }

        const url = `${this.baseURL}${endpoint}`

        try {
            const response = await fetch(url, config)

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new ApiError(
                    errorData.error || errorData.message || 'Errore nella richiesta',
                    response.status,
                    errorData
                )
            }

            // Se la risposta è 204 (No Content), ritorna null
            if (response.status === 204) {
                return null as T
            }

            const data = await response.json()
            return data as T
        } catch (error) {
            if (error instanceof ApiError) {
                throw error
            }

            // Errore di rete
            throw new ApiError(
                'Errore di connessione al server',
                0,
                { error: error instanceof Error ? error.message : String(error) }
            )
        }
    }

    // Metodi HTTP
    async get<T>(endpoint: string, cache?: RequestCache): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET', cache })
    }

    async post<T>(endpoint: string, body?: undefined | string | FormData | URLSearchParams | ReadableStream<Uint8Array>): Promise<T> {
        return this.request<T>(endpoint, { method: 'POST', body })
    }

    async put<T>(endpoint: string, body?: undefined | string | FormData | URLSearchParams | ReadableStream<Uint8Array>): Promise<T> {
        return this.request<T>(endpoint, { method: 'PUT', body })
    }

    async patch<T>(endpoint: string, body?: undefined | string | FormData | URLSearchParams | ReadableStream<Uint8Array>): Promise<T> {
        return this.request<T>(endpoint, { method: 'PATCH', body })
    }

    async delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE' })
    }
}

/**
 * Classe per errori API
 */
export class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public data?: Record<string, unknown> | undefined
    ) {
        super(message)
        this.name = 'ApiError'
    }
}

// Istanza singleton
export const apiClient = new ApiClient('/api')

// Export per uso diretto
export default apiClient