import { z } from 'zod';

// Schema per creazione di una camera
export const createRoomSchema = z.object({
    name: z.string().min(2, "Il nome della stanza deve contenere almeno 2 caratteri"),
    description: z.string().min(10, "La descrizione deve contenere almeno 10 caratteri"),
    capacity: z.coerce.number().int().positive("La capacità deve essere un numero intero positivo"),
    price: z.coerce.number().positive("Il prezzo per notte deve essere un numero positivo"),
    imageUrl: z.string().url("L'URL dell'immagine deve essere valido").optional(),
});

// Schema per aggiornamento di una camera (solo per Admin)
export const updateRoomSchema = z.object({
    roomId: z.coerce.number().int().positive("ID stanza non valido"),
    name: z.string().min(2, "Il nome della stanza deve contenere almeno 2 caratteri").optional(),
    description: z.string().min(10, "La descrizione deve contenere almeno 10 caratteri").optional(),
    capacity: z.coerce.number().int().positive("La capacità deve essere un numero intero positivo").optional(),
    price: z.coerce.number().positive("Il prezzo per notte deve essere un numero positivo").optional(),
    imageUrl: z.string().url("L'URL dell'immagine deve essere valido").optional(),
});

// Schema per i filtri di ricerca delle camere
export const roomFiltersSchema = z.object({
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  capacity: z.number().int().positive().optional(),
  isAvailable: z.boolean().optional(),
  sortBy: z.enum(['price', 'capacity', 'name']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
export type RoomFiltersInput = z.infer<typeof roomFiltersSchema>;