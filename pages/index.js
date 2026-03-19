import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

const MESES = [
  'enero','febrero','marzo','abril','mayo','junio',
  'julio','agosto','septiembre','octubre','noviembre','diciembre'
]

const COLOR_DEFAULT = '#e8e8ed'

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

function ConceptoDropdown({ conceptos, grupoMap, value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const selected = conceptos.find(c => c.nombre === value)
  const color = selected ? (grupoMap[selected.nombre] || COLOR_DEFAULT) : COLOR_DEFAULT

  return (
    <div className="custom-select" ref={ref}>
      <button
        type="button"
        className={`custom-select__trigger ${open ? 'custom-select__trigger--open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {value ? (
          <>
            <span className="custom-select__dot" style={{ background: color }} />
            <span className="custom-select__label">{value}</span>
          </>
        ) : (
          <span className="custom-select__placeholder">— Elige un concepto —</span>
        )}
        <span className="custom-select__arrow">▾</span>
      </button>

      {open && (
        <ul className="custom-select__list" role="listbox">
          {conceptos.map(c => {
            const c_color = grupoMap[c.nombre] || COLOR_DEFAULT
            return (
              <li
                key={c.id}
                role="option"
                aria-selected={c.nombre === value}
                className={`custom-select__option ${c.nombre === value ? 'custom-select__option--selected' : ''}`}
                style={{ borderLeftColor: c_color }}
                onClick={() => { onChange(c.nombre); setOpen(false) }}
              >
                <span className="custom-select__dot" style={{ background: c_color, width: '10px', height: '10px', borderRadius: '3px' }} />
                <span>{c.nombre}</span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default function Home() {
  const [conceptos, setConceptos]   = useState([])
  const [grupoMap,  setGrupoMap]    = useState({})
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
    localStorage.removeItem('session')
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
      const list = Array.isArray(data) ? data : []
      setConceptos(list)
      // mapa nombre → color de grupo
      const map = {}
      list.forEach(c => { if (c.grupo) map[c.nombre] = c.grupo })
      setGrupoMap(map)
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
        <meta name="theme-color" content="#f2f2f7" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Mis Gastos" />
        <link rel="manifest" href="/manifest.json" />
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
                <ConceptoDropdown
                  conceptos={conceptos}
                  grupoMap={grupoMap}
                  value={form.concepto}
                  onChange={v => setField('concepto', v)}
                />
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
                {ultimos.map(g => {
                  const color = grupoMap[g.concepto] || '#e8e8ed'
                  return (
                  <li
                    key={g.id}
                    className={`list__item ${editando === g.id ? 'list__item--active' : ''}`}
                    onClick={() => handleEditar(g)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && handleEditar(g)}
                    aria-label={`Editar ${g.concepto}`}
                    style={{ borderLeft: `3px solid ${color}` }}
                  >
                    <div className="item__dot" style={{ background: color }} />
                    <div className="item__content">
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
                    </div>
                    <span className="item__hint" aria-hidden="true">
                      toca para editar
                    </span>
                  </li>
                )})}

              </ul>
            )}
          </section>

        </main>
      </div>
    </>
  )
}
