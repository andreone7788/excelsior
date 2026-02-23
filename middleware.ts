import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/jwt'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  const pathname = request.nextUrl.pathname
  
  console.log('🔍 Middleware check:', pathname, 'Token:', !!token)

  // Percorsi pubblici (accessibili senza autenticazione)
  const publicPaths = ['/', '/login', '/register']
  const isPublicPath = publicPaths.includes(pathname)

  if (isPublicPath) {
    console.log('✅ Percorso pubblico, accesso consentito')
    return NextResponse.next()
  }

  // Verifica validità token
  let userPayload = null
  if (token) {
    userPayload = await verifyToken(token)
    console.log('👤 User payload:', userPayload ? `userId: ${userPayload.userId}` : 'invalid')
  }

  // Redirect se autenticato e prova ad accedere a login/register
  if (userPayload && (pathname === '/login' || pathname === '/register')) {
    console.log('✅ Utente già autenticato, redirect a /dashboard')
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Percorsi protetti
  const isProtectedPath = pathname.startsWith('/dashboard') || pathname.startsWith('/admin')

  if (isProtectedPath && !userPayload) {
    console.log('❌ Accesso negato, redirect a /login')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  console.log('✅ Middleware: accesso consentito')
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}