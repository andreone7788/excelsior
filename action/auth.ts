'use server'

import { prisma } from '@/lib/prisma.client'
import { createToken, verifyToken } from '@/lib/jwt'
import bcrypt from 'bcrypt'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { loginSchema, registerSchema } from '@/lib/validations/auth'
import type { LoginInput, RegisterInput } from '@/types'
import { Role } from '@prisma/client'

//=================================
// Register Action
//=================================
export async function registerAction(data: RegisterInput) {
    try {
        // 1 - Validazione dati con Zod
        const validated = registerSchema.parse(data)

        // 2 - Verifica email esistente
        const existingUser = await prisma.user.findUnique({
            where: { email: validated.email },
        })

        if (existingUser) {
            return {
                success: false,
                message: 'Email già registrata',
            }
        }

        // 3 - Hash password
        const hashedPassword = await bcrypt.hash(validated.password, 10)

        // 4 - Creazione utente
        const user = await prisma.user.create({
            data: {
                name: validated.name,
                surname: validated.surname,
                email: validated.email,
                password: hashedPassword,
                role: Role.USER // Imposta il ruolo di default a USER
            },
        })

        // 5 - Creazione token JWT
        const token = await createToken({
            userId: user.id,
            email: user.email,
            role: user.role
        })

        // 6 - Salvataggio del token nei cookie
        const cookieStore = await cookies()
        cookieStore.set('token', token, {
            httpOnly: true, // Non accessibile da JavaScript (sicurezza)
            secure: process.env.NODE_ENV === 'production', // HTTPS in produzione
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 giorni in secondi
            path: '/',
        })

        // 7 - Redirect accesso
        return {
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            message: 'Registrazione avvenuta con successo',
        }
    } catch (error) {
        console.error('Errore durante la registrazione:', error)
        return {
            success: false,
            message: 'Si è verificato un errore durante la registrazione',
        }
    }
}

//=================================
// Login Action
//=================================
export async function loginAction(data: LoginInput) {
    try {
        // 1 - Validazione dati con Zod
        const validated = loginSchema.parse(data)

        // 2 - Cerca l'utente per email
        const user = await prisma.user.findUnique({
            where: { email: validated.email },
        })

        if (!user) {
            return {
                success: false,
                message: 'Email o password errati',
            }
        }

        // 3 - Verifica password
        const isPasswordValid = await bcrypt.compare(validated.password, user.password)

        if (!isPasswordValid) {
            return {
                success: false,
                message: 'Email o password errati',
            }
        }

        // 4 - Creazione token JWT
        const token = await createToken({
            userId: user.id,
            email: user.email,
            role: user.role
        })

        // 5 - Salvataggio del token nei cookie
        const cookieStore = await cookies()
        cookieStore.set('token', token, {
            httpOnly: true, // Non accessibile da JavaScript (sicurezza)
            secure: process.env.NODE_ENV === 'production', // HTTPS in produzione
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 giorni in secondi
            path: '/',
        })

        // 6 - Redirect successo
        return {
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            message: 'Login avvenuto con successo',
        }
    } catch (error) {
        console.error('Errore durante il login:', error)
        return {
            success: false,
            message: 'Si è verificato un errore durante il login',
        }
    }
}

//=================================
// Logout Action
//=================================
export async function logoutAction() {
    const cookieStore = await cookies()
    cookieStore.delete('token') // Rimuove il cookie del token
    redirect('/login') // Reindirizza alla pagina di login
}

//=================================
// Current User Action
//=================================
export async function currentUserAction() {
    try {
        // 1 - Lettura del cookie
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) {
            return null // Nessun token, utente non autenticato
        }

        // 2 - Verifica del token
        const payload = await verifyToken(token)

        if (!payload) {
            return null // Token non valido o scaduto
        }

        // 3 - Recupero dati aggiornati dal database
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: {
                id: true,
                name: true,
                surname: true,
                email: true,
                role: true
            }
        })

        return user
    } catch (error) {
        console.error('Errore durante il recupero dell\'utente corrente:', error)
        return null
    }
}