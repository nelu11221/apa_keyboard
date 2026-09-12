import { Link, NavLink, useLocation } from 'react-router-dom'

import { useCart } from '../context/CartContext.jsx'
import { Cart, Logo } from './Icons.jsx'

// Când ești deja pe pagina principală cu același hash în URL, router-ul nu
// mai schimbă nimic — derulăm noi la secțiune.
function scrollToHash(hash) {
  document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function Nav() {
  const cart = useCart()
  const location = useLocation()
  const onHashLink = (hash) => (event) => {
    if (location.pathname === '/' && location.hash === `#${hash}`) {
      event.preventDefault()
      scrollToHash(hash)
    }
  }

  return (
    <header className="nav">
      <Link to="/" className="nav-logo" aria-label="NEXA home"><Logo /></Link>

      <nav className="nav-links">
        <NavLink to="/shop">Product</NavLink>
        <Link to="/#features" onClick={onHashLink('features')}>Features</Link>
        <Link to="/#explore" onClick={onHashLink('explore')}>Explore</Link>
        <NavLink to="/shop?category=keycaps">Customize</NavLink>
      </nav>

      <div className="nav-actions">
        <Link to="/cart" className="nav-cart" aria-label="Cart">
          <Cart />
          {cart.count > 0 && <span className="nav-cart-count">{cart.count}</span>}
        </Link>
        <Link to="/shop" className="btn btn-orange btn-sm">SHOP NOW</Link>
      </div>
    </header>
  )
}
