import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import OrnamentCard from '../components/OrnamentCard.jsx'
import { GridSkeleton } from '../components/Skeletons.jsx'
import { getRecent } from '../lib/store.js'

export default function Home() {
  const [cats, setCats] = useState([])
  const [featured, setFeatured] = useState([])
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  useEffect(() => {
    document.title = 'Shree Om Jwellers — Gold & Silver Jewellery Catalogue'
    setRecent(getRecent())
    Promise.all([
      api.categories(),
      api.ornaments({ sort: 'newest', page_size: 6 })
    ])
      .then(([c, o]) => {
        setCats(c)
        setFeatured(o.items)
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <div className="hero">
        <h1>Handcrafted <em>jewellery</em> for life's golden moments</h1>
        <p>Browse our collection, explore pieces in 3D, and visit us in store to purchase.</p>
        <div className="hero-banner">
          <div className="banner-text">
            <h2>Explore the Collection</h2>
            <p>Rings · Necklaces · Bangles · Earrings · Bridal</p>
            <Link to="/category/necklaces" className="btn-gold">Browse Now</Link>
          </div>
        </div>
      </div>

      <div className="section">
        <h3>Categories</h3>
      </div>
      <div className="chips">
        {cats.map((c) => (
          <Link key={c.id} to={`/category/${c.slug}`} className="chip">{c.name}</Link>
        ))}
      </div>

      {recent.length > 0 && (
        <>
          <div className="section">
            <h3>Recently Viewed</h3>
          </div>
          <div className="recent-strip">
            {recent.map((r) => (
              <Link key={r.id} to={`/ornament/${r.id}`} className="recent-item">
                {r.thumbnail ? (
                  <img src={r.thumbnail} alt={r.name} loading="lazy" />
                ) : (
                  <div className="card-fallback small" aria-hidden="true">SOJ</div>
                )}
                <span>{r.name}</span>
              </Link>
            ))}
          </div>
        </>
      )}

      <div className="section">
        <div className="section-head">
          <h3>Latest Pieces</h3>
          <Link to="/search" className="link-btn">View all</Link>
        </div>
        {err ? (
          <div className="error-box">
            Could not load the collection.{' '}
            <button className="link-btn" onClick={() => window.location.reload()}>Retry</button>
          </div>
        ) : loading ? (
          <GridSkeleton count={4} />
        ) : featured.length === 0 ? (
          <div className="empty">Collection coming soon. Visit us in store.</div>
        ) : (
          <div className="grid">
            {featured.map((o) => <OrnamentCard key={o.id} o={o} />)}
          </div>
        )}
      </div>
    </>
  )
}
