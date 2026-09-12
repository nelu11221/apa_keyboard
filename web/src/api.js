// Acces la backend-ul FastAPI. Cererile merg la /api, pe care Vite îl
// redirecționează către http://127.0.0.1:8000 în dezvoltare.

async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (response.status === 204) return null
  const body = await response.json().catch(() => ({}))
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
