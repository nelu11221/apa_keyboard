import { useEffect, useMemo, useState } from 'react'

import { ALGORITHMS, ALGORITHM_LABELS, api, formatPrice } from '../api.js'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [algorithm, setAlgorithm] = useState('bmh')
  const [result, setResult] = useState(null)

  useEffect(() => {
    api.orders().then((list) => setOrders(Array.isArray(list) ? list : [])).catch((requestError) => setError(requestError.message))
  }, [])

  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      setResult(null)
      return undefined
    }
    const handle = setTimeout(() => {
      api.search({ query: trimmed, scope: 'orders', algorithm }).then(setResult).catch((e) => setError(e.message))
    }, 250)
    return () => clearTimeout(handle)
  }, [query, algorithm])

  const visible = useMemo(() => {
    if (!result) return orders
    const ids = new Set(result.results.map((r) => r.id))
    return orders.filter((order) => ids.has(order.id))
  }, [orders, result])

  return (
    <div>
      <div className="admin-head">
        <h1>Orders</h1>
        <p className="muted">Search runs the selected algorithm over customer names, emails, status and product names.</p>
      </div>

      <div className="admin-toolbar">
        <input
          className="admin-input"
          type="search"
          placeholder="Search orders…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="seg">
          {ALGORITHMS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={option.id === algorithm ? 'active' : ''}
              onClick={() => setAlgorithm(option.id)}
            >
              {option.short}
            </button>
          ))}
        </div>
        {result && (
          <span className="muted small">
            {visible.length} match{visible.length === 1 ? '' : 'es'} · {ALGORITHM_LABELS[result.algorithm]} · {result.time_us.toFixed(2)} µs
          </span>
        )}
      </div>

      {error && <p className="notice notice-error">{error}</p>}

      <section className="panel">
        {orders.length === 0 ? (
          <p className="muted">No orders yet. Place an order from the store to see it here.</p>
        ) : (
          <table className="table">
            <thead>
              <tr><th>#</th><th>Customer</th><th>Email</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              {visible.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.customer_name}</td>
                  <td>{order.customer_email}</td>
                  <td>{order.items.map((item) => `${item.product_name} ×${item.quantity}`).join(', ')}</td>
                  <td>{formatPrice(order.total_cents)}</td>
                  <td><span className={`tag ${order.status === 'paid' ? 'tag-green' : 'tag-amber'}`}>{order.status}</span></td>
                  <td className="muted small">{new Date(order.created_at).toLocaleDateString('en-GB')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
