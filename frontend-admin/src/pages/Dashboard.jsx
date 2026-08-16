import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'

export default function Dashboard() {
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    api.enquiries('new').then((list) => setUnread(list.length)).catch(() => {})
  }, [])

  return (
    <div className="dash">
      <h2>Dashboard</h2>
      <div className="dash-grid">
        <Link to="/rates" className="dash-tile">
          <div className="ico">₹</div>
          <div className="lbl">Update Rates</div>
          <div className="sub">Gold &amp; Silver</div>
        </Link>
        <Link to="/ornaments" className="dash-tile">
          <div className="ico">◆</div>
          <div className="lbl">Manage Ornaments</div>
          <div className="sub">Catalogue</div>
        </Link>
        <Link to="/categories" className="dash-tile">
          <div className="ico">🏷️</div>
          <div className="lbl">Manage Categories</div>
          <div className="sub">Organize pieces</div>
        </Link>
        <Link to="/enquiries" className="dash-tile">
          <div className="ico">✉️</div>
          <div className="lbl">Enquiries</div>
          {unread > 0 ? <div className="badge">{unread} new</div> : <div className="sub">Inbox</div>}
        </Link>
      </div>
    </div>
  )
}
