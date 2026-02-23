'use client'

import { useEffect, useState } from 'react'

interface User {
  id: number
  name: string
  surname: string
  email: string
  role: 'USER' | 'ADMIN'
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user/me')
        
        if (!response.ok) {
          throw new Error('Non autenticato')
        }

        const data = await response.json()
        
        // 🔧 IMPORTANTE: data contiene già l'utente direttamente
        console.log('📦 Hook useUser - data ricevuti:', data)
        
        setUser(data)  // ← NON data.user.user!
      } catch (err) {
        console.error('❌ useUser: Errore:', err)
        setError(err instanceof Error ? err.message : 'Errore sconosciuto')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  return { user, loading, error }
}