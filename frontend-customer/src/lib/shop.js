export const SHOP_NAME = 'Shree Om Jwellers'
export const SHOP_WHATSAPP = '8935823361'
export const SHOP_PHONE = '+91 8935823361'
export const SHOP_ADDRESS = ['Main Chawk', 'Dhobhan Bazar']

export const waLink = (text) =>
  `https://wa.me/${SHOP_WHATSAPP}${text ? `?text=${encodeURIComponent(text)}` : ''}`

export const telLink = () => `tel:${SHOP_PHONE.replace(/\s/g, '')}`
