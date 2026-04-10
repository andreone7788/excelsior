'use client'

import { useState } from 'react'
import { useConversations } from '@/lib/hooks/useConversations'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { Box, Typography, Button, Card, CardContent, CardActionArea, Chip, LinearProgress, Avatar, Alert } from '@mui/material'
import Grid from '@mui/material/Grid'
import NewConversationDialog from '@/components/chat/NewConversationDialog'
import { Add, ChatBubble, Schedule } from '@mui/icons-material'
import type { Conversation } from '@/types'

export default function ConversationsPage() {
    const router = useRouter()
    const { t } = useTranslation()
    const { conversations, loading, error } = useConversations()
    const [newConversationOpen, setNewConversationOpen] = useState(false)

    // Formatta data relativa (es. "5 minuti fa", "2 ore fa", "3 giorni fa")
    const getRelativeTime = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMins / 60) // 60 minuti * 60 secondi * 1000 ms
        const diffDays = Math.floor(diffMins / 1440) // 60 minuti * 24 ore * 60 secondi * 1000 ms

        if (diffMins < 60) return `${diffMins} min fa`
        if (diffHours < 24) return `${diffHours} ore fa`
        if (diffDays < 7) return `${diffDays} giorni fa`
        return date.toLocaleDateString('it-IT')
    }

    // Gestione click su conversazione
    const handleConversationClick = (conversation: Conversation) => {
        router.push(`/user/conversations/${conversation.id}`)
    }

    if (loading) {
        return (
            <Box>
                <Typography variant="h4" fontWeight={700} mb={3}>
                    {t('conversations.title')}
                </Typography>
                <LinearProgress />
            </Box>
        )
    }

    if (error) {
        return (
            <Box>
                <Typography variant="h4" fontWeight={700} mb={3}>
                    {t('conversations.title')}
                </Typography>
                <Alert severity="error">{error}</Alert>
            </Box>
        )
    }

    return (
        <Box>
            {/* Header */}
            <Box mb={4} display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                        {t('conversations.title')}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {t('conversations.subtitle')}
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setNewConversationOpen(true)}
                >
                    {t('conversations.new.button')}
                </Button>
            </Box>

            {/* Lista conversazioni */}
            {conversations.length === 0 ? (
                <Card sx={{ textAlign: 'center', py: 6 }}>
                    <CardContent>
                        <ChatBubble sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            {t('conversations.empty.title')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {t('conversations.empty.message')}
                        </Typography>
                    </CardContent>
                </Card>
            ) : (
                <Grid container spacing={3}>
                    {conversations.map((conversation) => (
                        <Grid size={{ xs: 12, md: 6 }} key={conversation.id}>
                            <Card
                                sx={{
                                    height: '100%',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 6
                                    }
                                }}
                            >
                                <CardActionArea
                                    onClick={() => handleConversationClick(conversation)}
                                    sx={{ height: '100%' }}
                                >
                                    <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 3 }}>
                                        {/* Header conversazione */}
                                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                            <Box display="flex" gap={2} alignItems="center" flex={1}>
                                                <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                    <ChatBubble />
                                                </Avatar>
                                                <Box flex={1}>
                                                    <Typography variant="h6" fontWeight={600} noWrap>
                                                        {conversation.title || conversation.subject || `${t('conversations.defaultTitle')} #${conversation.id}`}
                                                    </Typography>
                                                    <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                                                        <Schedule sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                        <Typography variant="caption" color="text.secondary">
                                                            {getRelativeTime(conversation.updatedAt)}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Box>

                                            {/* Badge messaggi */}
                                            {conversation._count && conversation._count.messages > 0 && (
                                                <Chip
                                                    label={`${conversation._count.messages} ${t('conversations.labels.messages')}`}
                                                    size="small"
                                                    color="primary"
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            )}
                                        </Box>

                                        {/* Status */}
                                        <Box>
                                            <Chip
                                                label={conversation.status === 'OPEN' ? t('conversations.status.open') : t('conversations.status.closed')}
                                                size="small"
                                                color={conversation.status === 'OPEN' ? 'success' : 'default'}
                                                variant="outlined"
                                            />
                                        </Box>

                                        {/* Subject preview */}
                                        {conversation.subject && (
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                }}
                                            >
                                                {conversation.subject}
                                            </Typography>
                                        )}
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Dialog Nuova Conversazione */}
            <NewConversationDialog
                open={newConversationOpen}
                onClose={() => setNewConversationOpen(false)}
            />
        </Box>
    )
}