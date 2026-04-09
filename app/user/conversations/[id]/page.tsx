'use client'

import { use } from 'react'
import { useConversation } from '@/lib/hooks/useConversations'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useState, useEffect, useRef } from 'react'
import { Box, Typography, Paper, TextField, IconButton, Avatar, Chip, LinearProgress, Alert, Button } from '@mui/material'
import { Send, ArrowBack, Person, SupportAgent } from '@mui/icons-material'

interface ConversationPageProps {
    params: Promise<{ id: string }>
}

export default function ConversationDetailsPage({ params }: ConversationPageProps) {
    const { id } = use(params)
    const conversationId = parseInt(id)
    const router = useRouter()
    const { t } = useTranslation()
    const { conversation, sending, loading, error, sendMessage } = useConversation(conversationId)
    const [messageInput, setMessageInput] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // auto-scroll al nuovo messaggio
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [conversation?.messages])

    // Formatta timestamp
    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    // Gestione invio messaggio
    const handleSendMessage = async () => {
        if (!messageInput.trim() || sending) return

        try {
            await sendMessage(messageInput.trim())
            setMessageInput('')
        } catch (err) {
            console.error('Errore invio messaggio:', err)
        }
    }

    // Gestione Enter Key
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    if (loading) {
        return (
            <Box>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => router.push('/user/conversations')}
                    sx={{ mb: 3 }}
                >
                    {t('common.back')}
                </Button>
                <LinearProgress />
            </Box>
        )
    }

    if (error || !conversation) {
        return (
            <Box>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => router.push('/user/conversations')}
                    sx={{ mb: 3 }}
                >
                    {t('common.back')}
                </Button>
                <Alert severity="error">
                    {error || 'Conversazione non trovata'}
                </Alert>
            </Box>
        )
    }

    return (
        <Box sx={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box mb={3}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => router.push('/user/conversations')}
                    sx={{ mb: 2 }}
                >
                    {t('common.back')}
                </Button>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography variant="h4" fontWeight={700} gutterBottom>
                            {conversation.title || conversation.subject || `${t('conversations.defaultTitle')} #${conversation.id}`}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {conversation.messages.length} {t('conversations.labels.messages')}
                        </Typography>
                    </Box>
                    <Chip
                        label={conversation.status === 'OPEN'
                            ? t('conversations.status.open')
                            : t('conversations.status.closed')
                        }
                        color={conversation.status === 'OPEN' ? 'success' : 'default'}
                        variant="outlined"
                    />
                </Box>
            </Box>

            {/* Messaggi */}
            <Paper
                sx={{
                    flexGrow: 1,
                    p: 3,
                    overflowY: 'auto',
                    bgcolor: 'grey.50',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                }}
            >
                {conversation.messages.length === 0 ? (
                    <Box textAlign="center" py={6}>
                        <Typography variant="body2" color="text.secondary">
                            Nessun messaggio ancora
                        </Typography>
                    </Box>
                ) : (
                    conversation.messages.map((message) => {
                        const isUser = message.senderId === conversation.userId

                        return (
                            <Box
                                key={message.id}
                                display="flex"
                                justifyContent={isUser ? 'flex-end' : 'flex-start'}
                                gap={1}
                            >
                                {!isUser && (
                                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                                        <SupportAgent />
                                    </Avatar>
                                )}

                                <Box maxWidth="70%">
                                    <Paper
                                        sx={{
                                            p: 2,
                                            bgcolor: isUser ? 'primary.main' : 'white',
                                            color: isUser ? 'white' : 'text.primary',
                                        }}
                                    >
                                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                            {message.content}
                                        </Typography>
                                    </Paper>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{ display: 'block', mt: 0.5, px: 1 }}
                                    >
                                        {formatTime(message.createdAt)}
                                    </Typography>
                                </Box>

                                {isUser && (
                                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                                        <Person />
                                    </Avatar>
                                )}
                            </Box>
                        )
                    })
                )}
                <div ref={messagesEndRef} />
            </Paper>

            {/* Input messaggio */}
            <Box mt={2} display="flex" gap={1}>
                <TextField
                    fullWidth
                    placeholder={t('chat.placeholder')}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    disabled={sending || conversation.status === 'CLOSED'}
                    multiline
                    maxRows={4}
                />
                <IconButton
                    color="primary"
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() || sending || conversation.status === 'CLOSED'}
                    sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'primary.dark' },
                        '&:disabled': { bgcolor: 'grey.300' }
                    }}
                >
                    <Send />
                </IconButton>
            </Box>
        </Box>
    )
}