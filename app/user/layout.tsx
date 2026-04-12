'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Box, LinearProgress } from '@mui/material'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuth } from '@/lib/hooks/useAuth'

export default function UserLayout({ children }: { children: ReactNode }) {
    const router = useRouter()
    const { user, loading } = useAuth()

    // Se è ADMIN → redirect alla dashboard admin
    useEffect(() => {
        if (!loading && user?.role === 'ADMIN') {
            router.replace('/admin/dashboard')
        }
    }, [user, loading, router])

    if (loading) {
        return (
            <Box sx={{ width: '100%', mt: 4 }}>
                <LinearProgress />
            </Box>
        )
    }

    // Non mostrare nulla se è ADMIN (sta per essere rediretto)
    if (user?.role === 'ADMIN') {
        return null
    }

    return (
        <DashboardLayout>
            {children}
        </DashboardLayout>
    )
}