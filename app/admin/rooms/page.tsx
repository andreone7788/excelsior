'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Chip, IconButton, TextField, LinearProgress, Alert, Stack, Card, CardContent,
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Menu, MenuItem as MuiMenuItem,
    DialogContentText, Divider, List, ListItem, ListItemText, Tabs, Tab
} from '@mui/material'
import {
    ArrowBack, Refresh, Add, Edit, Delete, MoreVert, Visibility,
    Hotel, EuroSymbol, People, Warning, Image as ImageIcon
} from '@mui/icons-material'
import Grid from '@mui/material/Grid'
import apiClient, { ApiError } from '@/lib/api-client'
import type { Room, BookingStatus, RoomImage } from '@/types'
import RoomGallery from '@/components/rooms/RoomGallery'

// ======== TIPI LOCALI (specifici per questa pagina) ========

/**
 * Room con statistiche prenotazioni e immagini (ritornato da GET /api/admin/rooms)
 */
interface AdminRoom extends Room {
    _count: {
        bookings: number
    }
    images?: RoomImage[]
}

/**
 * Prenotazione nel contesto di una camera (per RoomDetail.bookings[])
 */
interface RoomBooking {
    id: number
    startDate: string
    endDate: string
    totalPrice: number
    status: BookingStatus
    user: {
        id: number
        name: string
        surname: string
        email: string
    }
}

/**
 * Dettaglio camera con lista prenotazioni (GET /api/admin/rooms/:id)
 */
interface RoomDetail extends AdminRoom {
    bookings: RoomBooking[]
}

/**
 * Response wrapper per GET /api/admin/rooms
 */
interface AdminRoomsResponse {
    rooms: AdminRoom[]
}

/**
 * Response wrapper per GET /api/admin/rooms/:id
 */
interface AdminRoomDetailResponse {
    room: RoomDetail
}

/**
 * Form data per creazione/modifica camera (stato locale)
 */
interface RoomFormData {
    name: string
    description: string
    price: string
    capacity: string
    imageUrl: string
}

// ========== MAIN COMPONENT ==========

