import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import it from './locales/it.json'
import en from './locales/en.json'

// Configurazione i18next
i18n
    .use(initReactI18next) // Passa i18n a react-i18next
    .init({
        resources: {
            it: { translation: it },
            en: { translation: en },
        },
        lng: 'it', // Lingua di default
        fallbackLng: 'it', // Fallback se traduzione mancante
        interpolation: {
            escapeValue: false, // React già gestisce XSS protection
        },
        // Debug mode (opzionale, utile per sviluppo)
        debug: false, // Cambia a true per vedere log dettagliati
    })

export default i18n