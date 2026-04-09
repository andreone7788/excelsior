import { resend, EMAIL_FROM, EMAIL_ADMIN } from './client'
import { render } from '@react-email/render'
import {
    BookingRequestUserTemplate,
    BookingRequestAdminTemplate,
    BookingConfirmedTemplate,
    BookingRejectedTemplate,
    BookingModificationRequestTemplate,
    BookingModificationRequestAdminTemplate,
    BookingModificationApprovedTemplate,
    BookingModificationRejectedTemplate,
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
            html: await render(BookingRequestUserTemplate({
                userName,
                roomName,
                checkIn,
                checkOut,
                bookingId,
            })),
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
            html: await render(BookingRequestAdminTemplate({
                userName,
                userEmail,
                roomName,
                checkIn,
                checkOut,
                bookingId,
            })),
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
            html: await render(BookingConfirmedTemplate({
                userName,
                roomName,
                checkIn,
                checkOut,
                bookingId,
                totalPrice,
            })),
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
            html: await render(BookingRejectedTemplate({
                userName,
                roomName,
                checkIn,
                checkOut,
                bookingId,
                reason,
            })),
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

/**
 * ========================================
 * INVIA EMAIL - Richiesta modifica prenotazione
 * ========================================
 */
export async function sendModificationRequestToUser({
    to,
    userName,
    roomName,
    originalDates,
    newDates,
    bookingId,
    priceDifference,
    reason,
}: {
    to: string
    userName: string
    roomName: string
    originalDates: string
    newDates: string
    bookingId: number
    priceDifference: number
    reason?: string
}) {
    try {
        const { data, error } = await resend.emails.send({
            from: EMAIL_FROM,
            to,
            subject: `Richiesta Modifica Prenotazione #${bookingId}`,
            html: await render(BookingModificationRequestTemplate({
                userName,
                roomName,
                originalDates,
                newDates,
                bookingId,
                priceDifference,
                reason,
            })),
        })

        if (error) {
            console.error('❌ Errore invio richiesta modifica utente:', error)
            return { success: false, error }
        }

        console.log('✅ Email richiesta modifica inviata a utente:', data?.id)
        return { success: true, data }
    } catch (error) {
        console.error('❌ Eccezione invio richiesta modifica utente:', error)
        return { success: false, error }
    }
}

/**
 * ========================================
 * INVIA EMAIL - Richiesta modifica prenotazione all'admin
 * ========================================
 */
export async function sendModificationRequestToAdmin({
    userName,
    userEmail,
    roomName,
    checkIn,
    checkOut,
    bookingId
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
            subject: `🔔 Richiesta Modifica Prenotazione #${bookingId}`,
            html: await render(BookingModificationRequestAdminTemplate({  // ✅ MODIFICATO
                userName,
                userEmail,
                roomName,
                checkIn,
                checkOut,
                bookingId,
            })),
        })

        if (error) {
            console.error('❌ Errore invio richiesta modifica admin:', error)
            return { success: false, error }
        }

        console.log('✅ Email richiesta modifica inviata a admin:', data?.id)
        return { success: true, data }
    } catch (error) {
        console.error('❌ Eccezione invio richiesta modifica admin:', error)
        return { success: false, error }
    }
}

/**
 * ========================================
 * INVIA EMAIL - Richiesta modifica appprovata
 * ========================================
 */
export async function sendModificationApproved({
    to,
    userName,
    roomName,
    newDates,
    bookingId,
    priceDifference,
}: {
    to: string
    userName: string
    roomName: string
    newDates: string
    bookingId: number
    priceDifference: number
}) {
    try {
        const { data, error } = await resend.emails.send({
            from: EMAIL_FROM,
            to,
            subject: `Modifica Prenotazione Approvata - Hotel Excelsior #${bookingId}`,
            html: await render(BookingModificationApprovedTemplate({
                userName,
                roomName,
                newDates,
                bookingId,
                priceDifference,
            })),
        })

        if (error) {
            console.error('❌ Errore invio modifica approvata:', error)
            return { success: false, error }
        }

        console.log('✅ Email modifica approvata inviata:', data?.id)
        return { success: true, data }
    } catch (error) {
        console.error('❌ Eccezione invio modifica approvata:', error)
        return { success: false, error }
    }
}

/**
 * ========================================
 * INVIA EMAIL - Richiesta modifica rifiutata
 * ========================================
 */
export async function sendModificationRejected({
    to,
    userName,
    roomName,
    bookingId,
    reason,
}: {
    to: string
    userName: string
    roomName: string
    bookingId: number
    reason: string
}) {
    try {
        const { data, error } = await resend.emails.send({
            from: EMAIL_FROM,
            to,
            subject: `Modifica Prenotazione Rifiutata - Hotel Excelsior #${bookingId}`,
            html: await render(BookingModificationRejectedTemplate({  // ✅ MODIFICATO
                userName,
                roomName,
                bookingId,
                reason,
            })),
        })

        if (error) {
            console.error('❌ Errore invio modifica rifiutata:', error)
            return { success: false, error }
        }

        console.log('✅ Email modifica rifiutata inviata:', data?.id)
        return { success: true, data }
    } catch (error) {
        console.error('❌ Eccezione invio modifica rifiutata:', error)
        return { success: false, error }
    }
}