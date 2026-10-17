export const SHOP_NAME = 'Shree Om Jwellers'
export const SHOP_WHATSAPP = '919876543210'
export const SHOP_PHONE = '+91 98765 43210'
export const SHOP_ADDRESS = ['Main Market Road,', 'Your City, Your State — 123456']

export const waLink = (text) =>
  `https://wa.me/${SHOP_WHATSAPP}${text ? `?text=${encodeURIComponent(text)}` : ''}`

export const telLink = () => `tel:${SHOP_PHONE.replace(/\s/g, '')}`
