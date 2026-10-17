import { Routes, Route, Navigate, useNavigate, Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { api } from './api.js'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Ornaments from './pages/Ornaments.jsx'
import OrnamentEdit from './pages/OrnamentEdit.jsx'
import Categories from './pages/Categories.jsx'
import Rates from './pages/Rates.jsx'
import Enquiries from './pages/Enquiries.jsx'
import Account from './pages/Account.jsx'

function AuthGuard({ children }) {
  const [status, setStatus] = useState('loading')
  useEffect(() => {
    let cancelled = false
    api.me()
      .then(() => { if (!cancelled) setStatus('ok') })
      .catch(() => { if (!cancelled) setStatus('noauth') })
    return () => { cancelled = true }
  }, [])
  if (status === 'loading') return <div className="wrap"><div className="loading"><div className="spinner" />Checking session…</div></div>
  if (status === 'noauth') return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [admin, setAdmin] = useState(null)

  useEffect(() => {
    let cancelled = false
    api.me()
      .then((a) => { if (!cancelled) setAdmin(a) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const on401 = () => {
      setAdmin(null)
      if (window.location.pathname !== '/login') navigate('/login', { replace: true })
    }
    window.addEventListener('auth:401', on401)
    return () => window.removeEventListener('auth:401', on401)
  }, [navigate])

  const onLogin = (a) => { setAdmin(a); navigate('/') }

  async function onLogout() {
    try { await api.logout() } catch {}
    setAdmin(null)
    navigate('/login')
  }

  if (location.pathname === '/login' && admin) return <Navigate to="/" replace />

  return (
    <div className="wrap">
      {location.pathname !== '/login' && (
        <header className="ahead">
          <Link to="/" className="brand">Shree <span>Om</span> Jwellers</Link>
          <div className="who">
            <Link to="/account" className="who-link" title="Account settings">
              {admin?.username || 'Admin'}
              {admin?.full_name ? ` (${admin.full_name})` : ''}
            </Link>
            <button onClick={onLogout} className="logout-btn">Logout</button>
          </div>
        </header>
      )}
      <Routes>
        <Route path="/login" element={<Login onLogin={onLogin} />} />
        <Route path="/" element={<AuthGuard><Dashboard /></AuthGuard>} />
        <Route path="/ornaments" element={<AuthGuard><Ornaments /></AuthGuard>} />
        <Route path="/ornaments/new" element={<AuthGuard><OrnamentEdit /></AuthGuard>} />
        <Route path="/ornaments/:id" element={<AuthGuard><OrnamentEdit /></AuthGuard>} />
        <Route path="/categories" element={<AuthGuard><Categories /></AuthGuard>} />
        <Route path="/rates" element={<AuthGuard><Rates /></AuthGuard>} />
        <Route path="/enquiries" element={<AuthGuard><Enquiries /></AuthGuard>} />
        <Route path="/account" element={<AuthGuard><Account admin={admin} onProfileUpdate={setAdmin} /></AuthGuard>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {location.pathname !== '/login' && (
        <footer className="afoot">© 2026 Shivam@. All rights reserved.</footer>
      )}
    </div>
  )
}
