import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/jwt'
import { prisma } from '@/lib/prisma.client'

export async function GET() {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('auth_token')?.value

        if (!token) {
            return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
        }

        const payload = await verifyToken(token)

        if (!payload) {
            return NextResponse.json({ error: 'Token non valido' }, { status: 401 })
        }

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

        if (!user) {
            return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 })
        }

        // 🔧 RITORNA user direttamente, NON { user: user }
        return NextResponse.json(user)
    } catch (error) {
        console.error('Errore API /user/me:', error)
        return NextResponse.json({ error: 'Errore server' }, { status: 500 })
    }
}