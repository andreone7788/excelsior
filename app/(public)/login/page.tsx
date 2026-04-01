'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/lib/hooks/useAuth'
import { Container, Paper, TextField, Button, Typography, Box, Alert, CircularProgress, Divider, FormControlLabel, Checkbox } from '@mui/material'
import { Login as LoginIcon } from '@mui/icons-material'

export default function LoginPage() {
    const { t } = useTranslation()
    const router = useRouter()
    const { login } = useAuth()

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false,
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            await login(formData)
            router.push('/user/dashboard')
        } catch (err) {
            setError((err instanceof Error ? err.message : t('auth.login.errors.generic')))
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }))
    }

    return (
        <Container maxWidth="sm" sx={{ mt: 8, mb: 8 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                {/* Header */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <LoginIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                        {t('auth.login.title')}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {t('auth.login.subtitle')}
                    </Typography>
                </Box>

                {/* Error Alert */}
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {/* Form */}
                <Box component="form" onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label={t('auth.login.email')}
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder={t('auth.login.emailPlaceholder')}
                        required
                        autoComplete="email"
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        fullWidth
                        label={t('auth.login.password')}
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder={t('auth.login.passwordPlaceholder')}
                        required
                        autoComplete="current-password"
                        sx={{ mb: 2 }}
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="rememberMe"
                                    checked={formData.rememberMe}
                                    onChange={handleChange}
                                    color="primary"
                                />
                            }
                            label={t('auth.login.rememberMe')}
                        />
                        <Link href="/forgot-password" style={{ textDecoration: 'none' }}>
                            <Typography variant="body2" color="primary" sx={{ '&:hover': { textDecoration: 'underline' } }}>
                                {t('auth.login.forgotPassword')}
                            </Typography>
                        </Link>
                    </Box>

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={loading}
                        sx={{ mb: 2, py: 1.5 }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : t('auth.login.submit')}
                    </Button>

                    <Divider sx={{ my: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                            {t('auth.login.or')}
                        </Typography>
                    </Divider>

                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            {t('auth.login.noAccount')}{' '}
                            <Link href="/register" style={{ textDecoration: 'none' }}>
                                <Typography component="span" variant="body2" color="primary" fontWeight={600} sx={{ '&:hover': { textDecoration: 'underline' } }}>
                                    {t('auth.login.registerLink')}
                                </Typography>
                            </Link>
                        </Typography>
                    </Box>
                </Box>
            </Paper>
        </Container>
    )
}