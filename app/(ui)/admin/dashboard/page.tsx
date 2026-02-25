'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import AdminDashboard from '@/components/dashboard/adminDashboard'
import { useUser } from '@/lib/hooks/useUser'

export default function AdminDashboardPage() {
  const router = useRouter()
  const { user, loading } = useUser()

  // Se NON è ADMIN → redirect
  useEffect(() => {
    if (!loading && user?.role !== 'ADMIN') {
      router.replace('/dashboard')
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

  // Non mostrare nulla se NON è ADMIN (sta per essere rediretto)
  if (user?.role !== 'ADMIN') {
    return null
  }

  return (
    <>
      <Navbar />
      <AdminDashboard />
    </>
  )
}