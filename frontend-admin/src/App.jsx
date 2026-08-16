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

function AuthGuard({ children }) {
  const [status, setStatus] = useState('loading')
  useEffect(() => {
    api.me().then(() => setStatus('ok')).catch(() => setStatus('noauth'))
  }, [])
  if (status === 'loading') return <div className="wrap"><div className="loading"><div className="spinner" />Checking session…</div></div>
  if (status === 'noauth') return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [admin, setAdmin] = useState(null)

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
            {admin?.username || 'Admin'}
            <button onClick={onLogout} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', marginLeft: '10px', fontSize: '12px' }}>Logout</button>
          </div>
        </header>
      )}
      <Routes>
        <Route path="/login" element={<Login onLogin={onLogin} />} />
        <Route path="/" element={<AuthGuard><Dashboard onLogout={onLogout} /></AuthGuard>} />
        <Route path="/ornaments" element={<AuthGuard><Ornaments /></AuthGuard>} />
        <Route path="/ornaments/new" element={<AuthGuard><OrnamentEdit /></AuthGuard>} />
        <Route path="/ornaments/:id" element={<AuthGuard><OrnamentEdit /></AuthGuard>} />
        <Route path="/categories" element={<AuthGuard><Categories /></AuthGuard>} />
        <Route path="/rates" element={<AuthGuard><Rates /></AuthGuard>} />
        <Route path="/enquiries" element={<AuthGuard><Enquiries /></AuthGuard>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {location.pathname !== '/login' && (
        <footer style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: 'var(--muted)' }}>
          © 2026 Shivam@. All rights reserved.
        </footer>
      )}
    </div>
  )
}
