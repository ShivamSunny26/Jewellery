import { useEffect, useState } from 'react'
import { api } from '../api.js'

export default function Settings() {
  const [form, setForm] = useState(null)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    api.settings().then(setForm).catch(() => {})
  }, [])

  if (!form) return <div className="page">Loading…</div>

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const save = async (e) => {
    e.preventDefault()
    setMsg('')
    try {
      const updated = await api.updateSettings(form)
      setForm(updated)
      setMsg('Saved')
    } catch (err) {
      setMsg(err.message)
    }
  }

  return (
    <div className="page">
      <h2>Shop Settings</h2>
      <form onSubmit={save} className="form">
        <label>Shop name<input value={form.shop_name} onChange={(e) => set('shop_name', e.target.value)} /></label>
        <label>Address line 1<input value={form.address_line1} onChange={(e) => set('address_line1', e.target.value)} /></label>
        <label>Address line 2<input value={form.address_line2} onChange={(e) => set('address_line2', e.target.value)} /></label>
        <label>Phone<input value={form.phone} onChange={(e) => set('phone', e.target.value)} /></label>
        <label>WhatsApp phone<input value={form.whatsapp_phone} onChange={(e) => set('whatsapp_phone', e.target.value)} /></label>
        <label>Map embed URL<input value={form.map_embed_url} onChange={(e) => set('map_embed_url', e.target.value)} /></label>
        <label><input type="checkbox" checked={form.show_map} onChange={(e) => set('show_map', e.target.checked)} /> Show map</label>
        <label><input type="checkbox" checked={form.show_whatsapp} onChange={(e) => set('show_whatsapp', e.target.checked)} /> Show WhatsApp</label>
        <label><input type="checkbox" checked={form.show_whatsapp_fab} onChange={(e) => set('show_whatsapp_fab', e.target.checked)} /> Show floating WhatsApp button</label>
        <label><input type="checkbox" checked={form.show_enquiry} onChange={(e) => set('show_enquiry', e.target.checked)} /> Show enquiry</label>
        <button type="submit">Save</button>
        {msg && <p>{msg}</p>}
      </form>
    </div>
  )
}