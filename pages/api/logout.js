import { serialize } from 'cookie'

export default function handler(req, res) {
  res.setHeader('Set-Cookie', serialize('session', '', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  }))

  return res.status(200).json({ success: true })
}
