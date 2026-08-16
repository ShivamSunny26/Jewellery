import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api.js'
import OrnamentCard from '../components/OrnamentCard.jsx'

const TITLES = {
  rings: 'Rings', necklaces: 'Necklaces', bangles: 'Bangles',
  earrings: 'Earrings', 'bridal-sets': 'Bridal Sets'
}

export default function CategoryPage() {
  const { slug } = useParams()
  const [cats, setCats] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([api.categories(), api.ornaments(slug)])
      .then(([c, o]) => { setCats(c); setItems(o) })
      .finally(() => setLoading(false))
  }, [slug])

  const title = TITLES[slug] || slug.replace('-', ' ')

  return (
    <>
      <div className="page-head">
        <h2>{title}</h2>
        <p className="sub">{items.length} piece(s)</p>
      </div>
      <div className="chips">
        <Link to="/" className="chip">All</Link>
        {cats.map((c) => (
          <Link key={c.id} to={`/category/${c.slug}`} className={`chip ${c.slug === slug ? 'active' : ''}`}>{c.name}</Link>
        ))}
      </div>
      <div className="section">
        {loading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : items.length === 0 ? (
          <div className="empty">No pieces in this category right now. Ask us in store.</div>
        ) : (
          <div className="grid">
            {items.map((o) => <OrnamentCard key={o.id} o={o} />)}
          </div>
        )}
      </div>
    </>
  )
}
