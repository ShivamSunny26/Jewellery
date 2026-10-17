import { useLocation } from 'react-router-dom'
import { waLink } from '../lib/shop.js'

export default function WhatsAppFab() {
  const { pathname } = useLocation()
  const hidden = pathname === '/enquire' || pathname === '/store'

  if (hidden) return null

  return (
    <a
      className="wa-fab"
      href={waLink('Hello! I have a question about your jewellery.')}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
    >
      <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true" fill="currentColor">
        <path d="M16 3C9.4 3 4 8.3 4 14.8c0 2.3.7 4.5 1.9 6.4L4 29l8-2.1c1.8 1 3.9 1.5 6 1.5 6.6 0 12-5.3 12-11.8S22.6 3 16 3zm0 21.6c-1.9 0-3.7-.5-5.2-1.5l-.4-.2-4.7 1.2 1.3-4.5-.3-.4a9.5 9.5 0 0 1-1.5-5.1c0-5.3 4.4-9.6 9.8-9.6s9.8 4.3 9.8 9.6-4.4 9.6-9.8 9.6zm5.4-7.2c-.3-.1-1.7-.9-2-1s-.5-.1-.7.1-.8 1-.9 1.2-.3.2-.6.1a7.8 7.8 0 0 1-3.9-3.4c-.3-.5.3-.5.8-1.6.1-.2 0-.4 0-.5s-.7-1.6-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4s-1 1-1 2.5 1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.4 1.9.8 2.6.9 3.5.7.6-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.2-.6-.4z" />
      </svg>
    </a>
  )
}
