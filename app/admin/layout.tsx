'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Box, LinearProgress } from '@mui/material'
import Navbar from '@/components/layout/Navbar'
import { useAuth } from '@/lib/hooks/useAuth'

export default function AdminLayout({ children }: { children: ReactNode }) {
    const router = useRouter()
    const { user, loading } = useAuth()

    // Se NON è ADMIN → redirect
    useEffect(() => {
        if (!loading && user?.role !== 'ADMIN') {
            router.replace('/user/dashboard')
        }
    }, [user, loading, router])

    if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress />
      </Box>
    )
  }

    // Non mostrare nulla se NON è ADMIN (sta per essere rediretto)
    if (user?.role !== 'ADMIN') {
        return null
    }

    return (
        <>
            <Navbar />
            {children}
        </>
    )
}