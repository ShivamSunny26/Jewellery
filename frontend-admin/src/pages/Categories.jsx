import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'

export default function Categories() {
  const [cats, setCats] = useState([])
  const [name, setName] = useState('')
  const [editId, setEditId] = useState(null)
  const [editName, setEditName] = useState('')
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')

  function load() {
    api.categories().then(setCats)
  }
  useEffect(load, [])

  async function add(e) {
    e.preventDefault()
    setErr(''); setMsg('')
    try {
      await api.createCategory({ name })
      setName('')
      setMsg('Category added.')
      load()
    } catch (e2) { setErr(e2.message) }
  }

  async function saveEdit() {
    setErr(''); setMsg('')
    try {
      await api.updateCategory(editId, { name: editName })
      setEditId(null)
      setMsg('Category updated.')
      load()
    } catch (e2) { setErr(e2.message) }
  }

  async function del(c) {
    if (!confirm(`Delete category "${c.name}"?`)) return
    setErr(''); setMsg('')
    try {
      await api.deleteCategory(c.id)
      setMsg('Category deleted.')
      load()
    } catch (e2) { setErr(e2.message) }
  }

  return (
    <div className="page-pad">
      <Link to="/" className="back-btn">← Back</Link>
      <h2 className="page-title">Categories</h2>

      {msg && <div className="msg-ok" style={{ marginBottom: '12px' }}>{msg}</div>}
      {err && <div className="msg-err" style={{ marginBottom: '12px' }}>{err}</div>}

      <form onSubmit={add} className="form-card" style={{ marginBottom: '14px' }}>
        <div className="field">
          <label>New Category Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Bridal Sets" required />
        </div>
        <button className="btn-primary" type="submit">Add Category</button>
      </form>

      <div className="list">
        {cats.map((c) => (
          <div key={c.id} className="list-item">
            {editId === c.id ? (
              <>
                <input
                  style={{ flex: 1, background: 'var(--bg)', border: '1px solid rgba(201,162,39,0.25)', borderRadius: 10, padding: 10, color: 'var(--ivory)' }}
                  value={editName} onChange={(e) => setEditName(e.target.value)}
                />
                <button className="btn-sm btn-gold-sm" onClick={saveEdit}>Save</button>
              </>
            ) : (
              <>
                <div className="li-body">
                  <div className="li-name">{c.name}</div>
                  <div className="li-meta">/{c.slug}</div>
                </div>
                <button className="btn-sm btn-ghost-sm" style={{ padding: '6px 12px', fontSize: 12, minHeight: 30 }} onClick={() => { setEditId(c.id); setEditName(c.name) }}>Edit</button>
                <button className="btn-sm btn-danger-sm" style={{ padding: '6px 12px', fontSize: 12, minHeight: 30 }} onClick={() => del(c)}>Delete</button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
