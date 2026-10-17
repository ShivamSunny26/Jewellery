import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api.js'
import ModelViewer3D from '../components/ModelViewer3D.jsx'
import { DetailSkeleton } from '../components/Skeletons.jsx'
import { useToast } from '../components/Toasts.jsx'
import { estimatePrice, formatINR } from '../lib/price.js'
import { pushRecent, useWishlist } from '../lib/store.js'
import { SHOP_PHONE, telLink, waLink } from '../lib/shop.js'

export default function OrnamentDetail() {
  const { id } = useParams()
  const toast = useToast()
  const wishlist = useWishlist()
  const [o, setO] = useState(null)
  const [rates, setRates] = useState(null)
  const [err, setErr] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setErr(null)
    setO(null)
    Promise.all([api.ornament(id), api.rates().catch(() => null)])
      .then(([ornament, rateData]) => {
        if (cancelled) return
        setO(ornament)
        setRates(rateData)
        document.title = `${ornament.name} · Shree Om Jwellers`
        pushRecent({
          id: ornament.id,
          name: ornament.name,
          purity: ornament.purity,
          thumbnail: ornament.photos[0] || null
        })
      })
      .catch((e) => {
        if (!cancelled) setErr(e.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) return <DetailSkeleton />
  if (err || !o) {
    return (
      <div className="notfound">
        <div className="nf-code">404</div>
        <h2>Piece not found</h2>
        <p className="sub">It may have been sold or hidden from the catalogue.</p>
        <div className="cta-row">
          <Link to="/search" className="btn-gold">Browse Collection</Link>
          <Link to="/" className="btn-visit">Go Home</Link>
        </div>
      </div>
    )
  }

  const estimate = estimatePrice({
    weight: o.approx_weight_grams,
    purity: o.purity,
    rates
  })
  const wished = wishlist.has(o.id)
  const shareUrl = `${window.location.origin}/ornament/${o.id}`
  const shareTitle = `${o.name} · ${SHOP_PHONE.replace(/\s/g, '')} — Shree Om Jwellers`
  const waText = `Hello! I'm interested in "${o.name}" (${o.purity || 'gold'}, ${
    o.approx_weight_grams ? `${o.approx_weight_grams}g` : 'approx.'
  }). Is it available to view in store?`

  async function onShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: o.name, text: shareTitle, url: shareUrl })
        return
      } catch {
        return
      }
    }
    copyLink()
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast?.push('Link copied')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast?.push('Could not copy the link', 'error')
    }
  }

  return (
    <>
      <ModelViewer3D modelUrl={o.model_url} photos={o.photos} name={o.name} />

      <div className="detail-info">
        <div className="crumbs">
          <Link to="/search">Collection</Link>
          <span>/</span>
          <Link to={`/search?q=${encodeURIComponent(o.category)}`}>{o.category || 'All'}</Link>
        </div>
        <div className="cat">{o.category}</div>
        <h1>{o.name}</h1>

        <div className="meta-row">
          {o.purity && (
            <div className="meta-box"><div className="lbl">Purity</div><div className="val">{o.purity}</div></div>
          )}
          {o.approx_weight_grams != null && (
            <div className="meta-box"><div className="lbl">Approx. Weight</div><div className="val">{o.approx_weight_grams}g</div></div>
          )}
        </div>

        <div className="price-box">
          <div className="lbl">Estimated material value</div>
          <div className="price-val">
            {estimate ? formatINR(estimate.value) : 'Ask in store'}
          </div>
          <div className="price-note">
            {estimate
              ? `Based on today's ${estimate.metal} rate and ${o.approx_weight_grams}g — excludes making & stone charges.`
              : "We'll quote the exact price at the counter."}
          </div>
        </div>

        {o.description && <p className="desc">{o.description}</p>}
        {o.making_charge_note && <div className="making-note">🜚 {o.making_charge_note}</div>}

        <div className="action-row">
          <button
            className={`heart-btn ${wished ? 'active' : ''}`}
            aria-pressed={wished}
            onClick={() => {
              const added = wishlist.toggle({
                id: o.id,
                name: o.name,
                category: o.category,
                purity: o.purity,
                approx_weight_grams: o.approx_weight_grams,
                thumbnail_url: o.photos[0] || null
              })
              toast?.push(added ? 'Saved to wishlist' : 'Removed from wishlist')
            }}
          >
            {wished ? '♥ Saved' : '♡ Save'}
          </button>

          <a className="share-btn" href={waLink(waText)} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
          <button className="share-btn" onClick={onShare}>Share</button>
          <button className="share-btn" onClick={copyLink} disabled={copied}>
            {copied ? 'Copied ✓' : 'Copy link'}
          </button>
        </div>

        <div className="cta-row">
          <Link to={`/enquire?ornament=${o.id}`} className="btn-enquire">Enquire About This Piece</Link>
          <Link to="/store" className="btn-visit">Visit Our Store</Link>
        </div>

        <div className="quick-contact">
          <a className="whatsapp" href={waLink(waText)} target="_blank" rel="noreferrer">WhatsApp Us</a>
          <a className="call" href={telLink()}>Call Shop</a>
        </div>

        <p className="fine-note">
          All purchases are completed in person at our store.
        </p>
      </div>
    </>
  )
}
