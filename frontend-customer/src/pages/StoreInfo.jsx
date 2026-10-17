import { useEffect } from 'react'
import { SHOP_ADDRESS, SHOP_PHONE, telLink, waLink } from '../lib/shop.js'

export default function StoreInfo() {
  useEffect(() => {
    document.title = `Visit Our Store · Shree Om Jwellers`
  }, [])

  return (
    <div style={{ padding: '16px 16px 24px' }}>
      <div className="page-head" style={{ padding: 0, marginBottom: '16px' }}>
        <h2 style={{ margin: 0, fontFamily: 'var(--serif)' }}>Visit Our Store</h2>
        <p className="sub" style={{ marginTop: '4px' }}>
          All purchases are completed in person. We'd love to see you.
        </p>
      </div>

      <div className="info-block">
        <h4>Address</h4>
        <p>Shree Om Jwellers</p>
        <p>{SHOP_ADDRESS[0]}<br />{SHOP_ADDRESS[1]}</p>
      </div>

      <div className="info-block">
        <h4>Map</h4>
        <iframe
          className="map"
          title="Store location map"
          loading="lazy"
          src="https://www.openstreetmap.org/export/embed.html?bbox=72.85%2C19.05%2C72.87%2C19.07&layer=mapnik"
        />
      </div>

      <div className="info-block">
        <h4>Opening Hours</h4>
        <p>Monday – Saturday: 10:00 AM – 8:00 PM</p>
        <p>Sunday: 11:00 AM – 6:00 PM</p>
      </div>

      <div className="info-block">
        <h4>Contact</h4>
        <p>Phone: {SHOP_PHONE}</p>
        <p>WhatsApp: {SHOP_PHONE}</p>
      </div>

      <div className="quick-contact">
        <a className="whatsapp" href={waLink()} target="_blank" rel="noreferrer">WhatsApp</a>
        <a className="call" href={telLink()}>Call Shop</a>
      </div>
    </div>
  )
}
