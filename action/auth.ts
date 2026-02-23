'use server'

import { z } from 'zod'
import bcrypt from 'bcrypt'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma.client'
import { registerSchema, loginSchema } from '@/lib/validations/auth'
import { signToken } from '@/lib/jwt'
import type { RegisterInput, LoginInput } from '@/types'

export async function registerAction(data: RegisterInput) {
    try {
        console.log('📝 Tentativo registrazione:', data.email)

        // 1 - Validazione dati con Zod
        const validated = registerSchema.parse(data)

        // 2 - Verifica email esistente
        const existingUser = await prisma.user.findUnique({
            where: { email: validated.email },
        })

        if (existingUser) {
            console.log('❌ Email già registrata:', validated.email)
            return { success: false, error: 'Email già registrata' }
        }

        // 3 - Hash password
        const hashedPassword = await bcrypt.hash(validated.password, 10)

        // 4 - Crea utente nel database
        const user = await prisma.user.create({
            data: {
                name: validated.name,
                surname: validated.surname,
                email: validated.email,
                password: hashedPassword,
                role: 'USER',
            },
        })

        console.log('✅ Utente creato con ID:', user.id)

        // 5 - Genera JWT token
        const token = await signToken({ userId: user.id, email: user.email })

        // 6 - Imposta cookie
        const cookieStore = await cookies()
        cookieStore.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 giorni
            path: '/',
        })

        console.log('✅ Cookie impostato per userId:', user.id)

        return { success: true }
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.log('❌ Errore validazione:', error.issues[0].message)
            return { success: false, error: error.issues[0].message }
        }

        console.error('❌ Errore durante la registrazione:', error)
        return { success: false, error: 'Errore durante la registrazione' }
    }
}

export async function loginAction(data: LoginInput) {
    try {
        console.log('🔐 Tentativo login:', data.email)

        // 1 - Validazione
        const validated = loginSchema.parse(data)

        // 2 - Trova utente
        const user = await prisma.user.findUnique({
            where: { email: validated.email },
        })

        if (!user) {
            console.log('❌ Utente non trovato:', validated.email)
            return { success: false, error: 'Credenziali non valide' }
        }

        // 3 - Verifica password
        const isPasswordValid = await bcrypt.compare(
            validated.password,
            user.password
        )

        if (!isPasswordValid) {
            console.log('❌ Password errata per:', validated.email)
            return { success: false, error: 'Credenziali non valide' }
        }

        console.log('✅ Password valida per userId:', user.id)

        // 4 - Genera token
        const token = await signToken({ userId: user.id, email: user.email })

        // 5 - Imposta cookie
        const cookieStore = await cookies()
        cookieStore.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
        })

        console.log('✅ Cookie impostato per userId:', user.id)

        return { success: true }
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.log('❌ Errore validazione:', error.issues[0].message)
            return { success: false, error: error.issues[0].message }
        }

        console.error('❌ Errore durante il login:', error)
        return { success: false, error: 'Errore durante il login' }
    }
}