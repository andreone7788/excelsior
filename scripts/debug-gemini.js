// debug-gemini.js (debug per API Gemini di Google Generative AI)
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

async function debugGemini() {
    console.log('🔍 DEBUG GEMINI API\n');
    console.log('═══════════════════════════════════════\n');
    
    // 1. Verifica API Key
    console.log('1️⃣ VERIFICA API KEY');
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        console.log('❌ GEMINI_API_KEY non trovata in .env');
        return;
    }
    
    console.log(`✅ API Key presente: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 5)}`);
    console.log(`   Lunghezza: ${apiKey.length} caratteri`);
    console.log('');
    
    // 2. Inizializza client
    console.log('2️⃣ INIZIALIZZAZIONE CLIENT');
    const genAI = new GoogleGenerativeAI(apiKey);
    console.log('✅ Client GoogleGenerativeAI creato');
    console.log('');
    
    // 3. Lista modelli da testare
    const modelsToTest = [
        'gemini-2.5-flash',
        'gemini-pro',
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-1.5-flash-latest',
        'gemini-1.5-pro-latest',
        'text-bison-001',
        'chat-bison-001'
    ];
    
    console.log('3️⃣ TEST MODELLI\n');
    
    for (const modelName of modelsToTest) {
        try {
            console.log(`🧪 Testing: ${modelName}`);
            
            const model = genAI.getGenerativeModel({ model: modelName });
            
            console.log(`   📡 Invio richiesta...`);
            const result = await model.generateContent('Rispondi solo con OK');
            
            const response = result.response;
            const text = response.text();
            
            console.log(`   ✅ FUNZIONA! Risposta: "${text}"`);
            console.log(`   🎯 USA QUESTO MODELLO: "${modelName}"`);
            console.log('');
            
            // Ferma al primo che funziona
            console.log('═══════════════════════════════════════');
            console.log(`✅ MODELLO CORRETTO TROVATO: ${modelName}`);
            console.log('═══════════════════════════════════════\n');
            
            console.log('📝 AGGIORNA IL CODICE CON:');
            console.log(`   model: '${modelName}'`);
            
            return; // Ferma qui
            
        } catch (error) {
            if (error.status) {
                console.log(`   ❌ Errore ${error.status}: ${error.statusText || error.message}`);
            } else {
                console.log(`   ❌ Errore: ${error.message}`);
            }
            console.log('');
        }
    }
    
    console.log('═══════════════════════════════════════');
    console.log('❌ NESSUN MODELLO FUNZIONA');
    console.log('═══════════════════════════════════════\n');
    
    console.log('🔧 POSSIBILI SOLUZIONI:\n');
    console.log('1. Verifica API Key su: https://aistudio.google.com/app/apikey');
    console.log('2. Controlla che "Generative Language API" sia abilitata');
    console.log('3. Prova a creare una NUOVA API Key');
    console.log('4. Verifica Account Google (potrebbero esserci restrizioni regionali)');
    console.log('5. Prova con account Google diverso');
}

debugGemini().catch(console.error);