'use client'

/**
 * Pagina principale per la visualizzazione delle camere disponibili.
 * Include filtri di ricerca, ordinamento e una griglia di camere.
 * Utilizza il custom hook useRooms per fetchare i dati in base ai filtri selezionati.
 * Implementa un'interfaccia utente moderna e responsive con Material-UI, con supporto per la localizzazione tramite react-i18next.
 * Gestisce stati di loading, errori e empty state in modo user-friendly.
 * Nota: Assicurarsi di avere un'immagine di placeholder (placeholder-room.jpg) nella cartella public per le camere senza immagine.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRooms } from '@/lib/hooks/useRooms'
import { useTranslation } from 'react-i18next'
import { Container, Box, Typography, Card, CardContent, CardMedia, CardActionArea, Button, Select, MenuItem, FormControl, InputLabel, Chip, LinearProgress, Paper, InputAdornment, TextField } from '@mui/material'
import { People, Euro, FilterList, BedOutlined } from '@mui/icons-material'
import Grid from '@mui/material/Grid'
import type { RoomSearchFilters } from '@/types'

export default function RoomsPage() {
    const { t } = useTranslation()
    const router = useRouter()

    // Filtri
    const [filters, setFilters] = useState<RoomSearchFilters>({
        minPrice: undefined,
        maxPrice: undefined,
        capacity: undefined,
        sortBy: 'price',
        sortOrder: 'asc',
    })

    // Fetch camere con filtri
    const { rooms, loading, error } = useRooms(filters)

    // Gestione cambio filtro
    const handleFilterChange = (key: keyof RoomSearchFilters, value: unknown) => {
        setFilters(prev => ({
            ...prev,
            [key]: value === '' ? undefined : value, // Se il valore è stringa vuota, lo settiamo a undefined per rimuovere il filtro
        }))
    }

    const clearFilters = () => {
        setFilters({
            minPrice: undefined,
            maxPrice: undefined,
            capacity: undefined,
            sortBy: 'price',
            sortOrder: 'asc',
        })
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h3" fontWeight={700} gutterBottom>
                    {t('rooms.title')}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {t('rooms.subtitle')}
                </Typography>
            </Box>

            {/* Filtri */}
            <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <FilterList sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight={600}>
                        {t('rooms.filters.title')}
                    </Typography>
                </Box>

                <Grid container spacing={2}>
                    {/* Prezzo minimo */}
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <TextField
                            fullWidth
                            label={t('rooms.filters.minPrice')}
                            type="number"
                            value={filters.minPrice || ''}
                            onChange={(e) => handleFilterChange('minPrice', parseFloat(e.target.value))}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Euro />
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>

                    {/* Prezzo massimo */}
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <TextField
                            fullWidth
                            label={t('rooms.filters.maxPrice')}
                            type="number"
                            value={filters.maxPrice || ''}
                            onChange={(e) => handleFilterChange('maxPrice', parseFloat(e.target.value))}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Euro />
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>

                    {/* Capacità */}
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <TextField
                            fullWidth
                            label="Ospiti"
                            type="number"
                            value={filters.capacity || ''}
                            onChange={(e) => handleFilterChange('capacity', parseInt(e.target.value))}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <People />
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>

                    {/* Ordinamento */}
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <FormControl fullWidth>
                            <InputLabel>{t('rooms.filters.sortBy')}</InputLabel>
                            <Select
                                value={filters.sortBy || 'price'}
                                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                label={t('rooms.filters.sortBy')}
                            >
                                <MenuItem value="type">{t('rooms.sortOptions.roomType')}</MenuItem>
                                <MenuItem value="name">{t('rooms.sortOptions.name')}</MenuItem>
                                <MenuItem value="price">{t('rooms.sortOptions.price')}</MenuItem>
                                <MenuItem value="capacity">{t('rooms.sortOptions.capacity')}</MenuItem>
                                <MenuItem value="amenities">{t('rooms.sortOptions.amenities')}</MenuItem>
                                <MenuItem value="availability">{t('rooms.sortOptions.availability')}</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>

                {/* Pulsante reset */}
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button onClick={clearFilters} variant="outlined">
                        {t('rooms.filters.clearFilters')}
                    </Button>
                </Box>
            </Paper>

            {/* Loading */}
            {loading && (
                <Box sx={{ mb: 4 }}>
                    <LinearProgress />
                </Box>
            )}

            {/* Error */}
            {error && (
                <Paper elevation={2} sx={{ p: 3, mb: 4, bgcolor: 'error.light' }}>
                    <Typography color="error.dark">{error}</Typography>
                </Paper>
            )}

            {/* Lista camere */}
            {!loading && rooms.length === 0 ? (
                // Empty state
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <BedOutlined sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h5" color="text.secondary" gutterBottom>
                        {t('rooms.results.noRooms')}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {t('rooms.results.noRoomsMessage')}
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={clearFilters}
                        sx={{ mt: 3 }}
                    >
                        {t('rooms.results.showAll')}
                    </Button>
                </Box>
            ) : (
                <>
                    {/* Risultati */}
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {rooms.length} {rooms.length === 1 ? t('rooms.results.found') : t('rooms.results.found_plural')}
                    </Typography>

                    <Grid container spacing={3}>
                        {rooms.map((room) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={room.id}>
                                <Card
                                    elevation={2}
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: 'transform 0.3s, box-shadow 0.3s',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: 4
                                        }
                                    }}
                                >
                                    <CardActionArea
                                        onClick={() => router.push(`/rooms/${room.id}`)}
                                        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                                    >
                                        {/* Immagine */}
                                        <CardMedia
                                            component="img"
                                            height="200"
                                            image={room.imageUrl || '/placeholder-room.jpg'}
                                            alt={room.name}
                                            sx={{ objectFit: 'cover' }}
                                        />

                                        {/* Contenuto */}
                                        <CardContent sx={{ flexGrow: 1 }}>
                                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                                {room.name}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    mb: 2,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical'
                                                }}
                                            >
                                                {room.description}
                                            </Typography>

                                            {/* Info */}
                                            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                                                <Chip
                                                    icon={<People />}
                                                    label={`${room.capacity} ${room.capacity === 1 ? t('rooms.card.guest') : t('rooms.card.guests')}`}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                                <Chip
                                                    icon={<Euro />}
                                                    label={`€${room.price}${t('rooms.card.perNight')}`}
                                                    size="small"
                                                    color="primary"
                                                />
                                            </Box>

                                            <Typography
                                                variant="body2"
                                                color="primary"
                                                fontWeight={600}
                                                sx={{ textAlign: 'center', mt: 'auto' }}
                                            >
                                                {t('rooms.card.viewDetails')} →
                                            </Typography>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </>
            )}
        </Container>
    )
}
