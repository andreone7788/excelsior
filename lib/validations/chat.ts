import { z } from "zod";

// Schema per inviare un messaggio
export const sendMessageSchema = z.object({
  conversationId: z.coerce.number().int().positive().optional(),
  
  // Il contenuto del messaggio
  content: z
    .string()
    .min(1, "Il messaggio non può essere vuoto")
    .max(1000, "Il messaggio è troppo lungo (max 1000 caratteri)")
    .trim(),
});

// Schema per admin reply (risposta da parte di un admin a un messaggio)
export const adminReplySchema = z.object({
  content: z
    .string()
    .min(1, "Il messaggio non può essere vuoto")
    .max(2000, "Il messaggio è troppo lungo (max 2000 caratteri)")
    .trim(),
});

// Schema per cancellare una conversazione (gestione storico)
export const deleteConversationSchema = z.object({
  conversationId: z.coerce.number().int().positive("ID conversazione non valido"),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type DeleteConversationInput = z.infer<typeof deleteConversationSchema>;
export type AdminReplyInput = z.infer<typeof adminReplySchema>;