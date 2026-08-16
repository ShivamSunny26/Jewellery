import { Link } from 'react-router-dom'

export default function OrnamentCard({ o }) {
  return (
    <Link to={`/ornament/${o.id}`} className="card">
      <img src={o.thumbnail_url} alt={o.name} loading="lazy" />
      <div className="card-body">
        <div className="cname">{o.name}</div>
        <div className="cmeta">
          {o.purity && <span className="pill">{o.purity}</span>}
          {o.approx_weight_grams != null && <span>{o.approx_weight_grams}g</span>}
        </div>
      </div>
    </Link>
  )
}
