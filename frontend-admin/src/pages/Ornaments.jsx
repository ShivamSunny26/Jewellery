import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api.js'

export default function Ornaments() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.ornaments().then(setItems).finally(() => setLoading(false))
  }, [])

  async function toggle(o) {
    const next = !o.is_visible
    await api.setVisibility(o.id, next)
    setItems((prev) => prev.map((x) => (x.id === o.id ? { ...x, is_visible: next } : x)))
  }

  async function del(o) {
    if (!confirm(`Delete "${o.name}"? This cannot be undone.`)) return
    await api.deleteOrnament(o.id)
    setItems((prev) => prev.filter((x) => x.id !== o.id))
  }

  const filtered = items.filter((o) =>
    o.name.toLowerCase().includes(query.toLowerCase()) ||
    (o.category || '').toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="page-pad">
      <h2 className="page-title">Ornaments</h2>
      <div className="actions">
        <input
          style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid rgba(201,162,39,0.25)', borderRadius: 10, padding: '12px', color: 'var(--ivory)', minHeight: 44 }}
          placeholder="Search…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Link to="/ornaments/new" className="btn-sm btn-gold-sm">+ Add New</Link>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty">No ornaments found.</div>
      ) : (
        <div className="list">
          {filtered.map((o) => (
            <div key={o.id} className="list-item" onClick={() => navigate(`/ornaments/${o.id}`)} style={{ cursor: 'pointer' }}>
              {o.photos && o.photos[0] ? (
                <img className="thumb" src={o.photos[0]} alt={o.name} />
              ) : (
                <div className="thumb" style={{ background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>◆</div>
              )}
              <div className="li-body">
                <div className="li-name">{o.name}</div>
                <div className="li-meta">{o.category} · {o.purity || '—'} · {o.approx_weight_grams != null ? `${o.approx_weight_grams}g` : '—'} {o.is_visible ? '' : '· HIDDEN'}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                <label className="toggle" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" checked={o.is_visible} onChange={() => toggle(o)} />
                  <span className="slider" />
                </label>
                <button className="btn-sm btn-danger-sm" style={{ padding: '6px 12px', fontSize: '12px', minHeight: 30 }} onClick={(e) => { e.stopPropagation(); del(o) }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
