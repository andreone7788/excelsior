'use client'

import { ReactNode, useEffect } from 'react'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { theme } from '@/lib/theme'
import { AuthProvider } from '@/lib/context/AuthContext'
import { NotificationProvider } from '@/lib/context/NotificationContext'
import { I18nextProvider } from 'react-i18next'
import ChatWidget from '@/components/chat/ChatWidget'
import i18n from '@/i18n/config'
import Navbar from '@/components/layout/Navbar'
import './globals.css'
import { Box } from '@mui/material'

export default function RootLayout({ children }: { children: ReactNode }) {
    useEffect(() => {
        // Carica lingua salvata (se esiste)
        const savedLang = localStorage.getItem('language')
        if (savedLang && (savedLang === 'it' || savedLang === 'en')) {
            i18n.changeLanguage(savedLang)
        }
    }, [])

    return (
        <html lang={i18n.language || 'it'}>
            <body>
                <I18nextProvider i18n={i18n}>
                    <AppRouterCacheProvider>
                        <ThemeProvider theme={theme}>
                            <CssBaseline />
                            <AuthProvider>
                                <NotificationProvider>
                                    <Navbar />
                                    <Box component="main" sx={{ minHeight: '100vh', pt: 8 }}>
                                        {children}
                                    </Box>
                                    <ChatWidget />
                                </NotificationProvider>
                            </AuthProvider>
                        </ThemeProvider>
                    </AppRouterCacheProvider>
                </I18nextProvider>
            </body>
        </html>
    )
}