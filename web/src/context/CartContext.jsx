import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'searchmart-cart'

function loadStoredCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadStoredCart)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Dacă localStorage nu e disponibil, coșul rămâne doar în memorie.
    }
  }, [items])

  const value = useMemo(() => {
    // Cheia unui articol = produs + opțiunile de personalizare (switch-uri,
    // keycaps), ca două configurații diferite să fie linii separate în coș.
    const keyOf = (product, options) => `${product.id}|${options?.switches ?? ''}|${options?.keycaps ?? ''}`

    const add = (product, options = null, quantity = 1) =>
      setItems((current) => {
        const key = keyOf(product, options)
        const existing = current.find((item) => item.key === key)
        if (existing) {
          return current.map((item) => (item.key === key ? { ...item, quantity: item.quantity + quantity } : item))
        }
        return [...current, { key, product, options, quantity }]
      })

    const setQuantity = (key, quantity) =>
      setItems((current) =>
        quantity <= 0
          ? current.filter((item) => item.key !== key)
          : current.map((item) => (item.key === key ? { ...item, quantity } : item)),
      )

    const clear = () => setItems([])

    const totalCents = items.reduce((sum, item) => sum + item.product.price_cents * item.quantity, 0)
    const count = items.reduce((sum, item) => sum + item.quantity, 0)

    return { items, add, setQuantity, clear, totalCents, count }
  }, [items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart trebuie folosit în interiorul unui CartProvider')
  return context
}
