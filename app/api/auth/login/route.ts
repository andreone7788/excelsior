import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma.client'
import { loginSchema } from '@/lib/validations/auth'
import bcrypt from 'bcrypt'
import { signToken } from '@/lib/jwt'
import { z } from 'zod'

/**
 * POST /api/auth/login
 * API pubblica per autenticazione
 * 
 * Request Body:
 * {
 *   email: string
 *   password: string
 * }
 * 
 * Response (200):
 * {
 *   message: "Login effettuato con successo",
 *   user: { id, name, surname, email, role }
 * }
 * + Cookie: auth_token (HttpOnly)
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const validated = loginSchema.parse(body)

        console.log('🔐 API Login:', validated.email)

        // 1. Trova utente
        const user = await prisma.user.findUnique({
            where: { email: validated.email },
            select: {
                id: true,
                name: true,
                surname: true,
                email: true,
                password: true,
                role: true,
            }
        })

        if (!user) {
            console.log('❌ Utente non trovato:', validated.email)
            return NextResponse.json(
                { error: 'Email o password non corretti' },
                { status: 401 }
            )
        }

        // 2. Verifica password
        const isPasswordValid = await bcrypt.compare(
            validated.password,
            user.password
        )

        if (!isPasswordValid) {
            console.log('❌ Password errata per:', validated.email)
            return NextResponse.json(
                { error: 'Email o password non corretti' },
                { status: 401 }
            )
        }

        // 3. Genera JWT con role
        const token = await signToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        })

        // 4. Rimuovi password dalla risposta
        const { password: _, ...userWithoutPassword } = user

        // 5. Crea risposta con cookie
        const response = NextResponse.json(
            {
                message: 'Login effettuato con successo',
                user: userWithoutPassword,
            },
            { status: 200 }
        )

        response.cookies.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
        })

        console.log(`✅ Login API: ${user.email} (${user.role})`)

        return response

    } catch (error) {
        console.error('❌ Errore API login:', error)

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    error: 'Dati non validi',
                    details: error.issues.map(e => ({
                        field: e.path.join('.'),
                        message: e.message
                    }))
                },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: 'Errore durante il login' },
            { status: 500 }
        )
    }
}