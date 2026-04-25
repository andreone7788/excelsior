'use client'

/**
 * ContactPage.tsx - Pagina di contatto per l'applicazione Excelsior
 * 
 * Questa pagina include:
 * - Una sezione hero con titolo e sottotitolo
 * - Un modulo di contatto con campi per nome, email, oggetto e messaggio
 * - Informazioni di contatto con icone per indirizzo, telefono, email e orari
 * - Una sezione con mappa integrata (Google Maps)
 * 
 * La pagina utilizza Material-UI per lo styling e i componenti, e supporta l'internazionalizzazione tramite react-i18next.
 * Il modulo di contatto simula l'invio dei dati e mostra messaggi di successo o errore in base al risultato dell'operazione.
 * 
 */

import { Container, Box, Typography, Paper, TextField, Button, Alert, Divider } from '@mui/material'
import Grid from '@mui/material/Grid'
import { LocationOn, Phone, Email, AccessTime, Send } from '@mui/icons-material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function ContactPage() {
    const { t } = useTranslation()
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    })
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(false)

        try {
            // Simulazione invio dati (sostituire con chiamata API reale)
            await new Promise(resolve => setTimeout(resolve, 2000))
            setSuccess(true)
            setFormData({ name: '', email: '', subject: '', message: '' })
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Errore sconosciuto')
        } finally {
            setLoading(false)
        }
    }

    const contactInfo = [
        {
            icon: <LocationOn fontSize="large" color="primary" />,
            label: t('contact.info.address'),
            value: t('contact.info.addressValue')
        },
        {
            icon: <Phone fontSize="large" color="primary" />,
            label: t('contact.info.phone'),
            value: t('contact.info.phoneValue')
        },
        {
            icon: <Email fontSize="large" color="primary" />,
            label: t('contact.info.email'),
            value: t('contact.info.emailValue')
        },
        {
            icon: <AccessTime fontSize="large" color="primary" />,
            label: t('contact.info.hours'),
            value: t('contact.info.hoursValue')
        }
    ]

    return (
        <Box>
            {/* Hero Section */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    py: 8,
                    mb: 6
                }}
            >
                <Container maxWidth="lg">
                    <Typography variant="h2" fontWeight={700} gutterBottom textAlign="center">
                        {t('contact.hero.title')}
                    </Typography>
                    <Typography variant="h5" textAlign="center" sx={{ opacity: 0.9 }}>
                        {t('contact.hero.subtitle')}
                    </Typography>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ mb: 8 }}>
                <Grid container spacing={4}>
                    {/* Form Section */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper elevation={2} sx={{ p: 4 }}>
                            <Typography variant="h4" fontWeight={700} gutterBottom>
                                {t('contact.form.title')}
                            </Typography>
                            <Divider sx={{ mb: 3 }} />

                            {success && (
                                <Alert severity="success" sx={{ mb: 3 }}>
                                    {t('contact.form.success')}
                                </Alert>
                            )}

                            {error && (
                                <Alert severity="error" sx={{ mb: 3 }}>
                                    {t('contact.form.error')}
                                </Alert>
                            )}

                            <Box component="form" onSubmit={handleSubmit}>
                                <TextField
                                    fullWidth
                                    label={t('contact.form.name')}
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder={t('contact.form.namePlaceholder')}
                                    required
                                    sx={{ mb: 2 }}
                                />

                                <TextField
                                    fullWidth
                                    type="email"
                                    label={t('contact.form.email')}
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder={t('contact.form.emailPlaceholder')}
                                    required
                                    sx={{ mb: 2 }}
                                />

                                <TextField
                                    fullWidth
                                    label={t('contact.form.subject')}
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    placeholder={t('contact.form.subjectPlaceholder')}
                                    required
                                    sx={{ mb: 2 }}
                                />

                                <TextField
                                    fullWidth
                                    multiline
                                    rows={6}
                                    label={t('contact.form.message')}
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder={t('contact.form.messagePlaceholder')}
                                    required
                                    sx={{ mb: 3 }}
                                />

                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    disabled={loading}
                                    startIcon={<Send />}
                                >
                                    {loading ? t('contact.form.sending') : t('contact.form.send')}
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Contact Info Section */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper elevation={2} sx={{ p: 4, mb: 3 }}>
                            <Typography variant="h4" fontWeight={700} gutterBottom>
                                {t('contact.info.title')}
                            </Typography>
                            <Divider sx={{ mb: 3 }} />

                            <Grid container spacing={3}>
                                {contactInfo.map((info, index) => (
                                    <Grid size={{ xs: 12 }} key={index}>
                                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                            {info.icon}
                                            <Box>
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    {info.label}
                                                </Typography>
                                                <Typography variant="body1" fontWeight={500}>
                                                    {info.value}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </Paper>

                        {/* Map Section */}
                        <Paper elevation={2} sx={{ p: 4 }}>
                            <Typography variant="h5" fontWeight={700} gutterBottom>
                                {t('contact.map.title')}
                            </Typography>
                            <Divider sx={{ mb: 3 }} />
                            <Box
                                sx={{
                                    width: '100%',
                                    height: 300,
                                    borderRadius: 2,
                                    overflow: 'hidden'
                                }}
                            >
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2969.5358782453!2d12.496365515562837!3d41.90278197922131!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x132f61b6532013ad%3A0x28f1c82e908503c4!2sColosseum!5e0!3m2!1sen!2sit!4v1234567890"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                />
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    )
}