import { z } from "zod"

// Schema per la creazione di una nuova conversazione
export const createConversationSchema = z.object({
    subject: z.string().min(1, "Il soggetto è obbligatorio"),
    message: z.string().min(1, "Il messaggio iniziale è obbligatorio"),
});

// Schema per la modifica dello stato di una conversazione (es. chiudere una conversazione)
export const updateConversationStatusSchema = z.object({
    status: z.enum(["OPEN", "CLOSED"]),
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type UpdateConversationStatusInput = z.infer<typeof updateConversationStatusSchema>;