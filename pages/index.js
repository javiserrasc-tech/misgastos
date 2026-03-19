import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

const MESES = [
  'enero','febrero','marzo','abril','mayo','junio',
  'julio','agosto','septiembre','octubre','noviembre','diciembre'
]

function parseValor(val) {
  if (!val) return 0
  return parseFloat(String(val).replace(',', '.')) || 0
}

function mesLabel(m) {
  if (!m) return ''
  return m.charAt(0).toUpperCase() + m.slice(1).toLowerCase()
}

function validarAnio(val) {
  if (!val) return ''
  if (!/^\d{4}$/.test(val)) return 'Debe tener 4 dígitos'
  if (!val.startsWith('20')) return 'Debe empezar por 20'
  return ''
}

export default function Home() {
  const [conceptos, setConceptos]   = useState([])
  const [ultimos,   setUltimos]     = useState([])
  const [form,      setForm]        = useState(defaultForm())
  const [editando,  setEditando]    = useState(null)
  const [loading,   setLoading]     = useState(false)
  const [fetching,  setFetching]    = useState(true)
  const [toast,     setToast]       = useState(null)
  const [anioError, setAnioError]   = useState('')
  const formRef = useRef(null)
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' })
    router.replace('/login')
  }

  function defaultForm() {
    return {
      concepto:   '',
      valor:      '',
      comentario: '',
      mes:        MESES[new Date().getMonth()],
      anio:       String(new Date().getFullYear()),
    }
  }

  useEffect(() => {
    Promise.all([loadConceptos(), loadUltimos()]).finally(() => setFetching(false))
  }, [])

  async function loadConceptos() {
    try {
      const res = await fetch('/api/conceptos')
      const data = await res.json()
      setConceptos(Array.isArray(data) ? data : [])
    } catch (e) { console.error(e) }
  }

  async function loadUltimos() {
    try {
      const res = await fetch('/api/gastos')
      const data = await res.json()
      setUltimos(Array.isArray(data) ? data : [])
    } catch (e) { console.error(e) }
  }

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const err = validarAnio(form.anio)
    if (err) { setAnioError(err); return }
    if (!form.concepto) { showToast('Elige un concepto', 'error'); return }
    if (!form.valor)    { showToast('Introduce un valor', 'error'); return }

    setLoading(true)
    try {
      const body   = editando ? { ...form, id: editando } : form
      const method = editando ? 'PUT' : 'POST'

      const res = await fetch('/api/gastos', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error desconocido')
      }

      showToast(editando ? '✓ Gasto actualizado' : '✓ Gasto guardado')
      resetForm()
      await loadUltimos()
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setForm(defaultForm())
    setEditando(null)
    setAnioError('')
  }

  function handleEditar(gasto) {
    setEditando(gasto.id)
    setForm({
      concepto:   gasto.concepto,
      valor:      String(gasto.valor).replace(',', '.'),
      comentario: gasto.comentario || '',
      mes:        gasto.mes || MESES[new Date().getMonth()],
      anio:       gasto.anio || String(new Date().getFullYear()),
    })
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function setField(key, value) {
    setForm(f => ({ ...f, [key]: value }))
  }

  return (
    <>
      <Head>
        <title>Mis Gastos</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0d0d11" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Mis Gastos" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>

      {/* Toast */}
      {toast && (
        <div className={`toast toast--${toast.type}`} role="alert">
          {toast.msg}
        </div>
      )}

      <div className="app">
        {/* Header */}
        <header className="header">
          <div className="header__badge">€</div>
          <div className="header__text">
            <h1 className="header__title">MIS GASTOS</h1>
            <p className="header__sub">
              {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <button className="btn-ghost header__logout" onClick={handleLogout} type="button" aria-label="Cerrar sesión">
            salir
          </button>
        </header>

        <main className="main" ref={formRef}>

          {/* ── Form card ───────────────────────────────────────── */}
          <section className={`card ${editando ? 'card--editing' : ''}`}>
            <div className="card__head">
              <h2 className="card__title">
                {editando ? '✎ Editar gasto' : '＋ Nuevo gasto'}
              </h2>
              {editando && (
                <button className="btn-ghost" onClick={resetForm} type="button">
                  Cancelar
                </button>
              )}
            </div>

            <form className="form" onSubmit={handleSubmit} noValidate>

              {/* Concepto */}
              <div className="field">
                <label className="label" htmlFor="concepto">Concepto</label>
                <div className="select-wrap">
                  <select
                    id="concepto"
                    className="select"
                    value={form.concepto}
                    onChange={e => setField('concepto', e.target.value)}
                    required
                  >
                    <option value="">— Elige un concepto —</option>
                    {conceptos.map(c => (
                      <option key={c.id} value={c.nombre}>{c.nombre}</option>
                    ))}
                  </select>
                  <span className="select-arrow">▾</span>
                </div>
              </div>

              {/* Valor */}
              <div className="field">
                <label className="label" htmlFor="valor">
                  Valor <span className="label__unit">€</span>
                </label>
                <input
                  id="valor"
                  className="input input--mono"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={form.valor}
                  onChange={e => setField('valor', e.target.value)}
                  required
                />
              </div>

              {/* Comentario */}
              <div className="field">
                <label className="label" htmlFor="comentario">
                  Comentario <span className="label__opt">opcional</span>
                </label>
                <input
                  id="comentario"
                  className="input"
                  type="text"
                  placeholder="Descripción libre..."
                  value={form.comentario}
                  onChange={e => setField('comentario', e.target.value)}
                />
              </div>

              {/* Mes + Año */}
              <div className="row2">
                <div className="field">
                  <label className="label" htmlFor="mes">Mes</label>
                  <div className="select-wrap">
                    <select
                      id="mes"
                      className="select"
                      value={form.mes}
                      onChange={e => setField('mes', e.target.value)}
                    >
                      {MESES.map(m => (
                        <option key={m} value={m}>{mesLabel(m)}</option>
                      ))}
                    </select>
                    <span className="select-arrow">▾</span>
                  </div>
                </div>

                <div className="field">
                  <label className="label" htmlFor="anio">Año</label>
                  <input
                    id="anio"
                    className={`input input--mono ${anioError ? 'input--error' : ''}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="20XX"
                    value={form.anio}
                    onChange={e => {
                      setField('anio', e.target.value)
                      setAnioError(validarAnio(e.target.value))
                    }}
                  />
                  {anioError && (
                    <span className="error-msg" role="alert">{anioError}</span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={loading || !!anioError}
              >
                {loading
                  ? 'Guardando…'
                  : editando
                    ? 'Actualizar gasto'
                    : 'Guardar gasto'
                }
              </button>
            </form>
          </section>

          {/* ── Últimas inserciones ─────────────────────────────── */}
          <section className="card">
            <div className="card__head">
              <h2 className="card__title">Últimas inserciones</h2>
              <button
                className="btn-ghost"
                onClick={loadUltimos}
                type="button"
                aria-label="Recargar"
              >
                ↺
              </button>
            </div>

            {fetching ? (
              <p className="empty">Cargando…</p>
            ) : ultimos.length === 0 ? (
              <p className="empty">Aún no hay registros.</p>
            ) : (
              <ul className="list">
                {ultimos.map(g => (
                  <li
                    key={g.id}
                    className={`list__item ${editando === g.id ? 'list__item--active' : ''}`}
                    onClick={() => handleEditar(g)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && handleEditar(g)}
                    aria-label={`Editar ${g.concepto}`}
                  >
                    <div className="item__top">
                      <span className="item__concepto">{g.concepto}</span>
                      <span className="item__valor">
                        {parseValor(g.valor).toFixed(2)} €
                      </span>
                    </div>
                    <div className="item__bottom">
                      <span className="item__fecha">
                        {mesLabel(g.mes)} {g.anio}
                      </span>
                      {g.comentario && (
                        <span className="item__tag">{g.comentario}</span>
                      )}
                    </div>
                    <span className="item__hint" aria-hidden="true">
                      toca para editar
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

        </main>
      </div>
    </>
  )
}
