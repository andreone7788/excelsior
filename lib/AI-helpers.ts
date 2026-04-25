import { GoogleGenerativeAI } from '@google/generative-ai'

if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY non definita nelle variabili d\'ambiente')
}

/**
 * Genera risposta AI per chatbot
 */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function generateAIResponse(userMessage: string, context?: string): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 500,
            }
        })

        // ✅ NUOVO: Rileva se serve supporto umano
        const needsHumanSupport = requiresHumanSupport(userMessage)

        const systemPrompt = `
Sei l'assistente virtuale dell'Hotel Excelsior, un hotel di lusso in Italia.
Rispondi in modo professionale, cordiale e conciso in italiano.

INFORMAZIONI HOTEL:
- Nome: Hotel Excelsior
- Ubicazione: Riviera italiana
- Servizi: WiFi gratuito, colazione inclusa, parcheggio, SPA, ristorante gourmet
- Check-in: 15:00 | Check-out: 11:00
- Early check-in: Disponibile su richiesta (soggetto a disponibilità)
- Late check-out: Disponibile su richiesta (€20 extra)
- Politica cancellazione: Gratuita fino a 24h prima dell'arrivo
- Contatti: info@excelsior.com | +39 123 456 789
- Parcheggio: Gratuito per gli ospiti
- Animali: Ammessi (piccola taglia, su richiesta)
- Bambini: Culla gratuita, seggiolone disponibile

${context ? `CONTESTO CONVERSAZIONE:\n${context}` : ''}

REGOLE IMPORTANTI:
- Se non sai la risposta ESATTA, suggerisci SEMPRE di contattare lo staff
- NON inventare informazioni su prezzi, disponibilità o servizi non menzionati
- Risposte brevi: massimo 3-4 righe
- Usa emoji appropriati (🏨 ⭐ 🌊 etc.) per rendere amichevole
- Se l'utente vuole prenotare, invitalo a usare il sistema di prenotazione

${needsHumanSupport ? `
⚠️ ATTENZIONE: Questa domanda riguarda modifiche, problemi o richieste complesse.
Dopo aver dato una risposta generica, INVITA L'UTENTE a contattare lo staff per assistenza personalizzata.
` : ''}
`;

        const prompt = `${systemPrompt}\n\nDomanda utente: ${userMessage}\nRisposta:`
        const result = await Promise.race([
            model.generateContent(prompt),
            new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('TIMEOUT_AI')), 10000)
            )
        ])

        let response = result.response.text()

        // ✅ NUOVO: Aggiungi escalation se necessario
        if (needsHumanSupport && !response.toLowerCase().includes('staff') && !response.toLowerCase().includes('personale')) {
            response += '\n\n💬 Per questo tipo di richiesta, ti consiglio di contattare il nostro staff attraverso il sistema di conversazioni. Potranno assisterti personalmente e risolvere la tua richiesta nel miglior modo possibile!'
        }

        return response

    } catch (error) {
        logger.error('Errore generazione AI:', error)

        if (error instanceof Error && error.message === 'TIMEOUT_AI') {
            throw new Error('Il servizio AI sta impiegando troppo tempo. Riprova tra poco.');
        }

        throw new Error('ERRORE_AI')
    }
}

/**
 * Suggerisce camere basandosi su preferenze utente
 */
export async function suggestRooms(userPreferences: string,
    availableRooms: Array<{
        id: number,
        name: string,
        description: string,
        price: number
        capacity: number
        amenities?: string[]
    }>
): Promise<{ suggestion: string; roomIds: number[] }> {
    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 300,
            }
        })

        const roomsFormatted = availableRooms
            .map(r =>
                `ID: ${r.id}
Nome: ${r.name}
Prezzo: €${r.price}/notte
Capacità: ${r.capacity} persone
Descrizione: ${r.description}
Servizi: ${r.amenities?.join(', ') || 'Standard'}
---`
            )
            .join('\n');

        const prompt = `
Sei un concierge esperto dell'Hotel Excelsior. 
Analizza le preferenze del cliente e suggerisci le 2 MIGLIORI camere tra quelle disponibili.

CAMERE DISPONIBILI:
${roomsFormatted}

PREFERENZE CLIENTE: 
"${userPreferences}"

ISTRUZIONI:
1. Analizza attentamente le preferenze (budget, capacità, servizi desiderati, vista, etc.)
2. Seleziona le 2 camere PIÙ ADATTE (non più di 2!)
3. Spiega BREVEMENTE perché sono perfette (max 2-3 righe)
4. Se nessuna camera è adatta, spiega perché e suggerisci alternative

Rispondi SOLO in questo formato JSON (nient'altro):
{
  "suggestion": "Spiegazione breve e convincente",
  "roomIds": [id1, id2]
}

Se NESSUNA camera soddisfa i requisiti, usa roomIds vuoto: []
`;

        const result = await Promise.race([
            model.generateContent(prompt),
            new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('TIMEOUT_AI')), 10000)
            )
        ])
        const text = result.response.text();

        // Estrai JSON dalla risposta
        const jsonMatch = text.match(/{[\s\S]*}/)
        if (!jsonMatch) {
            throw new Error('RISPOSTA_AI_NON_VALIDA')
        }

        const parsed = JSON.parse(jsonMatch[0])

        // Validazione base
        if (!parsed.suggestion || !Array.isArray(parsed.roomIds)) {
            throw new Error('RISPOSTA_AI_NON_VALIDA')
        }

        // Verifica che roomID esistano tra le camere disponibili
        const validRoomIds = parsed.roomIds.filter((id: number) =>
            availableRooms.some(r => r.id === id)
        )

        return { suggestion: parsed.suggestion, roomIds: validRoomIds }
    }
    catch (error) {
        logger.error('Errore suggerimento AI:', error)

        if (error instanceof Error && error.message === 'TIMEOUT_AI') {
            throw new Error('Il servizio AI sta impiegando troppo tempo. Riprova tra poco.');
        }

        throw new Error('ERRORE_AI')
    }
}

