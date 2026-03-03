import { z } from 'zod';

// Schema per creazione utente (Admin)
export const createUserSchema = z.object({
    name: z.string().min(2, "Il nome deve contenere almeno 2 caratteri"),
    surname: z.string().min(2, "Il cognome deve contenere almeno 2 caratteri"),
    email: z.string().email("Indirizzo email non valido"),
    password: z.string().min(8, "La password deve contenere almeno 8 caratteri")
        .regex(/[A-Z]/, "Almeno una maiuscola")
        .regex(/[a-z]/, "Almeno una minuscola")
        .regex(/[0-9]/, "Almeno un numero")
        .regex(/[^A-Za-z0-9]/, "Almeno un carattere speciale"),
    role: z.enum(["USER", "ADMIN"]),
});

// Schema per aggiornamento utente (Admin)
export const updateUserSchema = z.object({
    userId: z.coerce.number().int().positive("ID utente non valido"),
    name: z.string().min(2, "Il nome deve contenere almeno 2 caratteri").optional(),
    surname: z.string().min(2, "Il cognome deve contenere almeno 2 caratteri").optional(),
    email: z.string().email("Indirizzo email non valido").optional(),
    password: z.string().min(8, "La password deve contenere almeno 8 caratteri")
        .regex(/[A-Z]/, "Almeno una maiuscola")
        .regex(/[a-z]/, "Almeno una minuscola")
        .regex(/[0-9]/, "Almeno un numero")
        .regex(/[^A-Za-z0-9]/, "Almeno un carattere speciale").optional(),
    role: z.enum(["USER", "ADMIN"]).optional(),
});

// Schema per aggiornamento profilo utente (User)
export const updateProfileSchema = z.object({
    name: z.string().min(2, "Il nome deve contenere almeno 2 caratteri").optional(),
    surname: z.string().min(2, "Il cognome deve contenere almeno 2 caratteri").optional(),
    email: z.string().email("Indirizzo email non valido").optional(),
}).refine(
    (data) => data.name || data.surname || data.email,
    { message: "Almeno un campo deve essere fornito" }
)

// Schema per aggiornamento password utente (User)
export const updatePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Password corrente richiesta"),
    newPassword: z.string().min(8, "La nuova password deve contenere almeno 8 caratteri")
        .regex(/[A-Z]/, "Almeno una maiuscola")
        .regex(/[a-z]/, "Almeno una minuscola")
        .regex(/[0-9]/, "Almeno un numero")
        .regex(/[^A-Za-z0-9]/, "Almeno un carattere speciale"),
}).refine(
    (data) => data.currentPassword !== data.newPassword,
    { 
        message: "La nuova password deve essere diversa da quella corrente",
        path: ["newPassword"]}
);

//Schema per cancellazione utente (Admin)
export const deleteUserSchema = z.object({
    userId: z.coerce.number().int().positive("ID utente non valido"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type DeleteUserInput = z.infer<typeof deleteUserSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;