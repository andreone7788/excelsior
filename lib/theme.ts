'use client'

import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: 'rgba(0, 123, 255, 1)', // Colore principale in formato RGBA
            light: 'rgba(115, 179, 248, 0.7)', // Colore chiaro in formato RGBA
            dark: 'rgba(0, 123, 255, 0.7)', // Colore scuro in formato RGBA
            contrastText: '#fff', // Colore del testo in contrasto
        },
        secondary: {
            main: 'rgba(255, 193, 7, 1)', // Colore secondario in formato RGBA
            light: 'rgba(255, 224, 130, 0.7)', // Colore secondario chiaro in formato RGBA
            dark: 'rgba(255, 193, 7, 0.7)', // Colore secondario scuro in formato RGBA
            contrastText: '#000', // Colore del testo in contrasto
        },
        background: {
            default: 'rgba(255, 255, 255, 1)', // Colore di sfondo in formato RGBA
            paper: 'rgba(255, 255, 255, 0.9)', // Colore di sfondo per i componenti in formato RGBA
        }
    },
    typography: {
        fontFamily: 'Roboto, Arial, sans-serif', // Font principale
        button: {
            textTransform: 'none', // Disabilita la trasformazione del testo per i pulsanti
            fontWeight: 600, // Imposta il peso del font per i pulsanti
        },
    },
    shape: {
        borderRadius: 8, // Raggio di curvatura per i bordi dei componenti
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8, // Raggio di curvatura per i pulsanti
                    padding: '10px 24px', // Padding per i pulsanti
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12, // Raggio di curvatura per le card
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Ombra per le card
                },
            },
        },
    },
})