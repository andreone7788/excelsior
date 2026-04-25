'use server'

/**
 * Questo file contiene le azioni server-side per l'autenticazione, inclusi:
 * - registerAction: gestisce la registrazione degli utenti, 
 * validando i dati, creando l'utente nel database, 
 * generando un token JWT e impostando un cookie.
 * - loginAction: gestisce il login degli utenti, validando le credenziali,
 *  verificando la password, generando un token JWT e impostando un cookie.
 * - logoutAction: gestisce il logout degli utenti eliminando il cookie di autenticazione.
 * 
 * Utilizza Zod per la validazione dei dati, bcrypt per l'hashing delle password,
 * Prisma per l'interazione con il database e una libreria JWT personalizzata per la gestione dei token.
 */

import { z } from 'zod'
import bcrypt from 'bcrypt'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma.client'
import { registerSchema, loginSchema } from '@/lib/validations/auth'
import { signToken } from '@/lib/jwt'
import type { RegisterInput, LoginInput } from '@/types'
import { logger } from '@/lib/logger'

export async function registerAction(data: RegisterInput) {
    try {
        logger.info('📝 Tentativo registrazione:', data.email)

        // 1 - Validazione dati con Zod
        const validated = registerSchema.parse(data)

        // 2 - Verifica email esistente
        const existingUser = await prisma.user.findUnique({
            where: { email: validated.email },
        })

        if (existingUser) {
            logger.info('Email già registrata:', validated.email)
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

        logger.info('Utente creato con ID:', user.id)

        // 5 - Genera JWT token
        const token = await signToken({ userId: user.id, email: user.email, role: user.role })

        // 6 - Imposta cookie
        const cookieStore = await cookies()
        cookieStore.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 giorni
            path: '/',
        })

        logger.info('Cookie impostato per userId:', user.id)

        return { success: true }
    } catch (error) {
        if (error instanceof z.ZodError) {
            logger.info('Errore validazione:', error.issues[0].message)
            return { success: false, error: error.issues[0].message }
        }

        logger.error('Errore durante la registrazione:', error)
        return { success: false, error: 'Errore durante la registrazione' }
    }
}

export async function loginAction(data: LoginInput) {
    try {
        logger.info('🔐 Tentativo login:', data.email)

        // 1 - Validazione
        const validated = loginSchema.parse(data)

        // 2 - Trova utente
        const user = await prisma.user.findUnique({
            where: { email: validated.email },
        })

        if (!user) {
            logger.info('Utente non trovato:', validated.email)
            return { success: false, error: 'Credenziali non valide' }
        }

        // 3 - Verifica password
        const isPasswordValid = await bcrypt.compare(
            validated.password,
            user.password
        )

        if (!isPasswordValid) {
            logger.info('Password errata per:', validated.email)
            return { success: false, error: 'Credenziali non valide' }
        }

        logger.info('Password valida per userId:', user.id)

        // 4 - Genera token
        const token = await signToken({ userId: user.id, email: user.email, role: user.role })

        // 5 - Imposta cookie
        const cookieStore = await cookies()
        cookieStore.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
        })

        logger.info('Cookie impostato per userId:', user.id)

        return { success: true }
    } catch (error) {
        if (error instanceof z.ZodError) {
            logger.info('Errore validazione:', error.issues[0].message)
            return { success: false, error: error.issues[0].message }
        }

        logger.error('Errore durante il login:', error)
        return { success: false, error: 'Errore durante il login' }
    }
}

export async function logoutAction() {
    try {
        const cookieStore = await cookies()
        cookieStore.delete('auth_token')
        logger.info('Cookie auth_token eliminato')
        return { success: true }
    } catch (error) {
        logger.error('Errore durante il logout:', error)
        return { success: false, error: 'Errore durante il logout' }
    }
}