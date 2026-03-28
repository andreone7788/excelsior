'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Container, Paper, TextField, Button, Typography, Box, Alert, CircularProgress, Divider } from '@mui/material'
import { LoginOutlined } from '@mui/icons-material'

export default function LoginPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Errore durante il login')
            }

            // Reindirizza alla dashboard dopo il login
            router.push('/user/dashboard')
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Errore sconosciuto')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                bgcolor: 'background.default',
                py: 4,
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        borderRadius: 2,
                    }}
                >
                    {/* Header */}
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <LoginOutlined
                            sx={{
                                fontSize: 48,
                                color: 'primary.main',
                                mb: 1,
                            }}
                        />
                        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
                            Benvenuto
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Accedi al tuo account Excelsior
                        </Typography>
                    </Box>

                    {/* Error Alert */}
                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Form */}
                    <form onSubmit={(e) => handleSubmit(e)}>
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            margin="normal"
                            required
                            autoComplete="email"
                            autoFocus
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            disabled={loading}
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            type="password"
                            margin="normal"
                            required
                            autoComplete="current-password"
                            value={formData.password}
                            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                            disabled={loading}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{
                                mt: 3,
                                mb: 2,
                                py: 1.5,
                            }}
                        >
                            {loading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                'Accedi'
                            )}
                        </Button>
                    </form>

                    {/* Divider */}
                    <Divider sx={{ my: 3 }} />

                    {/* Register Link */}
                    <Typography variant="body2" align="center" color="text.secondary">
                        Non hai ancora un account?{' '}
                        <Link
                            href="/register"
                            style={{
                                color: '#1976d2',
                                textDecoration: 'none',
                                fontWeight: 600,
                            }}
                        >
                            Registrati ora
                        </Link>
                    </Typography>

                    {/* Test Credentials (solo per sviluppo) */}
                    <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                        <Typography variant="caption" display="block" gutterBottom fontWeight={600}>
                            🔧 Credenziali di test:
                        </Typography>
                        <Typography variant="caption" display="block">
                            Email: test@example.com
                        </Typography>
                        <Typography variant="caption" display="block">
                            Password: password123
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </Box>
    )
}
