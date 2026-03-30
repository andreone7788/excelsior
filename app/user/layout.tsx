import { ReactNode } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

export const metadata = {
    title: 'Dashboard - Excelsior Hotel',
    description: 'La tua dashboard personale per gestire le prenotazioni e il profilo.',
}

export default function UserLayout({ children }: { children: ReactNode }) {
    return (
        <DashboardLayout>
            {children}
        </DashboardLayout>
    )
}