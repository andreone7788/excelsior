import { SignJWT, jwtVerify } from "jose"

// Converte il secret in un formato adatto per la firma e verifica dei token
const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

// Type per il payload del token
export type JWTPayload = {
    userId: number
    email: string
    role: 'USER' | 'ADMIN'
};

// Funzione per la creazione del token JWT
export async function createToken(payload: JWTPayload): Promise<string> {
    return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt() // Quando il token è stato creato
    .setExpirationTime('7d') // Imposta la scadenza del token a 7 giorni
    .sign(secret) // Firma il token con il secret
};

// Funzione per la verifica del token JWT
export async function verifyToken(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtVerify(token, secret);
        return payload as JWTPayload; // Ritorna il payload se il token è valido
    } catch (error) {
        console.error("Token verification failed:", error);
        return null; // Ritorna null se il token non è valido
    }
}