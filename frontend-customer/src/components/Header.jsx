import { Link } from 'react-router-dom'

export default function Header({ menuOpen, setMenuOpen }) {
  return (
    <>
      <header className="header">
        <div className="brand">
          Shree <span>Om</span> Jwellers
        </div>
        <button
          className="hamburger"
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
        >
          <span /><span /><span />
        </button>
      </header>
      {menuOpen && (
        <>
          <div className="drawer-mask" onClick={() => setMenuOpen(false)} />
          <div className="drawer">
            <div className="brand">Shree <span>Om</span> Jwellers</div>
            <nav>
              <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
              <Link to="/category/rings" onClick={() => setMenuOpen(false)}>Rings</Link>
              <Link to="/category/necklaces" onClick={() => setMenuOpen(false)}>Necklaces</Link>
              <Link to="/category/bangles" onClick={() => setMenuOpen(false)}>Bangles</Link>
              <Link to="/category/earrings" onClick={() => setMenuOpen(false)}>Earrings</Link>
              <Link to="/category/bridal-sets" onClick={() => setMenuOpen(false)}>Bridal Sets</Link>
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
