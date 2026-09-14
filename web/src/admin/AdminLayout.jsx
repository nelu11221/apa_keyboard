import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'

import { adminSession, api } from '../api.js'
import { Logo } from '../components/Icons.jsx'

const LINKS = [
  { to: '/admin', label: 'Panou general', end: true },
  { to: '/admin/orders', label: 'Comenzi' },
  { to: '/admin/products', label: 'Produse' },
  { to: '/admin/algorithms', label: 'Algoritmi de căutare' },
  { to: '/admin/settings', label: 'Setări' },
]

// Panoul e protejat: fără un token valid (emis de backend după parolă) se
// afișează doar formularul de autentificare. Orice răspuns 401 de la API
// șterge tokenul și readuce formularul.
export default function AdminLayout() {
  const [status, setStatus] = useState('checking') // 'checking' | 'login' | 'ok'
  const [configured, setConfigured] = useState(true)

  useEffect(() => {
    const onLogout = () => setStatus('login')
    window.addEventListener('nexa-admin-logout', onLogout)
    if (!adminSession.get()) {
      setStatus('login')
      api.admin.session().then((s) => setConfigured(s.configured)).catch(() => {})
    } else {
      api.admin.session()
        .then((s) => { setConfigured(s.configured); setStatus(s.authenticated ? 'ok' : 'login') })
        .catch(() => setStatus('login'))
    }
    return () => window.removeEventListener('nexa-admin-logout', onLogout)
  }, [])

  function logout() {
    adminSession.clear()
    setStatus('login')
  }

  if (status === 'checking') return <div className="admin-login"><p className="muted">Se verifică sesiunea…</p></div>
  if (status === 'login') return <Login configured={configured} onSuccess={() => setStatus('ok')} />

  return (
    <div className="admin">
      <aside className="admin-side">
        <Link to="/" className="admin-brand"><Logo dark /> <span className="admin-brand-tag">admin</span></Link>
        <nav className="admin-nav">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end}>{link.label}</NavLink>
          ))}
        </nav>
        <div className="admin-side-foot">
          <button type="button" className="admin-logout" onClick={logout}>Deconectare</button>
          <Link to="/" className="admin-back">← Înapoi la magazin</Link>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}

function Login({ configured, onSuccess }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const { token } = await api.admin.login(password)
      adminSession.set(token)
      onSuccess()
    } catch (requestError) {
      setError(requestError.message === 'Parolă greșită.' ? 'Parolă greșită.' : requestError.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin-login">
      <form className="admin-login-card" onSubmit={submit}>
        <Link to="/" className="admin-brand admin-brand-light"><Logo /> <span className="admin-brand-tag">admin</span></Link>
        <h1>Autentificare</h1>
        <p className="muted">Panoul de administrare este disponibil doar cu parolă.</p>
        {!configured && (
          <p className="notice notice-error">
            Serverul nu are setată variabila <code>ADMIN_PASSWORD</code>; panoul nu poate fi accesat.
          </p>
        )}
        <label>
          Parolă
          <input
            type="password"
            autoComplete="current-password"
            autoFocus
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <p className="notice notice-error">{error}</p>}
        <button type="submit" className="btn btn-orange btn-block" disabled={busy || !configured}>
          {busy ? 'SE VERIFICĂ…' : 'INTRĂ'}
        </button>
        <Link to="/" className="admin-login-back">← Înapoi la magazin</Link>
      </form>
    </div>
  )
}
