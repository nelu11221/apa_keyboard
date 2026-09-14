import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'

import { ALGORITHM_COLORS, ALGORITHM_LABELS, api, formatPrice } from '../api.js'

function StatTile({ label, value, hint }) {
  return (
    <div className="stat-tile">
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
      {hint && <span className="stat-hint">{hint}</span>}
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.admin.stats().then(setStats).catch((requestError) => setError(requestError.message))
  }, [])

  if (error) return <p className="notice notice-error">{error}</p>
  if (!stats) return <p className="muted">Se încarcă…</p>

  const revenueSeries = stats.revenue_by_day.map((row) => ({
    day: row.day.slice(5),
    revenue: row.revenue_cents / 100,
    orders: row.orders,
  }))

  return (
    <div>
      <div className="admin-head">
        <h1>Panou general</h1>
        <p className="muted">Privire de ansamblu asupra vânzărilor, catalogului și căutărilor.</p>
      </div>

      <div className="stat-grid">
        <StatTile label="Încasări (plătite)" value={formatPrice(stats.revenue_cents)} hint={`${stats.orders_paid} comenzi plătite`} />
        <StatTile label="Comenzi" value={stats.orders_total} hint={`${stats.orders_pending} în așteptare`} />
        <StatTile label="Comandă medie" value={formatPrice(stats.average_order_cents)} />
        <StatTile label="Produse" value={stats.products_total} hint={`${stats.low_stock.length} cu stoc redus`} />
        <StatTile label="Căutări" value={stats.searches_total} hint="înregistrate de motorul de căutare" />
      </div>

      <div className="admin-grid-2">
        <section className="panel">
          <h3>Încasări · ultimele 14 zile</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueSeries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#FF4F1F" stopOpacity={0.35} />
                  <stop offset="1" stopColor="#FF4F1F" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ECEAE4" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} width={54} />
              <Tooltip formatter={(value, name) => (name === 'revenue' ? [`$${value.toFixed(2)}`, 'Încasări'] : [value, 'Comenzi'])} />
              <Area type="monotone" dataKey="revenue" stroke="#FF4F1F" strokeWidth={2} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </section>

        <section className="panel">
          <h3>Căutări pe algoritm</h3>
          {stats.search_by_algorithm.length === 0 ? (
            <p className="muted">Nicio căutare încă — încearcă bara de căutare din magazin.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={stats.search_by_algorithm} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ECEAE4" vertical={false} />
                <XAxis dataKey="algorithm" tickFormatter={(id) => ALGORITHM_LABELS[id]} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={40} allowDecimals={false} />
                <Tooltip
                  labelFormatter={(id) => ALGORITHM_LABELS[id]}
                  formatter={(value, name, entry) => (name === 'count' ? [value, 'Căutări'] : [value, name])}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const row = payload[0].payload
                    return (
                      <div className="tip">
                        <strong>{ALGORITHM_LABELS[row.algorithm]}</strong>
                        <div>{row.count} căutări</div>
                        <div>medie {row.avg_time_us} µs</div>
                      </div>
                    )
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#FF4F1F"
                  shape={(props) => {
                    const { x, y, width, height, payload } = props
                    return <rect x={x} y={y} width={width} height={height} rx={6} fill={ALGORITHM_COLORS[payload.algorithm]} />
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </section>
      </div>

      <div className="admin-grid-2">
        <section className="panel">
          <h3>Cele mai vândute</h3>
          {stats.top_products.length === 0 ? (
            <p className="muted">Nicio comandă plătită încă.</p>
          ) : (
            <table className="table">
              <thead><tr><th>Produs</th><th>Vândute</th><th>Încasări</th></tr></thead>
              <tbody>
                {stats.top_products.map((row) => (
                  <tr key={row.name}><td>{row.name}</td><td>{row.quantity}</td><td>{formatPrice(row.revenue_cents)}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="panel">
          <h3>Stoc redus</h3>
          {stats.low_stock.length === 0 ? (
            <p className="muted">Toate produsele au stoc suficient.</p>
          ) : (
            <table className="table">
              <thead><tr><th>Produs</th><th>Stoc</th><th /></tr></thead>
              <tbody>
                {stats.low_stock.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td><span className={product.stock === 0 ? 'tag tag-red' : 'tag tag-amber'}>{product.stock}</span></td>
                    <td><Link to="/admin/products">Gestionează</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  )
}
