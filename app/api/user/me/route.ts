import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import { prisma } from '@/lib/prisma.client'
import { cookies } from 'next/headers'

export async function GET() {
    try {
        console.log('📡 API /user/me chiamata')

        const cookieStore = await cookies()
        const token = cookieStore.get('auth_token')?.value

        if (!token) {
            console.log('❌ Nessun token trovato')
            return NextResponse.json(
                { error: 'Non autenticato' },
                { status: 401 }
            )
        }

        console.log('🔐 Token trovato, verifico...')

        const payload = await verifyToken(token)

        if (!payload || !payload.userId) {
            console.log('❌ Token non valido')
            return NextResponse.json(
                { error: 'Token non valido' },
                { status: 401 }
            )
        }

        console.log('✅ Token valido per userId:', payload.userId)

        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: {
                id: true,
                name: true,
                surname: true,
                email: true,
                role: true,
            }
        })

        if (!user) {
            console.log('❌ Utente non trovato nel database')
            return NextResponse.json(
                { error: 'Utente non trovato' },
                { status: 404 }
            )
        }

        console.log('✅ Utente trovato:', user.email, 'role:', user.role)

        return NextResponse.json({ user })
    } catch (error) {
        console.error('💥 Errore API /user/me:', error)
        return NextResponse.json(
            { error: 'Errore del server' },
            { status: 500 }
        )
    }
}