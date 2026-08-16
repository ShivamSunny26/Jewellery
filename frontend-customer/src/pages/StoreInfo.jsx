export default function StoreInfo() {
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
        <p>Main Market Road,<br />Your City, Your State — 123456</p>
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
        <p>Phone: +91 98765 43210</p>
        <p>WhatsApp: +91 98765 43210</p>
      </div>

      <div className="quick-contact">
        <a className="whatsapp" href="https://wa.me/919876543210" target="_blank" rel="noreferrer">WhatsApp</a>
        <a className="call" href="tel:+919876543210">Call Shop</a>
      </div>
    </div>
  )
}
