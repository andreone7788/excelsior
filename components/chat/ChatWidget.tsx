'use client'

import { useState, useRef, useEffect } from 'react'
import { Fab, Drawer, Box, Typography, IconButton, TextField, Paper, CircularProgress, Alert, Chip } from '@mui/material'
import { Chat, Close, Send, SmartToy, Person } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { usePublicChat } from '@/lib/hooks/usePublicChat'

/**
 * Widget chat AI pubblico - Floating Action Button + Drawer
 * 
 * Permette a utenti (anche non autenticati) di chattare con l'AI.
 * I messaggi NON vengono salvati nel database.
 */
export default function ChatWidget() {
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)
    const [inputValue, setInputValue] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const { messages, isLoading, error, sendMessage, clearChat } = usePublicChat()

    // Auto-scroll quando arrivano nuovi messaggi
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleToggle = () => {
        setOpen(prev => !prev)
    }

    const handleClose = () => {
        setOpen(false)
    }

    const handleSend = async () => {
        if (!inputValue.trim() || isLoading) return

        await sendMessage(inputValue)
        setInputValue('') // Pulisci input dopo invio
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <>
            {/* Floating Action Button - Visibile sempre */}
            <Fab
                color="primary"
                aria-label="chat"
                onClick={handleToggle}
                sx={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    zIndex: 1000,
                }}
            >
                <Chat />
            </Fab>

            {/* Drawer della chat */}
            <Drawer
                anchor="right"
                open={open}
                onClose={handleClose}
                sx={{
                    '& .MuiDrawer-paper': {
                        width: { xs: '100%', sm: 400 },
                        maxWidth: '100%'
                    }
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {/* Header */}
                    <Box
                        sx={{
                            p: 2,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <SmartToy />
                            <Box>
                                <Typography variant="h6" fontWeight={600}>
                                    {t('chat.title')}
                                </Typography>
                                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                    {t('chat.subtitle')}
                                </Typography>
                            </Box>
                        </Box>
                        <IconButton onClick={handleClose} sx={{ color: 'white' }}>
                            <Close />
                        </IconButton>
                    </Box>

                    {/* Area messaggi */}
                    <Box
                        sx={{
                            flex: 1,
                            overflowY: 'auto',
                            p: 2,
                            bgcolor: 'background.default',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2
                        }}
                    >
                        {/* Messaggio di benvenuto se non ci sono messaggi */}
                        {messages.length === 0 && (
                            <Paper elevation={1} sx={{ p: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                                <Typography variant="body2" gutterBottom>
                                    {t('chat.welcome')}
                                </Typography>
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="caption" fontWeight={600}>
                                        {t('chat.suggestions.title')}
                                    </Typography>
                                    <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                        <Chip
                                            label={t('chat.suggestions.roomAvailability')}
                                            size="small"
                                            onClick={() => setInputValue(t('chat.suggestions.roomAvailability'))}
                                            sx={{ cursor: 'pointer' }}
                                        />
                                        <Chip
                                            label={t('chat.suggestions.bestRoom')}
                                            size="small"
                                            onClick={() => setInputValue(t('chat.suggestions.bestRoom'))}
                                            sx={{ cursor: 'pointer' }}
                                        />
                                        <Chip
                                            label={t('chat.suggestions.localAttractions')}
                                            size="small"
                                            onClick={() => setInputValue(t('chat.suggestions.localAttractions'))}
                                            sx={{ cursor: 'pointer' }}
                                        />
                                    </Box>
                                </Box>
                            </Paper>
                        )}

                        {/* Messaggi effettivi */}
                        {messages.map((msg, index) => (
                            <Box
                                key={index}
                                sx={{
                                    display: 'flex',
                                    gap: 1,
                                    alignItems: 'flex-start',
                                    flexDirection: msg.role === 'USER' ? 'row-reverse' : 'row'
                                }}
                            >
                                {/* Avatar */}
                                <Box
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: '50%',
                                        bgcolor: msg.role === 'USER' ? 'primary.main' : 'secondary.main',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        flexShrink: 0
                                    }}
                                >
                                    {msg.role === 'USER' ? <Person fontSize="small" /> : <SmartToy fontSize="small" />}
                                </Box>

                                {/* Messaggio */}
                                <Paper
                                    elevation={1}
                                    sx={{
                                        p: 1.5,
                                        maxWidth: '75%',
                                        bgcolor: msg.role === 'USER' ? 'primary.main' : 'background.paper',
                                        color: msg.role === 'USER' ? 'white' : 'text.primary'
                                    }}
                                >
                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                        {msg.content}
                                    </Typography>
                                </Paper>
                            </Box>
                        ))}

                        {/* Indicatore loading */}
                        {isLoading && (
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <Box
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: '50%',
                                        bgcolor: 'secondary.main',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white'
                                    }}
                                >
                                    <SmartToy fontSize="small" />
                                </Box>
                                <Paper elevation={1} sx={{ p: 1.5 }}>
                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                        <CircularProgress size={16} />
                                        <Typography variant="body2" color="text.secondary">
                                            {t('chat.typing')}
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Box>
                        )}

                        {/* Errore */}
                        {error && (
                            <Alert severity="error" onClose={clearChat}>
                                {error}
                            </Alert>
                        )}

                        {/* Scroll anchor */}
                        <div ref={messagesEndRef} />
                    </Box>

                    {/* Input area */}
                    <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder={t('chat.placeholder')}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                disabled={isLoading}
                                multiline
                                maxRows={3}
                            />
                            <IconButton
                                color="primary"
                                onClick={handleSend}
                                disabled={!inputValue.trim() || isLoading}
                                sx={{
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    '&:hover': {
                                        bgcolor: 'primary.dark'
                                    },
                                    '&.Mui-disabled': {
                                        bgcolor: 'action.disabledBackground'
                                    }
                                }}
                            >
                                <Send />
                            </IconButton>
                        </Box>
                    </Box>
                </Box>
            </Drawer>
        </>
    )
}