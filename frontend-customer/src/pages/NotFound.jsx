import { useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  useEffect(() => {
    document.title = `Page not found · Shree Om Jwellers`
  }, [])

  return (
    <div className="notfound">
      <div className="nf-code">404</div>
      <h2>This page doesn't exist</h2>
      <p className="sub">
        The link may be old, or the piece may no longer be on display.
      </p>
      <div className="cta-row">
        <Link to="/" className="btn-gold">Go Home</Link>
        <Link to="/search" className="btn-visit">Browse Collection</Link>
      </div>
    </div>
  )
}
