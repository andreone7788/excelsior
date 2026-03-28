'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Container, Paper, TextField, Button, Typography, Box, Alert, CircularProgress, Divider } from '@mui/material'
import { PersonAddOutlined } from '@mui/icons-material'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validazione password
    if (formData.password !== formData.confirmPassword) {
      setError('Le password non coincidono')
      setLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError('La password deve contenere almeno 8 caratteri')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          surname: formData.surname,
          phone: formData.phone,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Errore durante la registrazione')
      }

      // Redirect to dashboard
      router.push('/user/dashboard')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante la registrazione')
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
            <PersonAddOutlined
              sx={{
                fontSize: 48,
                color: 'primary.main',
                mb: 1,
              }}
            />
            <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
              Crea Account
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Unisciti a Excelsior Hotel
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Nome"
              margin="normal"
              required
              autoComplete="name"
              autoFocus
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Cognome"
              margin="normal"
              required
              autoComplete="family-name"
              value={formData.surname}
              onChange={(e) => setFormData(prev => ({ ...prev, surname: e.target.value }))}
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Telefono"
              margin="normal"
              required
              autoComplete="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              margin="normal"
              required
              autoComplete="email"
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
              autoComplete="new-password"
              helperText="Minimo 8 caratteri"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Conferma Password"
              type="password"
              margin="normal"
              required
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
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
                'Registrati'
              )}
            </Button>
          </form>

          {/* Divider */}
          <Divider sx={{ my: 3 }} />

          {/* Login Link */}
          <Typography variant="body2" align="center" color="text.secondary">
            Hai già un account?{' '}
            <Link
              href="/login"
              style={{
                color: '#1976d2',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              Accedi
            </Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  )
}
