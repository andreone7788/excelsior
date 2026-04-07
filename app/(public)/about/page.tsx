'use client'

import { Container, Box, Typography, Paper, Divider } from '@mui/material'
import Grid from '@mui/material/Grid'
import { Hotel, Star, People, CheckCircle } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'

export default function AboutPage() {
    const { t } = useTranslation()

    const values = [
        {
            icon: <Hotel fontSize="large" color="primary" />,
            title: t('about.values.quality.title'),
            description: t('about.values.quality.description')
        },
        {
            icon: <Star fontSize="large" color="primary" />,
            title: t('about.values.excellence.title'),
            description: t('about.values.excellence.description')
        },
        {
            icon: <People fontSize="large" color="primary" />,
            title: t('about.values.customerFocus.title'),
            description: t('about.values.customerFocus.description')
        },
        {
            icon: <CheckCircle fontSize="large" color="primary" />,
            title: t('about.values.reliability.title'),
            description: t('about.values.reliability.description')
        }
    ]

    const stats = [
        { value: '50+', label: t('about.stats.hotels') },
        { value: '100+', label: t('about.stats.customers') },
        { value: '10K+', label: t('about.stats.bookings') },
        { value: '24/7', label: t('about.stats.support') }
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
                        {t('about.hero.title')}
                    </Typography>
                    <Typography variant="h5" textAlign="center" sx={{ opacity: 0.9 }}>
                        {t('about.hero.subtitle')}
                    </Typography>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ mb: 8 }}>
                {/* Storia */}
                <Paper elevation={2} sx={{ p: 4, mb: 6 }}>
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                        {t('about.history.title')}
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    <Typography variant="body1" color="text.secondary" paragraph>
                        {t('about.history.paragraph1')}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                        {t('about.history.paragraph2')}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                        {t('about.history.paragraph3')}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {t('about.history.paragraph4')}
                    </Typography>
                </Paper>

                {/* Valori */}
                <Typography variant="h4" fontWeight={700} gutterBottom textAlign="center" sx={{ mb: 4 }}>
                    {t('about.values.title')}
                </Typography>

                <Grid container spacing={4} sx={{ mb: 6 }}>
                    {values.map((value, index) => (
                        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 3,
                                    height: '100%',
                                    textAlign: 'center',
                                    transition: 'transform 0.3s',
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        boxShadow: 4
                                    }
                                }}
                            >
                                <Box sx={{ mb: 2 }}>
                                    {value.icon}
                                </Box>
                                <Typography variant="h6" fontWeight={600} gutterBottom>
                                    {value.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {value.description}
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>

                {/* Statistiche */}
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white'
                    }}
                >
                    <Grid container spacing={4}>
                        {stats.map((stat, index) => (
                            <Grid size={{ xs: 6, md: 3 }} key={index}>
                                <Box textAlign="center">
                                    <Typography variant="h2" fontWeight={700}>
                                        {stat.value}
                                    </Typography>
                                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                        {stat.label}
                                    </Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Paper>
            </Container>
        </Box>
    )
}