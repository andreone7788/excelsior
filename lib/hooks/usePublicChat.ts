'use client'

import { useState } from 'react'
import apiClient, { ApiError } from '@/lib/api-client'
import { AIChatMessage } from '@/types'

// Tipo per il return di usePublicChat
interface UsePublicChatReturn {
    messages: AIChatMessage[]
    isLoading: boolean
    error: string | null
    sendMessage: (content: string) => Promise<void>
    clearChat: () => void
}

/**
 * Hook per gestire la chat pubblica con AI (non autenticata)
 * 
 * I messaggi NON vengono salvati nel database, solo in memoria locale.
 * Quando l'utente chiude il widget, lo storico viene perso.
 * 
 * @example
 * ```tsx
 * const { messages, sendMessage, isLoading } = usePublicChat()
 * 
 * const handleSend = async () => {
 *   await sendMessage("Quali camere avete disponibili?")
 * }
 * ```
 */
export function usePublicChat(): UsePublicChatReturn {
    const [messages, setMessages] = useState<AIChatMessage[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    /**
     * Invia un messaggio all'AI e ottiene la risposta
     */
    const sendMessage = async (content: string) => {
        if (!content.trim()) return

        setIsLoading(true)
        setError(null)

        // Aggiungi il messaggio dell'utente alla chat
        const userMessage: AIChatMessage = {
            role: 'USER',
            content,
            timestamp: new Date().toISOString(),
        }
        setMessages(prev => [...prev, userMessage])

        try {
            // Prepara lo storico per l'API (ultimi 5 messaggi per context)
            const conversationHistory = [...messages, userMessage]
                .slice(-5) // Mantieni solo gli ultimi 5 messaggi per limitare il contesto
                .map(msg => ({ role: msg.role, content: msg.content })) // Mappa al formato richiesto dall'API

            // Chiamata API pubblica (NO autenticazione)
            const data = await apiClient.post<{ response: string; timestamp: string }>(
                '/ai/chat',
                JSON.stringify({
                    message: content,
                    conversationHistory
                })
            )

            const aiMessage: AIChatMessage = {
                role: 'ASSISTANT',
                content: data.response,
                timestamp: data.timestamp,
            }

            setMessages(prev => [...prev, aiMessage])

        } catch (err) {
            const errorMessage = err instanceof ApiError ? err.message : 'Errore sconosciuto'
            setError(errorMessage)
            console.error('usePublicChat error:', err)
        } finally {
            setIsLoading(false)
        }
    }

    /**
     * Resetta la chat (svuota tutti i messaggi)
     */
    const clearChat = () => {
        setMessages([])
        setError(null)
    }

    return {
        messages,
        isLoading,
        error,
        sendMessage,
        clearChat
    }
}