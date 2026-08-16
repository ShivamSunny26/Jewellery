import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import OrnamentCard from '../components/OrnamentCard.jsx'

export default function Home() {
  const [cats, setCats] = useState([])
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.categories(), api.ornaments()])
      .then(([c, o]) => {
        setCats(c)
        setFeatured(o)
      })
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

      <div className="section">
        <h3>Featured Pieces</h3>
        {loading ? (
          <div className="loading"><div className="spinner" /></div>
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
