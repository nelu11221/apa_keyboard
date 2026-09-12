import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'

import AdminLayout from './admin/AdminLayout.jsx'
import Algorithms from './admin/Algorithms.jsx'
import Dashboard from './admin/Dashboard.jsx'
import Orders from './admin/Orders.jsx'
import Products from './admin/Products.jsx'
import Settings from './admin/Settings.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import Footer from './components/Footer.jsx'
import Nav from './components/Nav.jsx'
import Cart from './pages/Cart.jsx'
import Home from './pages/Home.jsx'
import Product from './pages/Product.jsx'
import Shop from './pages/Shop.jsx'
import Success from './pages/Success.jsx'

function StoreLayout({ children }) {
  return (
    <div className="store">
      <Nav />
      <main>{children}</main>
      <Footer />
    </div>
  )
}

function ScrollToTop() {
  const { pathname, hash, key } = useLocation()
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0)
      return undefined
    }
    // Secțiunea țintă poate să nu fie încă montată / așezată (imagini,
    // secțiuni sticky), așa că încercăm câteva cadre la rând.
    let attempts = 0
    let frame = 0
    function scrollToTarget() {
      const target = document.getElementById(hash.slice(1))
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else if (attempts < 20) {
        attempts += 1
        frame = requestAnimationFrame(scrollToTarget)
      }
    }
    frame = requestAnimationFrame(scrollToTarget)
    return () => cancelAnimationFrame(frame)
  }, [pathname, hash, key])
  return null
}

export default function App() {
  return (
    <ErrorBoundary>
      <ScrollToTop />
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="products" element={<Products />} />
          <Route path="algorithms" element={<Algorithms />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="/" element={<StoreLayout><Home /></StoreLayout>} />
        <Route path="/shop" element={<StoreLayout><Shop /></StoreLayout>} />
        <Route path="/product/:slug" element={<StoreLayout><Product /></StoreLayout>} />
        <Route path="/cart" element={<StoreLayout><Cart /></StoreLayout>} />
        <Route path="/success" element={<StoreLayout><Success /></StoreLayout>} />
      </Routes>
    </ErrorBoundary>
  )
}
