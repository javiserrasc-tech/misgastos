import { serialize } from 'cookie'
import crypto from 'crypto'

function hashToken(value) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { password } = req.body

  if (!password || password !== process.env.APP_PASSWORD) {
    return res.status(401).json({ error: 'Contraseña incorrecta' })
  }

  // El token de sesión es un hash de la contraseña + un salt fijo del servidor
  const sessionToken = hashToken(process.env.APP_PASSWORD + process.env.SESSION_SECRET)

  res.setHeader('Set-Cookie', serialize('session', sessionToken, {
    httpOnly: true,   // JavaScript del navegador NO puede leerla
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 días
  }))

  return res.status(200).json({ success: true })
}
