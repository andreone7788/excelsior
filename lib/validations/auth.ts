import { z } from "zod"

// Schema di validazione per la registrazione degli utenti
export const registerSchema = z.object({
    name: z.string().min(2, "Il nome deve contenere almeno 2 caratteri"),
    surname: z.string().min(2, "Il cognome deve contenere almeno 2 caratteri"),
    // phone: deve essere un numero e non deve superare i 15 caratteri (es. +123456789012345)
    phone: z.string().refine(val => val.toString().length <= 15, {
        message: "Il numero di telefono deve contenere al massimo 15 cifre"
    }),
    email: z.string().email("Indirizzo email non valido"),
    password: z.string().min(8, "La password deve contenere almeno 8 caratteri")
        .regex(/[A-Z]/, "Almeno una maiuscola")
        .regex(/[a-z]/, "Almeno una minuscola")
        .regex(/[0-9]/, "Almeno un numero")
        .regex(/[^A-Za-z0-9]/, "Almeno un carattere speciale"),
});

// Schema di validazione per il login degli utenti
export const loginSchema = z.object({
    email: z.string().email("Indirizzo email non valido"),
    password: z.string().min(1, "La password è obbligatoria"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;