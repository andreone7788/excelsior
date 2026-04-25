'use client'

/**
 * AdminLayout è un layout specifico per le pagine dell'admin dashboard. Controlla se l'utente è un admin e, in caso contrario, lo reindirizza alla dashboard utente. Se l'utente è un admin, mostra la navbar e il contenuto della pagina.
 * 
 * - Se l'utente non è un admin, viene reindirizzato alla dashboard utente.
 * - Se l'utente è un admin, viene mostrata la navbar e il contenuto della pagina.
 * - Durante il caricamento dei dati dell'utente, viene mostrato un indicatore di caricamento.
 * 
 * Nota: Questo layout è utilizzato solo per le pagine che richiedono privilegi di amministratore. Assicurati di posizionare questo file nella cartella `app/admin` e di utilizzarlo come layout per le pagine dell'admin dashboard.
 * 
 * @component
 * @example
 *   return <AdminLayout>Contenuto della pagina</AdminLayout>

 */

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