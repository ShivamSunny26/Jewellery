import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import LineChart from '../components/LineChart.jsx'

const formatINR = (v) => `₹${Math.round(v).toLocaleString('en-IN')}`

function StatCard({ value, label, hint }) {
  return (
    <div className="stat-card">
      <div className="stat-val">{value}</div>
      <div className="stat-lbl">{label}</div>
      {hint && <div className="stat-hint">{hint}</div>}
    </div>
  )
}

function fmtDay(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [history, setHistory] = useState(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    Promise.all([api.stats(), api.rateHistoryPublic(30)])
      .then(([s, h]) => {
        setStats(s)
        setHistory(h)
      })
      .catch((e) => setErr(e.message))
  }, [])

  if (err) return <div className="dash"><div className="msg-err">{err}</div></div>
  if (!stats) return <div className="dash"><div className="loading"><div className="spinner" />Loading dashboard…</div></div>

  const eq = stats.enquiries
  const dayMax = Math.max(1, ...stats.enquiries_per_day.map((d) => d.count))

  return (
    <div className="dash">
      <h2>Dashboard</h2>

      <div className="stat-grid">
        <StatCard value={stats.ornaments.total} label="Ornaments" hint={`${stats.ornaments.visible} live · ${stats.ornaments.hidden} hidden`} />
        <StatCard value={eq.new} label="New enquiries" hint={`${eq.last_7_days} in last 7 days`} />
        <StatCard value={stats.categories} label="Categories" hint={`${stats.media.photos} photos · ${stats.media.models} models`} />
        <StatCard value={eq.resolved} label="Resolved" hint={`${eq.total} all time`} />
      </div>

      <div className="panel">
        <div className="panel-head">
          <h3>Today's rates</h3>
          <Link to="/rates" className="link-sm">Update →</Link>
        </div>
        <div className="rate-row">
          <div className="rate-mini">
            <span className="lbl">Gold</span>
            <span className="val">{stats.rates.gold ? formatINR(stats.rates.gold.rate_value) : '—'}</span>
          </div>
          <div className="rate-mini">
            <span className="lbl">Silver</span>
            <span className="val">{stats.rates.silver ? formatINR(stats.rates.silver.rate_value) : '—'}</span>
          </div>
        </div>
        <div className="chart-box">
          {history && (history.gold.length > 0 || history.silver.length > 0) ? (
            <LineChart
              height={150}
              format={formatINR}
              series={[
                { key: 'gold', label: 'Gold', color: '#C9A227', points: history.gold },
                { key: 'silver', label: 'Silver', color: '#C7CCD1', points: history.silver }
              ]}
            />
          ) : (
            <div className="empty" style={{ padding: '18px' }}>No rate history yet.</div>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h3>Enquiries · last 30 days</h3>
          <Link to="/enquiries" className="link-sm">Inbox →</Link>
        </div>
        <div className="bars" aria-hidden="true">
          {stats.enquiries_per_day.map((d) => (
            <div className="bar-col" key={d.date} title={`${d.date}: ${d.count}`}>
              <div
                className={`bar ${d.count ? 'on' : ''}`}
                style={{ height: `${Math.max(6, (d.count / dayMax) * 100)}%` }}
              />
            </div>
          ))}
        </div>
        <div className="bars-axis">
          <span>{fmtDay(stats.enquiries_per_day[0].date)}</span>
          <span>today</span>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h3>Top categories</h3>
          <Link to="/categories" className="link-sm">Manage →</Link>
        </div>
        {stats.top_categories.length === 0 ? (
          <div className="empty" style={{ padding: '14px' }}>No categories yet.</div>
        ) : (
          stats.top_categories.map((c) => (
            <div className="top-row" key={c.name}>
              <span>{c.name}</span>
              <span className="top-count">{c.count}</span>
            </div>
          ))
        )}
      </div>

      {stats.recent_enquiries.length > 0 && (
        <div className="panel">
          <div className="panel-head">
            <h3>Recent enquiries</h3>
            <Link to="/enquiries" className="link-sm">All →</Link>
          </div>
          {stats.recent_enquiries.map((e) => (
            <div className="recent-eq" key={e.id}>
              <div>
                <div className="re-name">
                  {e.customer_name}{' '}
                  <span className={`status-tag ${e.status}`}>{e.status}</span>
                </div>
                <div className="re-meta">
                  {e.ornament_name ? `About: ${e.ornament_name} · ` : ''}{fmtDay(e.created_at)}
                </div>
              </div>
              <a className="btn-sm btn-ghost-sm" href={`tel:${e.customer_phone}`}>Call</a>
            </div>
          ))}
        </div>
      )}

      <div className="dash-grid" style={{ marginTop: 16 }}>
        <Link to="/rates" className="dash-tile">
          <div className="ico">₹</div>
          <div className="lbl">Update Rates</div>
          <div className="sub">Gold &amp; Silver</div>
        </Link>
        <Link to="/ornaments" className="dash-tile">
          <div className="ico">◆</div>
          <div className="lbl">Manage Ornaments</div>
          <div className="sub">Catalogue</div>
        </Link>
        <Link to="/categories" className="dash-tile">
          <div className="ico">🏷️</div>
          <div className="lbl">Manage Categories</div>
          <div className="sub">Organize pieces</div>
        </Link>
        <Link to="/enquiries" className="dash-tile">
          <div className="ico">✉️</div>
          <div className="lbl">Enquiries</div>
          {eq.new > 0 ? <div className="badge">{eq.new} new</div> : <div className="sub">Inbox</div>}
        </Link>
      </div>
    </div>
  )
}
