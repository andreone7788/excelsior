import { z } from 'zod';

// Schema per creazione prenotazione
export const createBookingSchema = z.object({
    roomId: z.coerce.number().int().positive("ID stanza non valido"),
    startDate: z.coerce.date().refine((d) => d > new Date(), "La data deve essere futura"),
    endDate: z.coerce.date(),
}).refine((data) => data.endDate > data.startDate, "La data di fine deve essere dopo l'inizio");

// Schema per aggiornamento prenotazione (solo per Admin)
export const updateBookingStatusSchema = z.object({
    bookingId: z.coerce.number().int().positive().optional(),
    status: z.enum(["PENDING", "CONFIRMED", "CANCELLED"]),
    reason: z.string().optional()
});

// Schema validazione modifica prenotazione
export const requestBookingModificationSchema = z.object({
    newStartDate: z.coerce.date().refine((d) => d > new Date(), "La data deve essere futura").optional(),
    newEndDate: z.coerce.date().optional(),
    newRoomId: z.coerce.number().int().positive("ID stanza non valido").optional(),
}).refine((data) => {
    // Se modifichi entrambe le date, controlla coerenza
    if (data.newStartDate && data.newEndDate) {
        return new Date(data.newEndDate) > new Date(data.newStartDate)
    }
    return true
},
    { message: 'La data di check-out deve essere successiva al check-in' }
)

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
export type RequestBookingModificationInput = z.infer<typeof requestBookingModificationSchema>;