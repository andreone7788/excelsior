'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { Box, Container, Paper, TextField, Button, Typography, Alert, Divider, Checkbox, FormControlLabel, CircularProgress, Grid, InputAdornment, IconButton } from '@mui/material'
import { PersonAdd, Visibility, VisibilityOff } from '@mui/icons-material'

export default function RegisterPage() {
  const { t } = useTranslation()
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (formData.name.length < 2) {
      newErrors.name = t('auth.register.errors.nameMin')
    }
    if (formData.surname.length < 2) {
      newErrors.surname = t('auth.register.errors.surnameMin')
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('auth.register.errors.invalidEmail')
    }
    if (formData.password.length < 8) {
      newErrors.password = t('auth.register.errors.passwordMin')
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.register.errors.passwordMismatch')
    }
    if (formData.phone && formData.phone.length < 10) {
      newErrors.phone = t('auth.register.errors.phoneMin')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError('')

    if (!validateForm()) return

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          surname: formData.surname,
          email: formData.email,
          phone: formData.phone || undefined,
          password: formData.password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || t('auth.register.errors.generic'))
      }

      // Registrazione ok → redirect a login
      router.push('/login?registered=true')
    } catch (err) {
      setApiError(err instanceof Error ? err.message : t('auth.register.errors.generic'))
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
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <PersonAdd sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" fontWeight={700} gutterBottom>
            {t('auth.register.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('auth.register.subtitle')}
          </Typography>
        </Box>

        {/* Error Alert */}
        {apiError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {apiError}
          </Alert>
        )}

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Name */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={t('auth.register.name')}
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t('auth.register.namePlaceholder')}
                required
                error={!!errors.name}
                helperText={errors.name}
              />
            </Grid>
          </Grid>

          {/* Surname */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label={t('auth.register.surname')}
              name="surname"
              value={formData.surname}
              onChange={handleChange}
              placeholder={t('auth.register.surnamePlaceholder')}
              required
              error={!!errors.surname}
              helperText={errors.surname}
            />
          </Grid>

          {/* Email */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label={t('auth.register.email')}
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t('auth.register.emailPlaceholder')}
              required
              error={!!errors.email}
              helperText={errors.email}
            />
          </Grid>

          {/* Phone */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label={`${t('auth.register.phone')} ${t('auth.register.phoneOptional')}`}
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder={t('auth.register.phonePlaceholder')}
              error={!!errors.phone}
              helperText={errors.phone}
            />
          </Grid>

          {/* Password */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label={t('auth.register.password')}
              name="password"
              type={showPassword ? 'text' : 'password'}  // <-- Dinamico!
              value={formData.password}
              onChange={handleChange}
              placeholder={t('auth.register.passwordPlaceholder')}
              required
              error={!!errors.password}
              helperText={errors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      onMouseDown={(e) => e.preventDefault()} // Evita blur
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          {/* Confirm Password */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label={t('auth.register.confirmPassword')}
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}  // <-- Dinamico!
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder={t('auth.register.confirmPasswordPlaceholder')}
              required
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      onMouseDown={(e) => e.preventDefault()} // Evita blur
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          {/* Terms */}
          <FormControlLabel
            control={
              <Checkbox
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                color="primary"
                required
              />
            }
            label={
              <Typography variant="body2">
                {t('auth.register.acceptTerms')}{' '}
                <Link href="/terms" style={{ color: 'inherit', fontWeight: 600 }}>
                  {t('auth.register.termsLink')}
                </Link>{' '}
                {t('auth.register.and')}{' '}
                <Link href="/privacy" style={{ color: 'inherit', fontWeight: 600 }}>
                  {t('auth.register.privacyLink')}
                </Link>
              </Typography>
            }
            sx={{ mt: 2, mb: 3 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading || !formData.acceptTerms}
            sx={{ mb: 2, py: 1.5 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : t('auth.register.submit')}
          </Button>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {t('auth.register.hasAccount')}{' '}
              <Link href="/login" style={{ textDecoration: 'none' }}>
                <Typography component="span" variant="body2" color="primary" fontWeight={600} sx={{ '&:hover': { textDecoration: 'underline' } }}>
                  {t('auth.register.loginLink')}
                </Typography>
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  )
}