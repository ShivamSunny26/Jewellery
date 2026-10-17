import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'

function fmtTime(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ' ' +
    d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
}

function waNumber(phone) {
  const digits = String(phone || '').replace(/\D/g, '')
  if (digits.length >= 12 && digits.startsWith('91')) return digits
  if (digits.length === 10) return `91${digits}`
  if (digits.length === 11 && digits.startsWith('0')) return `91${digits.slice(1)}`
  return digits
}

export default function Enquiries() {
  const [filter, setFilter] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  function load() {
    setLoading(true)
    api.enquiries(filter || undefined).then(setItems).finally(() => setLoading(false))
  }
  useEffect(load, [filter])

  async function setStatus(e, status) {
    try {
      await api.setEnquiryStatus(e.id, status)
      load()
    } catch (err) {
      alert(`Could not update enquiry: ${err.message}`)
    }
  }

  const filters = [['', 'All'], ['new', 'New'], ['read', 'Read'], ['resolved', 'Resolved']]

  return (
    <div className="page-pad">
      <Link to="/" className="back-btn">← Back</Link>
      <h2 className="page-title">Enquiries</h2>

      <div className="chips" style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {filters.map(([val, label]) => (
          <button
            key={val}
            className="chip"
            onClick={() => setFilter(val)}
            style={{
              padding: '10px 14px', borderRadius: 999, border: '1px solid rgba(201,162,39,0.3)',
              background: filter === val ? 'linear-gradient(135deg, var(--gold), var(--gold-2))' : 'var(--bg-card)',
              color: filter === val ? '#201a08' : 'var(--ivory)', cursor: 'pointer', fontWeight: 600, fontSize: 13
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : items.length === 0 ? (
        <div className="empty">No enquiries here.</div>
      ) : (
        <div className="list">
          {items.map((e) => (
            <div key={e.id} className={`list-item eq-item ${e.status === 'new' ? 'unread' : ''}`} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <div className="eq-top">
                <span className="eq-name">{e.customer_name} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>· {e.customer_phone}</span></span>
                <span className="eq-time">{fmtTime(e.created_at)}</span>
              </div>
              {e.ornament_name && <div className="li-meta">Regarding: {e.ornament_name}</div>}
              {e.message && <div className="eq-msg">{e.message}</div>}
              <div className="eq-actions">
                <a className="btn-sm btn-gold-sm" href={`tel:${e.customer_phone}`} style={{ textAlign: 'center' }}>Call</a>
                <a className="btn-sm btn-ghost-sm" href={`https://wa.me/${waNumber(e.customer_phone)}`} target="_blank" rel="noreferrer" style={{ textAlign: 'center' }}>WhatsApp</a>
                {e.status !== 'resolved' && (
                  <button className="btn-sm btn-ghost-sm" onClick={() => setStatus(e, 'resolved')}>Mark Resolved</button>
                )}
                {e.status === 'new' && (
                  <button className="btn-sm btn-ghost-sm" onClick={() => setStatus(e, 'read')}>Mark Read</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
