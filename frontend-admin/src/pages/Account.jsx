import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'

export default function Account({ admin, onProfileUpdate }) {
  const [fullName, setFullName] = useState(admin?.full_name || '')
  const [profileMsg, setProfileMsg] = useState('')
  const [profileErr, setProfileErr] = useState('')

  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [pwdMsg, setPwdMsg] = useState('')
  const [pwdErr, setPwdErr] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (admin?.full_name) setFullName(admin.full_name)
  }, [admin])

  async function saveProfile(e) {
    e.preventDefault()
    setProfileMsg('')
    setProfileErr('')
    try {
      const updated = await api.updateProfile(fullName.trim() || null)
      onProfileUpdate?.(updated)
      setProfileMsg('Profile updated.')
    } catch (e2) {
      setProfileErr(e2.message)
    }
  }

  async function changePassword(e) {
    e.preventDefault()
    setPwdMsg('')
    setPwdErr('')
    if (next !== confirm) {
      setPwdErr('New passwords do not match.')
      return
    }
    setBusy(true)
    try {
      await api.changePassword(current, next)
      setPwdMsg('Password changed. Use it next time you log in.')
      setCurrent('')
      setNext('')
      setConfirm('')
    } catch (e2) {
      setPwdErr(e2.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page-pad">
      <Link to="/" className="back-btn">← Back</Link>
      <h2 className="page-title">Account</h2>

      <div className="form-card" style={{ marginBottom: 16 }}>
        <h3 style={{ fontFamily: 'var(--serif)', margin: '0 0 12px', fontSize: 17 }}>Profile</h3>
        {profileMsg && <div className="msg-ok" style={{ marginBottom: 12 }}>{profileMsg}</div>}
        {profileErr && <div className="msg-err" style={{ marginBottom: 12 }}>{profileErr}</div>}
        <form onSubmit={saveProfile}>
          <div className="field">
            <label>Username</label>
            <input value={admin?.username || ''} disabled />
          </div>
          <div className="field">
            <label>Display name</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              maxLength={100}
              placeholder="e.g. Shop Owner"
            />
          </div>
          <button className="btn-secondary" type="submit">Save Profile</button>
        </form>
      </div>

      <div className="form-card">
        <h3 style={{ fontFamily: 'var(--serif)', margin: '0 0 12px', fontSize: 17 }}>Change Password</h3>
        {pwdMsg && <div className="msg-ok" style={{ marginBottom: 12 }}>{pwdMsg}</div>}
        {pwdErr && <div className="msg-err" style={{ marginBottom: 12 }}>{pwdErr}</div>}
        <form onSubmit={changePassword}>
          <div className="field">
            <label>Current password</label>
            <input
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <div className="field">
            <label>New password (min 8 characters)</label>
            <input
              type="password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              required
            />
          </div>
          <div className="field">
            <label>Confirm new password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              required
            />
          </div>
          <button className="btn-primary" type="submit" disabled={busy}>
            {busy ? 'Changing…' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
