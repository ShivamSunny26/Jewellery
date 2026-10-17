import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useWishlist } from '../lib/store.js'

export default function OrnamentCard({ o }) {
  const { has, toggle } = useWishlist()
  const [broken, setBroken] = useState(false)
  const wished = has(o.id)
  const showImg = o.thumbnail_url && !broken

  return (
    <Link to={`/ornament/${o.id}`} className="card">
      {showImg ? (
        <img
          src={o.thumbnail_url}
          alt={o.name}
          loading="lazy"
          onError={() => setBroken(true)}
        />
      ) : (
        <div className="card-fallback" aria-hidden="true">SOJ</div>
      )}
      <button
        type="button"
        className={`heart ${wished ? 'active' : ''}`}
        aria-pressed={wished}
        aria-label={wished ? `Remove ${o.name} from wishlist` : `Add ${o.name} to wishlist`}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          toggle(o)
        }}
      >
        {wished ? '♥' : '♡'}
      </button>
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
