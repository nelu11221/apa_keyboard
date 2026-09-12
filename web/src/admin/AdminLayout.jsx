import { Link, NavLink, Outlet } from 'react-router-dom'

import { Logo } from '../components/Icons.jsx'

const LINKS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/algorithms', label: 'Search algorithms' },
  { to: '/admin/settings', label: 'Settings' },
]

export default function AdminLayout() {
  return (
    <div className="admin">
      <aside className="admin-side">
        <Link to="/" className="admin-brand"><Logo dark /> <span className="admin-brand-tag">admin</span></Link>
        <nav className="admin-nav">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end}>{link.label}</NavLink>
          ))}
        </nav>
        <Link to="/" className="admin-back">← Back to store</Link>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}
