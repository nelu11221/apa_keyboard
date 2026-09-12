import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { api, formatPrice } from '../api.js'
import { ArrowRight } from '../components/Icons.jsx'
import Picture from '../components/Picture.jsx'
import { useCart } from '../context/CartContext.jsx'
import { images } from '../images.js'
import { productKind } from './Shop.jsx'

// Clipul de prezentare al produsului (generat), dacă există (images.productVideos).
function videoFor(product) {
  return images.productVideos?.[product.slug] ?? null
}

// Imaginea tastaturii cu un anumit set de keycaps montat (dacă există o
// randare dedicată); altfel imaginea standard a produsului.
function keyboardImageFor(product, keycapsSlug) {
  const variants = images.keycapVariants?.[product.slug]
  return (keycapsSlug && variants?.[keycapsSlug]) || images[product.image_key] || null
}

export default function Product() {
  const { slug } = useParams()
  const cart = useCart()
  const [product, setProduct] = useState(null)
  const [allProducts, setAllProducts] = useState([])
  const [error, setError] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const [view, setView] = useState('photo') // 'photo' | 'video'
  const videoRef = useRef(null)
  const [customizing, setCustomizing] = useState(false)
  const [switchesSlug, setSwitchesSlug] = useState(null)
  const [keycapsSlug, setKeycapsSlug] = useState(null)

  useEffect(() => {
    setProduct(null)
    setError('')
    setQuantity(1)
    setAdded(false)
    setView('photo')
    setCustomizing(false)
    setSwitchesSlug(null)
    setKeycapsSlug(null)
    api.product(slug).then(setProduct).catch((requestError) => setError(requestError.message))
    api.products().then(setAllProducts).catch(() => {})
  }, [slug])

  const isKeyboard = product?.category === 'keyboards'
  const video = product ? videoFor(product) : null
  const switchOptions = useMemo(() => allProducts.filter((p) => p.category === 'switches'), [allProducts])
  const keycapOptions = useMemo(() => allProducts.filter((p) => p.category === 'keycaps'), [allProducts])

  if (error) return <div className="product-page"><p className="notice notice-error">{error}</p></div>
  if (!product) return <div className="product-page"><p className="muted">Loading…</p></div>

  const specs = product.specs
    .split('\n')
    .map((line) => line.split(':'))
    .filter((parts) => parts.length >= 2)
    .map(([label, ...rest]) => [label.trim(), rest.join(':').trim()])

  const chosenSwitches = switchOptions.find((p) => p.slug === switchesSlug) || null
  const chosenKeycaps = keycapOptions.find((p) => p.slug === keycapsSlug) || null
  const hasOptions = Boolean(chosenSwitches || chosenKeycaps)

  function addToCart() {
    const options = hasOptions
      ? {
          switches: chosenSwitches?.slug ?? null,
          keycaps: chosenKeycaps?.slug ?? null,
          switchesName: chosenSwitches ? `${chosenSwitches.name} switches` : null,
          keycapsName: chosenKeycaps ? `${chosenKeycaps.name} keycaps` : null,
        }
      : null
    cart.add(product, options, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  const galleryImage = isKeyboard ? keyboardImageFor(product, keycapsSlug) : images[product.image_key]

  return (
    <div className="product-page">
      <nav className="crumbs">
        <Link to="/shop">Shop</Link> <span>/</span>{' '}
        <Link to={`/shop?category=${product.category}`}>{product.category}</Link> <span>/</span>{' '}
        <span>{product.name}</span>
      </nav>

      <div className="product-layout">
        <div className="product-gallery-wrap">
          <div className={`product-gallery ${view === 'video' ? 'is-video' : ''}`}>
            {product.badge && <span className="product-badge">{product.badge}</span>}

            {view === 'video' && video ? (
              <video
                ref={videoRef}
                className="product-video"
                src={video}
                poster={galleryImage || undefined}
                autoPlay
                muted
                loop
                playsInline
                controls
              />
            ) : galleryImage ? (
              <img src={galleryImage} alt={product.name} />
            ) : (
              <Picture name={product.image_key} kind={productKind(product)} accent={product.accent} alt={product.name} />
            )}

          </div>

          {(video || isKeyboard) && (
            <div className="gallery-actions">
              {video ? (
                <div className="seg">
                  <button type="button" className={view === 'photo' ? 'active' : ''} onClick={() => setView('photo')}>Photo</button>
                  <button type="button" className={view === 'video' ? 'active' : ''} onClick={() => setView('video')}>
                    ▶ Video
                  </button>
                </div>
              ) : <span />}
              {isKeyboard && (
                <button
                  type="button"
                  className={`btn btn-sm ${customizing ? 'btn-dark' : 'btn-white'}`}
                  onClick={() => setCustomizing((value) => !value)}
                >
                  {customizing ? 'DONE' : 'CUSTOMIZE'}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="product-info">
          <span className="product-cat">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="product-tagline">{product.tagline}</p>
          <p className="product-price-lg">{formatPrice(product.price_cents)}</p>
          <p className="product-desc">{product.description}</p>

          {isKeyboard && customizing && (
            <div className="configurator">
              <div className="configurator-group">
                <div className="configurator-head">
                  <h3>Switches</h3>
                  <span className="muted small">No extra cost</span>
                </div>
                <div className="option-grid">
                  <OptionCard label="Standard" hint="factory switches" active={!switchesSlug} onClick={() => setSwitchesSlug(null)} />
                  {switchOptions.map((option) => (
                    <OptionCard
                      key={option.slug}
                      label={option.name}
                      hint={option.tagline.split('·').pop().trim()}
                      image={images[option.image_key]}
                      active={switchesSlug === option.slug}
                      onClick={() => setSwitchesSlug(option.slug)}
                    />
                  ))}
                </div>
              </div>

              <div className="configurator-group">
                <div className="configurator-head">
                  <h3>Keycaps</h3>
                  <span className="muted small">No extra cost</span>
                </div>
                <div className="option-grid">
                  <OptionCard label="Standard" hint="off-white + orange" active={!keycapsSlug} onClick={() => setKeycapsSlug(null)} />
                  {keycapOptions.map((option) => (
                    <OptionCard
                      key={option.slug}
                      label={option.name.replace(/^(Artisan|Minimal) Keycaps · /, '')}
                      hint={option.tagline}
                      image={images[option.image_key]}
                      active={keycapsSlug === option.slug}
                      onClick={() => setKeycapsSlug(option.slug)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {hasOptions && !customizing && (
            <p className="config-summary">
              Your build: {[chosenSwitches && `${chosenSwitches.name} switches`, chosenKeycaps && `${chosenKeycaps.name} keycaps`].filter(Boolean).join(' · ')}
              {' '}<button type="button" className="link-btn" onClick={() => setCustomizing(true)}>Edit</button>
            </p>
          )}

          <div className="product-buy">
            <div className="qty">
              <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
              <span>{quantity}</span>
              <button type="button" onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}>+</button>
            </div>
            <button type="button" className="btn btn-orange" disabled={product.stock === 0} onClick={addToCart}>
              {product.stock === 0 ? 'SOLD OUT' : added ? 'ADDED ✓' : 'ADD TO CART'}
            </button>
          </div>
          <p className="stock-note">
            {product.stock === 0 ? 'Out of stock' : product.stock <= 10 ? `Only ${product.stock} left` : 'In stock · ships in 24h'}
          </p>

          {specs.length > 0 && (
            <dl className="specs">
              {specs.map(([label, value]) => (
                <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
              ))}
            </dl>
          )}

          <Link to="/cart" className="link-arrow">Go to cart <ArrowRight /></Link>
        </div>
      </div>
    </div>
  )
}

function OptionCard({ label, hint, image, active, onClick }) {
  return (
    <button type="button" className={`option-card ${active ? 'active' : ''}`} onClick={onClick}>
      <span className="option-thumb">{image ? <img src={image} alt="" /> : <i />}</span>
      <span className="option-label">{label}</span>
      {hint && <span className="option-hint">{hint}</span>}
    </button>
  )
}
