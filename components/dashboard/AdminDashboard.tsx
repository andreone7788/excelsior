'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Typography, Card, CardContent, Button, Divider, LinearProgress, Alert, Chip, List, ListItem, ListItemText, ListItemAvatar, Avatar, Paper } from '@mui/material'
import { CalendarMonth, ChatBubble, People, Hotel, CheckCircle, Cancel, HourglassEmpty, ArrowForward, Notifications } from '@mui/icons-material'
import Grid from '@mui/material/Grid'
import apiClient, { ApiError } from '@/lib/api-client'
import type { BookingWithRelations, Conversation } from '@/types'

interface BookingsApiResponse {
    bookings: BookingWithRelations[]
    stats: {
        total: number
        pending: number
        confirmed: number
        cancelled: number
    }
}

interface ConversationsApiResponse {
    conversations: Conversation[]
    stats: {
        total: number
        open: number
        closed: number
    }
}

interface UsersApiResponse {
    users: Array<{
        id: number
        name: string
        surname: string
        email: string
        role: string
    }>
}

interface RoomsApiResponse {
    rooms: Array<{
        id: number
        name: string
        available: boolean
    }>
}

interface AdminDashboardOverview {
    bookings: { total: number; pending: number; confirmed: number; cancelled: number }
    conversations: { total: number; open: number; closed: number }
    users: number
    rooms: { total: number; available: number; occupied: number }
}

