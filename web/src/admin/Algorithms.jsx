import { useEffect, useMemo, useState } from 'react'
import {
  CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'

import { ALGORITHMS, ALGORITHM_COLORS, ALGORITHM_LABELS, api } from '../api.js'

const THEORY = [
  { id: 'kmp', preprocessing: 'funcția de eșec pe șablon', best: 'liniar în lungimea textului', worst: 'liniar în lungimea textului', note: 'Nu recitește niciun caracter din text. Cel mai previzibil dintre cei trei.' },
  { id: 'bmh', preprocessing: 'tabela de salturi (caracter rău)', best: 'sub-liniar (sare peste text)', worst: 'lungimea textului × lungimea șablonului', note: 'Cel mai rapid în practică pe text natural, cu alfabet mare.' },
  { id: 'rk', preprocessing: 'hash-ul șablonului + hash glisant', best: 'liniar în lungimea textului', worst: 'lungimea textului × lungimea șablonului (coliziuni de hash)', note: 'Se extinde natural la căutarea mai multor șabloane deodată.' },
]

export default function Algorithms() {
  return (
    <div>
      <div className="admin-head">
        <h1>Algoritmi de căutare</h1>
        <p className="muted">
          Căutarea din magazin rulează pe un motor C++ care implementează trei algoritmi de potrivire
          a șabloanelor. Compară-i aici pe text sintetic de dimensiune crescătoare.
        </p>
      </div>

      <section className="panel">
        <h3>Teorie</h3>
        <table className="table">
          <thead><tr><th>Algoritm</th><th>Preprocesare</th><th>Cazul cel mai bun</th><th>Cazul cel mai rău</th><th>Observații</th></tr></thead>
          <tbody>
            {THEORY.map((row) => (
              <tr key={row.id}>
                <td><span className="dot" style={{ background: ALGORITHM_COLORS[row.id] }} /> <strong>{ALGORITHM_LABELS[row.id]}</strong></td>
                <td>{row.preprocessing}</td><td>{row.best}</td><td>{row.worst}</td><td className="muted">{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <Benchmark />
      <SearchLogs />
    </div>
  )
}

function Benchmark() {
  const [pattern, setPattern] = useState('keyboard')
  const [alphabet, setAlphabet] = useState('natural')
  const [repeats, setRepeats] = useState(3)
  const [scale, setScale] = useState('linear')
  const [data, setData] = useState(null)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')

  async function run(event) {
    event?.preventDefault()
    setRunning(true)
    setError('')
    try {
      setData(await api.benchmark({ pattern, alphabet, repeats }))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setRunning(false)
    }
  }

  const rows = useMemo(() => {
    if (!data) return []
    const byLength = new Map()
    for (const point of data.points) {
      if (!byLength.has(point.text_length)) byLength.set(point.text_length, { text_length: point.text_length })
      byLength.get(point.text_length)[point.algorithm] = Number(point.time_us.toFixed(2))
    }
    return [...byLength.values()].sort((a, b) => a.text_length - b.text_length)
  }, [data])

  return (
    <section className="panel">
      <div className="panel-head">
        <h3>Măsurători</h3>
        {rows.length > 0 && (
          <div className="seg">
            <button type="button" className={scale === 'linear' ? 'active' : ''} onClick={() => setScale('linear')}>Liniar</button>
            <button type="button" className={scale === 'log' ? 'active' : ''} onClick={() => setScale('log')}>Log</button>
          </div>
        )}
      </div>

      <form className="bench-form" onSubmit={run}>
        <label>Șablon<input value={pattern} onChange={(e) => setPattern(e.target.value)} maxLength={50} required /></label>
        <label>Alfabet
          <select value={alphabet} onChange={(e) => setAlphabet(e.target.value)}>
            <option value="natural">natural (26 de litere + spațiu)</option>
            <option value="mic">binar (doar „a” și „b”)</option>
          </select>
        </label>
        <label>Repetări<input type="number" min={1} max={10} value={repeats} onChange={(e) => setRepeats(Number(e.target.value))} /></label>
        <button type="submit" className="btn btn-orange btn-sm" disabled={running}>{running ? 'RULEAZĂ…' : 'PORNEȘTE MĂSURĂTORILE'}</button>
      </form>

      {error && <p className="notice notice-error">{error}</p>}

      {rows.length > 0 && (
        <>
          <ResponsiveContainer width="100%" height={340}>
            <LineChart data={rows} margin={{ top: 10, right: 24, left: 8, bottom: 26 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ECEAE4" />
              <XAxis
                dataKey="text_length" type="number" scale={scale} domain={['dataMin', 'dataMax']}
                ticks={scale === 'log' ? rows.map((r) => r.text_length) : undefined}
                tickFormatter={(v) => v.toLocaleString('en-US')} tick={{ fontSize: 11 }}
                label={{ value: 'lungimea textului (caractere)', position: 'insideBottom', offset: -16, fontSize: 12 }}
              />
              <YAxis
                scale={scale} domain={scale === 'log' ? ['auto', 'auto'] : [0, 'auto']}
                tickFormatter={(v) => v.toLocaleString('en-US')} tick={{ fontSize: 11 }} width={64}
                label={{ value: 'timp (µs)', angle: -90, position: 'insideLeft', fontSize: 12 }}
              />
              <Tooltip formatter={(value, name) => [`${value} µs`, ALGORITHM_LABELS[name]]} labelFormatter={(v) => `${v.toLocaleString('ro-RO')} caractere`} />
              <Legend verticalAlign="top" height={30} formatter={(id) => ALGORITHM_LABELS[id]} />
              {ALGORITHMS.map((a) => (
                <Line key={a.id} type="monotone" dataKey={a.id} stroke={ALGORITHM_COLORS[a.id]} strokeWidth={2.5} dot={{ r: 3 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>

          <table className="table">
            <thead><tr><th>Lungimea textului</th>{ALGORITHMS.map((a) => <th key={a.id}>{a.label} (µs)</th>)}</tr></thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.text_length}>
                  <td>{row.text_length.toLocaleString('en-US')}</td>
                  {ALGORITHMS.map((a) => <td key={a.id}>{row[a.id]}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </section>
  )
}

function SearchLogs() {
  const [logs, setLogs] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    api.admin.searchLogs(30).then((list) => setLogs(Array.isArray(list) ? list : [])).catch((e) => setError(e.message))
  }, [])

  return (
    <section className="panel">
      <h3>Căutări recente</h3>
      <p className="muted small">Fiecare căutare reală din magazin și din admin, cu algoritmul folosit și timpul măsurat.</p>
      {error && <p className="notice notice-error">{error}</p>}
      {logs.length === 0 ? (
        <p className="muted">Nicio căutare înregistrată încă.</p>
      ) : (
        <table className="table">
          <thead><tr><th>Căutare</th><th>Unde</th><th>Algoritm</th><th>Lungimea textului</th><th>Potriviri</th><th>Timp</th><th>Când</th></tr></thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td><code>{log.query}</code></td>
                <td>{log.scope === 'orders' ? 'comenzi' : 'produse'}</td>
                <td><span className="dot" style={{ background: ALGORITHM_COLORS[log.algorithm] }} /> {ALGORITHM_LABELS[log.algorithm]}</td>
                <td>{log.text_length.toLocaleString('en-US')}</td>
                <td>{log.match_count}</td>
                <td>{log.time_us.toFixed(2)} µs</td>
                <td className="muted small">{new Date(log.created_at).toLocaleTimeString('ro-RO')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}
