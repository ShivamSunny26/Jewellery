import { useEffect, useState } from 'react'
import { api } from '../api.js'

function formatTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) +
    ', ' + d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
}

function BubbleCard({ title, data, metal }) {
  if (!data) {
    return (
      <div className="bubble-card">
        <h4>{title}</h4>
        <div className="rrow"><span className="k">Rate</span><span>Not set yet</span></div>
      </div>
    )
  }
  return (
    <div className="bubble-card">
      <h4>{title}</h4>
      <div className="rrow"><span className="k">Rate</span><span>₹{Number(data.rate_value).toLocaleString('en-IN')}</span></div>
      <div className="rrow"><span className="k">Unit</span><span>{data.unit}</span></div>
      {data.purity_reference && (
        <div className="rrow"><span className="k">Purity</span><span>{data.purity_reference}</span></div>
      )}
      <div className="upd">Updated: {formatTime(data.updated_at)}</div>
    </div>
  )
}

export default function RateBubbles() {
  const [rates, setRates] = useState(null)
  const [open, setOpen] = useState(null)

  useEffect(() => {
    let active = true
    const load = () =>
      api.rates().then((r) => {
        if (active) setRates(r)
      }).catch(() => {})
    load()
    const id = setInterval(load, 5 * 60 * 1000)
    return () => { active = false; clearInterval(id) }
  }, [])

  return (
    <div className="bubbles">
      {open === 'gold' && <BubbleCard title="Gold Rate" data={rates?.gold} metal="gold" />}
      {open === 'silver' && <BubbleCard title="Silver Rate" data={rates?.silver} metal="silver" />}
      <button
        className={`bubble gold ${open === 'gold' ? 'active' : ''}`}
        aria-label="Gold rate"
        onClick={() => setOpen(open === 'gold' ? null : 'gold')}
      >
        <small>Gold</small>
        {rates?.gold ? `₹${Math.round(rates.gold.rate_value)}` : '₹--'}
      </button>
      <button
        className={`bubble silver ${open === 'silver' ? 'active' : ''}`}
        aria-label="Silver rate"
        onClick={() => setOpen(open === 'silver' ? null : 'silver')}
      >
        <small>Silver</small>
        {rates?.silver ? `₹${rates.silver.rate_value}` : '₹--'}
      </button>
    </div>
  )
}
