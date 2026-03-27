'use client'

import { createTheme } from '@mui/material/styles'

/**
 * ═══════════════════════════════════════════════════════════
 * 🎨 EXCELSIOR HOTEL - THEME CONFIGURATION
 * ═══════════════════════════════════════════════════════════
 */

export const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1976d2',      // Blu elegante hotel
            light: '#42a5f5',
            dark: '#1565c0',
            contrastText: '#fff',
        },
        secondary: {
            main: '#dc004e',      // Accent per CTA
            light: '#ff5983',
            dark: '#9a0036',
            contrastText: '#fff',
        },
        success: {
            main: '#2e7d32',      // Conferme booking
        },
        warning: {
            main: '#ed6c02',      // Pending status
        },
        error: {
            main: '#d32f2f',      // Cancellazioni
        },
        background: {
            default: '#f5f5f5',
            paper: '#ffffff',
        },
        text: {
            primary: 'rgba(0, 0, 0, 0.87)',
            secondary: 'rgba(0, 0, 0, 0.6)',
        },
    },
    typography: {
        fontFamily: [
            'Inter',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
        ].join(','),
        h1: {
            fontWeight: 700,
            fontSize: '3rem',
        },
        h2: {
            fontWeight: 700,
            fontSize: '2.5rem',
        },
        h3: {
            fontWeight: 600,
            fontSize: '2rem',
        },
        h4: {
            fontWeight: 600,
            fontSize: '1.75rem',
        },
        h5: {
            fontWeight: 600,
            fontSize: '1.5rem',
        },
        h6: {
            fontWeight: 600,
            fontSize: '1.25rem',
        },
        button: {
            textTransform: 'none',  // Niente uppercase forzato
            fontWeight: 600,
        },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    padding: '8px 24px',
                },
                sizeLarge: {
                    padding: '12px 32px',
                    fontSize: '1rem',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
                elevation1: {
                    boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                },
                elevation2: {
                    boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                },
                elevation3: {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                variant: 'outlined',
            },
        },
    },
})

// Dark theme (opzionale - per futuro toggle)
export const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#90caf9',
        },
        secondary: {
            main: '#f48fb1',
        },
        background: {
            default: '#0a0a0a',
            paper: '#1e1e1e',
        },
    },
    typography: theme.typography,
    shape: theme.shape,
    components: theme.components,
})