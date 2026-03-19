import { NextResponse } from 'next/server'
import crypto from 'crypto'

function hashToken(value) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

export function middleware(request) {
  const { pathname } = request.nextUrl

  // La ruta de login siempre es pública
  if (pathname === '/login' || pathname === '/api/login') {
    return NextResponse.next()
  }

  const sessionCookie = request.cookies.get('session')?.value
  const expectedToken = hashToken(
    process.env.APP_PASSWORD + process.env.SESSION_SECRET
  )

  if (!sessionCookie || sessionCookie !== expectedToken) {
    // Si es una llamada a la API, devolver 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    // Si es una página, redirigir al login
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json).*)'],
}
