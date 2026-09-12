// Ilustrație SVG a unei tastaturi 65% — folosită ca placeholder până când
// sunt puse fotografiile reale. Desenată programatic din rândurile de mai jos
// (lățimile sunt în "unități de tastă").

const ROWS = [
  [['esc', 1, 'accent'], ...'1234567890-='.split('').map((k) => [k, 1]), ['⌫', 2], ['del', 1, 'side']],
  [['tab', 1.5], ...'QWERTYUIOP[]'.split('').map((k) => [k, 1]), ['\\', 1.5], ['pg↑', 1, 'side']],
  [['caps', 1.75], ..."ASDFGHJKL;'".split('').map((k) => [k, 1]), ['↵', 2.25], ['pg↓', 1, 'side']],
  [['shift', 2.25], ...'ZXCVBNM,./'.split('').map((k) => [k, 1]), ['shift', 1.75], ['↑', 1, 'accent'], ['end', 1, 'side']],
  [['ctrl', 1.25], ['fn', 1.25], ['⌘', 1.25], ['alt', 1.25], ['', 6.25], ['alt', 1], ['ctrl', 1], ['←', 1, 'accent'], ['↓', 1, 'accent'], ['→', 1, 'accent']],
]

const PALETTES = {
  light: { case: '#2A2A2A', caseEdge: '#1A1A1A', key: '#F1EFEA', keyEdge: '#D9D6CF', legend: '#5E5C57', side: '#E3E1DB' },
  dark: { case: '#1C1C1C', caseEdge: '#0F0F0F', key: '#33322F', keyEdge: '#232220', legend: '#B9B7B1', side: '#2A2927' },
  cream: { case: '#CFC9BC', caseEdge: '#B3AD9F', key: '#FBF8F1', keyEdge: '#E1DCCF', legend: '#6B675E', side: '#EFEAE0' },
}

const ACCENTS = { orange: '#FF4F1F', pink: '#E38A9A', cream: '#E8C79A', dark: '#111111' }

export default function KeyboardArt({
  variant = 'light',
  accent = 'orange',
  showDisplay = true,
  showLegends = true,
  className = '',
  style,
}) {
  const palette = PALETTES[variant] ?? PALETTES.light
  const accentColor = ACCENTS[accent] ?? ACCENTS.orange

  const unit = 52
  const gap = 5
  const pad = 22
  const sideGap = 10
  const rowUnits = 15 + (showDisplay ? 1.6 : 0) + 1 // rând principal + spațiu + coloană laterală
  const width = pad * 2 + rowUnits * unit + gap * 16 + sideGap
  const height = pad * 2 + ROWS.length * unit + (ROWS.length - 1) * gap

  const keys = []
  ROWS.forEach((row, rowIndex) => {
    let x = pad
    const y = pad + rowIndex * (unit + gap)
    row.forEach(([label, widthUnits, kind], keyIndex) => {
      if (kind === 'side') {
        // Coloana din dreapta, după spațiul pentru display/knob-uri.
        x = pad + 15 * unit + 14 * gap + sideGap + (showDisplay ? 1.6 * unit + gap : 0)
      }
      const w = widthUnits * unit + (widthUnits - 1) * gap
      const fill = kind === 'accent' ? accentColor : kind === 'side' ? palette.side : palette.key
      const legendColor = kind === 'accent' ? (accent === 'dark' ? '#FFFFFF' : '#FFFFFF') : palette.legend
      keys.push(
        <g key={`${rowIndex}-${keyIndex}`}>
          <rect x={x} y={y + 3} width={w} height={unit} rx={7} fill={kind === 'accent' ? accentColor : palette.keyEdge} />
          <rect x={x} y={y} width={w} height={unit - 2} rx={7} fill={fill} />
          {showLegends && label && (
            <text x={x + 8} y={y + 16} fontSize={9} fontFamily="Inter, sans-serif" fontWeight={500} fill={legendColor}>
              {label}
            </text>
          )}
        </g>,
      )
      x += w + gap
    })
  })

  const displayX = pad + 15 * unit + 14 * gap + sideGap
  const displayY = pad

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Mechanical keyboard illustration"
    >
      <rect x={0} y={6} width={width} height={height} rx={18} fill={palette.caseEdge} />
      <rect x={0} y={0} width={width} height={height} rx={18} fill={palette.case} />
      {keys}
      {showDisplay && (
        <g>
          <circle cx={displayX + 0.8 * unit} cy={displayY + 0.5 * unit} r={18} fill="#0E0E0E" />
          <circle cx={displayX + 0.8 * unit} cy={displayY + 0.5 * unit} r={12} fill="#2C2C2C" />
          <circle cx={displayX + 0.8 * unit} cy={displayY + 1.65 * unit} r={18} fill="#0E0E0E" />
          <circle cx={displayX + 0.8 * unit} cy={displayY + 1.65 * unit} r={12} fill="#2C2C2C" />
          <rect x={displayX + 0.15 * unit} y={displayY + 2.35 * unit} width={1.3 * unit} height={2.55 * unit} rx={8} fill="#0E0E0E" />
          <rect x={displayX + 0.25 * unit} y={displayY + 2.45 * unit} width={1.1 * unit} height={2.35 * unit} rx={6} fill="url(#nexaOled)" />
          <text x={displayX + 0.8 * unit} y={displayY + 3.35 * unit} textAnchor="middle" fontSize={13} fontWeight={600} fontFamily="Inter, sans-serif" fill="#111">
            9:42
          </text>
        </g>
      )}
      <defs>
        <linearGradient id="nexaOled" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFB347" />
          <stop offset="1" stopColor="#FFF3E0" />
        </linearGradient>
      </defs>
    </svg>
  )
}
