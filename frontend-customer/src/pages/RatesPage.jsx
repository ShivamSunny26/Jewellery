import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import LineChart from '../components/LineChart.jsx'
import { LineSkeleton } from '../components/Skeletons.jsx'
import { formatINR } from '../lib/price.js'

function formatTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return (
    d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ', ' +
    d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
  )
}

function MetalCard({ title, info, color }) {
  return (
    <div className="rate-card" style={{ borderColor: color }}>
      <div className="rate-metal" style={{ color }}>{title}</div>
      <div className="rate-value">
        {info ? formatINR(info.rate_value) : '—'}
      </div>
      <div className="rate-unit">{info ? info.unit : 'Rate not set yet'}</div>
      {info?.purity_reference && <div className="rate-purity">{info.purity_reference}</div>}
      {info && <div className="rate-updated">Updated {formatTime(info.updated_at)}</div>}
    </div>
  )
}

export default function RatesPage() {
  const [rates, setRates] = useState(null)
  const [history, setHistory] = useState(null)
  const [err, setErr] = useState(null)

  useEffect(() => {
    document.title = `Today's Gold & Silver Rates · Shree Om Jwellers`
    Promise.all([api.rates(), api.rateHistory(30)])
      .then(([current, hist]) => {
        setRates(current)
        setHistory(hist)
      })
      .catch((e) => setErr(e.message))
  }, [])

  return (
    <>
      <div className="page-head">
        <h2>Today's Rates</h2>
        <p className="sub">Gold &amp; silver rates as updated by the shop.</p>
      </div>

      {err ? (
        <div className="error-box">Could not load rates. Please try again.</div>
      ) : !rates ? (
        <>
          <LineSkeleton height={90} />
          <div style={{ height: 12 }} />
          <LineSkeleton height={160} />
        </>
      ) : (
        <>
          <div className="rate-cards">
            <MetalCard title="Gold" info={rates.gold} color="var(--gold)" />
            <MetalCard title="Silver" info={rates.silver} color="var(--silver)" />
          </div>

          <div className="section">
            <h3>Last 30 days</h3>
            <div className="chart-card">
              {!history || (!history.gold.length && !history.silver.length) ? (
                <div className="chart-empty">
                  Rate history starts from today — check back soon for trends.
                </div>
              ) : (
                <LineChart
                  format={formatINR}
                  series={[
                    { key: 'gold', label: 'Gold', color: '#C9A227', points: history.gold },
                    { key: 'silver', label: 'Silver', color: '#C7CCD1', points: history.silver }
                  ]}
                />
              )}
            </div>
            <p className="note">
              Rates are indicative and may differ at the counter. Making charges,
              stone charges and GST are extra.
            </p>
          </div>

          <div className="cta-row">
            <Link to="/enquire" className="btn-enquire">Ask about today's rate</Link>
            <Link to="/store" className="btn-visit">Visit Our Store</Link>
          </div>
        </>
      )}
    </>
  )
}
