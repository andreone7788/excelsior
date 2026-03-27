'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { registerAction } from '@/action/auth'
import type { RegisterInput } from '@/types'

export default function RegisterPage() {
    const router = useRouter()
    const [formData, setFormData] = useState<RegisterInput>({
        name: '',
        surname: '',
        email: '',
        password: '',
    })
    const [error, setError] = useState<string>('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)  // ← NUOVO

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const result = await registerAction(formData)

            if (!result.success) {
                setError(result.error || 'Errore durante la registrazione')
                setLoading(false)
                return
            }

            // ✅ Registrazione completata con successo!
            setSuccess(true)
            setLoading(false)

            // ✅ Mostra messaggio per 2 secondi, poi redirect
            setTimeout(() => {
                router.push('/dashboard')
            }, 2000)

        } catch (error) {
            console.error('Errore:', error)
            setError('Errore durante la registrazione')
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    // ✅ Mostra messaggio di successo
    if (success) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                padding: '20px',
                textAlign: 'center'
            }}>
                <div style={{
                    backgroundColor: '#000000',
                    border: '1px solid #c3e6cb',
                    borderRadius: '8px',
                    padding: '30px',
                    maxWidth: '500px',
                    width: '100%'
                }}>
                    <h1 style={{
                        color: '#155724',
                        fontSize: '32px',
                        marginBottom: '20px'
                    }}>
                        🎉 Registrazione completata!
                    </h1>

                    <p style={{
                        fontSize: '18px',
                        color: '#155724',
                        marginBottom: '10px'
                    }}>
                        Benvenuto, <strong>{formData.name}</strong>!
                    </p>

                    <p style={{ color: '#155724' }}>
                        Stai per essere reindirizzato alla dashboard...
                    </p>

                    <div style={{
                        marginTop: '20px',
                        animation: 'spin 1s linear infinite'
                    }}>
                        ⏳
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '20px'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '400px',
                padding: '30px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: '#fff'
            }}>
                <h1 style={{
                    textAlign: 'center',
                    marginBottom: '30px',
                    fontSize: '28px'
                }}>
                    Registrazione
                </h1>

                <form onSubmit={handleSubmit}>
                    {/* Nome */}
                    <div style={{ marginBottom: '20px' }}>
                        <label
                            htmlFor="name"
                            style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontWeight: '500'
                            }}
                        >
                            Nome
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '16px'
                            }}
                        />
                    </div>

                    {/* Cognome */}
                    <div style={{ marginBottom: '20px' }}>
                        <label
                            htmlFor="surname"
                            style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontWeight: '500'
                            }}
                        >
                            Cognome
                        </label>
                        <input
                            type="text"
                            id="surname"
                            name="surname"
                            value={formData.surname}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '16px'
                            }}
                        />
                    </div>

                    {/* Email */}
                    <div style={{ marginBottom: '20px' }}>
                        <label
                            htmlFor="email"
                            style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontWeight: '500'
                            }}
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '16px'
                            }}
                        />
                    </div>

                    {/* Password */}
                    <div style={{ marginBottom: '20px' }}>
                        <label
                            htmlFor="password"
                            style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontWeight: '500'
                            }}
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            minLength={6}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '16px'
                            }}
                        />
                        <small style={{
                            display: 'block',
                            marginTop: '5px',
                            color: '#666'
                        }}>
                            Minimo 6 caratteri
                        </small>
                    </div>

                    {/* Errore */}
                    {error && (
                        <div style={{
                            padding: '12px',
                            backgroundColor: '#f8d7da',
                            border: '1px solid #f5c6cb',
                            borderRadius: '4px',
                            color: '#721c24',
                            marginBottom: '20px'
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Pulsante Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: loading ? '#ccc' : '#007bff',
                            color: 'black',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        {loading ? 'Registrazione in corso...' : 'Registrati'}
                    </button>
                </form>

                {/* Link a Login */}
                <p style={{
                    textAlign: 'center',
                    marginTop: '20px',
                    color: '#666'
                }}>
                    Hai già un account?{' '}
                    <a
                        href="/login"
                        style={{
                            color: '#007bff',
                            textDecoration: 'none',
                            fontWeight: '500'
                        }}
                    >
                        Accedi
                    </a>
                </p>
            </div>
        </div>
    )
}