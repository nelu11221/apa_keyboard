import { useEffect, useMemo, useState } from 'react'
import {
  CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'

import { ALGORITHMS, ALGORITHM_COLORS, ALGORITHM_LABELS, api } from '../api.js'

const THEORY = [
  { id: 'kmp', preprocessing: 'failure function on the pattern', best: 'linear in text length', worst: 'linear in text length', note: 'Never re-reads a text character. Most predictable of the three.' },
  { id: 'bmh', preprocessing: 'bad-character shift table', best: 'sub-linear (skips text)', worst: 'text length × pattern length', note: 'Fastest in practice on natural text with a large alphabet.' },
  { id: 'rk', preprocessing: 'pattern hash + rolling hash', best: 'linear in text length', worst: 'text length × pattern length (hash collisions)', note: 'Extends naturally to searching many patterns at once.' },
]

export default function Algorithms() {
  return (
    <div>
      <div className="admin-head">
        <h1>Search algorithms</h1>
        <p className="muted">
          The store search runs on a C++ engine implementing three pattern-matching algorithms.
          Compare them here on synthetic text of growing size.
        </p>
      </div>

      <section className="panel">
        <h3>Theory</h3>
        <table className="table">
          <thead><tr><th>Algorithm</th><th>Preprocessing</th><th>Best case</th><th>Worst case</th><th>Notes</th></tr></thead>
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
        <h3>Benchmark</h3>
        {rows.length > 0 && (
          <div className="seg">
            <button type="button" className={scale === 'linear' ? 'active' : ''} onClick={() => setScale('linear')}>Linear</button>
            <button type="button" className={scale === 'log' ? 'active' : ''} onClick={() => setScale('log')}>Log</button>
          </div>
        )}
      </div>

      <form className="bench-form" onSubmit={run}>
        <label>Pattern<input value={pattern} onChange={(e) => setPattern(e.target.value)} maxLength={50} required /></label>
        <label>Alphabet
          <select value={alphabet} onChange={(e) => setAlphabet(e.target.value)}>
            <option value="natural">natural (26 letters + space)</option>
            <option value="mic">binary (only “a” and “b”)</option>
          </select>
        </label>
        <label>Repeats<input type="number" min={1} max={10} value={repeats} onChange={(e) => setRepeats(Number(e.target.value))} /></label>
        <button type="submit" className="btn btn-orange btn-sm" disabled={running}>{running ? 'RUNNING…' : 'RUN BENCHMARK'}</button>
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
                label={{ value: 'text length (characters)', position: 'insideBottom', offset: -16, fontSize: 12 }}
              />
              <YAxis
                scale={scale} domain={scale === 'log' ? ['auto', 'auto'] : [0, 'auto']}
                tickFormatter={(v) => v.toLocaleString('en-US')} tick={{ fontSize: 11 }} width={64}
                label={{ value: 'time (µs)', angle: -90, position: 'insideLeft', fontSize: 12 }}
              />
              <Tooltip formatter={(value, name) => [`${value} µs`, ALGORITHM_LABELS[name]]} labelFormatter={(v) => `${v.toLocaleString('en-US')} characters`} />
              <Legend verticalAlign="top" height={30} formatter={(id) => ALGORITHM_LABELS[id]} />
              {ALGORITHMS.map((a) => (
                <Line key={a.id} type="monotone" dataKey={a.id} stroke={ALGORITHM_COLORS[a.id]} strokeWidth={2.5} dot={{ r: 3 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>

          <table className="table">
            <thead><tr><th>Text length</th>{ALGORITHMS.map((a) => <th key={a.id}>{a.label} (µs)</th>)}</tr></thead>
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
      <h3>Recent searches</h3>
      <p className="muted small">Every real search from the store and the admin, with the algorithm used and the measured time.</p>
      {error && <p className="notice notice-error">{error}</p>}
      {logs.length === 0 ? (
        <p className="muted">No searches logged yet.</p>
      ) : (
        <table className="table">
          <thead><tr><th>Query</th><th>Scope</th><th>Algorithm</th><th>Text length</th><th>Matches</th><th>Time</th><th>When</th></tr></thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td><code>{log.query}</code></td>
                <td>{log.scope}</td>
                <td><span className="dot" style={{ background: ALGORITHM_COLORS[log.algorithm] }} /> {ALGORITHM_LABELS[log.algorithm]}</td>
                <td>{log.text_length.toLocaleString('en-US')}</td>
                <td>{log.match_count}</td>
                <td>{log.time_us.toFixed(2)} µs</td>
                <td className="muted small">{new Date(log.created_at).toLocaleTimeString('en-GB')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}
