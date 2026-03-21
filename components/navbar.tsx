'use client'

import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/hooks/AuthContext'

export default function Navbar() {
    const router = useRouter()
    const { user, loading } = useUser()

const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' })
            router.push('/login')
            router.refresh()
        } catch (error) {
            console.error('Errore logout:', error)
        }
    }

    // 🔧 AGGIUNGI !user QUI ANCHE
    if (loading || !user) {
        console.log('🔔 Navbar - Mostro loader perché:', { loading, user })
        return (
            <nav style={{
                padding: '15px 30px',
                backgroundColor: '#1a1a2e',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                    🏨 Hotel Excelsior
                </div>
                <div>Caricamento...</div>
            </nav>
        )
    }

    console.log('🔔 Navbar - Mostro dati utente:', user)

    return (
        <nav style={{
            padding: '15px 30px',
            backgroundColor: '#1a1a2e',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
            {/* Logo */}
            <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                cursor: 'pointer'
            }}
                onClick={() => router.push(user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard')}
            >
                🏨 Hotel Excelsior
            </div>

            {/* User info + Logout */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px'
            }}>
                {/* Nome utente + ruolo */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end'
                }}>
                    <span style={{ fontWeight: '500' }}>
                        {user.name} {user.surname}
                    </span>
                    <span style={{
                        fontSize: '12px',
                        color: user.role === 'ADMIN' ? '#ffd700' : '#a0a0a0',
                        fontWeight: user.role === 'ADMIN' ? 'bold' : 'normal'
                    }}>
                        {user.role === 'ADMIN' ? '👑 Amministratore' : '👤 Utente'}
                    </span>
                </div>

                {/* Pulsante Logout */}
                <button
                    onClick={handleLogout}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
                >
                    Logout
                </button>
            </div>
        </nav>
    )
}