'use client'

import { useState } from 'react'
import { registerAction } from '@/action/auth'
import { RegisterInput } from '@/types'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const data: RegisterInput = {
            name: formData.get('name') as string,
            surname: formData.get('surname') as string,
            email: formData.get('email') as string,
            password: formData.get('password') as string,
        }

        const result = await registerAction(data)

        if (result.success) {
            router.push('/dashboard')
        } else {
            setError(result.message || 'Errore sconosciuto durante la registrazione')
            setLoading(false)
        }
    }

    return (
        <div style={{
            maxWidth: '400px',
            margin: '100px auto',
            padding: '20px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
            <h1 style={{
                textAlign: 'center',
                marginBottom: '10px',
                color: '#333'
            }}>
                Registrazione
            </h1>

            <p style={{
                textAlign: 'center',
                color: '#666',
                fontSize: '14px',
                marginBottom: '30px'
            }}>
                Crea il tuo account per prenotare camere
            </p>

            {error && (
                <div style={{
                    padding: '12px',
                    marginBottom: '20px',
                    backgroundColor: '#fee',
                    color: '#c00',
                    borderRadius: '4px',
                    border: '1px solid #fcc',
                    fontSize: '14px'
                }}>
                    ⚠️ {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label
                        htmlFor="name"
                        style={{
                            display: 'block',
                            marginBottom: '5px',
                            fontWeight: '500',
                            fontSize: '14px'
                        }}
                    >
                        Nome *
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        style={{
                            width: '100%',
                            padding: '10px',
                            fontSize: '14px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label
                        htmlFor="surname"
                        style={{
                            display: 'block',
                            marginBottom: '5px',
                            fontWeight: '500',
                            fontSize: '14px'
                        }}
                    >
                        Cognome *
                    </label>
                    <input
                        type="text"
                        id="surname"
                        name="surname"
                        required
                        style={{
                            width: '100%',
                            padding: '10px',
                            fontSize: '14px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label
                        htmlFor="email"
                        style={{
                            display: 'block',
                            marginBottom: '5px',
                            fontWeight: '500',
                            fontSize: '14px'
                        }}
                    >
                        Email *
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        style={{
                            width: '100%',
                            padding: '10px',
                            fontSize: '14px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label
                        htmlFor="password"
                        style={{
                            display: 'block',
                            marginBottom: '5px',
                            fontWeight: '500',
                            fontSize: '14px'
                        }}
                    >
                        Password *
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        required
                        minLength={8}
                        style={{
                            width: '100%',
                            padding: '10px',
                            fontSize: '14px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            boxSizing: 'border-box'
                        }}
                    />
                    <small style={{
                        color: '#666',
                        fontSize: '12px',
                        display: 'block',
                        marginTop: '5px'
                    }}>
                        Min 8 caratteri, 1 maiuscola, 1 numero, 1 carattere speciale
                    </small>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '12px',
                        fontSize: '16px',
                        backgroundColor: loading ? '#ccc' : '#0070f3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    {loading ? '⏳ Registrazione in corso...' : '✅ Registrati'}
                </button>
            </form>

            <p style={{
                marginTop: '20px',
                textAlign: 'center',
                color: '#666',
                fontSize: '14px'
            }}>
                Hai già un account?{' '}
                <a
                    href="/login"
                    style={{
                        color: '#0070f3',
                        textDecoration: 'none',
                        fontWeight: '500'
                    }}
                >
                    Accedi
                </a>
            </p>
        </div>
    )
}