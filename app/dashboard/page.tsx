'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
    id: number
    name: string
    surname: string
    email: string
    role: string
}

export default function DashboardPage() {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function getUser() {
            try {
                const response = await fetch('/api/user/me')

                if (!response.ok) {
                    router.push('/login')
                    return
                }

                const data = await response.json()
                setUser(data.user)
            } catch (error) {
                console.error('Errore:', error)
                router.push('/login')
            } finally {
                setLoading(false)
            }
        }

        getUser()
    }, [router])

    async function handleLogout() {
        try {
            await fetch('/api/auth/logout', { method: 'POST' })
            router.push('/login')
        } catch (error) {
            console.error('Errore logout:', error)
        }
    }

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '20px'
            }}>
                ⏳ Caricamento...
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div style={{
            maxWidth: '800px',
            margin: '50px auto',
            padding: '20px'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px'
            }}>
                <h1 style={{ margin: 0 }}>Dashboard Hotel Excelsior</h1>
                <button
                    onClick={handleLogout}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    🚪 Logout
                </button>
            </div>

            <div style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: '#f9f9f9'
            }}>
                <h2 style={{ marginTop: 0 }}>👤 Il tuo profilo</h2>

                <div style={{ marginBottom: '15px' }}>
                    <strong>Nome:</strong> {user.name}
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <strong>Cognome:</strong> {user.surname}
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <strong>Email:</strong> {user.email}
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <strong>Ruolo:</strong> {' '}
                    <span style={{
                        padding: '4px 8px',
                        backgroundColor: user.role === 'ADMIN' ? '#28a745' : '#007bff',
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '14px'
                    }}>
                        {user.role}
                    </span>
                </div>
            </div>

            <div style={{
                marginTop: '30px',
                textAlign: 'center',
                color: '#666'
            }}>
                <p>🎉 Benvenuto nella dashboard!</p>
                <p style={{ fontSize: '14px' }}>
                    Presto potrai gestire le prenotazioni dell&apos;Hotel Excelsior 🏨
                </p>
            </div>
        </div>
    )
}