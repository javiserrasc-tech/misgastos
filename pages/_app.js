import '../styles/globals.css'
import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function App({ Component, pageProps }) {
  const router = useRouter()

  useEffect(() => {
    // Registrar service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error)
    }

    // Restaurar sesión desde localStorage si la cookie se perdió (iOS PWA)
    const stored = localStorage.getItem('session')
    if (stored) {
      const hasCookie = document.cookie.split(';').some(c => c.trim().startsWith('session='))
      if (!hasCookie) {
        // Restaurar la cookie desde localStorage
        const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString()
        document.cookie = `session=${stored}; path=/; expires=${expires}; SameSite=Strict${location.protocol === 'https:' ? '; Secure' : ''}`
        // Recargar para que el middleware la vea
        router.replace(router.asPath)
      }
    }
  }, [])

  // Guardar token en localStorage cuando se actualiza la cookie
  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)session=([^;]+)/)
    if (match) {
      localStorage.setItem('session', match[1])
    }
  }, [router.pathname])

  // Limpiar localStorage al hacer logout
  useEffect(() => {
    const handler = () => localStorage.removeItem('session')
    window.addEventListener('logout', handler)
    return () => window.removeEventListener('logout', handler)
  }, [])

  return <Component {...pageProps} />
}
