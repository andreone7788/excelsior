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

// Schema per chat AI (Gemini)
export const aiChatSchema = z.object({
  message: z.string()
    .min(1, "Il messaggio non può essere vuoto")
    .max(500, "Il messaggio è troppo lungo (max 500 caratteri)")
    .trim(),
  conversationHistory: z.array(
    z.object({
      role: z.enum(['USER', 'ADMIN']),
      content: z.string().min(1).max(2000).trim(),
    })
  ).optional(),
});

// Schema per suggerimento camere da parte di AI (Gemini)
export const aiSuggestSchema = z.object({
  preferences: z.string()
    .min(1, "Le preferenze non possono essere vuote")
    .max(1000, "Le preferenze sono troppo lunghe (max 1000 caratteri)")
    .trim(),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
});

// Schema di risposta al suggerimento camere da parte di AI (Gemini)
export const aiSuggestReplySchema = z.object({
  conversationId: z.number().int().positive(),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type AdminReplyInput = z.infer<typeof adminReplySchema>;
export type AIChatInput = z.infer<typeof aiChatSchema>;
export type AISuggestInput = z.infer<typeof aiSuggestSchema>;
export type AISuggestReplyInput = z.infer<typeof aiSuggestReplySchema>;