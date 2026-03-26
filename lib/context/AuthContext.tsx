'use client'

import { createContext, useState, useEffect, ReactNode } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@/types"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (user: User) => Promise<void>
  register: (user: User) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
  isAuthenticated: boolean
  isAdmin: boolean
  isUser: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
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

  async function login(userData: User) {
    setUser(userData)

    // Routing basato su ruolo
    if (userData.role === 'ADMIN') {
      router.push('/admin/dashboard')
    } else {
      router.push('/user/dashboard')
    }

    router.refresh()
  }

  async function register(userData: User) {
    setUser(userData)
    router.push('/user/dashboard')
    router.refresh()
  }

  async function logout() {
    setUser(null)
    router.push('/login')
    router.refresh()
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
    isUser: user?.role === 'USER',
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}