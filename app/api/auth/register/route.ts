import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma.client'
import { registerSchema } from '@/lib/validations/auth'
import bcrypt from 'bcrypt'
import { signToken } from '@/lib/jwt'
import { z } from 'zod'
import { logger } from '@/lib/logger'

/**
 * POST /api/auth/register
 * API pubblica per registrazione nuovo utente
 * 
 * Request Body:
 * {
 *   name: string
 *   surname: string
 *   phone: string
 *   email: string
 *   password: string
 * }
 * 
 * Response (201):
 * {
 *   message: "Registrazione completata con successo",
 *   user: { id, name, surname, phone, email, role }
 * }
 * + Cookie: auth_token (HttpOnly) - Login automatico
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const validated = registerSchema.parse(body)

        logger.info('API Registrazione:', validated.email)

        // 1. Verifica email non già registrata
        const existingUser = await prisma.user.findUnique({
            where: { email: validated.email }
        })

        if (existingUser) {
            logger.info('Email già registrata:', validated.email)
            return NextResponse.json(
                { error: 'Email già registrata' },
                { status: 409 }
            )
        }

        // 2. Hash password
        const hashedPassword = await bcrypt.hash(validated.password, 10)

        // 3. Crea utente
        const user = await prisma.user.create({
            data: {
                name: validated.name,
                surname: validated.surname,
                email: validated.email,
                phone: validated.phone,
                password: hashedPassword,
                role: 'USER',
            },
            select: {
                id: true,
                name: true,
                surname: true,
                email: true,
                phone: true,
                role: true,
                createdAt: true,
            }
        })

        // 4. Genera JWT con role
        const token = await signToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        })

        // 5. Crea risposta con cookie (login automatico)
        const response = NextResponse.json(
            {
                message: 'Registrazione completata con successo',
                user,
            },
            { status: 201 }
        )

        response.cookies.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
        })

        logger.info(`Registrazione API: ${user.email} (ID: ${user.id})`)

        return response

    } catch (error) {
        logger.error('Errore API registrazione:', error)

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
            { error: 'Errore durante la registrazione' },
            { status: 500 }
        )
    }
}