export default function AdminRoomsPage() {
    const router = useRouter()

    // Stati principali
    const [rooms, setRooms] = useState<AdminRoom[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    // Filtri e ricerca
    const [searchText, setSearchText] = useState<string>('')
    const [sortBy, setSortBy] = useState<'name' | 'price' | 'capacity'>('name')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

    // Dialog dettaglio camera
    const [detailDialogOpen, setDetailDialogOpen] = useState<boolean>(false)
    const [loadingDetails, setLoadingDetails] = useState<boolean>(false)
    const [selectedRoom, setSelectedRoom] = useState<RoomDetail | null>(null)
    const [detailTab, setDetailTab] = useState<number>(0)

    // Dialog creazione camera
    const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false)
    const [creating, setCreating] = useState<boolean>(false)
    const [createForm, setCreateForm] = useState<RoomFormData>({
        name: '',
        description: '',
        price: '',
        capacity: '',
        imageUrl: ''
    })

    // Dialog modifica camera
    const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false)
    const [editing, setEditing] = useState<boolean>(false)
    const [editForm, setEditForm] = useState<RoomFormData>({
        name: '',
        description: '',
        price: '',
        capacity: '',
        imageUrl: ''
    })
    const [editTab, setEditTab] = useState<number>(0)

    // Menu azioni
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const [menuRoom, setMenuRoom] = useState<AdminRoom | null>(null)

    // Dialog conferma cancellazione
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)
    const [deleting, setDeleting] = useState<boolean>(false)

    // ========== FETCH & FILTERING ==========

    const fetchRooms = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const data = await apiClient.get<AdminRoomsResponse>('/admin/rooms')
            setRooms(data.rooms)
        } catch (err) {
            const errorMessage = err instanceof ApiError ? err.message : 'Errore durante il caricamento delle camere'
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchRooms()
    }, [fetchRooms])

    const filteredRooms = rooms
        .filter(room => {
            if (!searchText) return true
            const lowerSearch = searchText.toLowerCase()
            return (
                room.name.toLowerCase().includes(lowerSearch) ||
                room.description?.toLowerCase().includes(lowerSearch)
            )
        })
        .sort((a, b) => {
            const multiplier = sortOrder === 'asc' ? 1 : -1
            if (sortBy === 'name') {
                return a.name.localeCompare(b.name) * multiplier
            } else if (sortBy === 'price') {
                return (a.price - b.price) * multiplier
            } else if (sortBy === 'capacity') {
                return (a.capacity - b.capacity) * multiplier
            }
            return 0
        })

    const stats = {
        totalRooms: rooms.length,
        totalBookings: rooms.reduce((sum, room) => sum + room._count.bookings, 0),
        averagePrice: rooms.length > 0
            ? (rooms.reduce((sum, room) => sum + room.price, 0) / rooms.length).toFixed(2)
            : '0',
        totalCapacity: rooms.reduce((sum, room) => sum + room.capacity, 0)
    }

    // ========== DIALOG DETTAGLIO ==========

    const handleOpenDetailDialog = async (room: AdminRoom) => {
        setDetailDialogOpen(true)
        setLoadingDetails(true)
        setDetailTab(0)

        try {
            const data = await apiClient.get<AdminRoomDetailResponse>(`/admin/rooms/${room.id}`)
            setSelectedRoom(data.room)
        } catch (err) {
            const errorMessage = err instanceof ApiError ? err.message : 'Errore durante il caricamento dei dettagli della camera'
            setError(errorMessage)
        } finally {
            setLoadingDetails(false)
        }
    }

    const handleCloseDetailDialog = () => {
        setDetailDialogOpen(false)
        setSelectedRoom(null)
        setDetailTab(0)
    }

    // ========== DIALOG CREATE ==========

    const handleOpenCreateDialog = () => {
        setCreateForm({
            name: '',
            description: '',
            price: '',
            capacity: '',
            imageUrl: ''
        })
        setCreateDialogOpen(true)
    }

    const handleCloseCreateDialog = () => {
        setCreateDialogOpen(false)
        setCreateForm({
            name: '',
            description: '',
            price: '',
            capacity: '',
            imageUrl: ''
        })
    }

    const handleCreateRoom = async () => {
        try {
            setCreating(true)
            setError(null)

            const payload = {
                name: createForm.name,
                description: createForm.description,
                price: parseFloat(createForm.price),
                capacity: parseInt(createForm.capacity, 10),
                imageUrl: createForm.imageUrl
            }

            await apiClient.post('/admin/rooms', JSON.stringify(payload))

            setSuccessMessage('Camera creata con successo!')
            handleCloseCreateDialog()
            await fetchRooms()
        } catch (err) {
            const errorMessage = err instanceof ApiError ? err.message : 'Errore durante la creazione della camera'
            setError(errorMessage)
        } finally {
            setCreating(false)
        }
    }

    // ========== DIALOG EDIT ==========

    const handleOpenEditDialog = (room: AdminRoom) => {
        setEditForm({
            name: room.name,
            description: room.description || '',
            price: room.price.toString(),
            capacity: room.capacity.toString(),
            imageUrl: room.imageUrl || ''
        })
        setMenuRoom(room)
        setAnchorEl(null)
        setEditDialogOpen(true)
        setEditTab(0)
    }

    const handleCloseEditDialog = () => {
        setEditDialogOpen(false)
        setEditForm({
            name: '',
            description: '',
            price: '',
            capacity: '',
            imageUrl: ''
        })
        setEditTab(0)
    }

    const handleEditRoom = async () => {
        if (!menuRoom) return

        try {
            setEditing(true)
            setError(null)

            const payload = {
                name: editForm.name,
                description: editForm.description,
                price: parseFloat(editForm.price),
                capacity: parseInt(editForm.capacity, 10),
                imageUrl: editForm.imageUrl
            }

            await apiClient.put(`/admin/rooms/${menuRoom.id}`, JSON.stringify(payload))

            setSuccessMessage('Camera aggiornata con successo!')
            handleCloseEditDialog()
            await fetchRooms()

            if (selectedRoom && selectedRoom.id === menuRoom.id) {
                const data = await apiClient.get<AdminRoomDetailResponse>(`/admin/rooms/${menuRoom.id}`)
                setSelectedRoom(data.room)
            }

            setTimeout(() => setSuccessMessage(null), 3000)
        } catch (err) {
            const errorMessage = err instanceof ApiError ? err.message : 'Errore durante l\'aggiornamento della camera'
            setError(errorMessage)
        } finally {
            setEditing(false)
        }
    }

    // ========== DIALOG DELETE ==========

    const handleOpenDeleteDialog = (room: AdminRoom) => {
        setMenuRoom(room)
        setAnchorEl(null)
        setDeleteDialogOpen(true)
    }

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false)
        setMenuRoom(null)
    }

    const handleConfirmDelete = async () => {
        if (!menuRoom) return

        try {
            setDeleting(true)
            setError(null)

            await apiClient.delete(`/admin/rooms/${menuRoom.id}`)

            setSuccessMessage('Camera eliminata con successo!')
            handleCloseDeleteDialog()
            await fetchRooms()

            if (selectedRoom && selectedRoom.id === menuRoom.id) {
                setSelectedRoom(null)
            }

            setTimeout(() => setSuccessMessage(null), 3000)
        } catch (err) {
            const errorMessage = err instanceof ApiError ? err.message : 'Errore durante l\'eliminazione della camera'
            setError(errorMessage)
        } finally {
            setDeleting(false)
        }
    }

    // ========== MENU ==========

    const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, room: AdminRoom) => {
        setAnchorEl(event.currentTarget)
        setMenuRoom(room)
    }

    const handleCloseMenu = () => {
        setAnchorEl(null)
        setMenuRoom(null)
    }

    // ========== UTILITY ==========

    const getAvailabilityChip = (bookingsCount: number) => {
        if (bookingsCount === 0) {
            return <Chip label="Disponibile" color="success" size="small" />
        }
        return <Chip label={`${bookingsCount} prenotazioni`} color="warning" size="small" />
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('it-IT', {
            style: 'currency',
            currency: 'EUR'
        }).format(price)
    }

    if (loading && rooms.length === 0) {
        return (
            <Box sx={{ width: '100%', mt: 4 }}>
                <LinearProgress />
            </Box>
        )
    }

    return (
        <Box sx={{ maxWidth: 1600, mx: 'auto', p: 3 }}>
            {/* Header */}
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <IconButton onClick={() => router.push('/admin/dashboard')}>
                    <ArrowBack />
                </IconButton>
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h4" fontWeight={700}>
                        Gestione Camere
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Visualizza e gestisci l&apos;inventario delle camere dell&apos;hotel
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleOpenCreateDialog}
                >
                    Nuova Camera
                </Button>
                <IconButton onClick={fetchRooms} disabled={loading}>
                    <Refresh />
                </IconButton>
            </Stack>

            {/* Alerts */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {successMessage && (
                <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage(null)}>
                    {successMessage}
                </Alert>
            )}

            {/* Stats Cards */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Hotel color="primary" fontSize="large" />
                                <Box>
                                    <Typography color="text.secondary" variant="body2">
                                        Totale Camere
                                    </Typography>
                                    <Typography variant="h4" fontWeight={700}>
                                        {stats.totalRooms}
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <EuroSymbol color="success" fontSize="large" />
                                <Box>
                                    <Typography color="text.secondary" variant="body2">
                                        Prezzo Medio
                                    </Typography>
                                    <Typography variant="h4" fontWeight={700}>
                                        {formatPrice(parseFloat(stats.averagePrice))}
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <People color="info" fontSize="large" />
                                <Box>
                                    <Typography color="text.secondary" variant="body2">
                                        Capacità Totale
                                    </Typography>
                                    <Typography variant="h4" fontWeight={700}>
                                        {stats.totalCapacity}
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Visibility color="warning" fontSize="large" />
                                <Box>
                                    <Typography color="text.secondary" variant="body2">
                                        Prenotazioni Totali
                                    </Typography>
                                    <Typography variant="h4" fontWeight={700}>
                                        {stats.totalBookings}
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Filtri */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <TextField
                        label="Cerca camera"
                        variant="outlined"
                        size="small"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        sx={{ flexGrow: 1 }}
                    />
                    <TextField
                        select
                        label="Ordina per"
                        size="small"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'capacity')}
                        sx={{ minWidth: 150 }}
                    >
                        <MuiMenuItem value="name">Nome</MuiMenuItem>
                        <MuiMenuItem value="price">Prezzo</MuiMenuItem>
                        <MuiMenuItem value="capacity">Capacità</MuiMenuItem>
                    </TextField>
                    <TextField
                        select
                        label="Ordine"
                        size="small"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                        sx={{ minWidth: 120 }}
                    >
                        <MuiMenuItem value="asc">Crescente</MuiMenuItem>
                        <MuiMenuItem value="desc">Decrescente</MuiMenuItem>
                    </TextField>
                </Stack>
            </Paper>

            {/* Tabella Camere */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>ID</strong></TableCell>
                            <TableCell><strong>Nome</strong></TableCell>
                            <TableCell><strong>Descrizione</strong></TableCell>
                            <TableCell><strong>Prezzo/notte</strong></TableCell>
                            <TableCell><strong>Capacità</strong></TableCell>
                            <TableCell><strong>Immagini</strong></TableCell>
                            <TableCell><strong>Stato</strong></TableCell>
                            <TableCell align="center"><strong>Azioni</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredRooms.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    <Typography color="text.secondary" sx={{ py: 4 }}>
                                        Nessuna camera trovata
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredRooms.map((room) => (
                                <TableRow key={room.id} hover>
                                    <TableCell>{room.id}</TableCell>
                                    <TableCell>
                                        <Typography fontWeight={600}>
                                            {room.name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                maxWidth: 300,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            {room.description || 'N/A'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography fontWeight={600} color="primary">
                                            {formatPrice(room.price)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                            <People fontSize="small" color="action" />
                                            <Typography>{room.capacity}</Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            icon={<ImageIcon />}
                                            label={room.images?.length || 0}
                                            size="small"
                                            color={room.images && room.images.length > 0 ? 'primary' : 'default'}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {getAvailabilityChip(room._count.bookings)}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Stack direction="row" spacing={1} justifyContent="center">
                                            <IconButton
                                                size="small"
                                                color="info"
                                                onClick={() => handleOpenDetailDialog(room)}
                                            >
                                                <Visibility />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={(e) => handleOpenMenu(e, room)}
                                            >
                                                <MoreVert />
                                            </IconButton>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Menu Azioni */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
            >
                <MuiMenuItem onClick={() => menuRoom && handleOpenEditDialog(menuRoom)}>
                    <Edit fontSize="small" sx={{ mr: 1 }} />
                    Modifica Camera
                </MuiMenuItem>
                <Divider />
                <MuiMenuItem
                    onClick={() => menuRoom && handleOpenDeleteDialog(menuRoom)}
                    sx={{ color: 'error.main' }}
                >
                    <Delete fontSize="small" sx={{ mr: 1 }} />
                    Elimina Camera
                </MuiMenuItem>
            </Menu>

            {/* Dialog Dettaglio Camera */}
            <Dialog
                open={detailDialogOpen}
                onClose={handleCloseDetailDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Hotel />
                        <Box>
                            <Typography variant="h6">
                                {selectedRoom?.name || 'Caricamento...'}
                            </Typography>
                            {selectedRoom && (
                                <Typography variant="caption" color="text.secondary">
                                    ID: {selectedRoom.id} | {selectedRoom.images?.length || 0} immagini
                                </Typography>
                            )}
                        </Box>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    {loadingDetails ? (
                        <LinearProgress />
                    ) : selectedRoom ? (
                        <>
                            <Tabs value={detailTab} onChange={(_, v) => setDetailTab(v)} sx={{ mb: 2 }}>
                                <Tab label="Informazioni" />
                                <Tab label={`Prenotazioni (${selectedRoom._count.bookings})`} />
                            </Tabs>

                            {/* Tab Informazioni */}
                            {detailTab === 0 && (
                                <Stack spacing={3}>
                                    {/* Gallery Immagini */}
                                    {selectedRoom.images && selectedRoom.images.length > 0 ? (
                                        <RoomGallery images={selectedRoom.images} roomName={selectedRoom.name} />
                                    ) : selectedRoom.imageUrl ? (
                                        <Box
                                            component="img"
                                            src={selectedRoom.imageUrl}
                                            alt={selectedRoom.name}
                                            sx={{
                                                width: '100%',
                                                height: 300,
                                                objectFit: 'cover',
                                                borderRadius: 2
                                            }}
                                        />
                                    ) : (
                                        <Alert severity="info">
                                            Nessuna immagine disponibile per questa camera
                                        </Alert>
                                    )}

                                    {/* Descrizione */}
                                    <Box>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                            Descrizione
                                        </Typography>
                                        <Typography>
                                            {selectedRoom.description || 'Nessuna descrizione disponibile'}
                                        </Typography>
                                    </Box>

                                    {/* Dettagli */}
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 6 }}>
                                            <Card variant="outlined">
                                                <CardContent>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Prezzo per notte
                                                    </Typography>
                                                    <Typography variant="h5" fontWeight={700} color="primary">
                                                        {formatPrice(selectedRoom.price)}
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <Card variant="outlined">
                                                <CardContent>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Capacità persone
                                                    </Typography>
                                                    <Typography variant="h5" fontWeight={700}>
                                                        {selectedRoom.capacity}
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    </Grid>

                                    {/* Date */}
                                    <Divider />
                                    <Stack direction="row" spacing={4}>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Creata il
                                            </Typography>
                                            <Typography variant="body2">
                                                {new Date(selectedRoom.createdAt).toLocaleDateString('it-IT')}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Ultimo aggiornamento
                                            </Typography>
                                            <Typography variant="body2">
                                                {new Date(selectedRoom.updatedAt).toLocaleDateString('it-IT')}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Stack>
                            )}

                            {/* Tab Prenotazioni */}
                            {detailTab === 1 && (
                                <Box>
                                    {selectedRoom.bookings.length === 0 ? (
                                        <Alert severity="info">
                                            Nessuna prenotazione per questa camera
                                        </Alert>
                                    ) : (
                                        <List dense>
                                            {selectedRoom.bookings.map((booking) => (
                                                <ListItem key={booking.id} divider>
                                                    <ListItemText
                                                        primary={`${booking.user.name} ${booking.user.surname}`}
                                                        secondary={
                                                            <>
                                                                {new Date(booking.startDate).toLocaleDateString('it-IT')} - {' '}
                                                                {new Date(booking.endDate).toLocaleDateString('it-IT')} | {' '}
                                                                {formatPrice(booking.totalPrice)} | {' '}
                                                                <Chip
                                                                    label={booking.status}
                                                                    size="small"
                                                                    color={
                                                                        booking.status === 'CONFIRMED' ? 'success' :
                                                                            booking.status === 'PENDING' ? 'warning' : 'default'
                                                                    }
                                                                />
                                                            </>
                                                        }
                                                        secondaryTypographyProps={{ component: 'div' }}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    )}
                                </Box>
                            )}
                        </>
                    ) : (
                        <Alert severity="error">Errore caricamento dettagli</Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDetailDialog}>Chiudi</Button>
                </DialogActions>
            </Dialog>

            {/* Dialog Crea Camera */}
            <Dialog
                open={createDialogOpen}
                onClose={handleCloseCreateDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Crea Nuova Camera</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Inserisci i dettagli della nuova camera. I campi contrassegnati con * sono obbligatori.
                    </DialogContentText>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            label="Nome Camera *"
                            fullWidth
                            value={createForm.name}
                            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                            required
                            helperText="Es: Suite Deluxe, Camera Standard, etc."
                        />
                        <TextField
                            label="Descrizione *"
                            fullWidth
                            multiline
                            rows={3}
                            value={createForm.description}
                            onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                            required
                            helperText="Minimo 10 caratteri"
                        />
                        <TextField
                            label="Prezzo per notte (€) *"
                            fullWidth
                            type="number"
                            value={createForm.price}
                            onChange={(e) => setCreateForm({ ...createForm, price: e.target.value })}
                            required
                            inputProps={{ min: 0, step: 0.01 }}
                        />
                        <TextField
                            label="Capacità persone *"
                            fullWidth
                            type="number"
                            value={createForm.capacity}
                            onChange={(e) => setCreateForm({ ...createForm, capacity: e.target.value })}
                            required
                            inputProps={{ min: 1, step: 1 }}
                        />
                        <TextField
                            label="URL Immagine"
                            fullWidth
                            type="url"
                            value={createForm.imageUrl}
                            onChange={(e) => setCreateForm({ ...createForm, imageUrl: e.target.value })}
                            helperText="URL completo dell'immagine (opzionale)"
                        />
                        <Alert severity="info" icon={<ImageIcon />}>
                            <Typography variant="body2">
                                <strong>Nota:</strong> Dopo aver creato la camera, potrai aggiungere una gallery di immagini dalla funzione di modifica.
                            </Typography>
                        </Alert>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseCreateDialog} disabled={creating}>
                        Annulla
                    </Button>
                    <Button
                        onClick={handleCreateRoom}
                        variant="contained"
                        disabled={
                            creating ||
                            !createForm.name ||
                            !createForm.description ||
                            !createForm.price ||
                            !createForm.capacity ||
                            createForm.description.length < 10
                        }
                    >
                        {creating ? 'Creazione...' : 'Crea Camera'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog Modifica Camera */}
            <Dialog
                open={editDialogOpen}
                onClose={handleCloseEditDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Modifica Camera</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Modifica i dettagli della camera: <strong>{menuRoom?.name}</strong>
                    </DialogContentText>

                    <Tabs value={editTab} onChange={(_, v) => setEditTab(v)} sx={{ mb: 2 }}>
                        <Tab label="Informazioni Base" />
                        <Tab label={`Gallery (${menuRoom?.images?.length || 0})`} icon={<ImageIcon />} iconPosition="start" />
                    </Tabs>

                    {/* Tab Informazioni Base */}
                    {editTab === 0 && (
                        <Stack spacing={2}>
                            <TextField
                                label="Nome Camera *"
                                fullWidth
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                required
                            />
                            <TextField
                                label="Descrizione *"
                                fullWidth
                                multiline
                                rows={3}
                                value={editForm.description}
                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                required
                                helperText="Minimo 10 caratteri"
                            />
                            <TextField
                                label="Prezzo per notte (€) *"
                                fullWidth
                                type="number"
                                value={editForm.price}
                                onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                                required
                                inputProps={{ min: 0, step: 0.01 }}
                            />
                            <TextField
                                label="Capacità persone *"
                                fullWidth
                                type="number"
                                value={editForm.capacity}
                                onChange={(e) => setEditForm({ ...editForm, capacity: e.target.value })}
                                required
                                inputProps={{ min: 1, step: 1 }}
                            />
                            <TextField
                                label="URL Immagine Principale"
                                fullWidth
                                type="url"
                                value={editForm.imageUrl}
                                onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                                helperText="Immagine principale mostrata in lista (opzionale se hai una gallery)"
                            />
                        </Stack>
                    )}

                    {/* Tab Gallery */}
                    {editTab === 1 && (
                        <Stack spacing={2}>
                            <Alert severity="info">
                                <Typography variant="body2" gutterBottom>
                                    <strong>Gestione Gallery Immagini</strong>
                                </Typography>
                                <Typography variant="caption">
                                    Per gestire le immagini della gallery, utilizza direttamente il database.
                                    Questa funzionalità sarà disponibile in una futura versione dell&apos;admin panel.
                                </Typography>
                            </Alert>

                            {menuRoom?.images && menuRoom.images.length > 0 ? (
                                <>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Immagini Esistenti ({menuRoom.images.length})
                                    </Typography>
                                    <Stack spacing={1}>
                                        {menuRoom.images.map((img, idx) => (
                                            <Card key={img.id} variant="outlined">
                                                <CardContent>
                                                    <Stack direction="row" spacing={2} alignItems="center">
                                                        <Box
                                                            component="img"
                                                            src={img.url}
                                                            alt={img.caption || `Immagine ${idx + 1}`}
                                                            sx={{
                                                                width: 80,
                                                                height: 60,
                                                                objectFit: 'cover',
                                                                borderRadius: 1
                                                            }}
                                                        />
                                                        <Box sx={{ flexGrow: 1 }}>
                                                            <Typography variant="body2" fontWeight={600}>
                                                                {img.caption || `Immagine ${idx + 1}`}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Ordine: {img.order} {img.isPrimary && '| Principale'}
                                                            </Typography>
                                                        </Box>
                                                        <Chip
                                                            label={img.isPrimary ? 'Principale' : 'Secondaria'}
                                                            size="small"
                                                            color={img.isPrimary ? 'primary' : 'default'}
                                                        />
                                                    </Stack>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </Stack>
                                </>
                            ) : (
                                <Alert severity="warning">
                                    Nessuna immagine nella gallery. Aggiungi immagini direttamente nel database (tabella RoomImage).
                                </Alert>
                            )}
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEditDialog} disabled={editing}>
                        Annulla
                    </Button>
                    <Button
                        onClick={handleEditRoom}
                        variant="contained"
                        disabled={
                            editing ||
                            !editForm.name ||
                            !editForm.description ||
                            !editForm.price ||
                            !editForm.capacity ||
                            editForm.description.length < 10
                        }
                    >
                        {editing ? 'Salvataggio...' : 'Salva Modifiche'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog Elimina Camera */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleCloseDeleteDialog}
                maxWidth="sm"
            >
                <DialogTitle>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Warning color="error" />
                        <Typography variant="h6">Conferma Eliminazione</Typography>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Sei sicuro di voler eliminare la camera <strong>{menuRoom?.name}</strong>?
                    </DialogContentText>

                    {menuRoom && menuRoom._count.bookings > 0 ? (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            <Typography variant="body2" fontWeight={600} gutterBottom>
                                Impossibile eliminare questa camera
                            </Typography>
                            <Typography variant="body2">
                                Ci sono <strong>{menuRoom._count.bookings} prenotazioni</strong> associate a questa camera.
                                Elimina prima tutte le prenotazioni o attendi il loro completamento.
                            </Typography>
                        </Alert>
                    ) : (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                            Questa azione è irreversibile. Tutti i dati della camera (incluse le immagini) saranno eliminati definitivamente.
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog} disabled={deleting}>
                        Annulla
                    </Button>
                    <Button
                        onClick={handleConfirmDelete}
                        variant="contained"
                        color="error"
                        disabled={deleting || (menuRoom?._count.bookings ?? 0) > 0}
                    >
                        {deleting ? 'Eliminazione...' : 'Conferma Eliminazione'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}