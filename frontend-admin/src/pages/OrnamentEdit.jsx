import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../api.js'

const EMPTY = {
  name: '', category_id: '', purity: '', approx_weight_grams: '',
  description: '', making_charge_note: '', is_visible: true
}

export default function OrnamentEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = !id

  const [cats, setCats] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [media, setMedia] = useState([])
  const [modelUrl, setModelUrl] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api.categories().then(setCats)
    if (!isNew) {
      api.ornament(id).then((o) => {
        setForm({
          name: o.name, category_id: o.category_id, purity: o.purity || '',
          approx_weight_grams: o.approx_weight_grams ?? '',
          description: o.description || '', making_charge_note: o.making_charge_note || '',
          is_visible: o.is_visible
        })
        setMedia(o.media || [])
        setModelUrl(o.model_url || '')
      })
    }
  }, [id])

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function save(e) {
    e.preventDefault()
    setBusy(true); setMsg(''); setErr('')
    const payload = {
      name: form.name,
      category_id: Number(form.category_id),
      purity: form.purity || null,
      approx_weight_grams: form.approx_weight_grams ? Number(form.approx_weight_grams) : null,
      description: form.description || null,
      making_charge_note: form.making_charge_note || null,
      is_visible: form.is_visible
    }
    try {
      if (isNew) {
        const created = await api.createOrnament(payload)
        navigate(`/ornaments/${created.id}`, { state: { justCreated: true } })
      } else {
        await api.updateOrnament(id, payload)
        setMsg('Saved successfully.')
      }
    } catch (e2) {
      setErr(e2.message)
    } finally {
      setBusy(false)
    }
  }

  async function onUpload(mediaType, file) {
    setErr(''); setMsg('')
    try {
      await api.uploadMedia(id, mediaType, file)
      const updated = await api.ornament(id)
      setMedia(updated.media || [])
      setModelUrl(updated.model_url || '')
      setMsg('File uploaded.')
    } catch (e2) {
      setErr(e2.message)
    }
  }

  async function onDeleteMedia(m) {
    if (!confirm('Remove this file?')) return
    await api.deleteMedia(m.id)
    const updated = await api.ornament(id)
    setMedia(updated.media || [])
    setModelUrl(updated.model_url || '')
  }

  const photoFiles = media.filter((m) => m.media_type === 'photo')
  const modelFile = media.find((m) => m.media_type === 'model')

  return (
    <div className="page-pad">
      <Link to="/ornaments" className="back-btn">← Back</Link>
      <h2 className="page-title">{isNew ? 'Add New Ornament' : `Edit: ${form.name || id}`}</h2>

      {msg && <div className="msg-ok" style={{ marginBottom: '12px' }}>{msg}</div>}
      {err && <div className="msg-err" style={{ marginBottom: '12px' }}>{err}</div>}

      <form onSubmit={save}>
        <div className="form-card">
          <div className="field">
            <label>Name</label>
            <input value={form.name} onChange={set('name')} required />
          </div>
          <div className="field">
            <label>Category</label>
            <select value={form.category_id} onChange={set('category_id')} required>
              <option value="">Select category…</option>
              {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="row">
            <div className="field">
              <label>Purity</label>
              <input value={form.purity} onChange={set('purity')} placeholder="e.g. 22K" />
            </div>
            <div className="field">
              <label>Approx. Weight (g)</label>
              <input type="number" step="0.01" value={form.approx_weight_grams} onChange={set('approx_weight_grams')} />
            </div>
          </div>
          <div className="field">
            <label>Description</label>
            <textarea value={form.description} onChange={set('description')} />
          </div>
          <div className="field">
            <label>Making Charge Note</label>
            <input value={form.making_charge_note} onChange={set('making_charge_note')} placeholder="e.g. Making charges applicable, ask in store" />
          </div>
          <label className="field" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>Visible to customers</span>
            <input type="checkbox" checked={form.is_visible} onChange={(e) => setForm((f) => ({ ...f, is_visible: e.target.checked }))} />
          </label>
          <button className="btn-primary" type="submit" disabled={busy}>
            {busy ? 'Saving…' : (isNew ? 'Create Ornament' : 'Save Changes')}
          </button>
        </div>
      </form>

      {!isNew && (
        <div className="form-card" style={{ marginTop: '14px' }}>
          <h4 style={{ margin: '0 0 12px', fontFamily: 'var(--serif)' }}>Media</h4>
          <div className="field">
            <label>Upload Photo (JPG/PNG/WEBP)</label>
            <input type="file" accept="image/*" onChange={(e) => e.target.files[0] && onUpload('photo', e.target.files[0])} />
          </div>
          <div className="field">
            <label>Upload 3D Model (GLB)</label>
            <input type="file" accept=".glb,.gltf" onChange={(e) => e.target.files[0] && onUpload('model', e.target.files[0])} />
          </div>

          {modelFile && <div className="msg-ok" style={{ marginBottom: '10px' }}>3D model attached{modelUrl ? ' — customers see the 3D view' : ''}</div>}

          <div className="list">
            {photoFiles.map((m) => (
              <div key={m.id} className="list-item">
                <img className="thumb" src={m.url} alt="" />
                <div className="li-body"><div className="li-meta">Photo</div></div>
                <button className="btn-sm btn-danger-sm" style={{ padding: '6px 12px', fontSize: 12, minHeight: 30 }} onClick={() => onDeleteMedia(m)}>Remove</button>
              </div>
            ))}
            {modelFile && (
              <div className="list-item">
                <div className="thumb" style={{ background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3D</div>
                <div className="li-body"><div className="li-meta">3D Model</div></div>
                <button className="btn-sm btn-danger-sm" style={{ padding: '6px 12px', fontSize: 12, minHeight: 30 }} onClick={() => onDeleteMedia(modelFile)}>Remove</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
