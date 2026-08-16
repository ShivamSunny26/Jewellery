const API = '/api/v1'

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

export const api = {
  categories: () => request('/categories'),
  ornaments: (category) => request(`/ornaments${category ? `?category=${category}` : ''}`),
  ornament: (id) => request(`/ornaments/${id}`),
  rates: () => request('/rates/current'),
  enquiry: (payload) => request('/enquiries', { method: 'POST', body: JSON.stringify(payload) })
}
