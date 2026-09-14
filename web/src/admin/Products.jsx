import { useEffect, useState } from 'react'

import { api, formatPrice } from '../api.js'

const EMPTY = {
  slug: '', name: '', tagline: '', description: '', category: 'keyboards',
  price_cents: 0, stock: 0, badge: '', image_key: '', accent: 'orange', specs: '',
}

const CATEGORIES = ['keyboards', 'switches', 'keycaps', 'mice', 'audio', 'accessories']
const ACCENTS = ['orange', 'cream', 'dark', 'pink']

export default function Products() {
  const [products, setProducts] = useState([])
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null) // null | 'new' | product id
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  function load() {
    api.products().then((list) => setProducts(Array.isArray(list) ? list : [])).catch((requestError) => setError(requestError.message))
  }

  useEffect(load, [])

  function startNew() {
    setForm(EMPTY)
    setEditing('new')
  }

  function startEdit(product) {
    const { id, ...rest } = product
    setForm(rest)
    setEditing(id)
  }

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function save(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = { ...form, price_cents: Number(form.price_cents), stock: Number(form.stock) }
      if (editing === 'new') await api.admin.createProduct(payload)
      else await api.admin.updateProduct(editing, payload)
      setEditing(null)
      load()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function remove(product) {
    if (!window.confirm(`Ștergi „${product.name}”?`)) return
    try {
      await api.admin.deleteProduct(product.id)
      load()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <div>
      <div className="admin-head admin-head-row">
        <div>
          <h1>Produse</h1>
          <p className="muted">{products.length} produse în catalog.</p>
        </div>
        <button type="button" className="btn btn-orange btn-sm" onClick={startNew}>PRODUS NOU</button>
      </div>

      {error && <p className="notice notice-error">{error}</p>}

      {editing !== null && (
        <form className="panel form-grid" onSubmit={save}>
          <h3 className="span-2">{editing === 'new' ? 'Produs nou' : 'Editează produsul'}</h3>
          <label>Nume<input required value={form.name} onChange={(e) => update('name', e.target.value)} /></label>
          <label>Slug<input required value={form.slug} onChange={(e) => update('slug', e.target.value)} /></label>
          <label>Slogan<input value={form.tagline} onChange={(e) => update('tagline', e.target.value)} /></label>
          <label>Categorie
            <select value={form.category} onChange={(e) => update('category', e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label>Preț (cenți)<input type="number" min="0" required value={form.price_cents} onChange={(e) => update('price_cents', e.target.value)} /></label>
          <label>Stoc<input type="number" min="0" required value={form.stock} onChange={(e) => update('stock', e.target.value)} /></label>
          <label>Etichetă<input value={form.badge} onChange={(e) => update('badge', e.target.value)} placeholder="New, Best seller…" /></label>
          <label>Cheie imagine<input value={form.image_key} onChange={(e) => update('image_key', e.target.value)} placeholder="cheie din images.js" /></label>
          <label>Culoare accent
            <select value={form.accent} onChange={(e) => update('accent', e.target.value)}>
              {ACCENTS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </label>
          <label className="span-2">Descriere<textarea rows={3} value={form.description} onChange={(e) => update('description', e.target.value)} /></label>
          <label className="span-2">Specificații (câte o linie „Etichetă: valoare”)<textarea rows={4} value={form.specs} onChange={(e) => update('specs', e.target.value)} /></label>
          <div className="span-2 form-actions">
            <button type="button" className="btn btn-white btn-sm" onClick={() => setEditing(null)}>RENUNȚĂ</button>
            <button type="submit" className="btn btn-dark btn-sm" disabled={saving}>{saving ? 'SE SALVEAZĂ…' : 'SALVEAZĂ'}</button>
          </div>
        </form>
      )}

      <section className="panel">
        <table className="table">
          <thead><tr><th>Nume</th><th>Categorie</th><th>Preț</th><th>Stoc</th><th>Etichetă</th><th /></tr></thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td><strong>{product.name}</strong><div className="muted small">{product.slug}</div></td>
                <td>{product.category}</td>
                <td>{formatPrice(product.price_cents)}</td>
                <td><span className={`tag ${product.stock === 0 ? 'tag-red' : product.stock <= 20 ? 'tag-amber' : 'tag-green'}`}>{product.stock}</span></td>
                <td>{product.badge}</td>
                <td className="row-actions">
                  <button type="button" onClick={() => startEdit(product)}>Editează</button>
                  <button type="button" className="danger" onClick={() => remove(product)}>Șterge</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
