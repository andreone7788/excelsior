'use client'

import { useState, useEffect, useCallback } from 'react'
import apiClient, { ApiError } from '@/lib/api-client'
import { Conversation, ConversationWithMessages, Message, AISuggestPreferences, AIRoomSuggestion } from '@/types'

/**
 * ═══════════════════════════════════════════════════════════
 * HOOK GESTIONE CONVERSAZIONI AI
 * ═══════════════════════════════════════════════════════════
 */
interface CreateConversationInput {
    title?: string,
    message: string
}

interface SuggestRoomsInput {
    preferences: AISuggestPreferences
}

// ═══════════════════════════════════════════════════════════
// HOOK: useConversations (Lista conversazioni)
// 
interface UseConversationsReturn {
    conversations: Conversation[],
    loading: boolean,
    error: string | null,
    refetch: () => Promise<void>,
    createConversation: (data: CreateConversationInput) => Promise<Conversation>,
    deleteConversation: (conversationId: number) => Promise<void>,
}

export function useConversations(autoFetch: boolean = true): UseConversationsReturn {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const fetchConversations = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            // Simulazione ritardo API
            const data = await apiClient.get<Conversation[]>('/user/conversations')

            const sorted = data.sort((a, b) =>
                new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            )

            setConversations(sorted)
        } catch (err) {
            const errorMessage = err instanceof ApiError ? err.message : 'Errore durante il recupero delle conversazioni'
            setError(errorMessage)
            console.error('useConversations error:', err)
        }
        finally {
            setLoading(false)
        }
    }, [])

    const createConversation = async (data: CreateConversationInput): Promise<Conversation> => {
        try {
            setLoading(true)
            setError(null)

            const newConversation = await apiClient.post<Conversation>('/chat', JSON.stringify(data))

            setConversations(prev => [newConversation, ...prev])
            return newConversation

        } catch (err) {
            const errorMessage = err instanceof ApiError ? err.message : 'Errore durante la creazione della conversazione'
            setError(errorMessage)
            throw err
        } finally {
            setLoading(false)
        }
    }

    const deleteConversation = async (id: number): Promise<void> => {
        try {
            setLoading(true)
            setError(null)

            await apiClient.delete(`/chat/${id}`)
            setConversations(prev => prev.filter(conv => conv.id !== id))

        } catch (err) {
            const errorMessage = err instanceof ApiError ? err.message : 'Errore durante la cancellazione della conversazione'
            setError(errorMessage)
            throw err
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (autoFetch) {
            fetchConversations()
        }
    }, [autoFetch, fetchConversations])

    return {
        conversations,
        loading,
        error,
        refetch: fetchConversations,
        createConversation,
        deleteConversation
    }
}

// ═══════════════════════════════════════════════════════════
// HOOK: useConversation (Singola conversazione + messaggi)
// ═══════════════════════════════════════════════════════════
interface UseConversationReturn {
    conversation: ConversationWithMessages | null,
    loading: boolean,
    error: string | null,
    sending: boolean,
    refetch: () => Promise<void>,
    sendMessage: (content: string) => Promise<Message>
    clearError: () => void
}

export function useConversation(id: number | null): UseConversationReturn {
    const [conversation, setConversation] = useState<ConversationWithMessages | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [sending, setSending] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const fetchConversation = useCallback(async () => {
        if (!id) {
            setConversation(null)
            return
        }

        try {
            setLoading(true)
            setError(null)

            const data = await apiClient.get<ConversationWithMessages>(`/chat/${id}`)
            setConversation(data)

        } catch (err) {
            const errorMessage = err instanceof ApiError ? err.message : 'Errore durante il caricamento della conversazione'
            setError(errorMessage)
            console.error('useConversation error:', err)
        } finally {
            setLoading(false)
        }
    }, [id])

    const sendMessage = async (content: string): Promise<Message> => {
        if (!id) {
            throw new Error('Nessuna conversazione trovata')
        }

        try {
            setSending(true)
            setError(null)

            const response = await apiClient.post<{
                userMessage: Message
                aiMessage: Message
            }>(`/chat/${id}`, JSON.stringify({ content })
            )

            setConversation(prev => {
                if (!prev) return null
                return {
                    ...prev,
                    messages: [...prev.messages, response.userMessage, response.aiMessage],
                    updatedAt: new Date().toISOString()
                }
            })

            return response.aiMessage

        } catch (err) {
            const errorMessage = err instanceof ApiError ? err.message : 'Errore durante l\'invio del messaggio'
            setError(errorMessage)
            throw err
        } finally {
            setSending(false)
        }
    }

    const clearError = () => setError(null)

    useEffect(() => {
        fetchConversation()
    }, [fetchConversation])

    return {
        conversation,
        loading,
        error,
        sending,
        refetch: fetchConversation,
        sendMessage,
        clearError
    }
}

