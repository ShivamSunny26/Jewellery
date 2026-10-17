import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { api } from '../api.js'
import { useWishlist } from '../lib/store.js'

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <line x1="16.5" y1="16.5" x2="21" y2="21" />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <path d="M12 20s-7-4.6-7-9.4A4 4 0 0 1 12 7a4 4 0 0 1 7 3.6C19 15.4 12 20 12 20z" />
    </svg>
  )
}

export default function Header({ menuOpen, setMenuOpen }) {
  const [cats, setCats] = useState([])
  const wishlist = useWishlist()
  const location = useLocation()

  useEffect(() => {
    api.categories().then(setCats).catch(() => {})
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname, setMenuOpen])

  useEffect(() => {
    if (!menuOpen) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen, setMenuOpen])

  const count = wishlist.list.length

  return (
    <>
      <header className="header">
        <Link to="/" className="brand">
          Shree <span>Om</span> Jwellers
        </Link>
        <div className="header-actions">
          <Link to="/search" className="icon-btn" aria-label="Search the collection">
            <SearchIcon />
          </Link>
          <Link to="/wishlist" className="icon-btn" aria-label={`Wishlist, ${count} saved`}>
            <HeartIcon />
            {count > 0 && <span className="badge">{count}</span>}
          </Link>
          <button
            className="hamburger"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <span /><span /><span />
          </button>
        </div>
      </header>

      {menuOpen && (
        <>
          <div className="drawer-mask" onClick={() => setMenuOpen(false)} />
          <div className="drawer" role="dialog" aria-label="Menu">
            <div className="brand">Shree <span>Om</span> Jwellers</div>
            <nav>
              <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
              {cats.map((c) => (
                <Link key={c.id} to={`/category/${c.slug}`} onClick={() => setMenuOpen(false)}>
                  {c.name}
                </Link>
              ))}
              <Link to="/search" onClick={() => setMenuOpen(false)}>Search</Link>
              <Link to="/rates" onClick={() => setMenuOpen(false)}>Today's Rates</Link>
              <Link to="/wishlist" onClick={() => setMenuOpen(false)}>
                Wishlist{count ? ` (${count})` : ''}
              </Link>
              <Link to="/enquire" onClick={() => setMenuOpen(false)}>Enquire</Link>
              <Link to="/store" onClick={() => setMenuOpen(false)}>Visit Our Store</Link>
            </nav>
            <div className="store-tag">
              Premium gold &amp; silver ornaments.<br />
              All purchases completed in-store.
            </div>
          </div>
        </>
      )}
    </>
  )
}
