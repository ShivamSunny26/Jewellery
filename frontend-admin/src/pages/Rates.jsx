import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'

function fmtTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ' ' +
    d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
}

export default function Rates() {
  const [gold, setGold] = useState('')
  const [silver, setSilver] = useState('')
  const [goldHist, setGoldHist] = useState([])
  const [silverHist, setSilverHist] = useState([])
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  function load() {
    api.rateHistory('gold').then(setGoldHist)
    api.rateHistory('silver').then(setSilverHist)
    fetch('/api/v1/rates/current').then((r) => r.json()).then((cur) => {
      if (cur.gold) setGold(String(cur.gold.rate_value))
      if (cur.silver) setSilver(String(cur.silver.rate_value))
    }).catch(() => {})
  }
  useEffect(load, [])

  async function save(e) {
    e.preventDefault()
    setBusy(true); setMsg(''); setErr('')
    try {
      await api.setRate({ metal: 'gold', rate_value: Number(gold), purity_reference: '22K' })
      await api.setRate({ metal: 'silver', rate_value: Number(silver), purity_reference: '92.5' })
      setMsg('Rates updated. The bubbles on the customer site are now live.')
      load()
    } catch (e2) { setErr(e2.message) } finally { setBusy(false) }
  }

  return (
    <div className="page-pad">
      <Link to="/" className="back-btn">← Back</Link>
      <h2 className="page-title">Update Rates</h2>

      {msg && <div className="msg-ok" style={{ marginBottom: '12px' }}>{msg}</div>}
      {err && <div className="msg-err" style={{ marginBottom: '12px' }}>{err}</div>}

      <form onSubmit={save} className="form-card">
        <div className="field">
          <label>Gold Rate (₹ per gram, 22K)</label>
          <input type="number" step="0.01" value={gold} onChange={(e) => setGold(e.target.value)} required />
        </div>
        <div className="field">
          <label>Silver Rate (₹ per gram)</label>
          <input type="number" step="0.01" value={silver} onChange={(e) => setSilver(e.target.value)} required />
        </div>
        <button className="btn-primary" type="submit" disabled={busy}>
          {busy ? 'Saving…' : 'Save Rate'}
        </button>
      </form>

      <div style={{ marginTop: '20px' }}>
        <h3 style={{ fontFamily: 'var(--serif)', margin: '0 0 10px' }}>Gold Rate History</h3>
        <div className="form-card">
          {goldHist.length === 0 ? <div className="empty">No history yet.</div> : goldHist.map((h) => (
            <div key={h.id} className="history-item">
              <span className="h-val">₹{h.rate_value} <span className={h.is_active ? 'h-active' : ''}>{h.is_active ? '(active)' : ''}</span></span>
              <span className="h-time">{fmtTime(h.created_at)}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3 style={{ fontFamily: 'var(--serif)', margin: '0 0 10px' }}>Silver Rate History</h3>
        <div className="form-card">
          {silverHist.length === 0 ? <div className="empty">No history yet.</div> : silverHist.map((h) => (
            <div key={h.id} className="history-item">
              <span className="h-val">₹{h.rate_value} <span className={h.is_active ? 'h-active' : ''}>{h.is_active ? '(active)' : ''}</span></span>
              <span className="h-time">{fmtTime(h.created_at)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
