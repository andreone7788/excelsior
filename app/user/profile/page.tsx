'use client'

import { useState } from 'react'
import { useUserProfile } from '@/lib/hooks/useUser'
import { useTranslation } from 'react-i18next'
import { Box, Typography, Card, CardContent, TextField, Button, Divider, LinearProgress, Alert, Grid, Paper, Avatar, IconButton, InputAdornment } from '@mui/material'
import { Person, Email, Phone, Lock, Save, Visibility, VisibilityOff } from '@mui/icons-material'
import { UpdateProfileInput, UpdatePasswordInput } from '@/types'
import { logger } from '@/lib/logger'

export default function ProfilePage() {
    const { t } = useTranslation()
    const { user, loading, updating, error, updateProfile, updatePassword, clearError } = useUserProfile()

    // Form profilo - inizializza vuoto
    const [profileForm, setProfileForm] = useState<UpdateProfileInput>({
        name: user?.name || '',
        surname: user?.surname || '',
        email: user?.email || '',
        phone: user?.phone || ''
    })

    // Form password
    const [passwordForm, setPasswordForm] = useState<UpdatePasswordInput>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    })

    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false,
    })

    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    // Aggiorna profilo
    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        clearError()
        setSuccessMessage(null)

        try {
            await updateProfile(profileForm)
            setSuccessMessage(t('profile.updateSuccess'))
            setTimeout(() => setSuccessMessage(null), 3000)
        } catch (err) {
            logger.error('Errore aggiornamento profilo:', err)
        }
    }

    // Aggiorna password
    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        clearError()
        setSuccessMessage(null)

        try {
            await updatePassword(passwordForm)
            setSuccessMessage(t('profile.passwordUpdateSuccess'))
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
            setTimeout(() => setSuccessMessage(null), 3000)
        } catch (err) {
            logger.error('Errore aggiornamento password:', err)
        }
    }

    if (loading) {
        return (
            <Box sx={{ width: '100%', mt: 4 }}>
                <LinearProgress />
            </Box>
        )
    }

    if (!user) {
        return (
            <Alert severity="error">
                {t('profile.userNotFound')}
            </Alert>
        )
    }

    return (
        <Box key={user?.id || 'no-user'}>
            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
                <Avatar
                    sx={{
                        width: 80,
                        height: 80,
                        bgcolor: 'primary.main',
                        fontSize: '2rem',
                        fontWeight: 700
                    }}
                >
                    {user.name?.[0]}{user.surname?.[0]}
                </Avatar>
                <Box>
                    <Typography variant="h4" fontWeight={700}>
                        {t('profile.title')}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {t('profile.subtitle')}
                    </Typography>
                </Box>
            </Box>

            {/* Messaggi globali */}
            {successMessage && (
                <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage(null)}>
                    {successMessage}
                </Alert>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* FORM PROFILO */}
                <Grid size={{ xs: 12, lg: 6 }}>
                    <Card elevation={2}>
                        <CardContent>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                {t('profile.personalInfo')}
                            </Typography>
                            <Divider sx={{ mb: 3 }} />

                            <Box component="form" onSubmit={handleUpdateProfile}>
                                <TextField
                                    fullWidth
                                    label={t('profile.name')}
                                    value={profileForm.name}
                                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                    sx={{ mb: 2 }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Person color="action" />
                                            </InputAdornment>
                                        )
                                    }}
                                />

                                <TextField
                                    fullWidth
                                    label={t('profile.surname')}
                                    value={profileForm.surname}
                                    onChange={(e) => setProfileForm({ ...profileForm, surname: e.target.value })}
                                    sx={{ mb: 2 }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Person color="action" />
                                            </InputAdornment>
                                        )
                                    }}
                                />

                                <TextField
                                    fullWidth
                                    label={t('profile.email')}
                                    type="email"
                                    value={profileForm.email}
                                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                    sx={{ mb: 2 }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Email color="action" />
                                            </InputAdornment>
                                        )
                                    }}
                                />

                                <TextField
                                    fullWidth
                                    label={t('profile.phone')}
                                    type="tel"
                                    value={profileForm.phone}
                                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                    sx={{ mb: 3 }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Phone color="action" />
                                            </InputAdornment>
                                        )
                                    }}
                                />

                                <Button
                                    type="submit"
                                    variant="contained"
                                    fullWidth
                                    size="large"
                                    disabled={updating}
                                    startIcon={<Save />}
                                >
                                    {updating ? t('common.loading') : t('profile.saveChanges')}
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* FORM PASSWORD */}
                <Grid size={{ xs: 12, lg: 6 }}>
                    <Card elevation={2}>
                        <CardContent>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                {t('profile.changePassword')}
                            </Typography>
                            <Divider sx={{ mb: 3 }} />

                            <Box component="form" onSubmit={handleUpdatePassword}>
                                <TextField
                                    fullWidth
                                    label={t('profile.currentPassword')}
                                    type={showPassword.current ? 'text' : 'password'}
                                    value={passwordForm.currentPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                    sx={{ mb: 2 }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Lock color="action" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                                                    edge="end"
                                                >
                                                    {showPassword.current ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />

                                <TextField
                                    fullWidth
                                    label={t('profile.newPassword')}
                                    type={showPassword.new ? 'text' : 'password'}
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                    sx={{ mb: 2 }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Lock color="action" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                                                    edge="end"
                                                >
                                                    {showPassword.new ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />

                                <TextField
                                    fullWidth
                                    label={t('profile.confirmNewPassword')}
                                    type={showPassword.confirm ? 'text' : 'password'}
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                    sx={{ mb: 3 }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Lock color="action" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                                                    edge="end"
                                                >
                                                    {showPassword.confirm ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />

                                <Alert severity="info" sx={{ mb: 3 }}>
                                    <Typography variant="caption">
                                        La password deve contenere almeno 8 caratteri, una maiuscola, una minuscola, un numero e un carattere speciale.
                                    </Typography>
                                </Alert>

                                <Button
                                    type="submit"
                                    variant="contained"
                                    fullWidth
                                    size="large"
                                    disabled={updating}
                                    startIcon={<Save />}
                                >
                                    {updating ? t('common.loading') : 'Aggiorna Password'}
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* STATISTICHE ACCOUNT */}
                <Grid size={{ xs: 12 }}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                            Statistiche Account
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" color="primary" fontWeight={700}>
                                        {user.role}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Ruolo
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" color="success.main" fontWeight={700}>
                                        {new Date(user.createdAt).getFullYear()}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Membro dal
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" color="info.main" fontWeight={700}>
                                        {user.email}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Email verificata
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" color="warning.main" fontWeight={700}>
                                        {new Date(user.updatedAt).toLocaleDateString('it-IT')}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Ultimo aggiornamento
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    )
}
