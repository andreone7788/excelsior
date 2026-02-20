import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/jwt'

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value
    const { pathname } = request.nextUrl

    console.log('🔍 Middleware check:', pathname, 'Token:', !!token)

    //==========================
    // Routes pubbliche (accessibili senza autenticazione)
    //==========================
    const publicRoutes = ['/login', '/register', '/']
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

    //===========================
    // CASO 1: Nessun token e route protetta
    //===========================
    if (!token && !isPublicRoute) {
        console.log('Accesso negato: nessun token presente')
        return NextResponse.redirect(new URL('/login', request.url))
    }

    //===========================
    // CASO 2: Verifica validità del token
    //===========================
    if (token) {
        let payload = null

        try {
            payload = await verifyToken(token)
        } catch (error) {
            console.error('Errore durante la verifica del token:', error)

            // Token corrotto o malformato - cancelliamolo
            if (!isPublicRoute) {
                console.log('🗑️ Token corrotto, lo cancello e redirect')
                const response = NextResponse.redirect(new URL('/login', request.url))
                response.cookies.delete('token')
                return response
            }
        }

        // Token non valido o scaduto
        if (!payload && !isPublicRoute) {
            console.log('Token non valido o scaduto')
            const response = NextResponse.redirect(new URL('/login', request.url))
            response.cookies.delete('token')
            return response
        }

        //============================
        // CASO 3: Loggato ma su pagine login/register
        //============================
        if (payload && (pathname === '/login' || pathname === '/register')) {
            console.log('Utente già autenticato, redirect a dashboard')
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }

        //============================
        // CASO 4: Route riservate solo agli ADMIN
        //============================
        if (pathname.startsWith('/dashboard/admin') && payload?.role !== 'ADMIN') {
            console.log('Solo ADMIN può accedere')
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    //===========================
    // Controlli ok, accesso consentito
    //===========================
    console.log('Middleware: accesso consentito')
    return NextResponse.next()
}

//===========================
// Configurazione del middleware
//===========================
export const config = {
    matcher: [
        /*
         * Match tutte le route ECCETTO:
         * - /api/* (API routes)
         * - /_next/static (file statici)
         * - /_next/image (ottimizzazione immagini)
         * - /favicon.ico
         * - File con estensioni (.png, .jpg, .svg, etc.)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*$).*)',
    ],
}