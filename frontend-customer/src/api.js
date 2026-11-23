const API = import.meta.env.PROD
  ? 'https://jewellery-ctnt.onrender.com/api/v1'
  : '/api/v1'

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail || body.error?.message || 'Request failed')
  }
  if (res.status === 204) return null
  return res.json()
}

function qs(params = {}) {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ''
  )
  if (!entries.length) return ''
  return `?${entries
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')}`
}

export const api = {
  categories: () => request('/categories'),
  ornaments: (params = {}) => request(`/ornaments${qs(params)}`),
  purities: () => request('/ornaments/purities'),
  ornament: (id) => request(`/ornaments/${id}`),
  rates: () => request('/rates/current'),
  rateHistory: (days = 30) => request(`/rates/history${qs({ days })}`),
  enquiry: (payload) =>
    request('/enquiries', { method: 'POST', body: JSON.stringify(payload) })
}
