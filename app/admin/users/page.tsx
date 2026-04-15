'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, TextField, MenuItem, LinearProgress, Alert, Stack, Tooltip, Card, CardContent, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, Button, Menu, MenuItem as MuiMenuItem, DialogContentText, Divider, List, ListItem, ListItemText } from '@mui/material'
import { FilterList, Refresh, ArrowBack, Visibility, Delete, MoreVert, AdminPanelSettings, Person, Shield, Warning } from '@mui/icons-material'
import Grid from '@mui/material/Grid'
import apiClient, { ApiError } from '@/lib/api-client'
import type { User } from '@/types'

// Tipi locali specifici per admin users
type UserRole = 'USER' | 'ADMIN' | 'ALL'

interface AdminUserStats {
    totalBookings: number
    totalConversations: number
}

interface AdminUser extends User {
    stats: AdminUserStats
}

interface AdminBooking {
    id: number
    startDate: string
    endDate: string
    totalPrice: number
    status: string
    room: { name: string }
}

interface AdminConversation {
    id: number
    createdAt: string
    _count: { messages: number }
}

interface UserDetail extends AdminUser {
    bookings: AdminBooking[]
    conversations: AdminConversation[]
    _count: {
        bookings: number
        conversations: number
    }
}

interface AdminUsersResponse {
    users: AdminUser[]
}

interface UserDetailResponse {
    user: UserDetail
}

