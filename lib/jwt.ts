import { SignJWT, jwtVerify } from 'jose'

// Converti la chiave segreta in Uint8Array (richiesto da jose per Edge Runtime)
const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
)

export interface JWTPayload {
    userId: number
    email: string
}

/**
 * Genera un token JWT firmato (compatibile con Edge Runtime)
 * @param payload - Dati da includere nel token
 * @returns Promise con il token JWT come stringa
 */
export async function signToken(payload: { userId: number; email: string }): Promise<string> {
    const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(JWT_SECRET)

    return token
}

/**
 * Verifica e decodifica un token JWT (compatibile con Edge Runtime)
 * @param token - Token JWT da verificare
 * @returns Promise con il payload decodificato o null se non valido
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET)

        return {
            userId: payload.userId as number,
            email: payload.email as string,
        }
    } catch (error) {
        console.error('❌ JWT verification failed:', error)
        return null
    }
}