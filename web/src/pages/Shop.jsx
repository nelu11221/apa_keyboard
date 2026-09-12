import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { api, formatPrice } from '../api.js'
import { Search } from '../components/Icons.jsx'
import Picture from '../components/Picture.jsx'
import { useCart } from '../context/CartContext.jsx'

const CATEGORIES = [
  { id: '', label: 'All' },
  { id: 'keyboards', label: 'Keyboards' },
  { id: 'switches', label: 'Switches' },
  { id: 'keycaps', label: 'Keycaps' },
  { id: 'mice', label: 'Mice' },
  { id: 'audio', label: 'Audio' },
  { id: 'accessories', label: 'Accessories' },
]

const KIND_BY_CATEGORY = { keyboards: 'keyboard', switches: 'switch', keycaps: 'keycaps', mice: 'mouse', audio: 'headphones', accessories: 'box' }

export function productKindFor(product) {
  if (product.slug === 'nexa-desk-mat') return 'mousepad'
  return KIND_BY_CATEGORY[product.category] ?? 'box'
}

export function productKind(product) {
  return productKindFor(product)
}

export default function Shop() {
  const cart = useCart()
  const [params, setParams] = useSearchParams()
  const category = params.get('category') ?? ''
  const query = params.get('q') ?? ''

  const [products, setProducts] = useState([])
  const [loadError, setLoadError] = useState('')
  const [searchResult, setSearchResult] = useState(null)
  const [searchError, setSearchError] = useState('')
  const [draft, setDraft] = useState(query)

  useEffect(() => {
    api.products().then((list) => setProducts(Array.isArray(list) ? list : [])).catch((error) => setLoadError(error.message))
  }, [])

  useEffect(() => setDraft(query), [query])

  // Căutarea rulează pe backend cu algoritmul setat din admin; magazinul nu
  // știe și nu afișează ce algoritm e — exact ca într-un magazin real.
  useEffect(() => {
    const trimmed = draft.trim()
    if (!trimmed) {
      setSearchResult(null)
      setSearchError('')
      return undefined
    }
    const handle = setTimeout(async () => {
      try {
        setSearchError('')
        setSearchResult(await api.search({ query: trimmed, scope: 'products' }))
      } catch (error) {
        setSearchError(error.message)
      }
    }, 250)
    return () => clearTimeout(handle)
  }, [draft])

  const visible = useMemo(() => {
    let list = products
    if (category) list = list.filter((product) => product.category === category)
    if (searchResult) {
      const ids = new Set(searchResult.results.map((r) => r.id))
      list = list.filter((product) => ids.has(product.id))
    }
    return list
  }, [products, category, searchResult])

  function selectCategory(id) {
    const next = new URLSearchParams(params)
    if (id) next.set('category', id)
    else next.delete('category')
    setParams(next)
  }

  return (
    <div className="shop">
      <div className="shop-head">
        <h1>Shop</h1>
        <p>Keyboards, switches, keycaps and everything in between.</p>
      </div>

      <div className="shop-toolbar">
        <div className="shop-tabs">
          {CATEGORIES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={item.id === category ? 'shop-tab active' : 'shop-tab'}
              onClick={() => selectCategory(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <label className="shop-search">
          <Search size={16} />
          <input
            type="search"
            placeholder="Search products"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
        </label>
      </div>

      {searchError && <p className="notice notice-error">{searchError}</p>}
      {loadError && <p className="notice notice-error">{loadError}</p>}
      {searchResult && (
        <p className="shop-count">{visible.length} result{visible.length === 1 ? '' : 's'} for “{searchResult.query}”</p>
      )}

      <div className="product-grid">
        {visible.map((product) => (
          <article key={product.id} className="product-card">
            <Link to={`/product/${product.slug}`} className="product-media">
              {product.badge && <span className="product-badge">{product.badge}</span>}
              <Picture name={product.image_key} kind={productKind(product)} accent={product.accent} alt={product.name} showDisplay={false} showLegends={false} />
            </Link>
            <div className="product-body">
              <span className="product-cat">{product.category}</span>
              <h3><Link to={`/product/${product.slug}`}>{product.name}</Link></h3>
              <p>{product.tagline}</p>
            </div>
            <div className="product-foot">
              <span className="product-price">{formatPrice(product.price_cents)}</span>
              <button
                type="button"
                className="btn btn-dark btn-sm"
                disabled={product.stock === 0}
                onClick={() => cart.add(product)}
              >
                {product.stock === 0 ? 'SOLD OUT' : 'ADD TO CART'}
              </button>
            </div>
          </article>
        ))}
        {visible.length === 0 && !loadError && <p className="shop-empty">Nothing matches your search.</p>}
      </div>
    </div>
  )
}
