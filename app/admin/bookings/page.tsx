'use client'

import { useState, JSX, useCallback, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button, IconButton, TextField, MenuItem, LinearProgress, Alert, Stack, Tooltip, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import { CheckCircle, Cancel, Visibility, FilterList, Refresh, HourglassEmpty, TaskAlt, Block } from '@mui/icons-material'
import Grid from '@mui/material/Grid'
import apiClient, { ApiError } from '@/lib/api-client'
import type { BookingStatus, BookingWithRelations } from '@/types'

interface BookingExtended extends BookingWithRelations {
    nights: number
    totalPrice: number
}

interface AdminBookingsResponse {
    bookings: BookingExtended[]
    stats: {
        total: number
        pending: number
        confirmed: number
        cancelled: number
    }
}

export default function AdminBookingPage() {
    const searchParams = useSearchParams()
    const [bookings, setBookings] = useState<BookingExtended[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, cancelled: 0 })

    // Filtri
    const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>(searchParams.get('status') as BookingStatus || '')
    const [searchText, setSearchText] = useState('')

    // Dialog Dettagli
    const [selectedBooking, setSelectedBooking] = useState<BookingExtended | null>(null)
    const [detailsOpen, setDetailsOpen] = useState(false)

    // Fetch bookings
    const fetchBookings = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const params = new URLSearchParams()
            if (statusFilter) {
                params.append('status', statusFilter)
            }

            const query = params.toString()
            const endpoint = query ? `/admin/bookings?${query}` : '/admin/bookings'

            const data = await apiClient.get<AdminBookingsResponse>(endpoint)
            setBookings(data.bookings)
            setStats(data.stats)
        } catch (err) {
            const errorMessage = err instanceof ApiError ? err.message : 'Errore caricamento prenotazioni'
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }, [statusFilter])

    // Effetto per aggiornare i bookings quando cambia il filtro
    useEffect(() => {
        fetchBookings()
    }, [fetchBookings])

    // Approva prenotazione
    const handleApprove = async (bookingId: number) => {
        try {
            await apiClient.put(`/admin/bookings/${bookingId}`, JSON.stringify({ status: 'CONFIRMED' }))
            fetchBookings()
        } catch (err) {
            const errorMessage = err instanceof ApiError ? err.message : 'Errore approvazione'
            setError(errorMessage)
        }
    }

    // Rifiuta prenotazione
    const handleReject = async (bookingId: number) => {
        try {
            await apiClient.put(`/admin/bookings/${bookingId}`, JSON.stringify({ status: 'CANCELLED' }))
            fetchBookings()
        } catch (err) {
            const errorMessage = err instanceof ApiError ? err.message : 'Errore rifiuto'
            setError(errorMessage)
        }
    }

    // Filtra bookings con search text
    const filteredBookings = bookings.filter((booking) => {
        if (!searchText) return true
        const search = searchText.toLowerCase()
        return (
            booking.user?.name?.toLowerCase().includes(search) ||
            booking.user?.surname?.toLowerCase().includes(search) ||
            booking.user?.email?.toLowerCase().includes(search) ||
            booking.room?.name?.toLowerCase().includes(search)
        )
    })

    // Chip status: tipizzato per BookingStatus
    const getStatusChip = (status: BookingStatus) => {
        const statusConfig: Record<BookingStatus, { label: string; color: 'warning' | 'success' | 'error' | 'default'; icon: JSX.Element }> = {
            PENDING: { label: 'In Attesa', color: 'warning', icon: <HourglassEmpty /> },
            CONFIRMED: { label: 'Confermata', color: 'success', icon: <TaskAlt /> },
            CANCELLED: { label: 'Annullata', color: 'error', icon: <Block /> },
            PENDING_MODIFICATION: { label: 'In Modifica', color: 'warning', icon: <HourglassEmpty /> },
            REPLACED: { label: 'Sostituita', color: 'default', icon: <Block /> }
        }
        const config = statusConfig[status]
        return <Chip label={config.label} color={config.color} size="small" icon={config.icon} />
    }

    if (loading && bookings.length === 0) {
        return (
            <Box sx={{ width: '100%', mt: 4 }}>
                <LinearProgress />
            </Box>
        )
    }

    return (
        <Box sx={{ maxWidth: 1600, mx: 'auto', p: 3 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                    Gestione Prenotazioni
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Visualizza, approva o rifiuta le prenotazioni
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Stats Cards */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid size={{ xs: 6, sm: 3 }}>
                    <Card>
                        <CardContent>
                            <Typography color="text.secondary" variant="body2">
                                Totale
                            </Typography>
                            <Typography variant="h4" fontWeight={700}>
                                {stats.total}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                    <Card sx={{ bgcolor: 'warning.light' }}>
                        <CardContent>
                            <Typography color="text.secondary" variant="body2">
                                In Attesa
                            </Typography>
                            <Typography variant="h4" fontWeight={700}>
                                {stats.pending}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                    <Card sx={{ bgcolor: 'success.light' }}>
                        <CardContent>
                            <Typography color="text.secondary" variant="body2">
                                Confermate
                            </Typography>
                            <Typography variant="h4" fontWeight={700}>
                                {stats.confirmed}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                    <Card sx={{ bgcolor: 'error.light' }}>
                        <CardContent>
                            <Typography color="text.secondary" variant="body2">
                                Annullate
                            </Typography>
                            <Typography variant="h4" fontWeight={700}>
                                {stats.cancelled}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Filtri */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                    <FilterList />
                    <TextField
                        select
                        label="Stato"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as BookingStatus | '')}
                        size="small"
                        sx={{ minWidth: 200 }}
                    >
                        <MenuItem value="">Tutti</MenuItem>
                        <MenuItem value="PENDING">In Attesa</MenuItem>
                        <MenuItem value="CONFIRMED">Confermate</MenuItem>
                        <MenuItem value="CANCELLED">Annullate</MenuItem>
                    </TextField>
                    <TextField
                        label="Cerca utente, email, camera..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        size="small"
                        sx={{ flexGrow: 1 }}
                    />
                    <Tooltip title="Ricarica">
                        <IconButton onClick={fetchBookings} color="primary">
                            <Refresh />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Paper>

            {/* Tabella Prenotazioni */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>ID</strong></TableCell>
                            <TableCell><strong>Utente</strong></TableCell>
                            <TableCell><strong>Camera</strong></TableCell>
                            <TableCell><strong>Check-in</strong></TableCell>
                            <TableCell><strong>Check-out</strong></TableCell>
                            <TableCell align="center"><strong>Notti</strong></TableCell>
                            <TableCell align="right"><strong>Prezzo Tot.</strong></TableCell>
                            <TableCell align="center"><strong>Stato</strong></TableCell>
                            <TableCell align="center"><strong>Azioni</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredBookings.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary">
                                        Nessuna prenotazione trovata
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredBookings.map((booking) => (
                                <TableRow key={booking.id} hover>
                                    <TableCell>{booking.id}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={600}>
                                            {booking.user?.name} {booking.user?.surname}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {booking.user?.email}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{booking.room?.name || 'N/A'}</TableCell>
                                    <TableCell>
                                        {new Date(booking.startDate).toLocaleDateString('it-IT')}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(booking.endDate).toLocaleDateString('it-IT')}
                                    </TableCell>
                                    <TableCell align="center">{booking.nights}</TableCell>
                                    <TableCell align="right">€{booking.totalPrice.toFixed(2)}</TableCell>
                                    <TableCell align="center">{getStatusChip(booking.status)}</TableCell>
                                    <TableCell align="center">
                                        <Stack direction="row" spacing={1} justifyContent="center">
                                            {booking.status === 'PENDING' && (
                                                <>
                                                    <Tooltip title="Approva">
                                                        <IconButton
                                                            color="success"
                                                            size="small"
                                                            onClick={() => handleApprove(booking.id)}
                                                        >
                                                            <CheckCircle />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Rifiuta">
                                                        <IconButton
                                                            color="error"
                                                            size="small"
                                                            onClick={() => handleReject(booking.id)}
                                                        >
                                                            <Cancel />
                                                        </IconButton>
                                                    </Tooltip>
                                                </>
                                            )}
                                            <Tooltip title="Dettagli">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => {
                                                        setSelectedBooking(booking)
                                                        setDetailsOpen(true)
                                                    }}
                                                >
                                                    <Visibility />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialog Dettagli */}
            <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Dettagli Prenotazione #{selectedBooking?.id}</DialogTitle>
                <DialogContent>
                    {selectedBooking && (
                        <Stack spacing={2} sx={{ mt: 1 }}>
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Utente
                                </Typography>
                                <Typography variant="body1" fontWeight={600}>
                                    {selectedBooking.user?.name} {selectedBooking.user?.surname}
                                </Typography>
                                <Typography variant="body2">{selectedBooking.user?.email}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Camera
                                </Typography>
                                <Typography variant="body1">{selectedBooking.room?.name}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Periodo
                                </Typography>
                                <Typography variant="body1">
                                    {new Date(selectedBooking.startDate).toLocaleDateString('it-IT')} -{' '}
                                    {new Date(selectedBooking.endDate).toLocaleDateString('it-IT')}
                                </Typography>
                                <Typography variant="body2">
                                    {selectedBooking.nights} {selectedBooking.nights === 1 ? 'notte' : 'notti'}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Prezzo Totale
                                </Typography>
                                <Typography variant="h6" color="primary">
                                    €{selectedBooking.totalPrice.toFixed(2)}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Stato
                                </Typography>
                                <Box sx={{ mt: 1 }}>{getStatusChip(selectedBooking.status)}</Box>
                            </Box>
                            {selectedBooking.notes && (
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Note
                                    </Typography>
                                    <Typography variant="body2">{selectedBooking.notes}</Typography>
                                </Box>
                            )}
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDetailsOpen(false)}>Chiudi</Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}