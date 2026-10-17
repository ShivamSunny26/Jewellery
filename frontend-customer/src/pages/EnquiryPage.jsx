import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api.js'
import { telLink, waLink } from '../lib/shop.js'

export default function EnquiryPage() {
  const [params] = useSearchParams()
  const ornamentId = params.get('ornament')

  const [ornamentName, setOrnamentName] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('idle')

  useEffect(() => {
    document.title = `Enquire · Shree Om Jwellers`
    if (ornamentId) {
      api.ornament(ornamentId)
        .then((o) => {
          setOrnamentName(o.name)
          setMessage(`I'd like to know more about the "${o.name}".`)
        })
        .catch(() => {})
    }
  }, [ornamentId])

  async function submit(e) {
    e.preventDefault()
    setStatus('sending')
    try {
      await api.enquiry({
        ornament_id: ornamentId ? Number(ornamentId) : null,
        customer_name: name,
        customer_phone: phone,
        message
      })
      setStatus('ok')
    } catch (err) {
      setStatus('error')
    }
  }

  const waText = ornamentName
    ? `Hello! I'd like to know more about "${ornamentName}".`
    : 'Hello! I have a question about your jewellery.'

  return (
    <div style={{ padding: '16px 16px 24px' }}>
      <div className="page-head" style={{ padding: 0, marginBottom: '6px' }}>
        <h2 style={{ margin: 0, fontFamily: 'var(--serif)' }}>Enquire</h2>
        <p className="sub" style={{ marginTop: '4px' }}>
          {ornamentName ? `About: ${ornamentName}` : 'Send us your question — no account needed.'}
        </p>
      </div>

      <div className="quick-contact">
        <a className="whatsapp" href={waLink(waText)} target="_blank" rel="noreferrer">WhatsApp</a>
        <a className="call" href={telLink()}>Call Shop</a>
      </div>

      <div className="form-card">
        {status === 'ok' ? (
          <div className="msg-ok">Thanks! Your enquiry has been sent. We'll get back to you soon.</div>
        ) : status === 'error' ? (
          <div className="msg-err">Something went wrong. Please try again or call us directly.</div>
        ) : (
          <form onSubmit={submit}>
            <div className="field">
              <label>Your Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Riya Shah" />
            </div>
            <div className="field">
              <label>Phone Number</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                type="tel"
                inputMode="tel"
                minLength={7}
                maxLength={15}
                pattern="[0-9+ ]{7,15}"
                title="Enter a valid phone number (7–15 digits)"
                placeholder="e.g. 9876543210"
              />
            </div>
            <div className="field">
              <label>Message</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us what you're looking for…" />
            </div>
            <button className="submit-btn" type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending…' : 'Send Enquiry'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
