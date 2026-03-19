import { NextResponse } from 'next/server'

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json).*)'],
  runtime: 'experimental-edge',
}

async function sha256(message) {
  const encoder = new TextEncoder()
  const data = encoder.encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Rutas siempre públicas
  if (pathname === '/login' || pathname === '/api/login') {
    return NextResponse.next()
  }

  const sessionCookie = request.cookies.get('session')?.value
  const expectedToken = await sha256(
    (process.env.APP_PASSWORD || '') + (process.env.SESSION_SECRET || '')
  )

  if (!sessionCookie || sessionCookie !== expectedToken) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}
