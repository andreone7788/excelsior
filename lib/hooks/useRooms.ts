'use client'

import { useState, useEffect, useCallback } from 'react'
import apiClient, { ApiError } from '@/lib/api-client'
import type { Room, RoomSearchFilters, CreateRoomInput, UpdateRoomInput } from '@/types'
import { logger } from '../logger'

// Tipo per il return di useRooms (lista di camere)
interface UseRoomsReturn {
    rooms: Room[]
    loading: boolean
    error: string | null
    refetch: () => Promise<void>
    createRoom: (data: CreateRoomInput) => Promise<Room>
    updateRoom: (id: number, data: UpdateRoomInput) => Promise<Room>
    deleteRoom: (id: number) => Promise<void>
}

// Tipo per il return di useRoom (singola camera)
interface UseRoomReturn {
    room: Room | null
    loading: boolean
    error: string | null
    refetch: () => Promise<void>
}

/**
 * Hook per gestire le camere
 * @param filters - Filtri di ricerca (opzionali)
 * @param autoFetch - Se true, carica le camere automaticamente (default: true)
 */
export function useRooms(filters?: RoomSearchFilters, autoFetch: boolean = true): UseRoomsReturn {
    const [rooms, setRooms] = useState<Room[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    /**
    * Fetch camere con filtri
    */
    const fetchRooms = useCallback(async () => {
        try {

            setLoading(true)
            setError(null)

            // Costruzione query params
            const params = new URLSearchParams()

            if (filters?.capacity) {
                params.append('capacity', filters.capacity.toString())
            }
            if (filters?.minPrice) {
                params.append('minPrice', filters.minPrice.toString())
            }
            if (filters?.maxPrice) {
                params.append('maxPrice', filters.maxPrice.toString())
            }
            if (filters?.available) {
                params.append('available', filters.available.toString())
            }
            if (filters?.amenities) {
                params.append('amenities', filters.amenities.join(','))
            }
            if (filters?.sortBy) {
                params.append('sortBy', filters.sortBy)
            }
            if (filters?.sortOrder) {
                params.append('sortOrder', filters.sortOrder)
            }

            const query = params.toString() ? `?${params.toString()}` : ''
            const endpoint = query ? `/rooms?${query}` : '/rooms'

            const data = await apiClient.get<{ rooms: Room[], count: number }>(endpoint)
            setRooms(data.rooms || [])
            setLoading(false)

        } catch (err) {
            const errorMessage = err instanceof ApiError ? err.message : 'Errore durante il caricamento delle camere'
            setError(errorMessage)
            logger.error('useRooms error:', err)
        } finally {
            setLoading(false)
        }
    }, [filters])

    /**
     * Crea nuova camera (ADMIN)
     */
    const createRoom = async (data: CreateRoomInput): Promise<Room> => {
        try {
            setLoading(true)
            setError(null)

            const newRoom = await apiClient.post<Room>('/rooms', JSON.stringify(data))

            // Aggiorna lista locale
            setRooms(prev => [...prev, newRoom])

            return newRoom
        } catch (err) {
            const errorMessage = err instanceof ApiError ? err.message : 'Errore durante la creazione della camera'
            setError(errorMessage)
            logger.error('createRoom error:', err)
            throw err
        } finally {
            setLoading(false)
        }
    }

    /**
 * Aggiorna camera esistente (ADMIN)
 */
    const updateRoom = async (id: number, data: UpdateRoomInput): Promise<Room> => {
        try {
            setLoading(true)
            setError(null)

            const updatedRoom = await apiClient.put<Room>(`/rooms/${id}`, JSON.stringify(data))

            // Aggiorna lista locale
            setRooms(prev => prev.map(room => room.id === id ? updatedRoom : room
            ))

            return updatedRoom
        } catch (err) {
            const errorMessage = err instanceof ApiError ? err.message : 'Errore durante l\'aggiornamento della camera'
            setError(errorMessage)
            logger.error('updateRoom error:', err)
            throw err
        } finally {
            setLoading(false)
        }
    }

    /**
   * Elimina camera (ADMIN)
   */
    const deleteRoom = async (id: number): Promise<void> => {
        try {
            setLoading(true)
            setError(null)

            await apiClient.delete(`/rooms/${id}`)

            // Rimuovi dalla lista locale
            setRooms(prev => prev.filter(room => room.id !== id))
        } catch (err) {
            const errorMessage = err instanceof ApiError ? err.message : 'Errore durante l\'eliminazione della camera'
            setError(errorMessage)
            logger.error('deleteRoom error:', err)
            throw err
        } finally {
            setLoading(false)
        }
    }

    // Auto-fetch al mount o quando cambiano i filtri
    useEffect(() => {
        if (autoFetch) {
            fetchRooms()
        }
    }, [fetchRooms, autoFetch])

    return {
        rooms,
        loading,
        error,
        refetch: fetchRooms,
        createRoom,
        updateRoom,
        deleteRoom
    }
}

/**
 * Hook per ottenere una singola camera
 */
export function useRoom(id: number): UseRoomReturn {
    const [room, setRoom] = useState<Room | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const fetchRoom = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const data = await apiClient.get<{ room: Room }>(`/rooms/${id}`)
            setRoom(data.room)
        } catch (err) {
            const errorMessage = err instanceof ApiError
                ? err.message
                : 'Errore durante il caricamento della camera'
            setError(errorMessage)
            logger.error('useRoom error:', err)
        } finally {
            setLoading(false)
        }
    }, [id])

    useEffect(() => {
        if (id) {
            fetchRoom()
        }
    }, [id, fetchRoom])

    return { room, loading, error, refetch: fetchRoom }
}