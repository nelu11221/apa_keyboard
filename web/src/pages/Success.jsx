import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { useCart } from '../context/CartContext.jsx'

export default function Success() {
  const [params] = useSearchParams()
  const cart = useCart()
  const orderId = params.get('order_id')

  useEffect(() => {
    cart.clear()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="success-page">
      <div className="success-mark">✓</div>
      <h1>Thank you for your order.</h1>
      <p>
        Order <strong>#{orderId}</strong> is confirmed. You will receive an email receipt from Stripe shortly.
      </p>
      <Link to="/shop" className="btn btn-orange">CONTINUE SHOPPING</Link>
    </div>
  )
}
