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
        <h1>Setări</h1>
        <p className="muted">Controlează motorul de căutare folosit de magazin.</p>
      </div>

      <section className="panel">
        <h3>Algoritmul de căutare din magazin</h3>
        <p className="muted small">
          Clienții nu văd această alegere — bara de căutare pur și simplu funcționează. Fiecare căutare
          e înregistrată împreună cu algoritmul folosit, ca să poți compara timpii reali la
          <strong> Algoritmi de căutare</strong>.
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
                {option.id === 'kmp' && 'Previzibil, liniar în orice caz.'}
                {option.id === 'bmh' && 'Cel mai rapid pe text natural (implicit).'}
                {option.id === 'rk' && 'Bazat pe hash, bun pentru căutarea mai multor șabloane.'}
              </span>
            </button>
          ))}
        </div>
        {saved && <p className="muted small">Salvat ✓</p>}
      </section>
    </div>
  )
}
