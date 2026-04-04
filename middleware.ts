import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/jwt'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  const pathname = request.nextUrl.pathname

  // Percorsi pubblici (non serve autenticazione)
  const publicPaths = ['/', '/login', '/register', '/rooms', '/contact', '/about']
  if (publicPaths.includes(pathname)) {
    return NextResponse.next()
  }

  // Verifica solo se è autenticato (non il ruolo!)
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const payload = await verifyToken(token)
  if (!payload) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // OK, è autenticato → passa
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}