/**
 * Formatta data in italiano
 */
export function formatDate(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date

    return new Intl.DateTimeFormat('it-IT', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(d)
}

/**
 * Formatta data e ora
*/
export function formatDateTime(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date

    return new Intl.DateTimeFormat('it-IT', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(d)
}

/**
 * Formatta prezzo in euro
*/
export function formatPrice(price: number): string {
    return new Intl.NumberFormat('it-IT', {
        style: 'currency',
        currency: 'EUR',
    }).format(price)
}

/**
 * Calcola numero di notti tra due date
*/
export function calculateNights(checkIn: string | Date, checkOut: string | Date): number {
    const checkInDate = typeof checkIn === 'string' ? new Date(checkIn) : checkIn
    const checkOutDate = typeof checkOut === 'string' ? new Date(checkOut) : checkOut

    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays
}

/**
 * Calcola prezzo totale prenotazione
*/
export function calculateTotalPrice(
    pricePerNight: number,
    checkIn: string | Date,
    checkOut: string | Date
): number {
    const nights = calculateNights(checkIn, checkOut)
    return pricePerNight * nights
}

/**
 * Valida email
*/
export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

/**
 * Tronca testo a lunghezza massima
*/
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
        return text
    }
    return text.substring(0, maxLength) + '...'
}

/**
 * Classe CSS condizionale (simile a clsx)
*/
export function classNames(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(' ')
}

/**
 * Ritarda esecuzione (per testing/loading)
*/
export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Genera ID random
*/
export function generateRandomId(): string {
    return Math.random().toString(36).substr(2, 9)
}

/**
 * Capitalizza prima lettera
*/
export function capitalizeFirstLetter(text: string): string {
    if (!text) return text
    return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * Check se data è passata
*/
export function isPastDate(date: string | Date): boolean {
    const d = typeof date === 'string' ? new Date(date) : date
    const now = new Date()
    return d < now
}

/**
 * Traduzione status booking
 */
export function translateBookingStatus(
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
): string {
    const translations = {
        PENDING: 'In Attesa',
        CONFIRMED: 'Confermata',
        CANCELLED: 'Cancellata',
        COMPLETED: 'Completata',
    }
    return translations[status] || status
}

/**
 * Colore status booking (per MUI)
 */
export function getBookingStatusColor(
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
): 'default' | 'primary' | 'secondary' | 'error' | 'success' | 'warning' {
    const colors = {
        PENDING: 'warning' as const,
        CONFIRMED: 'success' as const,
        CANCELLED: 'error' as const,
        COMPLETED: 'default' as const,
    }
    return colors[status] || 'default'
}
