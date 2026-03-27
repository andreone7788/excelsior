'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/NavBar'
import UserDashboard from '@/components/dashboard/userDashboard'
import { useAuth } from '@/lib/hooks/useAuth'

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  // Se è ADMIN → redirect
  useEffect(() => {
    if (!loading && user?.role === 'ADMIN') {
      router.replace('/admin/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '20px'
      }}>
        Caricamento...
      </div>
    )
  }

  // Non mostrare nulla se è ADMIN (sta per essere rediretto)
  if (user?.role === 'ADMIN') {
    return null
  }

  return (
    <>
      <Navbar />
      <UserDashboard />
    </>
  )
}