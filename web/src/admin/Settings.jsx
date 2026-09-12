import { useEffect, useState } from 'react'

import { ALGORITHMS, api } from '../api.js'

export default function Settings() {
  const [algorithm, setAlgorithm] = useState('bmh')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.admin.settings().then((s) => setAlgorithm(s.search_algorithm)).catch((e) => setError(e.message))
  }, [])

  async function choose(id) {
    setAlgorithm(id)
    setSaved(false)
    setError('')
    try {
      await api.admin.updateSettings({ search_algorithm: id })
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <div>
      <div className="admin-head">
        <h1>Settings</h1>
        <p className="muted">Controls the search engine used by the customer-facing store.</p>
      </div>

      <section className="panel">
        <h3>Store search algorithm</h3>
        <p className="muted small">
          Customers never see this choice — the search bar just works. Every search is logged with the
          algorithm used, so you can compare real-world timings under <strong>Search algorithms</strong>.
        </p>
        {error && <p className="notice notice-error">{error}</p>}
        <div className="radio-cards">
          {ALGORITHMS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={option.id === algorithm ? 'radio-card active' : 'radio-card'}
              onClick={() => choose(option.id)}
            >
              <strong>{option.label}</strong>
              <span className="muted small">
                {option.id === 'kmp' && 'Predictable, linear in every case.'}
                {option.id === 'bmh' && 'Fastest on natural text (default).'}
                {option.id === 'rk' && 'Hash-based, good for multi-pattern search.'}
              </span>
            </button>
          ))}
        </div>
        {saved && <p className="muted small">Saved ✓</p>}
      </section>
    </div>
  )
}
