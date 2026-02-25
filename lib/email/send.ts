import { resend, EMAIL_FROM, EMAIL_ADMIN } from './client'
import {
    BookingRequestUserTemplate,
    BookingRequestAdminTemplate,
    BookingConfirmedTemplate,
    BookingRejectedTemplate,
} from './templates'

/**
 * ========================================
 * INVIA EMAIL - Richiesta prenotazione all'utente
 * ========================================
 */
export async function sendBookingRequestToUser({
    to,
    userName,
    roomName,
    checkIn,
    checkOut,
    bookingId,
}: {
    to: string
    userName: string
    roomName: string
    checkIn: string
    checkOut: string
    bookingId: number
}) {
    try {
        const { data, error } = await resend.emails.send({
            from: EMAIL_FROM,
            to,
            subject: `Richiesta Prenotazione Ricevuta - Hotel Excelsior`,
            react: BookingRequestUserTemplate({
                userName,
                roomName,
                checkIn,
                checkOut,
                bookingId,
            }),
        })

        if (error) {
            console.error('❌ Errore invio email utente:', error)
            return { success: false, error }
        }

        console.log('✅ Email inviata all\'utente:', data?.id)
        return { success: true, data }
    } catch (error) {
        console.error('❌ Eccezione invio email utente:', error)
        return { success: false, error }
    }
}

/**
 * ========================================
 * INVIA EMAIL - Notifica prenotazione all'admin
 * ========================================
 */
export async function sendBookingRequestToAdmin({
    userName,
    userEmail,
    roomName,
    checkIn,
    checkOut,
    bookingId,
}: {
    userName: string
    userEmail: string
    roomName: string
    checkIn: string
    checkOut: string
    bookingId: number
}) {
    try {
        const { data, error } = await resend.emails.send({
            from: EMAIL_FROM,
            to: EMAIL_ADMIN,
            subject: `🔔 Nuova Prenotazione da Approvare - #${bookingId}`,
            react: BookingRequestAdminTemplate({
                userName,
                userEmail,
                roomName,
                checkIn,
                checkOut,
                bookingId,
            }),
        })

        if (error) {
            console.error('❌ Errore invio email admin:', error)
            return { success: false, error }
        }

        console.log('✅ Email inviata all\'admin:', data?.id)
        return { success: true, data }
    } catch (error) {
        console.error('❌ Eccezione invio email admin:', error)
        return { success: false, error }
    }
}

/**
 * ========================================
 * INVIA EMAIL - Prenotazione confermata
 * ========================================
 */
export async function sendBookingConfirmed({
    to,
    userName,
    roomName,
    checkIn,
    checkOut,
    bookingId,
    totalPrice,
}: {
    to: string
    userName: string
    roomName: string
    checkIn: string
    checkOut: string
    bookingId: number
    totalPrice: number
}) {
    try {
        const { data, error } = await resend.emails.send({
            from: EMAIL_FROM,
            to,
            subject: `✅ Prenotazione Confermata - Hotel Excelsior #${bookingId}`,
            react: BookingConfirmedTemplate({
                userName,
                roomName,
                checkIn,
                checkOut,
                bookingId,
                totalPrice,
            }),
        })

        if (error) {
            console.error('❌ Errore invio conferma:', error)
            return { success: false, error }
        }

        console.log('✅ Email conferma inviata:', data?.id)
        return { success: true, data }
    } catch (error) {
        console.error('❌ Eccezione invio conferma:', error)
        return { success: false, error }
    }
}

/**
 * ========================================
 * INVIA EMAIL - Prenotazione rifiutata
 * ========================================
 */
export async function sendBookingRejected({
    to,
    userName,
    roomName,
    checkIn,
    checkOut,
    bookingId,
    reason,
}: {
    to: string
    userName: string
    roomName: string
    checkIn: string
    checkOut: string
    bookingId: number
    reason?: string
}) {
    try {
        const { data, error } = await resend.emails.send({
            from: EMAIL_FROM,
            to,
            subject: `Prenotazione Non Approvata - Hotel Excelsior #${bookingId}`,
            react: BookingRejectedTemplate({
                userName,
                roomName,
                checkIn,
                checkOut,
                bookingId,
                reason,
            }),
        })

        if (error) {
            console.error('❌ Errore invio rifiuto:', error)
            return { success: false, error }
        }

        console.log('✅ Email rifiuto inviata:', data?.id)
        return { success: true, data }
    } catch (error) {
        console.error('❌ Eccezione invio rifiuto:', error)
        return { success: false, error }
    }
}