export default function AdminDashboard() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<AdminDashboardOverview>({
        bookings: { total: 0, pending: 0, confirmed: 0, cancelled: 0 },
        conversations: { total: 0, open: 0, closed: 0 },
        users: 0,
        rooms: { total: 0, available: 0, occupied: 0 },
    })
    const [pendingBookings, setPendingBookings] = useState<BookingWithRelations[]>([])
    const [recentConversations, setRecentConversations] = useState<Conversation[]>([])
    const [error, setError] = useState<string | null>(null)

    // Fetch dati dashboard
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true)
                setError(null)

                // Fetch parallelo di tutte le risorse necessarie per la dashboard
                const [bookingsRes, conversationsRes, usersRes, roomsRes] = await Promise.all([
                    apiClient.get<BookingsApiResponse>('/admin/bookings'),
                    apiClient.get<ConversationsApiResponse>('/admin/conversations?limit=5'),
                    apiClient.get<UsersApiResponse>('/admin/users'),
                    apiClient.get<RoomsApiResponse>('/admin/rooms')
                ])

                // Aggiorna Stats
                setStats({
                    bookings: bookingsRes.stats,
                    conversations: {
                        total: conversationsRes.stats.total,
                        open: conversationsRes.stats.open,
                        closed: conversationsRes.stats.closed
                    },
                    users: usersRes.users.length,
                    rooms: {
                        total: roomsRes.rooms.length,
                        available: roomsRes.rooms.filter((r) => r.available).length,
                        occupied: roomsRes.rooms.filter((r) => !r.available).length
                    }
                })

                // Filtro pending bookings (MAIUSCOLO) - ultime 5
                const pending = bookingsRes.bookings
                    .filter((b) => b.status === 'PENDING')
                    .slice(0, 5)
                setPendingBookings(pending)

                // Recent conversations (ultime 5)
                setRecentConversations(conversationsRes.conversations)

            } catch (err) {
                const errorMessage = err instanceof ApiError ? err.message : 'Errore sconosciuto'
                setError(errorMessage)
            } finally {
                setLoading(false)
            }
        }
        fetchDashboardData()
    }, [])

    // Approva prenotazione
    const handleApproveBooking = async (bookingId: number) => {
        try {
            await apiClient.put(`/admin/bookings/${bookingId}`, JSON.stringify({ status: 'CONFIRMED' }))
            setPendingBookings(prev => prev.filter(b => b.id !== bookingId))
            setStats(prev => ({
                ...prev,
                bookings: {
                    ...prev.bookings,
                    pending: prev.bookings.pending - 1,
                    confirmed: prev.bookings.confirmed + 1
                }
            }))
        } catch (err) {
            console.error('Errore approvazione:', err)
        }
    }

    // Rifiuta prenotazione
    const handleRejectBooking = async (bookingId: number) => {
        try {
            await apiClient.put(`/admin/bookings/${bookingId}`, JSON.stringify({ status: 'CANCELLED' }))
            setPendingBookings(prev => prev.filter(b => b.id !== bookingId))
            setStats(prev => ({
                ...prev,
                bookings: {
                    ...prev.bookings,
                    pending: prev.bookings.pending - 1,
                    cancelled: prev.bookings.cancelled + 1
                }
            }))
        } catch (err) {
            console.error('Errore rifiuto:', err)
        }
    }

    if (loading) {
        return (
            <Box sx={{ width: '100%', mt: 4 }}>
                <LinearProgress />
            </Box>
        )
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mt: 4 }}>
                {error}
            </Alert>
        )
    }

    const statsCards = [
        {
            title: 'Prenotazioni Totali',
            value: stats.bookings.total,
            icon: <CalendarMonth sx={{ fontSize: 40, color: 'primary.main' }} />,
            details: [
                { label: 'Pending', value: stats.bookings.pending, color: 'warning.main' },
                { label: 'Confirmed', value: stats.bookings.confirmed, color: 'success.main' },
                { label: 'Cancelled', value: stats.bookings.cancelled, color: 'error.main' }
            ]
        },
        {
            title: 'Conversazioni',
            value: stats.conversations.total,
            icon: <ChatBubble sx={{ fontSize: 40, color: 'info.main' }} />,
            details: [
                { label: 'Aperte', value: stats.conversations.open, color: 'success.main' },
                { label: 'Chiuse', value: stats.conversations.closed, color: 'text.secondary' }
            ]
        },
        {
            title: 'Utenti Registrati',
            value: stats.users,
            icon: <People sx={{ fontSize: 40, color: 'success.main' }} />,
            details: []
        },
        {
            title: 'Camere',
            value: stats.rooms.total,
            icon: <Hotel sx={{ fontSize: 40, color: 'warning.main' }} />,
            details: [
                { label: 'Disponibili', value: stats.rooms.available, color: 'success.main' },
                { label: 'Occupate', value: stats.rooms.occupied, color: 'error.main' }
            ]
        }
    ]

    const quickActions = [
        {
            title: 'Gestisci Prenotazioni',
            description: 'Visualizza, approva o rifiuta prenotazioni',
            icon: <CalendarMonth sx={{ fontSize: 32 }} />,
            action: () => router.push('/admin/bookings'),
            color: 'primary.main'
        },
        {
            title: 'Conversazioni',
            description: 'Rispondi alle richieste degli utenti',
            icon: <ChatBubble sx={{ fontSize: 32 }} />,
            action: () => router.push('/admin/conversations'),
            color: 'info.main'
        },
        {
            title: 'Gestisci Camere',
            description: 'Aggiungi, modifica o elimina camere',
            icon: <Hotel sx={{ fontSize: 32 }} />,
            action: () => router.push('/admin/rooms'),
            color: 'warning.main'
        },
        {
            title: 'Gestisci Utenti',
            description: 'Visualizza e gestisci gli utenti',
            icon: <People sx={{ fontSize: 32 }} />,
            action: () => router.push('/admin/users'),
            color: 'success.main'
        }
    ]

    return (
        <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                    Admin Dashboard
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Panoramica e gestione dell&apos;hotel
                </Typography>
            </Box>

            {/* Statistiche Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {statsCards.map((card, index) => (
                    <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
                        <Card elevation={2}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    {card.icon}
                                    <Box>
                                        <Typography variant="h4" fontWeight={700}>
                                            {card.value}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {card.title}
                                        </Typography>
                                    </Box>
                                </Box>
                                {card.details.length > 0 && (
                                    <>
                                        <Divider sx={{ my: 1 }} />
                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                            {card.details.map((detail, idx) => (
                                                <Chip
                                                    key={idx}
                                                    label={`${detail.label}: ${detail.value}`}
                                                    size="small"
                                                    sx={{ bgcolor: detail.color, color: 'white' }}
                                                />
                                            ))}
                                        </Box>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Prenotazioni Pending */}
            {pendingBookings.length > 0 && (
                <Alert severity="warning" icon={<Notifications />} sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        ⚠️ Hai {pendingBookings.length} prenotazioni in attesa di conferma!
                    </Typography>
                    <Typography variant="body2">
                        Approva o rifiuta le prenotazioni per notificare gli utenti.
                    </Typography>
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* Pending Bookings */}
                <Grid size={{ xs: 12, lg: 7 }}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" fontWeight={600}>
                                <HourglassEmpty sx={{ verticalAlign: 'middle', mr: 1 }} />
                                Prenotazioni Pending
                            </Typography>
                            <Button
                                variant="outlined"
                                size="small"
                                endIcon={<ArrowForward />}
                                onClick={() => router.push('/admin/bookings?status=PENDING')}
                            >
                                Vedi tutte
                            </Button>
                        </Box>
                        <Divider sx={{ mb: 2 }} />

                        {pendingBookings.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Typography color="text.secondary">
                                    Nessuna prenotazione in attesa 🎉
                                </Typography>
                            </Box>
                        ) : (
                            <List>
                                {pendingBookings.map((booking) => (
                                    <ListItem
                                        key={booking.id}
                                        sx={{
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            borderRadius: 2,
                                            mb: 1,
                                            flexDirection: 'column',
                                            alignItems: 'stretch'
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', mb: 1 }}>
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: 'warning.main' }}>
                                                    <CalendarMonth />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={`${booking.user?.name || ''} ${booking.user?.surname || ''} - ${booking.room?.name || 'Camera'}`}
                                                secondary={`${new Date(booking.startDate).toLocaleDateString('it-IT')} → ${new Date(booking.endDate).toLocaleDateString('it-IT')}`}
                                            />
                                            <Chip label="PENDING" color="warning" size="small" />
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                            <Button
                                                size="small"
                                                variant="contained"
                                                color="success"
                                                startIcon={<CheckCircle />}
                                                onClick={() => handleApproveBooking(booking.id)}
                                            >
                                                Approva
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                color="error"
                                                startIcon={<Cancel />}
                                                onClick={() => handleRejectBooking(booking.id)}
                                            >
                                                Rifiuta
                                            </Button>
                                        </Box>
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Paper>
                </Grid>

                {/* Conversazioni Recenti */}
                <Grid size={{ xs: 12, lg: 5 }}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" fontWeight={600}>
                                <ChatBubble sx={{ verticalAlign: 'middle', mr: 1 }} />
                                Conversazioni Recenti
                            </Typography>
                            <Button
                                variant="outlined"
                                size="small"
                                endIcon={<ArrowForward />}
                                onClick={() => router.push('/admin/conversations')}
                            >
                                Vedi tutte
                            </Button>
                        </Box>
                        <Divider sx={{ mb: 2 }} />

                        {recentConversations.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Typography color="text.secondary">
                                    Nessuna conversazione recente
                                </Typography>
                            </Box>
                        ) : (
                            <List>
                                {recentConversations.map((conv) => (
                                    <ListItem
                                        key={conv.id}
                                        component="div"
                                        onClick={() => router.push(`/admin/conversations/${conv.id}`)}
                                        sx={{
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            borderRadius: 2,
                                            mb: 1,
                                            cursor: 'pointer',
                                            '&:hover': { bgcolor: 'action.hover' }
                                        }}
                                    >
                                        <ListItemAvatar>
                                            <Avatar sx={{ bgcolor: conv.status === 'OPEN' ? 'success.main' : 'grey.400' }}>
                                                <ChatBubble />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={conv.subject || conv.title || 'Conversazione'}  // ✅ Fallback
                                            secondary={`${conv.user?.name || ''} ${conv.user?.surname || ''} - ${conv._count?.messages || 0} messaggi`}  // ✅ Safe access
                                        />
                                        <Chip
                                            label={conv.status}
                                            color={conv.status === 'OPEN' ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            {/* Azioni Rapide */}
            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                    Azioni Rapide
                </Typography>
                <Grid container spacing={3}>
                    {quickActions.map((action, index) => (
                        <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
                            <Card
                                elevation={2}
                                sx={{
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
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Box sx={{ color: action.color, mb: 2 }}>{action.icon}</Box>
                                        <Typography variant="h6" fontWeight={600} gutterBottom>
                                            {action.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {action.description}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Box>
    )
}