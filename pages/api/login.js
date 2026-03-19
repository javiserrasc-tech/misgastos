import { serialize } from 'cookie'

async function sha256(message) {
  const encoder = new TextEncoder()
  const data = encoder.encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { password } = req.body

  if (!password || password !== process.env.APP_PASSWORD) {
    return res.status(401).json({ error: 'Contraseña incorrecta' })
  }

  const sessionToken = await sha256(
    process.env.APP_PASSWORD + process.env.SESSION_SECRET
  )

  res.setHeader('Set-Cookie', serialize('session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  }))

  return res.status(200).json({ success: true })
}
