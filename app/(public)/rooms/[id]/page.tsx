'use client'

/**
 * Pagina di dettaglio per una singola camera.
 * Mostra tutte le informazioni sulla camera, inclusa una galleria di immagini, descrizione, servizi e un modulo di prenotazione.
 * Utilizza il custom hook useRoom per fetchare i dati della camera in base all'ID passato come parametro.
 * Implementa un'interfaccia utente moderna e responsive con Material-UI, con supporto per la localizzazione tramite react-i18next.
 * Gestisce stati di loading, errori e validazione del modulo di prenotazione in modo user-friendly.
 * Permette agli utenti autenticati di prenotare la camera selezionando le date di check-in e check-out, calcolando il prezzo totale in base al numero di notti.
 * Se l'utente non è autenticato, mostra un messaggio che invita a effettuare il login prima di prenotare.
 */

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRoom } from '@/lib/hooks/useRooms'
import { useAuth } from '@/lib/hooks/useAuth'
import { useTranslation } from 'react-i18next'
import { Container, Box, Typography, Button, Paper, Chip, LinearProgress, Alert, Divider, TextField, Card, CardContent } from '@mui/material'
import Grid from '@mui/material/Grid'
import RoomGallery from '@/components/rooms/RoomGallery'
import { ArrowBack, People, Euro, CalendarMonth, CheckCircle } from '@mui/icons-material'
import { useNotification } from '@/lib/context/NotificationContext'

export default function RoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const roomId = parseInt(id)
    const router = useRouter()
    const { t } = useTranslation()
    const { user } = useAuth()
    const { showSuccess, showError, showWarning } = useNotification()

    // Fetch room data
    const { room, loading, error } = useRoom(roomId)

    // Date booking
    const [checkIn, setCheckIn] = useState('')
    const [checkOut, setCheckOut] = useState('')

    // Calcola numero notti e prezzo totale
    const calculateNights = () => {
        if (!checkIn || !checkOut) return 0
        const start = new Date(checkIn)
        const end = new Date(checkOut)
        const diffTime = Math.abs(end.getTime() - start.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
    }

    const roomPrice = Number(room?.price) || 0;
    const nights = calculateNights();
    const totalPrice = nights * roomPrice;

    const handleBooking = async () => {
        if (!user) {
            showWarning(t('rooms.booking.loginRequired'))
            router.push('/login')
            return
        }

        if (!checkIn || !checkOut) {
            showError(t('rooms.booking.selectDates'))
            return
        }

        if (new Date(checkIn) >= new Date(checkOut)) {
            showError(t('rooms.booking.invalidDates'))
            return
        }

        try {
            const bookingData = {
                roomId,
                startDate: checkIn,
                endDate: checkOut,
                totalPrice,
                status: 'PENDING'
            }

            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData)
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Errore durante la prenotazione')
            }

            showSuccess(t('rooms.booking.success'))
            router.push('/user/bookings')
        } catch (err) {
            showError(err instanceof Error ? err.message : t('rooms.booking.error'))
        }
    }

    // Loading
    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <LinearProgress />
            </Container>
        )
    }

    // Error
    if (error || !room) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error || 'Camera non trovata'}
                </Alert>
                <Button
                    variant="contained"
                    startIcon={<ArrowBack />}
                    onClick={() => router.push('/rooms')}
                >
                    {t('rooms.card.backToList')}
                </Button>
            </Container>
        )
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Back button */}
            <Button
                startIcon={<ArrowBack />}
                onClick={() => router.push('/rooms')}
                sx={{ mb: 3 }}
            >
                {t('rooms.card.backToList')}
            </Button>

            <Grid container spacing={4}>
                {/* Colonna sinistra - Immagine e info */}
                <Grid size={{ xs: 12, md: 8 }}>
                    {/* Galleria immagini */}
                    <RoomGallery images={room.images || []} roomName={room.name} />

                    {/* Info camera */}
                    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h4" fontWeight={700} gutterBottom>
                            {room.name}
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                            <Chip
                                icon={<People />}
                                label={`${t('rooms.card.capacity')}: ${room.capacity} ${room.capacity === 1 ? t('rooms.card.person') : t('rooms.card.people')}`}
                                color="primary"
                            />
                            <Chip
                                icon={<Euro />}
                                label={`€${room.price} / ${t('rooms.card.night')}`}
                                color="success"
                            />
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        <Typography variant="h6" fontWeight={600} gutterBottom>
                            {t('rooms.card.description')}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            {room.description}
                        </Typography>

                        {/* Servizi (se disponibili) */}
                        {room.amenities && room.amenities.length > 0 && (
                            <>
                                <Divider sx={{ my: 3 }} />
                                <Typography variant="h6" fontWeight={600} gutterBottom>
                                    {t('rooms.card.amenities')}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    {room.amenities.map((amenity, index) => (
                                        <Chip
                                            key={index}
                                            label={amenity}
                                            icon={<CheckCircle />}
                                            variant="outlined"
                                            color="success"
                                        />
                                    ))}
                                </Box>
                            </>
                        )}
                    </Paper>
                </Grid>

                {/* Colonna destra - Prenotazione */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card elevation={3} sx={{ position: 'static', top: 80 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h5" fontWeight={700} gutterBottom>
                                {t('rooms.booking.bookNow')}
                            </Typography>

                            <Typography variant="h3" color="primary.main" fontWeight={700} gutterBottom>
                                €{room.price}
                                <Typography component="span" variant="body2" color="text.secondary">
                                    {' '}/ {t('rooms.card.night')}
                                </Typography>
                            </Typography>

                            <Divider sx={{ my: 3 }} />

                            {/* Date picker */}
                            <Box sx={{ mb: 3 }}>
                                <TextField
                                    fullWidth
                                    label="Check-in"
                                    type="date"
                                    value={checkIn}
                                    onChange={(e) => setCheckIn(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    inputProps={{ min: new Date().toISOString().split('T')[0] }}
                                    sx={{ mb: 2 }}
                                />
                                <TextField
                                    fullWidth
                                    label="Check-out"
                                    type="date"
                                    value={checkOut}
                                    onChange={(e) => setCheckOut(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    inputProps={{ min: checkIn || new Date().toISOString().split('T')[0] }}
                                />
                            </Box>

                            {/* Riepilogo */}
                            {nights > 0 && (
                                <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            €{room.price} x {nights} {nights === 1 ? t('rooms.card.night') : t('rooms.card.nights')}
                                        </Typography>
                                        <Typography variant="body2" fontWeight={600}>
                                            €{totalPrice.toFixed(2)}
                                        </Typography>
                                    </Box>
                                    <Divider sx={{ my: 1 }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="h6" fontWeight={700}>
                                            {t('rooms.booking.total')}
                                        </Typography>
                                        <Typography variant="h6" fontWeight={700} color="primary.main">
                                            €{totalPrice.toFixed(2)}
                                        </Typography>
                                    </Box>
                                </Paper>
                            )}

                            {/* Pulsante prenota */}
                            <Button
                                variant="contained"
                                size="large"
                                fullWidth
                                startIcon={<CalendarMonth />}
                                onClick={handleBooking}
                                disabled={!checkIn || !checkOut}
                            >
                                {user ? t('rooms.booking.bookNow') : t('rooms.booking.loginButton')}
                            </Button>

                            {!user && (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
                                    {t('rooms.booking.loginMessage')}
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    )
}