/**
 * Suggerisce una risposta per admin in base alla conversazione
 */
export async function suggestAdminReply(
    conversationHistory: Array<{ role: 'USER' | 'ADMIN', content: string }>,
    userQuestion: string
): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 300,
            }
        })

        const historyFormatted = conversationHistory
            .map(msg => `${msg.role}: ${msg.content}`)
            .join('\n');

        const prompt = `
Sei l'assistente dell'admin dell'Hotel Excelsior.
Suggerisci una risposta PROFESSIONALE e CORTESE per questa conversazione.

CRONOLOGIA CONVERSAZIONE:
${historyFormatted}

ULTIMA DOMANDA UTENTE:
${userQuestion}

ISTRUZIONI:
- Rispondi in modo professionale ma cordiale
- Fornisci informazioni concrete e utili
- Se non hai info certe, suggerisci di verificare e rispondere presto
- Massimo 4-5 righe
- Usa il "Lei" formale

Genera SOLO la risposta suggerita (niente prefissi come "Risposta:" o altro):
`;

        const result = await Promise.race([
            model.generateContent(prompt),
            new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('TIMEOUT_AI')), 10000)
            )
        ])
        return result.response.text().trim()

    } catch (error) {
        logger.error('Errore suggerimento risposta admin AI:', error)

        if (error instanceof Error && error.message === 'TIMEOUT_AI') {
            throw new Error('Il servizio AI sta impiegando troppo tempo. Riprova tra poco.');
        }

        throw new Error('ERRORE_AI')
    }
}

/**
 * Error handler specifico per AI
 */
export function handleAIError(error: unknown) {
    logger.error('Errore AI:', error)

    if (error instanceof Error) {
        switch (error.message) {
            case 'TIMEOUT_AI':
                return { error: 'Il servizio AI sta impiegando troppo tempo. Riprova tra poco.', status: 503 }
            case 'ERRORE_AI':
                return { error: 'Si è verificato un errore durante la generazione della risposta AI. Riprova più tardi.', status: 500 }
            case 'RISPOSTA_AI_NON_VALIDA':
                return { error: 'La risposta generata dall\'AI non è valida. Riprova.', status: 500 }
            default:
                return { error: 'Errore sconosciuto', status: 500 }
        }
    }
    return { error: 'Errore sconosciuto', status: 500 }
}

/**
 * Rileva se una domanda richiede assistenza umana
 */
function requiresHumanSupport(userMessage: string): boolean {
    const complexKeywords = [
        // Modifiche/Cancellazioni
        'modificare', 'cambiare', 'cancellare', 'annullare', 'spostare',
        'modifico', 'cambio', 'cancello', 'annullo',

        // Problemi
        'problema', 'errore', 'non funziona', 'sbagliato', 'difetto',
        'reclamo', 'lamentela', 'guasto', 'rotto',

        // Pagamenti
        'pagamento', 'pagare', 'carta', 'rimborso', 'fattura',
        'non mi hanno addebitato', 'errore pagamento', 'bonifico',

        // Prenotazioni esistenti
        'mia prenotazione', 'ho prenotato', 'ho già prenotato',
        'conferma prenotazione', 'numero prenotazione',

        // Richieste personalizzate
        'speciale', 'personalizzato', 'particolare', 'allergie',
        'disabilità', 'accessibilità', 'necessità specifiche',

        // Urgenze
        'urgente', 'subito', 'emergenza', 'aiuto'
    ]

    const lowerMessage = userMessage.toLowerCase()
    return complexKeywords.some(keyword => lowerMessage.includes(keyword))
}