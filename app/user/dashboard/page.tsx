'use client'

import { useAuth } from '@/lib/hooks/useAuth'
// ✅ Importa useMyBookings invece di useBookings
import { useMyBookings } from '@/lib/hooks/useBookings'
import { useConversations } from '@/lib/hooks/useConversations'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'
import { Box, Typography, Card, CardContent, Button, Paper, Divider, LinearProgress, Chip, Avatar, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material'
import Grid from '@mui/material/Grid'
import { CalendarMonth, ChatBubble, HotelOutlined, ArrowForward, CheckCircle, Message as MessageIcon } from '@mui/icons-material'

export default function UserDashboardPage() {
  const { t } = useTranslation()
  const { user, loading: authLoading } = useAuth()
  
  // ✅ Usa useMyBookings al posto di useBookings
  const { bookings, loading: bookingsLoading } = useMyBookings()
  const { conversations, loading: conversationsLoading } = useConversations()
  const router = useRouter()

  // Calcola stats dinamiche
  const activeBookings = bookings.filter(b =>
    b.status === 'CONFIRMED' || b.status === 'PENDING'
  ).length

  const completedBookings = bookings.filter(b =>
    b.status === 'CONFIRMED' && new Date(b.endDate) < new Date()
  ).length

  const totalMessages = conversations.reduce((sum, conv) =>
    sum + (conv.messages?.length || 0), 0
  )

  // Prossima prenotazione
  const nextBooking = bookings
    .filter(b => b.status === 'CONFIRMED' && new Date(b.startDate) > new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0]

  // Mostra caricamento
  if (authLoading) {
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
      value: activeBookings,
      color: 'primary.main',
    },
    {
      icon: <CheckCircle sx={{ fontSize: 40, color: 'success.main' }} />,
      label: t('dashboard.user.stats.completedBookings'),
      value: completedBookings,
      color: 'success.main',
    },
    {
      icon: <ChatBubble sx={{ fontSize: 40, color: 'info.main' }} />,
      label: t('dashboard.user.stats.aiConversations'),
      value: conversations.length,
      color: 'info.main',
    },
    {
      icon: <MessageIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
      label: t('dashboard.user.stats.totalMessages'),
      value: totalMessages,
      color: 'warning.main',
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
                      {bookingsLoading || conversationsLoading ? '...' : stat.value}
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

      {/* Prossima Prenotazione */}
      {nextBooking && (
        <Card elevation={2} sx={{ mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6" color="white" gutterBottom>
                  🎉 Prossima Prenotazione
                </Typography>
                <Typography variant="body1" color="white" sx={{ opacity: 0.9 }}>
                  Camera: {nextBooking.room?.name || `#${nextBooking.roomId}`}
                </Typography>
                <Typography variant="body2" color="white" sx={{ opacity: 0.8 }}>
                  Dal {new Date(nextBooking.startDate).toLocaleDateString('it-IT')}
                  al {new Date(nextBooking.endDate).toLocaleDateString('it-IT')}
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="inherit"
                onClick={() => router.push('/user/bookings')}
                sx={{ bgcolor: 'white', color: 'primary.main' }}
              >
                Dettagli
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          {t('dashboard.user.quickActions.title')}
        </Typography>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {quickActions.map((action, index) => (
            <Grid key={index} size={{ xs: 12, md: 4 }}>
              <Card
                elevation={2}
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
                onClick={action.action}
              >
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
                      <Button variant="outlined" endIcon={<ArrowForward />}>
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

      {/* Recent Bookings */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" fontWeight={600}>
            {t('dashboard.user.recentBookings.title')}
          </Typography>
          <Button
            variant="text"
            endIcon={<ArrowForward />}
            onClick={() => router.push('/user/bookings')}
          >
            {t('common.viewMore')}
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />

        {bookingsLoading ? (
          <LinearProgress />
        ) : bookings.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {t('dashboard.user.recentBookings.noBookings')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('dashboard.user.recentBookings.noBookingsMessage')}
            </Typography>
          </Box>
        ) : (
          <List>
            {bookings.slice(0, 3).map((booking) => (
              <ListItem
                key={booking.id}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  mb: 1,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
                onClick={() => router.push('/user/bookings')}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <HotelOutlined />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`Camera #${booking.roomId}`}
                  secondary={`${new Date(booking.startDate).toLocaleDateString('it-IT')} - ${new Date(booking.endDate).toLocaleDateString('it-IT')}`}
                />
                <Chip
                  label={booking.status}
                  color={
                    booking.status === 'CONFIRMED' ? 'success' :
                      booking.status === 'PENDING' ? 'warning' : 'default'
                  }
                  size="small"
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {/* Recent Conversations */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" fontWeight={600}>
            {t('dashboard.user.recentConversations.title')}
          </Typography>
          <Button
            variant="text"
            endIcon={<ArrowForward />}
            onClick={() => router.push('/user/chat')}
          >
            {t('common.viewMore')}
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />

        {conversationsLoading ? (
          <LinearProgress />
        ) : conversations.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {t('dashboard.user.recentConversations.noConversations')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Inizia una chat con il nostro assistente AI!
            </Typography>
          </Box>
        ) : (
          <List>
            {conversations.slice(0, 3).map((conv) => (
              <ListItem
                key={conv.id}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  mb: 1,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
                onClick={() => router.push(`/user/chat`)}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <ChatBubble />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={conv.subject || 'Conversazione'}
                  secondary={new Date(conv.updatedAt).toLocaleDateString('it-IT')}
                />
                <Chip
                  label={`${conv.messages?.length || 0} messaggi`}
                  size="small"
                  variant="outlined"
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  )
}