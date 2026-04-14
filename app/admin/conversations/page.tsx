'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, TextField, MenuItem, LinearProgress, Alert, Stack, Tooltip, Card, CardContent, Avatar, Badge, Dialog, DialogTitle, DialogContent, DialogActions, Button, Menu, MenuItem as MuiMenuItem } from '@mui/material'
import { FilterList, Refresh, ChatBubble, CheckCircle, Cancel, ArrowBack, Send, MoreVert, Lock, LockOpen } from '@mui/icons-material'
import Grid from '@mui/material/Grid'
import apiClient, { ApiError } from '@/lib/api-client'
import type { Conversation, ConversationStatus, Message } from '@/types'

interface MessageWithSender extends Message {
    sender?: {
        id: number
        name: string
        surname: string
        role: 'USER' | 'ADMIN'
    }
}

interface AdminConversationsResponse {
    conversations: Conversation[]
    stats: {
        total: number
        open: number
        closed: number
    }
}

interface ConversationDetailResponse {
    conversation: Conversation
}

export default function AdminConversationsPage() {
    const router = useRouter()
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [stats, setStats] = useState({ total: 0, open: 0, closed: 0 })

    // Filtri
    const [statusFilter, setStatusFilter] = useState<ConversationStatus | ''>('')
    const [searchText, setSearchText] = useState('')

    // Dialog conversazione
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
    const [messages, setMessages] = useState<MessageWithSender[]>([])
    const [loadingMessages, setLoadingMessages] = useState(false)
    const [replyText, setReplyText] = useState('')
    const [sending, setSending] = useState(false)
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

    // Fetch conversations
    const fetchConversations = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const params = new URLSearchParams()
            if (statusFilter) {
                params.append('status', statusFilter)
            }

            const query = params.toString()
            const endpoint = query ? `/admin/conversations?${query}` : '/admin/conversations'

            const data = await apiClient.get<AdminConversationsResponse>(endpoint)
            setConversations(data.conversations)
            setStats(data.stats)
        } catch (err) {
            const errorMessage = err instanceof ApiError ? err.message : 'Errore caricamento conversazioni'
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }, [statusFilter])

    useEffect(() => {
        fetchConversations()
    }, [fetchConversations])

    // Apri dialog con dettagli conversazione
    const handleOpenConversation = async (conv: Conversation) => {
        setSelectedConversation(conv)
        setDialogOpen(true)
        setLoadingMessages(true)

        try {
            const data = await apiClient.get<ConversationDetailResponse>(`/admin/conversations/${conv.id}`)
            setMessages(data.conversation.messages || [])
        } catch (err) {
            const errorMessage = err instanceof ApiError ? err.message : 'Errore caricamento messaggi'
            setError(errorMessage)
        } finally {
            setLoadingMessages(false)
        }
    }

    // Invia risposta
    const handleSendReply = async () => {
        if (!replyText.trim() || !selectedConversation) return

        try {
            setSending(true)
            setError(null)

            const response = await apiClient.post<{ message: MessageWithSender }>(
                `/admin/conversations/${selectedConversation.id}/messages`,
                JSON.stringify({ content: replyText })
            )

            setMessages(prev => [...prev, response.message])
            setReplyText('')

            // Aggiorna la lista
            fetchConversations()
        } catch (err) {
            const errorMessage = err instanceof ApiError ? err.message : 'Errore invio messaggio'
            setError(errorMessage)
        } finally {
            setSending(false)
        }
    }

    // Cambia status conversazione
    const handleChangeStatus = async (newStatus: ConversationStatus) => {
        if (!selectedConversation) return

        try {
            setAnchorEl(null)
            await apiClient.put(`/admin/conversations/${selectedConversation.id}`, JSON.stringify({ status: newStatus }))
            setSelectedConversation(prev => prev ? { ...prev, status: newStatus } : null)
            fetchConversations()
        } catch (err) {
            const errorMessage = err instanceof ApiError ? err.message : 'Errore cambio status'
            setError(errorMessage)
        }
    }

    // Chiudi dialog
    const handleCloseDialog = () => {
        setDialogOpen(false)
        setSelectedConversation(null)
        setMessages([])
        setReplyText('')
        setError(null)
    }

    // Filtra conversazioni con search text
    const filteredConversations = conversations.filter((conv) => {
        if (!searchText) return true
        const search = searchText.toLowerCase()
        return (
            conv.user?.name?.toLowerCase().includes(search) ||
            conv.user?.surname?.toLowerCase().includes(search) ||
            conv.user?.email?.toLowerCase().includes(search) ||
            conv.title?.toLowerCase().includes(search) ||
            conv.subject?.toLowerCase().includes(search)
        )
    })

    // Chip status
    const getStatusChip = (status: ConversationStatus) => {
        const config = {
            OPEN: { label: 'Aperta', color: 'success' as const, icon: <CheckCircle /> },
            CLOSED: { label: 'Chiusa', color: 'default' as const, icon: <Cancel /> }
        }
        const { label, color, icon } = config[status]
        return <Chip label={label} color={color} size="small" icon={icon} />
    }

    if (loading && conversations.length === 0) {
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
                        Gestione Conversazioni
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Visualizza e rispondi alle conversazioni degli utenti
                    </Typography>
                </Box>
            </Stack>

            {error && !dialogOpen && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Stats Cards */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid size={{ xs: 4 }}>
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
                <Grid size={{ xs: 4 }}>
                    <Card sx={{ bgcolor: 'success.light' }}>
                        <CardContent>
                            <Typography color="text.secondary" variant="body2">
                                Aperte
                            </Typography>
                            <Typography variant="h4" fontWeight={700}>
                                {stats.open}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 4 }}>
                    <Card sx={{ bgcolor: 'grey.300' }}>
                        <CardContent>
                            <Typography color="text.secondary" variant="body2">
                                Chiuse
                            </Typography>
                            <Typography variant="h4" fontWeight={700}>
                                {stats.closed}
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
                        onChange={(e) => setStatusFilter(e.target.value as ConversationStatus | '')}
                        size="small"
                        sx={{ minWidth: 200 }}
                    >
                        <MenuItem value="">Tutte</MenuItem>
                        <MenuItem value="OPEN">Aperte</MenuItem>
                        <MenuItem value="CLOSED">Chiuse</MenuItem>
                    </TextField>
                    <TextField
                        label="Cerca utente, titolo, oggetto..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        size="small"
                        sx={{ flexGrow: 1 }}
                    />
                    <Tooltip title="Ricarica">
                        <IconButton onClick={fetchConversations} color="primary">
                            <Refresh />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Paper>

            {/* Tabella Conversazioni */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>ID</strong></TableCell>
                            <TableCell><strong>Utente</strong></TableCell>
                            <TableCell><strong>Titolo/Oggetto</strong></TableCell>
                            <TableCell align="center"><strong>Messaggi</strong></TableCell>
                            <TableCell><strong>Ultimo Aggiornamento</strong></TableCell>
                            <TableCell align="center"><strong>Stato</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredConversations.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary">
                                        Nessuna conversazione trovata
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredConversations.map((conv) => (
                                <TableRow
                                    key={conv.id}
                                    hover
                                    sx={{ cursor: 'pointer' }}
                                    onClick={() => handleOpenConversation(conv)}
                                >
                                    <TableCell>{conv.id}</TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                                {conv.user?.name?.[0]?.toUpperCase()}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {conv.user?.name} {conv.user?.surname}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {conv.user?.email}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={600}>
                                            {conv.title || conv.subject || 'Conversazione'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Badge badgeContent={conv._count?.messages || 0} color="primary">
                                            <ChatBubble />
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(conv.updatedAt).toLocaleDateString('it-IT', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </TableCell>
                                    <TableCell align="center">{getStatusChip(conv.status)}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialog Conversazione */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography variant="h6" fontWeight={600}>
                                {selectedConversation?.title || selectedConversation?.subject || 'Conversazione'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                con {selectedConversation?.user?.name} {selectedConversation?.user?.surname}
                            </Typography>
                        </Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                            {selectedConversation && getStatusChip(selectedConversation.status)}
                            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
                                <MoreVert />
                            </IconButton>
                        </Stack>
                    </Stack>
                </DialogTitle>

                <DialogContent dividers sx={{ minHeight: 400, maxHeight: '60vh' }}>
                    {error && dialogOpen && (
                        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}

                    {loadingMessages ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <LinearProgress sx={{ width: '50%' }} />
                        </Box>
                    ) : (
                        <Stack spacing={2}>
                            {messages.length === 0 ? (
                                <Typography color="text.secondary" textAlign="center">
                                    Nessun messaggio
                                </Typography>
                            ) : (
                                messages.map((msg) => {
                                    // ✅ CORREZIONE 1: Usa msg.sender?.role invece di msg.role
                                    const isAdmin = msg.sender?.role === 'ADMIN'
                                    return (
                                        <Box
                                            // ✅ CORREZIONE 2: Aggiungi key={msg.id}
                                            key={msg.id}
                                            sx={{
                                                display: 'flex',
                                                flexDirection: isAdmin ? 'row-reverse' : 'row',
                                                gap: 1,
                                                alignItems: 'flex-start'
                                            }}
                                        >
                                            <Avatar
                                                sx={{
                                                    bgcolor: isAdmin ? 'secondary.main' : 'primary.main',
                                                    width: 36,
                                                    height: 36
                                                }}
                                            >
                                                {/* ✅ CORREZIONE 3: Usa msg.sender?.name invece di selectedConversation.user */}
                                                {msg.sender?.name?.[0]?.toUpperCase()}
                                            </Avatar>
                                            <Card
                                                sx={{
                                                    maxWidth: '70%',
                                                    bgcolor: isAdmin ? 'secondary.light' : 'primary.light'
                                                }}
                                            >
                                                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                                    <Typography variant="caption" fontWeight={600} display="block">
                                                        {/* ✅ CORREZIONE 4: Usa msg.sender per nome e cognome */}
                                                        {msg.sender?.name} {msg.sender?.surname}
                                                        {isAdmin && ' (Admin)'}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                                                        {msg.content}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                                                        {new Date(msg.createdAt).toLocaleString('it-IT')}
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        </Box>
                                    )
                                })
                            )}
                        </Stack>
                    )}
                </DialogContent>

                <DialogActions sx={{ p: 2, flexDirection: 'column', alignItems: 'stretch', gap: 1 }}>
                    {selectedConversation?.status === 'CLOSED' ? (
                        <Alert severity="info" sx={{ mb: 1 }}>
                            Questa conversazione è chiusa. Riaprila per inviare messaggi.
                        </Alert>
                    ) : (
                        <Stack direction="row" spacing={1}>
                            <TextField
                                fullWidth
                                multiline
                                rows={2}
                                placeholder="Scrivi una risposta..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                disabled={sending}
                                size="small"
                            />
                            <Button
                                variant="contained"
                                endIcon={<Send />}
                                onClick={handleSendReply}
                                disabled={!replyText.trim() || sending}
                                sx={{ alignSelf: 'flex-end' }}
                            >
                                Invia
                            </Button>
                        </Stack>
                    )}
                    <Button onClick={handleCloseDialog} fullWidth>
                        Chiudi
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Menu azioni conversazione */}
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                {selectedConversation?.status === 'OPEN' ? (
                    <MuiMenuItem onClick={() => handleChangeStatus('CLOSED')}>
                        <Lock sx={{ mr: 1 }} fontSize="small" />
                        Chiudi conversazione
                    </MuiMenuItem>
                ) : (
                    <MuiMenuItem onClick={() => handleChangeStatus('OPEN')}>
                        <LockOpen sx={{ mr: 1 }} fontSize="small" />
                        Riapri conversazione
                    </MuiMenuItem>
                )}
            </Menu>
        </Box>
    )
}