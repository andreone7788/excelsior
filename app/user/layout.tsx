import { ReactNode } from 'react'
import { DashboardUser } from '@/components/layout/DashboardUser'

export const metadata = {
    title: 'Dashboard - Excelsior Hotel',
    description: 'La tua dashboard personale per gestire le prenotazioni e il profilo.',
}

export default function UserLayout({ children }: { children: ReactNode }) {
    return (
        <DashboardUser>
            {children}
        </DashboardUser>
    )
}