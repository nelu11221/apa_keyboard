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
        <h1>Comenzi</h1>
        <p className="muted">Căutarea rulează algoritmul ales peste numele clienților, e-mailuri, stări și numele produselor.</p>
      </div>

      <div className="admin-toolbar">
        <input
          className="admin-input"
          type="search"
          placeholder="Caută în comenzi…"
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
            {visible.length} {visible.length === 1 ? 'potrivire' : 'potriviri'} · {ALGORITHM_LABELS[result.algorithm]} · {result.time_us.toFixed(2)} µs
          </span>
        )}
      </div>

      {error && <p className="notice notice-error">{error}</p>}

      <section className="panel">
        {orders.length === 0 ? (
          <p className="muted">Nicio comandă încă. Plasează o comandă din magazin ca să apară aici.</p>
        ) : (
          <table className="table">
            <thead>
              <tr><th>#</th><th>Client</th><th>E-mail</th><th>Produse</th><th>Total</th><th>Stare</th><th>Data</th></tr>
            </thead>
            <tbody>
              {visible.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.customer_name}</td>
                  <td>{order.customer_email}</td>
                  <td>{order.items.map((item) => `${item.product_name} ×${item.quantity}`).join(', ')}</td>
                  <td>{formatPrice(order.total_cents)}</td>
                  <td><span className={`tag ${order.status === 'paid' ? 'tag-green' : 'tag-amber'}`}>{order.status === 'paid' ? 'plătită' : 'în așteptare'}</span></td>
                  <td className="muted small">{new Date(order.created_at).toLocaleDateString('ro-RO')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
