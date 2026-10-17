import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import OrnamentCard from '../components/OrnamentCard.jsx'
import { useWishlist } from '../lib/store.js'

export default function WishlistPage() {
  const { list } = useWishlist()

  useEffect(() => {
    document.title = `Wishlist · Shree Om Jwellers`
  }, [])

  return (
    <>
      <div className="page-head">
        <h2>Your Wishlist</h2>
        <p className="sub">
          {list.length
            ? `${list.length} saved piece${list.length === 1 ? '' : 's'} · stored on this device`
            : 'Saved on this device — no account needed.'}
        </p>
      </div>

      {list.length === 0 ? (
        <div className="empty">
          Tap the <span className="heart-demo">♡</span> on any piece to save it here.
          <div style={{ marginTop: '16px' }}>
            <Link to="/search" className="btn-gold">Browse the collection</Link>
          </div>
        </div>
      ) : (
        <div className="section">
          <div className="grid">
            {list.map((o) => <OrnamentCard key={o.id} o={o} />)}
          </div>
        </div>
      )}
    </>
  )
}
