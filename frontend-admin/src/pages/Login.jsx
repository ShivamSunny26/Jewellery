import { useState } from 'react'
import { api } from '../api.js'

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setErr('')
    try {
      const admin = await api.login(username, password)
      onLogin(admin)
    } catch (e2) {
      setErr(e2.message === 'Invalid username or password'
        ? 'Invalid username or password'
        : e2.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-card">
      <div className="login-brand">Shree <span>Om</span> Jwellers</div>
      <div className="login-sub">Admin Panel</div>
      <div className="form-card">
        <form onSubmit={submit}>
          {err && <div className="msg-err" style={{ marginBottom: '12px' }}>{err}</div>}
          <div className="field">
            <label>Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
          </div>
          <button className="btn-primary" type="submit" disabled={busy}>
            {busy ? 'Logging in…' : 'Login'}
          </button>
        </form>
      </div>
      <div style={{ marginTop: '16px', fontSize: '12px', color: 'var(--muted)', textAlign: 'center' }}>
        © 2026 Shivam@. All rights reserved.
      </div>
    </div>
  )
}
