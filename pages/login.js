import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function Login() {
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!password) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        router.replace('/')
      } else {
        setError('Contraseña incorrecta')
        setPassword('')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Mis Gastos — Acceso</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Mono:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>

      <div className="login-wrap">
        <div className="login-card">
          <div className="login-badge">€</div>
          <h1 className="login-title">MIS GASTOS</h1>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <input
              className={`login-input ${error ? 'login-input--error' : ''}`}
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              autoFocus
              autoComplete="current-password"
            />
            {error && <p className="login-error">{error}</p>}
            <button
              className="login-btn"
              type="submit"
              disabled={loading || !password}
            >
              {loading ? 'Verificando…' : 'Entrar'}
            </button>
          </form>
        </div>

        <style jsx>{`
          .login-wrap {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1.5rem;
            background: #f2f2f7;
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
          }
          .login-card {
            width: 100%;
            max-width: 340px;
            background: #ffffff;
            border: 1px solid rgba(0,0,0,0.08);
            border-radius: 1.25rem;
            padding: 2.5rem 2rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            box-shadow: 0 4px 24px rgba(0,0,0,0.08);
          }
          .login-badge {
            width: 2.8rem;
            height: 2.8rem;
            border-radius: 0.7rem;
            background: #007aff;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: ui-monospace, 'SF Mono', monospace;
            font-size: 1.2rem;
            font-weight: 600;
            margin-bottom: 1rem;
          }
          .login-title {
            font-size: 0.88rem;
            font-weight: 700;
            letter-spacing: -0.01em;
            color: #1c1c1e;
            margin-bottom: 1.75rem;
          }
          .login-form {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }
          .login-input {
            background: #f9f9fb;
            border: 1px solid rgba(0,0,0,0.08);
            border-radius: 0.625rem;
            color: #1c1c1e;
            font-family: ui-monospace, 'SF Mono', monospace;
            font-size: 1rem;
            padding: 0.8rem 1rem;
            width: 100%;
            outline: none;
            transition: border-color 0.15s, box-shadow 0.15s;
            -webkit-appearance: none;
          }
          .login-input:focus {
            border-color: #007aff;
            box-shadow: 0 0 0 3px rgba(0,122,255,0.12);
            background: #fff;
          }
          .login-input--error {
            border-color: #ff3b30 !important;
            box-shadow: 0 0 0 3px rgba(255,59,48,0.1) !important;
          }
          .login-error {
            font-size: 0.72rem;
            font-weight: 500;
            color: #ff3b30;
            text-align: center;
            margin: 0;
          }
          .login-btn {
            background: #007aff;
            color: #fff;
            border: none;
            border-radius: 0.625rem;
            padding: 0.875rem;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 0.95rem;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            margin-top: 0.25rem;
            transition: background 0.15s, transform 0.1s;
            box-shadow: 0 2px 8px rgba(0,122,255,0.2);
          }
          .login-btn:hover:not(:disabled) { background: #0066d6; }
          .login-btn:active:not(:disabled) { transform: scale(0.98); }
          .login-btn:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }
        `}</style>
      </div>
    </>
  )
}
