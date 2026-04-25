import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma.client';
import { aiSuggestSchema } from '@/lib/validations/chat';
import { suggestRooms, handleAIError } from '@/lib/AI-helpers'
import { logger } from '@/lib/logger';

/**
 * ==============================================
 * PUBLIC - AI ROOM SUGGESTIONS
 * ==============================================
 * POST /api/ai/suggest-rooms => AI suggerisce camere
 * 
 * Body:
 * {
 *   "preferences": "Camera romantica vista mare per anniversario",
 *   "minPrice": 100,
 *   "maxPrice": 250
 * }
 * 
 * Response 200:
 * {
 *   "suggestion": "Perfetta per un anniversario! Ti consiglio...",
 *   "rooms": [
 *     {
 *       "id": 3,
 *       "name": "Camera Verdone",
 *       "price": 180,
 *       "description": "...",
 *       "capacity": 2,
 *       "amenities": ["Vista mare", "Balcone"]
 *     }
 *   ],
 *   "totalAvailable": 5,
 *   "searchCriteria": {
 *     "preferences": "Camera romantica...",
 *     "priceRange": "€100-250"
 *   }
 * }
 * ==============================================
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { preferences, minPrice, maxPrice } = aiSuggestSchema.parse(body);

        // Filtra camere disponibili in base a preferenze e range di prezzo
        const rooms = await prisma.room.findMany({
            where: {
                isAvailable: true,
                ...(minPrice && { price: { gte: minPrice } }),
                ...(maxPrice && { price: { lte: maxPrice } }),
            },
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                capacity: true,
                isAvailable: true,
            },
            take: 10 // Limitiamo a 10 risultati per performance
        });

        if (rooms.length === 0) {
            return NextResponse.json(
                { 
                    error: 'Nessuna camera disponibile con questi criteri',
                    suggestion: 'Prova ad ampliare i filtri di prezzo o contatta lo staff per assistenza.'
                },
                { status: 404 }
            );
        };

        // Converti decimal a number per compatibilità con AI
        const roomsForAI = rooms.map(r => ({
            ...r,
            price: Number(r.price)
        }));

        // AI analizza preferenze e suggerisce la camera migliore
        const { suggestion, roomIds } = await suggestRooms(preferences, roomsForAI);

        // Ottieni dettagli delle camere suggerite
        const suggestedRooms = rooms.filter(r => roomIds.includes(r.id));

        logger.info('AI ha suggerito camere per preferenze:', preferences, 'Camere suggerite:', roomIds);

        return NextResponse.json({
            suggestion,
            rooms: suggestedRooms,
            totalAvailable: rooms.length,
            searchCriteria: {
                preferences,
                priceRange: `${minPrice ? '€' + minPrice : 'Nessun minimo'} - ${maxPrice ? '€' + maxPrice : 'Nessun massimo'}`
            }
        }, { status: 200 });

    } catch (error) {
        const { error: message, status } = handleAIError(error);
        return NextResponse.json({ error: message }, { status });
    }
}