import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { SHOP_PHONE, telLink, waLink } from '../lib/shop.js'

export default function StoreInfo() {
  const [settings, setSettings] = useState(null)
  useEffect(() => {
    document.title = `Visit Our Store · Shree Om Jwellers`
    api.settings().then(setSettings).catch(() => setSettings(null))
  }, [])

  const address1 = settings?.address_line1
  const address2 = settings?.address_line2
  const phone = settings?.phone || SHOP_PHONE
  const whatsapp = settings?.whatsapp_phone || SHOP_PHONE.replace(/\D/g, '')
  const showMap = settings?.show_map ?? true
  const showWhatsapp = settings?.show_whatsapp ?? true

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
        <p>{address1 || '------'}<br />{address2}</p>
      </div>

      {showMap && (
        <div className="info-block">
          <h4>Map</h4>
          <iframe
            className="map"
            title="Store location map"
            loading="lazy"
            src={settings?.map_embed_url || 'https://www.openstreetmap.org/export/embed.html?bbox=72.85%2C19.05%2C72.87%2C19.07&layer=mapnik'}
          />
        </div>
      )}

      <div className="info-block">
        <h4>Opening Hours</h4>
        <p>Monday – Saturday: 10:00 AM – 8:00 PM</p>
        <p>Sunday: 11:00 AM – 6:00 PM</p>
      </div>

      <div className="info-block">
        <h4>Contact</h4>
        <p>Phone: {phone}</p>
        {showWhatsapp && <p>WhatsApp: {whatsapp}</p>}
      </div>

      <div className="quick-contact">
        {showWhatsapp && (
          <a className="whatsapp" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer">WhatsApp</a>
        )}
        <a className="call" href={`tel:${phone.replace(/\s/g, '')}`}>Call Shop</a>
      </div>
    </div>
  )
}