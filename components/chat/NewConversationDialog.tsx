'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Alert, Box, CircularProgress } from '@mui/material'
import { Send, Close } from '@mui/icons-material'
import apiClient, { ApiError } from '@/lib/api-client'
import type { Conversation } from '@/types'

interface NewConversationDialogProps {
    open: boolean
    onClose: () => void
}

export default function NewConversationDialog({ open, onClose }: NewConversationDialogProps) {
    const { t } = useTranslation()
    const router = useRouter()
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!subject.trim() || !message.trim()) {
            setError('Campo obbligatorio')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const conversation = await apiClient.post<Conversation>(
                '/user/conversations',
                JSON.stringify({ subject: subject.trim(), message: message.trim() })
            )

            // reset form
            setSubject('')
            setMessage('')
            onClose()

            // Naviga alla nuova conversazione
            router.push(`/user/conversations/${conversation.id}`)
        } catch (err) {
            const errorMessage = err instanceof ApiError ? err.message : 'Errore sconosciuto'
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        if (!loading) {
            setSubject('')
            setMessage('')
            setError(null)
            onClose()
        }
    }

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                component: 'form',
                onSubmit: handleSubmit
            }}
        >
            <DialogTitle>
                {t('conversations.new.title')}
            </DialogTitle>

            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <TextField
                    autoFocus
                    margin="dense"
                    label={t('conversations.new.subject')}
                    placeholder={t('conversations.new.subjectPlaceholder')}
                    fullWidth
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    disabled={loading}
                    sx={{ mb: 2 }}
                />

                <TextField
                    margin="dense"
                    label={t('conversations.new.message')}
                    placeholder={t('conversations.new.messagePlaceholder')}
                    fullWidth
                    required
                    multiline
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={loading}
                />

                <Box sx={{ mt: 2, p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'info.main' }}>
                        💡 <strong>{t('conversations.new.tip')}</strong>
                    </Box>
                    <Box sx={{ mt: 1, fontSize: '0.875rem', color: 'text.secondary' }}>
                        {t('conversations.new.ask')}
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button
                    onClick={handleClose}
                    disabled={loading}
                    startIcon={<Close />}
                >
                    {t('common.cancel')}
                </Button>
                <Button
                    type="submit"
                    variant="contained"
                    disabled={loading || !subject.trim() || !message.trim()}
                    startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                >
                    {loading ? t('common.sending') : t('common.send')}
                </Button>
            </DialogActions>
        </Dialog>
    )
}