// Central API client. Point this at your backend by setting VITE_API_URL in a
// .env file; it falls back to the local Spring Boot server.
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

async function request(path, options = {}) {
  let res
  try {
    res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
  } catch {
    // Network-level failure (backend not running, CORS blocked, etc.)
    throw new Error('Cannot reach the server. Is the backend running on port 8080?')
  }

  let body = null
  try {
    body = await res.json()
  } catch {
    body = null
  }

  if (!res.ok) {
    const message = (body && body.message) || `Request failed (${res.status})`
    throw new Error(message)
  }
  return body
}

export const api = {
  register: (data) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  getMenu: () => request('/canteen'),
  preorder: (mealId) =>
    request(`/canteen/preorder/${mealId}`, { method: 'POST' }),

  getRooms: () => request('/hostel/rooms'),
  toggleBed: (roomId, bedId) =>
    request(`/hostel/rooms/${roomId}/beds/${bedId}/toggle`, { method: 'PUT' }),
  checkIn: () => request('/hostel/checkin', { method: 'POST' }),
  checkOut: () => request('/hostel/checkout', { method: 'POST' }),

  submitGrievance: (message) =>
    request('/grievances', { method: 'POST', body: JSON.stringify({ message }) }),

  getAnalytics: () => request('/analytics'),
}

export { API_BASE }
