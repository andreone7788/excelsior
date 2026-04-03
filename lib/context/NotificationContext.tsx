'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { Snackbar, Alert, AlertColor } from "@mui/material"

interface NotificationContextType {
    showNotification: (message: string, severity?: AlertColor, duration?: number) => void
    showSuccess: (message: string) => void
    showError: (message: string) => void
    showWarning: (message: string) => void
    showInfo: (message: string) => void
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notification, setNotification] = useState<{
        message: string
        severity: AlertColor
        duration: number
        open: boolean
    } | null>(null)

    const showNotification = useCallback((
        message: string,
        severity: AlertColor = "info",
        duration: number = 3000
    ) => {
        setNotification({ message, severity, duration, open: true })
    }, [])

    const showSuccess = useCallback((message: string) => {
        showNotification(message, 'success')
    }, [showNotification])

    const showError = useCallback((message: string) => {
        showNotification(message, 'error', 6000)
    }, [showNotification])

    const showWarning = useCallback((message: string) => {
        showNotification(message, 'warning')
    }, [showNotification])

    const showInfo = useCallback((message: string) => {
        showNotification(message, 'info')
    }, [showNotification])

    const handleClose = () => {
        setNotification(null)
    }

    return (
        <NotificationContext.Provider
            value={{
                showNotification,
                showSuccess,
                showError,
                showWarning,
                showInfo
            }}
        >
            {children}
            {notification && (
                <Snackbar
                    open={notification.open}
                    autoHideDuration={notification.duration}
                    onClose={handleClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert
                        onClose={handleClose}
                        severity={notification.severity}
                        variant="filled"
                        sx={{ width: '100%' }}
                    >
                        {notification.message}
                    </Alert>
                </Snackbar>
            )}
        </NotificationContext.Provider>
    )
}

export function useNotification() {
    const context = useContext(NotificationContext)
    if (!context) {
        throw new Error("useNotification deve essere usato all'interno di un NotificationProvider")
    }
    return context
}