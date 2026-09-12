import { useState } from 'react'
import { Link } from 'react-router-dom'

import { api, formatPrice } from '../api.js'
import Picture from '../components/Picture.jsx'
import { useCart } from '../context/CartContext.jsx'
import { productKind } from './Shop.jsx'

export default function Cart() {
  const cart = useCart()
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleCheckout(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const { checkout_url: checkoutUrl } = await api.checkout({ customerName, customerEmail, items: cart.items })
      window.location.assign(checkoutUrl)
    } catch (requestError) {
      setError(requestError.message)
      setSubmitting(false)
    }
  }

  if (cart.items.length === 0) {
    return (
      <div className="cart-page">
        <h1>Your cart</h1>
        <p className="muted">Your cart is empty. <Link to="/shop">Continue shopping</Link>.</p>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <h1>Your cart</h1>
      <div className="cart-layout">
        <ul className="cart-items">
          {cart.items.map(({ key, product, quantity, options }) => (
            <li key={key} className="cart-item">
              <div className="cart-thumb">
                <Picture name={product.image_key} kind={productKind(product)} accent={product.accent} alt={product.name} showDisplay={false} showLegends={false} />
              </div>
              <div className="cart-info">
                <Link to={`/product/${product.slug}`}><strong>{product.name}</strong></Link>
                {options && (options.switchesName || options.keycapsName) && (
                  <span className="cart-options">
                    {[options.switchesName, options.keycapsName].filter(Boolean).join(' · ')}
                  </span>
                )}
                <span className="muted">{formatPrice(product.price_cents)} each</span>
              </div>
              <div className="qty">
                <button type="button" onClick={() => cart.setQuantity(key, quantity - 1)}>−</button>
                <span>{quantity}</span>
                <button type="button" onClick={() => cart.setQuantity(key, Math.min(product.stock, quantity + 1))}>+</button>
              </div>
              <span className="cart-line">{formatPrice(product.price_cents * quantity)}</span>
            </li>
          ))}
        </ul>

        <form className="checkout-card" onSubmit={handleCheckout}>
          <h2>Checkout</h2>
          <div className="summary-row"><span>Subtotal</span><span>{formatPrice(cart.totalCents)}</span></div>
          <div className="summary-row"><span>Shipping</span><span>Free</span></div>
          <div className="summary-row total"><span>Total</span><strong>{formatPrice(cart.totalCents)}</strong></div>

          <label>
            Full name
            <input required value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          </label>
          <label>
            Email
            <input required type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
          </label>
          {error && <p className="notice notice-error">{error}</p>}
          <button type="submit" className="btn btn-orange btn-block" disabled={submitting}>
            {submitting ? 'REDIRECTING TO STRIPE…' : 'PAY WITH STRIPE'}
          </button>
          <p className="muted small">Secure payment powered by Stripe. Test card: <code>4242 4242 4242 4242</code>.</p>
        </form>
      </div>
    </div>
  )
}
