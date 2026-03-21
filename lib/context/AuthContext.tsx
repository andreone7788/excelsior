'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter } from "next/navigation"
import apiClient from "../api-client"
import type { User, LoginInput, RegisterInput, AuthResponse } from "@/types"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (credentials: LoginInput) => Promise<void>
  register: (data: RegisterInput) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
  isAuthenticated: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children } : { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadUser()
  }, [])

  async function loadUser() {
    try {
      const response = await fetch('/api/user/me')

      if (!response.ok) {
        setUser(null)
        return
      }

      const data = await response.json()
      setUser(data)
    } catch (error) {
      console.error('Errore durante il caricamento dell\'utente:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  async function login(credentials: LoginInput) {
    try {
      setLoading(true)

      const response = await apiClient.post<AuthResponse>('/api/auth/login', JSON.stringify(credentials))

      setUser(response.user)

      if (response.user.role === 'ADMIN') {
        router.push('/admin/dashboard')
      } else {
        router.push('/dashboard')
      }

      router.refresh()

    } catch (error) {
      console.error('Errore durante il login:', error)
      throw error
    } finally {
      setLoading(false)
    }
}

  async function register(data: RegisterInput) {
    try {
      setLoading(true)

      const response = await apiClient.post<AuthResponse>('/api/auth/register', JSON.stringify(data))

      setUser(response.user)
      router.refresh()
    } catch (error) {
      console.error('Errore durante la registrazione:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  async function logout() {
    try {
      setLoading(true)

      await apiClient.post('/api/auth/logout')
      router.push('/login')
    } catch (error) {
      console.error('Errore durante il logout:', error)
    } finally {
      setUser(null)
      setLoading(false)
      router.push('/login')
      router.refresh()
    }
  }

  async function refreshUser() {
    await loadUser()
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth deve essere usato all\'interno di un AuthProvider')
  }

  return context
}
  
