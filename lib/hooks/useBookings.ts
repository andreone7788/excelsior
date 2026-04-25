'use client'

import { useState, useEffect, useCallback } from 'react'
import apiClient, { ApiError } from '@/lib/api-client'
import type { Booking, BookingSearchFilters, CreateBookingInput, UpdateBookingStatusInput, BookingWithRelations, RequestModificationInput } from '@/types'
import { logger } from '../logger'

// Tipo per il return di useBookings (lista prenotazioni)
interface UseBookingsReturn {
  bookings: Booking[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createBooking: (data: CreateBookingInput) => Promise<Booking>
  updateBookingStatus: (id: number, data: UpdateBookingStatusInput) => Promise<Booking>
  cancelBooking: (id: number) => Promise<void>
  requestBookingModification: (id: number, data: RequestModificationInput) => Promise<Booking>
}

/**
 * Hook per gestire le prenotazioni
 * @param filters - Filtri di ricerca (opzionali)
 * @param autoFetch - Se true, carica le prenotazioni automaticamente (default: true)
 */
export function useBookings(
  filters?: BookingSearchFilters,
  autoFetch: boolean = true
): UseBookingsReturn {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch prenotazioni con filtri
   */
  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Costruzione query params
      const params = new URLSearchParams()

      if (filters?.status) {
        params.append('status', filters.status)
      }
      if (filters?.startDate) {
        params.append('startDate', filters.startDate)
      }
      if (filters?.endDate) {
        params.append('endDate', filters.endDate)
      }
      if (filters?.userId) {
        params.append('userId', filters.userId.toString())
      }
      if (filters?.roomId) {
        params.append('roomId', filters.roomId.toString())
      }

      const query = params.toString()
      const endpoint = query ? `/bookings?${query}` : '/bookings'

      const data = await apiClient.get<Booking[]>(endpoint)
      setBookings(data)
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : 'Errore durante il caricamento delle prenotazioni'
      setError(errorMessage)
      logger.error('useBookings error:', err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  /**
   * Crea nuova prenotazione
   */
  const createBooking = async (data: CreateBookingInput): Promise<Booking> => {
    try {
      setLoading(true)
      setError(null)

      const newBooking = await apiClient.post<Booking>('/bookings', JSON.stringify(data))

      // Aggiorna lista locale
      setBookings(prev => [...prev, newBooking])

      return newBooking
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Errore durante la creazione della prenotazione'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  /**
   * Aggiorna stato prenotazione (ADMIN)
   */
  const updateBookingStatus = async (
    id: number,
    data: UpdateBookingStatusInput
  ): Promise<Booking> => {
    try {
      setLoading(true)
      setError(null)

      const updatedBooking = await apiClient.put<Booking>(
        `/admin/bookings/${id}/status`, JSON.stringify(data)
      )

      // Aggiorna lista locale
      setBookings(prev => prev.map(booking =>
        booking.id === id ? updatedBooking : booking
      ))

      return updatedBooking
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Errore durante l\'aggiornamento della prenotazione'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  /**
   * Cancella prenotazione
   */
  const cancelBooking = async (id: number): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      await apiClient.delete(`/bookings/${id}`)

      // Rimuovi dalla lista locale
      setBookings(prev => prev.filter(booking => booking.id !== id))
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Errore durante la cancellazione della prenotazione'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  /**
   * Richiede modifica prenotazione (utente)
   */
  const requestBookingModification = async (id: number, data: RequestModificationInput): Promise<Booking> => {
    try {
      setLoading(true)
      setError(null)

      const updated = await apiClient.put<Booking>(
        `/bookings/${id}/modification`, JSON.stringify(data)
      )

      // Aggiorna lista locale
      setBookings(prev => prev.map(booking =>
        booking.id === id ? updated : booking
      ))

      return updated
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Errore durante la richiesta di modifica della prenotazione'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Auto-fetch al mount o quando cambiano i filtri
  useEffect(() => {
    if (autoFetch) {
      fetchBookings()
    }
  }, [autoFetch, fetchBookings])

  return {
    bookings,
    loading,
    error,
    refetch: fetchBookings,
    createBooking,
    updateBookingStatus,
    cancelBooking,
    requestBookingModification
  }
}

/**
 * Hook per ottenere una singola prenotazione
 */

// Tipo per il return di useBooking (singola prenotazione)
interface UseBookingReturn {
  booking: BookingWithRelations | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useBooking(id: number): UseBookingReturn {
  const [booking, setBooking] = useState<BookingWithRelations | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBooking = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await apiClient.get<BookingWithRelations>(`/bookings/${id}`)
      setBooking(data)
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : 'Errore durante il caricamento della prenotazione'
      setError(errorMessage)
      logger.error('useBooking error:', err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) {
      fetchBooking()
    }
  }, [id, fetchBooking])

  return { booking, loading, error, refetch: fetchBooking }
}

/**
 * Hook per le prenotazioni dell'utente loggato
 */
export function useMyBookings() {
  const [bookings, setBookings] = useState<BookingWithRelations[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMyBookings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.get<{ bookings: BookingWithRelations[]; total: number }>(
        '/user/bookings'
      )
      setBookings(response.bookings)
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : 'Errore durante il caricamento delle tue prenotazioni'
      setError(errorMessage)
      logger.error('useMyBookings error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMyBookings()
  }, [fetchMyBookings])

  return {
    bookings,
    loading,
    error,
    refetch: fetchMyBookings
  }
}