export default function AdminUsersPage() {
    const router = useRouter()
    const [users, setUsers] = useState<AdminUser[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Filtri
    const [roleFilter, setRoleFilter] = useState<UserRole>('ALL')
    const [searchText, setSearchText] = useState('')

    // Dialog dettaglio
    const [detailDialogOpen, setDetailDialogOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null)
    const [loadingDetails, setLoadingDetails] = useState(false)

    // Menu azioni
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const [menuUser, setMenuUser] = useState<AdminUser | null>(null)

    // Dialog delete
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deletingUser, setDeletingUser] = useState(false)

    // Fetch users
    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const params = new URLSearchParams()
            if (roleFilter !== 'ALL') {
                params.append('role', roleFilter)
            }
            if (searchText) {
                params.append('search', searchText)
            }

            const query = params.toString()
            const endpoint = query ? `/admin/users?${query}` : '/admin/users'

            const data = await apiClient.get<AdminUsersResponse>(endpoint)
            setUsers(data.users)
        } catch (err) {
            const errorMessage = err instanceof ApiError ? err.message : 'Errore caricamento utenti'
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }, [roleFilter, searchText])

    useEffect(() => {
        fetchUsers()
    }, [fetchUsers])

    // Apri dialog dettaglio
    const handleOpenDetailDialog = async (user: AdminUser) => {
        setDetailDialogOpen(true)
        setLoadingDetails(true)

        try {
            const data = await apiClient.get<UserDetailResponse>(`/admin/users/${user.id}`)
            setSelectedUser(data.user)
        } catch (err) {
            const errorMessage = err instanceof ApiError ? err.message : 'Errore caricamento dettagli'
            setError(errorMessage)
        } finally {
            setLoadingDetails(false)
        }
    }

    // Chiudi dialog dettaglio
    const handleCloseDetailDialog = () => {
        setDetailDialogOpen(false)
        setSelectedUser(null)
    }

    // Apri menu azioni
    const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, user: AdminUser) => {
        setAnchorEl(event.currentTarget)
        setMenuUser(user)
    }

    // Chiudi menu
    const handleCloseMenu = () => {
        setAnchorEl(null)
        setMenuUser(null)
    }

    // Cambia ruolo utente
    const handleChangeUserRole = async (newRole: 'USER' | 'ADMIN') => {
        if (!menuUser) return

        try {
            handleCloseMenu()
            await apiClient.put(`/admin/users/${menuUser.id}`, JSON.stringify({ role: newRole }))
            await fetchUsers()

            if (selectedUser && selectedUser.id === menuUser.id) {
                setSelectedUser({ ...selectedUser, role: newRole })
            }
        } catch (err) {
            const errorMessage = err instanceof ApiError ? err.message : 'Errore cambio ruolo'
            setError(errorMessage)
        }
    }

    // Apri dialog delete
    const handleOpenDeleteDialog = (user: AdminUser) => {
        setMenuUser(user)
        handleCloseMenu()
        setDeleteDialogOpen(true)
    }

    // Conferma delete
    const handleConfirmDelete = async () => {
        if (!menuUser) return

        try {
            setDeletingUser(true)
            await apiClient.delete(`/admin/users/${menuUser.id}`)
            await fetchUsers()
            setDeleteDialogOpen(false)
            setMenuUser(null)

            if (selectedUser && selectedUser.id === menuUser.id) {
                handleCloseDetailDialog()
            }
        } catch (err) {
            const errorMessage = err instanceof ApiError ? err.message : 'Errore eliminazione utente'
            setError(errorMessage)
        } finally {
            setDeletingUser(false)
        }
    }

    // Stats
    const stats = {
        total: users.length,
        admins: users.filter(u => u.role === 'ADMIN').length,
        users: users.filter(u => u.role === 'USER').length
    }

    // Role chip
    const getRoleChip = (role: 'USER' | 'ADMIN') => {
        if (role === 'ADMIN') {
            return <Chip label="Admin" color="secondary" size="small" icon={<AdminPanelSettings />} />
        }
        return <Chip label="User" color="default" size="small" icon={<Person />} />
    }

    if (loading && users.length === 0) {
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
                        Gestione Utenti
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Visualizza e gestisci gli utenti della piattaforma
                    </Typography>
                </Box>
            </Stack>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Stats Cards */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid size={{ xs: 4 }}>
                    <Card>
                        <CardContent>
                            <Typography color="text.secondary" variant="body2">
                                Totale Utenti
                            </Typography>
                            <Typography variant="h4" fontWeight={700}>
                                {stats.total}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 4 }}>
                    <Card sx={{ bgcolor: 'secondary.light' }}>
                        <CardContent>
                            <Typography color="text.secondary" variant="body2">
                                Amministratori
                            </Typography>
                            <Typography variant="h4" fontWeight={700}>
                                {stats.admins}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 4 }}>
                    <Card sx={{ bgcolor: 'primary.light' }}>
                        <CardContent>
                            <Typography color="text.secondary" variant="body2">
                                Utenti Normali
                            </Typography>
                            <Typography variant="h4" fontWeight={700}>
                                {stats.users}
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
                        label="Ruolo"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value as UserRole)}
                        size="small"
                        sx={{ minWidth: 200 }}
                    >
                        <MenuItem value="ALL">Tutti</MenuItem>
                        <MenuItem value="USER">Solo Utenti</MenuItem>
                        <MenuItem value="ADMIN">Solo Admin</MenuItem>
                    </TextField>
                    <TextField
                        label="Cerca nome, email..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        size="small"
                        sx={{ flexGrow: 1 }}
                    />
                    <Tooltip title="Ricarica">
                        <IconButton onClick={fetchUsers} color="primary">
                            <Refresh />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Paper>

            {/* Tabella Utenti */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>ID</strong></TableCell>
                            <TableCell><strong>Utente</strong></TableCell>
                            <TableCell><strong>Email</strong></TableCell>
                            <TableCell align="center"><strong>Ruolo</strong></TableCell>
                            <TableCell align="center"><strong>Prenotazioni</strong></TableCell>
                            <TableCell align="center"><strong>Conversazioni</strong></TableCell>
                            <TableCell><strong>Registrato il</strong></TableCell>
                            <TableCell align="center"><strong>Azioni</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary">
                                        Nessun utente trovato
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id} hover>
                                    <TableCell>{user.id}</TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                                {user.name[0]?.toUpperCase()}
                                            </Avatar>
                                            <Typography variant="body2" fontWeight={600}>
                                                {user.name} {user.surname}
                                            </Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{user.email}</Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        {getRoleChip(user.role)}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip label={user.stats.totalBookings} size="small" variant="outlined" />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip label={user.stats.totalConversations} size="small" variant="outlined" />
                                    </TableCell>
                                    <TableCell>
                                        {new Date(user.createdAt).toLocaleDateString('it-IT', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric'
                                        })}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Stack direction="row" spacing={1} justifyContent="center">
                                            <Tooltip title="Dettagli">
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => handleOpenDetailDialog(user)}
                                                >
                                                    <Visibility />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Azioni">
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => handleOpenMenu(e, user)}
                                                >
                                                    <MoreVert />
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

            {/* Dialog Dettaglio Utente */}
            <Dialog open={detailDialogOpen} onClose={handleCloseDetailDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography variant="h6" fontWeight={600}>
                                Dettaglio Utente
                            </Typography>
                            {selectedUser && (
                                <Typography variant="caption" color="text.secondary">
                                    ID: {selectedUser.id}
                                </Typography>
                            )}
                        </Box>
                        {selectedUser && getRoleChip(selectedUser.role)}
                    </Stack>
                </DialogTitle>

                <DialogContent dividers>
                    {loadingDetails ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <LinearProgress sx={{ width: '50%' }} />
                        </Box>
                    ) : selectedUser ? (
                        <Stack spacing={3}>
                            {/* Info Personali */}
                            <Box>
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                    Informazioni Personali
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography variant="caption" color="text.secondary">Nome</Typography>
                                        <Typography variant="body2">{selectedUser.name} {selectedUser.surname}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography variant="caption" color="text.secondary">Email</Typography>
                                        <Typography variant="body2">{selectedUser.email}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography variant="caption" color="text.secondary">Telefono</Typography>
                                        <Typography variant="body2">{selectedUser.phone || 'Non fornito'}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography variant="caption" color="text.secondary">Registrato il</Typography>
                                        <Typography variant="body2">
                                            {new Date(selectedUser.createdAt).toLocaleDateString('it-IT')}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Box>

                            <Divider />

                            {/* Statistiche */}
                            <Box>
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                    Attività
                                </Typography>
                                <Stack direction="row" spacing={2}>
                                    <Card variant="outlined" sx={{ flex: 1 }}>
                                        <CardContent>
                                            <Typography color="text.secondary" variant="caption">
                                                Prenotazioni
                                            </Typography>
                                            <Typography variant="h5" fontWeight={700}>
                                                {selectedUser._count.bookings}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                    <Card variant="outlined" sx={{ flex: 1 }}>
                                        <CardContent>
                                            <Typography color="text.secondary" variant="caption">
                                                Conversazioni
                                            </Typography>
                                            <Typography variant="h5" fontWeight={700}>
                                                {selectedUser._count.conversations}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Stack>
                            </Box>

                            <Divider />

                            {/* Prenotazioni */}
                            <Box>
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                    Ultime Prenotazioni
                                </Typography>
                                {selectedUser.bookings.length === 0 ? (
                                    <Typography variant="body2" color="text.secondary">
                                        Nessuna prenotazione
                                    </Typography>
                                ) : (
                                    <List dense>
                                        {selectedUser.bookings.slice(0, 5).map((booking) => (
                                            <ListItem key={booking.id}>
                                                <ListItemText
                                                    primary={`${booking.room.name} - €${Number(booking.totalPrice).toFixed(2)}`}
                                                    secondary={`${new Date(booking.startDate).toLocaleDateString('it-IT')} → ${new Date(booking.endDate).toLocaleDateString('it-IT')} • ${booking.status}`}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                )}
                            </Box>

                            <Divider />

                            {/* Conversazioni */}
                            <Box>
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                    Conversazioni Recenti
                                </Typography>
                                {selectedUser.conversations.length === 0 ? (
                                    <Typography variant="body2" color="text.secondary">
                                        Nessuna conversazione
                                    </Typography>
                                ) : (
                                    <List dense>
                                        {selectedUser.conversations.slice(0, 5).map((conv) => (
                                            <ListItem key={conv.id}>
                                                <ListItemText
                                                    primary={`Conversazione #${conv.id}`}
                                                    secondary={`${conv._count.messages} messaggi • ${new Date(conv.createdAt).toLocaleDateString('it-IT')}`}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                )}
                            </Box>
                        </Stack>
                    ) : null}
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleCloseDetailDialog}>Chiudi</Button>
                </DialogActions>
            </Dialog>

            {/* Menu Azioni */}
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
                {menuUser?.role === 'USER' ? (
                    <MuiMenuItem onClick={() => handleChangeUserRole('ADMIN')}>
                        <Shield sx={{ mr: 1 }} fontSize="small" />
                        Promuovi ad Admin
                    </MuiMenuItem>
                ) : (
                    <MuiMenuItem onClick={() => handleChangeUserRole('USER')}>
                        <Person sx={{ mr: 1 }} fontSize="small" />
                        Degrada a Utente
                    </MuiMenuItem>
                )}
                <Divider />
                <MuiMenuItem onClick={() => menuUser && handleOpenDeleteDialog(menuUser)} sx={{ color: 'error.main' }}>
                    <Delete sx={{ mr: 1 }} fontSize="small" />
                    Elimina Utente
                </MuiMenuItem>
            </Menu>

            {/* Dialog Delete Confirmation */}
            <Dialog open={deleteDialogOpen} onClose={() => !deletingUser && setDeleteDialogOpen(false)}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Warning color="error" />
                    Conferma Eliminazione
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Sei sicuro di voler eliminare l&apos;utente{' '}
                        <strong>{menuUser?.name} {menuUser?.surname}</strong>?
                        <br /><br />
                        Questa azione eliminerà:
                        <br />
                        • Tutte le prenotazioni dell&apos;utente ({menuUser?.stats.totalBookings})
                        <br />
                        • Tutte le conversazioni dell&apos;utente ({menuUser?.stats.totalConversations})
                        <br /><br />
                        <strong>Questa azione NON può essere annullata.</strong>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)} disabled={deletingUser}>
                        Annulla
                    </Button>
                    <Button
                        onClick={handleConfirmDelete}
                        color="error"
                        variant="contained"
                        disabled={deletingUser}
                    >
                        {deletingUser ? 'Eliminazione...' : 'Elimina Utente'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}