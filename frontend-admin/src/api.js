const API = '/api/v1'

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    credentials: 'include',
    headers: options.body instanceof FormData
      ? undefined
      : { 'Content-Type': 'application/json' },
    ...options
  })
  if (res.status === 401) {
    window.location.href = '/login'
    throw new Error('Not authenticated')
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail || 'Request failed')
  }
  if (res.status === 204) return null
  return res.json()
}

export const api = {
  login: (u, p) => request('/admin/login', { method: 'POST', body: JSON.stringify({ username: u, password: p }) }),
  logout: () => request('/admin/logout', { method: 'POST' }),
  me: () => request('/admin/me'),

  ornaments: () => request('/admin/ornaments'),
  ornament: (id) => request(`/admin/ornaments/${id}`),
  createOrnament: (data) => request('/admin/ornaments', { method: 'POST', body: JSON.stringify(data) }),
  updateOrnament: (id, data) => request(`/admin/ornaments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteOrnament: (id) => request(`/admin/ornaments/${id}`, { method: 'DELETE' }),
  setVisibility: (id, isVisible) => request(`/admin/ornaments/${id}/visibility`, { method: 'PATCH', body: JSON.stringify({ is_visible: isVisible }) }),
  uploadMedia: (id, mediaType, file) => {
    const fd = new FormData()
    fd.append('media_type', mediaType)
    fd.append('file', file)
    return request(`/admin/ornaments/${id}/media`, { method: 'POST', body: fd })
  },
  deleteMedia: (mediaId) => request(`/admin/media/${mediaId}`, { method: 'DELETE' }),

  categories: () => request('/admin/categories'),
  createCategory: (data) => request('/admin/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id, data) => request(`/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id) => request(`/admin/categories/${id}`, { method: 'DELETE' }),

  rateHistory: (metal) => request(`/admin/rates/history?metal=${metal}&limit=20`),
  setRate: (data) => request('/admin/rates', { method: 'POST', body: JSON.stringify(data) }),

  enquiries: (status) => request(`/admin/enquiries${status ? `?status=${status}` : ''}`),
  setEnquiryStatus: (id, status) => request(`/admin/enquiries/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
}
