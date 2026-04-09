'use client'

import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import Grid from '@mui/material/Grid'
import { Button, Container, Typography, Box, Card, CardContent } from '@mui/material'
import { Hotel, Star, LocalOffer, SupportAgent } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'

export default function HomePage() {
  const { t } = useTranslation()

  const features = [
    {
      icon: <Hotel sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: t('home.features.luxuryRooms.title'),
      description: t('home.features.luxuryRooms.description')
    },
    {
      icon: <Star sx={{ fontSize: 48, color: 'warning.main' }} />,
      title: t('home.features.fiveStarService.title'),
      description: t('home.features.fiveStarService.description')
    },
    {
      icon: <LocalOffer sx={{ fontSize: 48, color: 'success.main' }} />,
      title: t('home.features.exclusiveOffers.title'),
      description: t('home.features.exclusiveOffers.description')
    },
    {
      icon: <SupportAgent sx={{ fontSize: 48, color: 'info.main' }} />,
      title: t('home.features.aiAssistant.title'),
      description: t('home.features.aiAssistant.description')
    }
  ]

  return (
    <>
      {/* Hero Section */}
      <Box
        sx={{
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h1" fontWeight={700} gutterBottom>
              Excelsior Hotel
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
              {t('home.hero.subtitle')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="large"
                component={Link}
                href="/rooms"
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': { bgcolor: 'grey.100' }
                }}
              >
                {t('home.hero.exploreRooms')}
              </Button>
              <Button
                variant="outlined"
                size="large"
                component={Link}
                href="/login"
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                {t('home.hero.login')}
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" textAlign="center" fontWeight={600} gutterBottom>
          {t('home.features.title')}
        </Typography>
        <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
          {t('home.features.subtitle')}
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Card
                elevation={2}
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 4
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" fontWeight={600} gutterBottom>
              {t('home.cta.title')}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              {t('home.cta.subtitle')}
            </Typography>
            <Button
              variant="contained"
              size="large"
              component={Link}
              href="/rooms"
            >
              {t('home.cta.button')}
            </Button>
          </Box>
        </Container>
      </Box>
      <Footer />
    </>
  )
}