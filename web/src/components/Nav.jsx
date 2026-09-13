import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

import { useCart } from '../context/CartContext.jsx'
import { Cart, Logo } from './Icons.jsx'

// Când ești deja pe pagina principală cu același hash în URL, router-ul nu
// mai schimbă nimic — derulăm noi la secțiune.
function scrollToHash(hash) {
  let target = document.getElementById(hash)
  if (target && target.getBoundingClientRect().height === 0) target = document.getElementById('benefits') || target
  target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const LINKS = [
  { to: '/shop', label: 'Product', nav: true },
  { to: '/#features', label: 'Features', hash: 'features' },
  { to: '/#explore', label: 'Explore', hash: 'explore' },
  { to: '/shop?category=keycaps', label: 'Customize' },
]

export default function Nav() {
  const cart = useCart()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)

  // Pe mobil bara e lipită sus, dar se retrage când derulezi în jos (ca să
  // nu acopere secțiunile cinematice) și revine la prima derulare în sus.
  useEffect(() => {
    let last = window.scrollY
    let frame = 0
    function onScroll() {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        const y = window.scrollY
        if (y > last + 6 && y > 90) setHidden(true)
        else if (y < last - 6 || y <= 90) setHidden(false)
        last = y
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  const onHashLink = (hash) => (event) => {
    if (location.pathname === '/' && location.hash === `#${hash}`) {
      event.preventDefault()
      scrollToHash(hash)
    }
    setOpen(false)
  }

  // meniul mobil se închide la schimbarea paginii și blochează derularea
  // paginii din spate cât e deschis
  useEffect(() => { setOpen(false) }, [location.pathname, location.search, location.hash])
  useEffect(() => {
    document.body.classList.toggle('menu-open', open)
    return () => document.body.classList.remove('menu-open')
  }, [open])

  const renderLink = (link, className) => {
    if (link.hash) return <Link key={link.to} to={link.to} className={className} onClick={onHashLink(link.hash)}>{link.label}</Link>
    if (link.nav) return <NavLink key={link.to} to={link.to} className={className} onClick={() => setOpen(false)}>{link.label}</NavLink>
    return <Link key={link.to} to={link.to} className={className} onClick={() => setOpen(false)}>{link.label}</Link>
  }

  return (
    <header className={`nav ${open ? 'is-open' : ''} ${hidden && !open ? 'is-hidden' : ''}`}>
      <Link to="/" className="nav-logo" aria-label="NEXA home"><Logo /></Link>

      <nav className="nav-links">{LINKS.map((link) => renderLink(link))}</nav>

      <div className="nav-actions">
        <Link to="/cart" className="nav-cart" aria-label="Cart">
          <Cart />
          {cart.count > 0 && <span className="nav-cart-count">{cart.count}</span>}
        </Link>
        <Link to="/shop" className="btn btn-orange btn-sm nav-shop">SHOP NOW</Link>
        <button
          type="button"
          className="nav-burger"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <span /><span /><span />
        </button>
      </div>

      {/* meniul mobil: panou pe tot ecranul, sub bara de sus */}
      <div className="nav-sheet" aria-hidden={!open}>
        <nav className="nav-sheet-links">
          {LINKS.map((link) => renderLink(link, 'nav-sheet-link'))}
          <NavLink to="/cart" className="nav-sheet-link" onClick={() => setOpen(false)}>
            Cart{cart.count > 0 && <span className="nav-sheet-count">{cart.count}</span>}
          </NavLink>
          <NavLink to="/admin" className="nav-sheet-link nav-sheet-link-muted" onClick={() => setOpen(false)}>Admin</NavLink>
        </nav>
        <Link to="/shop" className="btn btn-orange btn-block" onClick={() => setOpen(false)}>SHOP NOW</Link>
      </div>
    </header>
  )
}
