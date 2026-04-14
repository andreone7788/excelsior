'use client'

import { useState } from 'react'
import { useMyBookings } from '@/lib/hooks/useBookings'
import { useTranslation } from 'react-i18next'
import { Box, Typography, Card, CardContent, Chip, Button, LinearProgress, Tabs, Tab, Alert, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, TextField, Stack } from '@mui/material'
import Grid from '@mui/material/Grid'
import { Hotel, CalendarToday, People, Euro, Cancel, Edit } from '@mui/icons-material'
import type { BookingWithRelations, BookingStatus } from '@/types'
import apiClient, { ApiError } from '@/lib/api-client'

type StatusFilter = BookingStatus | 'ALL'

export default function UserBookingsPage() {
    const { t } = useTranslation()
    const { bookings, loading, error, refetch } = useMyBookings()
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
    const [selectedBooking, setSelectedBooking] = useState<BookingWithRelations | null>(null)
    const [cancelling, setCancelling] = useState(false)

    // Stato modifica prenotazione
    const [modifyDialogOpen, setModifyDialogOpen] = useState(false)
    const [modifying, setModifying] = useState(false)
    const [modifyError, setModifyError] = useState<string | null>(null)
    const [modifyForm, setModifyForm] = useState({
        newStartDate: '',
        newEndDate: '',
        reason: ''
    })

    // Filtra prenotazioni in base allo stato
    const filteredBookings = statusFilter === 'ALL'
        ? bookings
        : bookings.filter(b => b.status === statusFilter)

    // Funzione helper per ottenere colore e label dello status
    const getStatusConfig = (status: BookingStatus) => {
        const statusMap: Record<BookingStatus, { color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning', label: string }> = {
            'PENDING': { color: 'warning', label: t('bookings.status.pending') },
            'CONFIRMED': { color: 'success', label: t('bookings.status.confirmed') },
            'CANCELLED': { color: 'error', label: t('bookings.status.cancelled') },
            'PENDING_MODIFICATION': { color: 'info', label: 'In modifica' },
            'REPLACED': { color: 'default', label: 'Sostituita' }
        }
        return statusMap[status]
    }

    // Gestione apertura dialog cancellazione
    const handleCancelClick = (booking: BookingWithRelations) => {
        setSelectedBooking(booking)
        setCancelDialogOpen(true)
    }

    // Gestione conferma cancellazione
    const handleCancelConfirm = async () => {
        if (!selectedBooking) return

        try {
            setCancelling(true)
            await apiClient.delete(`/bookings/${selectedBooking.id}`)
            await refetch()
            setCancelDialogOpen(false)
            setSelectedBooking(null)
        } catch (err) {
            const errorMessage = err instanceof ApiError ? err.message : 'Errore sconosciuto'
            alert(`Errore cancellazione: ${errorMessage}`)
        } finally {
            setCancelling(false)
        }
    }

    // Gestione apertura dialog modifica
    const handleModifyClick = (booking: BookingWithRelations) => {
        setSelectedBooking(booking)
        setModifyError(null)

        // Pre-compila le date con quelle esistenti (opzionale)
        const startDate = new Date(booking.startDate).toISOString().split('T')[0]
        const endDate = new Date(booking.endDate).toISOString().split('T')[0]

        setModifyForm({
            newStartDate: startDate,
            newEndDate: endDate,
            reason: ''
        })
        setModifyDialogOpen(true)
    }

    // Gestione conferma modifica
    const handleModifyConfirm = async () => {
        if (!selectedBooking) return

        if (!modifyForm.reason || modifyForm.reason.trim().length < 10) {
            setModifyError('Inserisci una motivazione di almeno 10 caratteri')
            return
        }

        try {
            setModifying(true)
            setModifyError(null)

            const payload: {
                newStartDate?: string
                newEndDate?: string
                reason: string
            } = {
                reason: modifyForm.reason
            }

            // Includi solo le date se modificate
            const originalStart = new Date(selectedBooking.startDate).toISOString().split('T')[0]
            const originalEnd = new Date(selectedBooking.endDate).toISOString().split('T')[0]

            if (modifyForm.newStartDate !== originalStart) {
                payload.newStartDate = modifyForm.newStartDate
            }
            if (modifyForm.newEndDate !== originalEnd) {
                payload.newEndDate = modifyForm.newEndDate
            }

            await apiClient.put(`/bookings/${selectedBooking.id}`, JSON.stringify(payload))

            await refetch()
            setModifyDialogOpen(false)
            setSelectedBooking(null)
            setModifyForm({ newStartDate: '', newEndDate: '', reason: '' })

            alert('Richiesta di modifica inviata! Riceverai conferma via email.')
        } catch (err) {
            const errorMessage = err instanceof ApiError ? err.message : 'Errore sconosciuto'
            setModifyError(errorMessage)
        } finally {
            setModifying(false)
        }
    }

    // Calcola numero notti
    const calculateNights = (startDate: string, endDate: string) => {
        const start = new Date(startDate)
        const end = new Date(endDate)
        return Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24))
    }

    if (loading) {
        return <Box sx={{ width: '100%' }}><LinearProgress /></Box>
    }

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                    {t('bookings.title')}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {t('bookings.subtitle')}
                </Typography>
            </Box>

            {/* Errore */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Filtri Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs
                    value={statusFilter}
                    onChange={(_, newValue) => setStatusFilter(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    <Tab label={t('bookings.status.all')} value="ALL" />
                    <Tab label={t('bookings.status.pending')} value="PENDING" />
                    <Tab label={t('bookings.status.confirmed')} value="CONFIRMED" />
                    <Tab label={t('bookings.status.pendingModification')} value="PENDING_MODIFICATION" />
                    <Tab label={t('bookings.status.completed')} value="REPLACED" />
                    <Tab label={t('bookings.status.cancelled')} value="CANCELLED" />
                </Tabs>
            </Box>

            {/* Lista prenotazioni */}
            {filteredBookings.length === 0 ? (
                // Empty State
                <Box
                    sx={{
                        textAlign: 'center',
                        py: 8,
                        px: 2,
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                    }}
                >
                    <Hotel sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                        {t('bookings.noBookings')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        {statusFilter === 'ALL'
                            ? t('bookings.createFirst')
                            : t('bookings.noBookingsWithStatus', { status: t(`bookings.status.${statusFilter.toLowerCase()}`) })
                        }
                    </Typography>
                    <Button variant="contained" href="/rooms">
                        {t('nav.rooms')}
                    </Button>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {filteredBookings.map((booking) => {
                        const statusConfig = getStatusConfig(booking.status)
                        const nights = calculateNights(booking.startDate, booking.endDate)
                        const canCancel = booking.status === 'PENDING' || booking.status === 'CONFIRMED'
                        const canModify = booking.status === 'CONFIRMED'

                        return (
                            <Grid size={{ xs: 12, md: 6 }} key={booking.id}>
                                <Card
                                    elevation={2}
                                    sx={{
                                        height: '100%',
                                        transition: 'all 0.3s',
                                        '&:hover': {
                                            boxShadow: 4,
                                            transform: 'translateY(-2px)'
                                        }
                                    }}
                                >
                                    <CardContent>
                                        {/* Header con status */}
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                            <Box>
                                                <Typography variant="h6" fontWeight={600} gutterBottom>
                                                    {booking.room?.name || `Camera #${booking.roomId}`}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Prenotazione #{booking.id}
                                                </Typography>
                                            </Box>
                                            <Chip
                                                label={statusConfig.label}
                                                color={statusConfig.color}
                                                size="small"
                                            />
                                        </Box>

                                        {/* Dettagli prenotazione */}
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
                                            {/* Date */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <CalendarToday fontSize="small" color="action" />
                                                <Typography variant="body2">
                                                    {new Date(booking.startDate).toLocaleDateString('it-IT', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                    {' → '}
                                                    {new Date(booking.endDate).toLocaleDateString('it-IT', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </Typography>
                                                <Chip label={`${nights} ${nights === 1 ? 'notte' : 'notti'}`} size="small" variant="outlined" />
                                            </Box>

                                            {/* Ospiti */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <People fontSize="small" color="action" />
                                                <Typography variant="body2">
                                                    {booking.guests} {booking.guests === 1 ? 'ospite' : 'ospiti'}
                                                </Typography>
                                            </Box>

                                            {/* Prezzo */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Euro fontSize="small" color="action" />
                                                <Typography variant="body2" fontWeight={600}>
                                                    €{Number(booking.totalPrice).toFixed(2)}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* Azioni */}
                                        <Box sx={{ display: 'flex', gap: 1, mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                                            {canModify && (
                                                <Button
                                                    variant="outlined"
                                                    color="primary"
                                                    size="small"
                                                    startIcon={<Edit />}
                                                    onClick={() => handleModifyClick(booking)}
                                                    fullWidth
                                                >
                                                    {t('bookings.common.modify')}
                                                </Button>
                                            )}
                                            {canCancel && (
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    size="small"
                                                    startIcon={<Cancel />}
                                                    onClick={() => handleCancelClick(booking)}
                                                    fullWidth
                                                >
                                                    {t('bookings.common.cancel')}
                                                </Button>
                                            )}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        )
                    })}
                </Grid>
            )}

            {/* Dialog conferma cancellazione */}
            <Dialog
                open={cancelDialogOpen}
                onClose={() => !cancelling && setCancelDialogOpen(false)}
            >
                <DialogTitle>{t('bookings.dialogs.confirmCancellation.title')}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {t('bookings.dialogs.confirmCancellation.message', {
                            room: selectedBooking?.room?.name || `Camera #${selectedBooking?.roomId}`
                        })}
                        <br />
                        {t('bookings.dialogs.confirmCancellation.warning')}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCancelDialogOpen(false)} disabled={cancelling}>
                        {t('bookings.common.cancel')}
                    </Button>
                    <Button
                        onClick={handleCancelConfirm}
                        color="error"
                        variant="contained"
                        disabled={cancelling}
                    >
                        {cancelling ? t('bookings.common.cancelling') : t('bookings.common.confirm')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog modifica prenotazione */}
            <Dialog
                open={modifyDialogOpen}
                onClose={() => !modifying && setModifyDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>{t('bookings.dialogs.modifyBooking.title')}</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        {t('bookings.dialogs.modifyBooking.message', {
                            room: selectedBooking?.room?.name || `Camera #${selectedBooking?.roomId}`
                        })}
                        <br />
                        {t('bookings.dialogs.modifyBooking.note')}
                    </DialogContentText>

                    {modifyError && (
                        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setModifyError(null)}>
                            {modifyError}
                        </Alert>
                    )}

                    <Stack spacing={2}>
                        <TextField
                            label={t('bookings.dialogs.modifyBooking.newCheckInDate')}
                            type="date"
                            value={modifyForm.newStartDate}
                            onChange={(e) => setModifyForm(prev => ({ ...prev, newStartDate: e.target.value }))}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            disabled={modifying}
                            helperText={t('bookings.dialogs.modifyBooking.newCheckInDateHelper')}
                        />
                        <TextField
                            label={t('bookings.dialogs.modifyBooking.newCheckOutDate')}
                            type="date"
                            value={modifyForm.newEndDate}
                            onChange={(e) => setModifyForm(prev => ({ ...prev, newEndDate: e.target.value }))}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            disabled={modifying}
                            helperText={t('bookings.dialogs.modifyBooking.newCheckOutDateHelper')}
                        />
                        <TextField
                            label={t('bookings.dialogs.modifyBooking.reason')}
                            multiline
                            rows={4}
                            value={modifyForm.reason}
                            onChange={(e) => setModifyForm(prev => ({ ...prev, reason: e.target.value }))}
                            fullWidth
                            disabled={modifying}
                            helperText={t('bookings.dialogs.modifyBooking.reasonHelper')}
                            required
                            error={!!modifyError && modifyForm.reason.length < 10}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setModifyDialogOpen(false)} disabled={modifying}>
                        {t('bookings.common.cancel')}
                    </Button>
                    <Button
                        onClick={handleModifyConfirm}
                        color="primary"
                        variant="contained"
                        disabled={modifying || !modifyForm.reason || modifyForm.reason.trim().length < 10}
                    >
                        {modifying ? t('bookings.common.sending') : t('bookings.common.send')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}