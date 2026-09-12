// Acces la backend-ul FastAPI. În dezvoltare cererile merg la /api (proxy
// Vite → :8000). În producție (ex. Netlify) backend-ul e pe alt domeniu:
// setează VITE_API_BASE (ex. https://nexa-api.onrender.com) la build.

const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '')

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (response.status === 204) return null
  // Fără backend (ex. Netlify fără VITE_API_BASE), redirect-ul SPA răspunde
  // cu index.html la /api/... — nu e JSON, deci semnalăm clar, nu crăpăm.
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    throw new Error(
      API_BASE
        ? `Backend-ul nu a răspuns cu JSON (${response.status}).`
        : 'Backend-ul nu este configurat: setează VITE_API_BASE la adresa serverului FastAPI.',
    )
  }
  const body = await response.json()
  if (!response.ok) {
    const message = typeof body.detail === 'string' ? body.detail : JSON.stringify(body.detail ?? body)
    throw new Error(message || `HTTP ${response.status}`)
  }
  return body
}

export const api = {
  products: (category) => request(category ? `/api/products?category=${encodeURIComponent(category)}` : '/api/products'),
  product: (slug) => request(`/api/products/${encodeURIComponent(slug)}`),

  // Din magazin nu se trimite algorithm — backend-ul folosește setarea din admin.
  search: ({ query, scope = 'products', algorithm }) => {
    const params = new URLSearchParams({ q: query, scope })
    if (algorithm) params.set('algorithm', algorithm)
    return request(`/api/search?${params.toString()}`)
  },

  orders: () => request('/api/orders'),

  checkout: ({ customerName, customerEmail, items }) =>
    request('/api/checkout', {
      method: 'POST',
      body: JSON.stringify({
        customer_name: customerName,
        customer_email: customerEmail,
        items: items.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
          switches: item.options?.switches ?? null,
          keycaps: item.options?.keycaps ?? null,
        })),
      }),
    }),

  benchmark: ({ pattern, alphabet, repeats }) => {
    const params = new URLSearchParams({ pattern, alphabet, repeats: String(repeats) })
    return request(`/api/benchmark?${params.toString()}`)
  },

  admin: {
    stats: () => request('/api/admin/stats'),
    searchLogs: (limit = 50) => request(`/api/admin/search-logs?limit=${limit}`),
    settings: () => request('/api/admin/settings'),
    updateSettings: (payload) => request('/api/admin/settings', { method: 'PUT', body: JSON.stringify(payload) }),
    createProduct: (payload) => request('/api/admin/products', { method: 'POST', body: JSON.stringify(payload) }),
    updateProduct: (id, payload) => request(`/api/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    deleteProduct: (id) => request(`/api/admin/products/${id}`, { method: 'DELETE' }),
  },
}

export const ALGORITHMS = [
  { id: 'kmp', label: 'Knuth–Morris–Pratt', short: 'KMP' },
  { id: 'bmh', label: 'Boyer–Moore–Horspool', short: 'BMH' },
  { id: 'rk', label: 'Rabin–Karp', short: 'RK' },
]

export const ALGORITHM_LABELS = Object.fromEntries(ALGORITHMS.map((a) => [a.id, a.label]))
export const ALGORITHM_COLORS = { kmp: '#2563EB', bmh: '#FF4F1F', rk: '#111111' }

export function formatPrice(cents) {
  return `$${(cents / 100).toFixed(2)}`
}
