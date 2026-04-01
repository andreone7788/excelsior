'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'
import { Box, Typography, Card, CardContent, Button, Paper, Divider, LinearProgress } from '@mui/material'
import Grid from '@mui/material/Grid'
import { CalendarMonth, ChatBubble, Stars, Favorite, ArrowForward, HotelOutlined } from '@mui/icons-material'

export default function UserDashboardPage() {
  const { t } = useTranslation()
  const { user, loading } = useAuth()
  const router = useRouter()

  // Mostra caricamento
  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress />
      </Box>
    )
  }

  const stats = [
    {
      icon: <CalendarMonth sx={{ fontSize: 40, color: 'primary.main' }} />,
      label: t('dashboard.user.stats.activeBookings'),
      value: '2',
      color: 'primary.main',
    },
    {
      icon: <ChatBubble sx={{ fontSize: 40, color: 'success.main' }} />,
      label: t('dashboard.user.stats.aiMessages'),
      value: '15',
      color: 'success.main',
    },
    {
      icon: <Stars sx={{ fontSize: 40, color: 'warning.main' }} />,
      label: t('dashboard.user.stats.loyaltyPoints'),
      value: '350',
      color: 'warning.main',
    },
    {
      icon: <Favorite sx={{ fontSize: 40, color: 'error.main' }} />,
      label: t('dashboard.user.stats.favoriteRooms'),
      value: '3',
      color: 'error.main',
    },
  ]

  const quickActions = [
    {
      title: t('dashboard.user.quickActions.bookRoom.title'),
      description: t('dashboard.user.quickActions.bookRoom.description'),
      icon: <HotelOutlined sx={{ fontSize: 32 }} />,
      action: () => router.push('/rooms'),
      color: 'primary.main',
    },
    {
      title: t('dashboard.user.quickActions.chatAI.title'),
      description: t('dashboard.user.quickActions.chatAI.description'),
      icon: <ChatBubble sx={{ fontSize: 32 }} />,
      action: () => router.push('/user/chat'),
      color: 'success.main',
    },
    {
      title: t('dashboard.user.quickActions.viewBookings.title'),
      description: t('dashboard.user.quickActions.viewBookings.description'),
      icon: <CalendarMonth sx={{ fontSize: 32 }} />,
      action: () => router.push('/user/bookings'),
      color: 'info.main',
    },
  ]

  return (
    <Box>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          {t('dashboard.user.welcome', { name: user?.name || 'Utente' })}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('dashboard.user.subtitle')}
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {stat.icon}
                  <Box>
                    <Typography variant="h4" fontWeight={700} color={stat.color}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          {t('dashboard.user.quickActions.title')}
        </Typography>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {quickActions.map((action, index) => (
            <Grid key={index} size={{ xs: 12, md: 4 }}>
              <Card elevation={2} sx={{ height: '100%', cursor: 'pointer', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Box sx={{ color: action.color }}>{action.icon}</Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {action.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {action.description}
                      </Typography>
                      <Button variant="outlined" endIcon={<ArrowForward />} onClick={action.action}>
                        {t('common.viewMore')}
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Recent Activity */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          {t('dashboard.user.recentActivity.title')}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {t('dashboard.user.recentActivity.noActivity')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('dashboard.user.recentActivity.noActivitySubtitle')}
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}