// ═══════════════════════════════════════════════════════════
// HOOK: useAISuggestRooms (Suggerimenti camere AI)
// ═══════════════════════════════════════════════════════════
interface UseAISuggestRoomsReturn {
    suggestions: AIRoomSuggestion[],
    loading: boolean,
    error: string | null,
    getSuggestions: (input: SuggestRoomsInput) => Promise<AIRoomSuggestion[]>,
    clearSuggestions: () => void
}

export function useAISuggestRooms(): UseAISuggestRoomsReturn {
    const [suggestions, setSuggestions] = useState<AIRoomSuggestion[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const getSuggestions = async (input: SuggestRoomsInput): Promise<AIRoomSuggestion[]> => {
        try {
            setLoading(true)
            setError(null)

            const data = await apiClient.post<AIRoomSuggestion[]>(
                '/ai/suggest-rooms',
                JSON.stringify(input)
            )

            setSuggestions(data)
            return data

        } catch (err) {
            const errorMessage = err instanceof ApiError
                ? err.message
                : 'Errore durante il recupero dei suggerimenti'
            setError(errorMessage)
            throw err
        } finally {
            setLoading(false)
        }
    }

    const clearSuggestions = () => {
        setSuggestions([])
        setError(null)
    }

    return {
        suggestions,
        loading,
        error,
        getSuggestions,
        clearSuggestions
    }
}

// ═══════════════════════════════════════════════════════════
// HOOK COMPOSITO: useChat (All-in-one)
// ═══════════════════════════════════════════════════════════
interface UseChatReturn {
    conversations: Conversation[],
    conversationsLoading: boolean,
    activeConversation: ConversationWithMessages | null,
    messagesLoading: boolean,
    selectConversation: (id: number) => void,
    createNewChat: (message: string) => Promise<Conversation>,
    sendMessage: (content: string) => Promise<Message>,
    sending: boolean,
    deleteChat: (id: number) => Promise<void>,
    refresh: () => Promise<void>,
    error: string | null,
    clearError: () => void
}

export function useChat(initialConversationId?: number): UseChatReturn {
    const [activeId, setActiveId] = useState<number | null>(initialConversationId || null)

    const {
        conversations,
        loading: conversationsLoading,
        error: conversationsError,
        refetch: refetchConversations,
        createConversation,
        deleteConversation
    } = useConversations()

    const {
        conversation: activeConversation,
        loading: messagesLoading,
        error: messagesError,
        sending,
        refetch: refetchMessages,
        sendMessage: sendMsg,
        clearError: clearMsgError
    } = useConversation(activeId)

    const selectConversation = (id: number) => {
        setActiveId(id)
    }

    const createNewChat = async (message: string): Promise<Conversation> => {
        const newConv = await createConversation({ message })
        setActiveId(newConv.id)
        return newConv
    }

    const sendMessage = async (content: string): Promise<Message> => {
        if (!activeId) {
            throw new Error('Nessuna conversazione attiva')
        }
        return await sendMsg(content)
    }

    const deleteChat = async (id: number): Promise<void> => {
        await deleteConversation(id)
        if (activeId === id) {
            setActiveId(null)
        }
    }

    const refresh = async () => {
        await refetchConversations()
        if (activeId) {
            await refetchMessages()
        }
    }

    const error = conversationsError || messagesError || null

    return {
        conversations,
        conversationsLoading,
        activeConversation,
        messagesLoading,
        sending,
        selectConversation,
        createNewChat,
        sendMessage,
        deleteChat,
        refresh,
        error,
        clearError: clearMsgError
    }
}

    