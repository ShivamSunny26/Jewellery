import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api } from '../api.js'
import ModelViewer3D from '../components/ModelViewer3D.jsx'

export default function OrnamentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [o, setO] = useState(null)
  const [err, setErr] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.ornament(id)
      .then(setO)
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="loading"><div className="spinner" />Loading…</div>
  if (err || !o) return <div className="empty">Sorry, this piece could not be found.</div>

  return (
    <>
      <ModelViewer3D modelUrl={o.model_url} photos={o.photos} name={o.name} />

      <div className="detail-info">
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

        {o.description && <p className="desc">{o.description}</p>}
        {o.making_charge_note && <div className="making-note">🜚 {o.making_charge_note}</div>}

        <div className="cta-row">
          <Link to={`/enquire?ornament=${o.id}`} className="btn-enquire">Enquire About This Piece</Link>
          <Link to="/store" className="btn-visit">Visit Our Store</Link>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: '12px', textAlign: 'center', marginTop: '14px' }}>
          All purchases are completed in person at our store.
        </p>
      </div>
    </>
  )
}
