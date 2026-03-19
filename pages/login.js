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
            background: #0d0d11;
          }
          .login-wrap::before {
            content: '';
            position: fixed;
            inset: 0;
            background: radial-gradient(ellipse 80% 50% at 50% -10%, rgba(240,165,0,0.07) 0%, transparent 60%);
            pointer-events: none;
          }
          .login-card {
            position: relative;
            width: 100%;
            max-width: 340px;
            background: #15151c;
            border: 1px solid #26263a;
            border-radius: 1.25rem;
            padding: 2.5rem 2rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0;
          }
          .login-badge {
            width: 3rem;
            height: 3rem;
            border-radius: 0.75rem;
            background: #f0a500;
            color: #000;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'DM Mono', monospace;
            font-size: 1.3rem;
            font-weight: 500;
            box-shadow: 0 0 28px rgba(240,165,0,0.3);
            margin-bottom: 1.1rem;
          }
          .login-title {
            font-family: 'Syne', sans-serif;
            font-size: 0.85rem;
            font-weight: 800;
            letter-spacing: 0.16em;
            color: #e0e0f0;
            margin-bottom: 2rem;
          }
          .login-form {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }
          .login-input {
            background: #1c1c26;
            border: 1px solid #26263a;
            border-radius: 0.6rem;
            color: #e0e0f0;
            font-family: 'DM Mono', monospace;
            font-size: 1rem;
            letter-spacing: 0.1em;
            padding: 0.85rem 1rem;
            width: 100%;
            outline: none;
            transition: border-color 0.15s, box-shadow 0.15s;
            -webkit-appearance: none;
          }
          .login-input:focus {
            border-color: #f0a500;
            box-shadow: 0 0 0 3px rgba(240,165,0,0.1);
          }
          .login-input--error {
            border-color: #ff4d4d !important;
            box-shadow: 0 0 0 3px rgba(255,77,77,0.1) !important;
          }
          .login-error {
            font-family: 'Syne', sans-serif;
            font-size: 0.72rem;
            font-weight: 600;
            color: #ff4d4d;
            text-align: center;
            margin: 0;
          }
          .login-btn {
            background: #f0a500;
            color: #000;
            border: none;
            border-radius: 0.6rem;
            padding: 0.875rem;
            font-family: 'Syne', sans-serif;
            font-size: 0.9rem;
            font-weight: 800;
            letter-spacing: 0.06em;
            cursor: pointer;
            width: 100%;
            margin-top: 0.25rem;
            transition: background 0.15s, transform 0.1s;
            box-shadow: 0 4px 14px rgba(240,165,0,0.2);
          }
          .login-btn:hover:not(:disabled) {
            background: #ffc02e;
          }
          .login-btn:active:not(:disabled) {
            transform: scale(0.98);
          }
          .login-btn:disabled {
            opacity: 0.4;
            cursor: not-allowed;
            box-shadow: none;
          }
        `}</style>
      </div>
    </>
  )
}
