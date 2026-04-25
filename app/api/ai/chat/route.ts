import { NextRequest, NextResponse } from 'next/server';
import { generateAIResponse, handleAIError } from '@/lib/AI-helpers';
import { aiChatSchema } from '@/lib/validations/chat';
import { logger } from '@/lib/logger';

/**
 * ==============================================
 * PUBLIC - AI CHATBOT
 * ==============================================
 * POST /api/ai/chat => Chatbot risponde a domande generali
 * 
 * Body:
 * {
 *   "message": "A che ora è il check-in?",
 *   "conversationHistory": [
 *     { "role": "user", "content": "Ciao" },
 *     { "role": "assistant", "content": "Ciao! Come posso aiutarti?" }
 *   ]
 * }
 * 
 * Response 200:
 * {
 *   "response": "Il check-in è alle 15:00...",
 *   "timestamp": "2025-03-18T..."
 * }
 * ===============================================
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { message, conversationHistory } = aiChatSchema.parse(body);

        // Costruisci contesto degli ultimi 3 messaggi per il modello AI
        const context = conversationHistory?.length
            ? conversationHistory.slice(-3).map(msg => `${msg.role}: ${msg.content}`).join('\n')
            : undefined;

        // Genera risposta AI
        const aiResponse = await generateAIResponse(message, context);

        logger.info(`AI Chat - Nuova richiesta: "${message}". Risposta generata: "${aiResponse}"`);

        return NextResponse.json({
            response: aiResponse,
            timestamp: new Date().toISOString(),
        }, { status: 200 });

    } catch (error) {
        const { error: message, status } = handleAIError(error);
        return NextResponse.json({ error: message }, { status });
    }
}