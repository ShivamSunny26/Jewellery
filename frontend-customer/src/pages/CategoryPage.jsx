import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api.js'
import OrnamentExplorer from '../components/OrnamentExplorer.jsx'

export default function CategoryPage() {
  const { slug } = useParams()
  const [cats, setCats] = useState([])
  const [title, setTitle] = useState('')

  useEffect(() => {
    let cancelled = false
    api.categories()
      .then((all) => {
        if (cancelled) return
        setCats(all)
        const match = all.find((c) => c.slug === slug)
        setTitle(match ? match.name : slug.replace(/-/g, ' '))
      })
      .catch(() => setTitle(slug.replace(/-/g, ' ')))
    return () => {
      cancelled = true
    }
  }, [slug])

  useEffect(() => {
    document.title = `${title || 'Collection'} · Shree Om Jwellers`
  }, [title])

  return (
    <>
      <div className="page-head">
        <h2>{title}</h2>
        <p className="sub">Handpicked pieces, available to view in store.</p>
      </div>
      <div className="chips">
        {cats.map((c) => (
          <Link
            key={c.id}
            to={`/category/${c.slug}`}
            className={`chip ${c.slug === slug ? 'active' : ''}`}
          >
            {c.name}
          </Link>
        ))}
        <Link to="/search" className="chip">All</Link>
      </div>
      <OrnamentExplorer category={slug} />
    </>
  )
}
