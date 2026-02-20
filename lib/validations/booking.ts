import { z } from 'zod';

// Schema per creazione prenotazione
export const createBookingSchema = z.object({
    userId: z.coerce.number().int().positive("ID utente non valido"),
    roomId: z.coerce.number().int().positive("ID stanza non valido"),
    startDate: z.coerce.date().refine((d) => d > new Date(), "La data deve essere futura"),
    endDate: z.coerce.date(),
}).refine((data) => data.endDate > data.startDate, "La data di fine deve essere dopo l'inizio");

// Schema per aggiornamento prenotazione (solo per Admin)
export const updateBookingStatusSchema = z.object({
    bookingId: z.coerce.number().int().positive(),
    status: z.enum(["PENDING", "CONFIRMED", "CANCELLED"]),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;