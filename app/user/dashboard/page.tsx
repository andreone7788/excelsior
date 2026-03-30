'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Card, CardContent, Typography, Box, Paper, List, ListItem, ListItemText, Chip, IconButton } from '@mui/material'
import Grid from '@mui/material/Grid'
import { CalendarMonth, ChatBubble, Hotel, TrendingUp, ArrowForward, NotificationsActive } from '@mui/icons-material'

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()

  const stats = [
    {
      title: 'Prenotazioni Attive',
      value: '0',
      icon: <CalendarMonth />,
      color: 'primary',
      change: '+0%',
    },
    {
      title: 'Messaggi AI',
      value: '0',
      icon: <ChatBubble />,
      color: 'secondary',
      change: '+0%',
    },
    {
      title: 'Punti Fedeltà',
      value: '0',
      icon: <TrendingUp />,
      color: 'success',
      change: '+0',
    },
    {
      title: 'Camere Preferite',
      value: '0',
      icon: <Hotel />,
      color: 'warning',
      change: '+0',
    },
  ]

  const quickActions = [
    {
      title: 'Prenota una camera',
      description: 'Esplora le nostre camere disponibili',
      icon: <Hotel />,
      color: 'primary',
      action: () => router.push('/rooms'),
    },
    {
      title: 'Chatta con AI',
      description: 'Chiedi consigli al nostro assistente',
      icon: <ChatBubble />,
      color: 'secondary',
      action: () => router.push('/user/chat'),
    },
    {
      title: 'Le mie prenotazioni',
      description: 'Gestisci le tue prenotazioni',
      icon: <CalendarMonth />,
      color: 'success',
      action: () => router.push('/user/bookings'),
    },
  ]

  return (
    <Box>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Benvenuto, {user?.name}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Ecco un riepilogo delle tue attività
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat) => (
          <Grid key={stat.title} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card
              sx={{
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: `${stat.color}.main`,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Chip
                    label={stat.change}
                    size="small"
                    color={stat.change.startsWith('+') ? 'success' : 'default'}
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
                <Typography variant="h3" fontWeight={700} gutterBottom>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions & Recent Activity */}
      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" fontWeight={600}>
                Azioni Rapide
              </Typography>
            </Box>
            <Grid container spacing={2}>
              {quickActions.map((action) => (
                <Grid key={action.title} size={{ xs: 12, sm: 4 }}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      },
                    }}
                    onClick={action.action}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          bgcolor: `${action.color}.main`,
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                        }}
                      >
                        {action.icon}
                      </Box>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        {action.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {action.description}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <IconButton size="small" sx={{ color: `${action.color}.main` }}>
                          <ArrowForward />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" fontWeight={600}>
                Attività Recenti
              </Typography>
              <NotificationsActive color="action" />
            </Box>
            <List>
              <ListItem
                sx={{
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  py: 2,
                  px: 2,
                  borderRadius: 2,
                  bgcolor: 'background.default',
                }}
              >
                <ListItemText
                  primary="Nessuna attività recente"
                  secondary="Inizia esplorando le nostre camere o chatta con l'AI assistant!"
                  primaryTypographyProps={{ fontWeight: 600, fontSize: '0.95rem' }}
                  secondaryTypographyProps={{ fontSize: '0.85rem' }}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}