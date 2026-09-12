import { images } from '../images.js'
import KeyboardArt from './KeyboardArt.jsx'

const ACCENTS = { orange: '#FF4F1F', pink: '#E38A9A', cream: '#E8C79A', dark: '#111111' }

// Close-up de keycaps mari, folosit ca placeholder pentru imaginile "detaliu".
function KeycapsArt({ accent = 'orange', rows = 3, cols = 4, tilt = true }) {
  const accentColor = ACCENTS[accent] ?? ACCENTS.orange
  const size = 100
  const gap = 8
  const width = cols * (size + gap)
  const height = rows * (size + gap)
  const caps = []
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const isAccent = (r + c) % 5 === 0
      const x = c * (size + gap)
      const y = r * (size + gap)
      caps.push(
        <g key={`${r}-${c}`}>
          <rect x={x} y={y + 8} width={size} height={size} rx={12} fill={isAccent ? accentColor : '#D9D6CF'} />
          <rect x={x} y={y} width={size} height={size - 4} rx={12} fill={isAccent ? accentColor : '#F3F1EC'} />
          <rect x={x + 12} y={y + 10} width={size - 24} height={size - 30} rx={8} fill={isAccent ? 'rgba(255,255,255,0.14)' : '#FBFAF7'} />
        </g>,
      )
    }
  }
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{ width: '100%', height: '100%', transform: tilt ? 'rotate(-8deg) scale(1.25)' : undefined }}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Keycaps close-up illustration"
    >
      {caps}
    </svg>
  )
}

// Un switch mecanic văzut de sus.
function SwitchArt({ accent = 'orange' }) {
  const accentColor = ACCENTS[accent] ?? ACCENTS.orange
  return (
    <svg viewBox="0 0 200 200" style={{ width: '70%', height: '70%' }} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Switch illustration">
      <rect x={20} y={28} width={160} height={160} rx={22} fill="#1B1B1B" />
      <rect x={20} y={20} width={160} height={160} rx={22} fill="#2C2C2C" />
      <rect x={44} y={44} width={112} height={112} rx={14} fill="#E9E7E1" />
      <rect x={82} y={70} width={36} height={60} rx={6} fill={accentColor} />
      <rect x={70} y={94} width={60} height={14} rx={4} fill={accentColor} />
    </svg>
  )
}

// Mouse văzut de sus.
function MouseArt({ accent = 'orange' }) {
  const accentColor = ACCENTS[accent] ?? ACCENTS.orange
  return (
    <svg viewBox="0 0 320 420" style={{ height: '88%', width: 'auto' }} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Mouse illustration">
      <path d="M160 14c-78 0-130 58-130 150v110c0 78 58 132 130 132s130-54 130-132V164c0-92-52-150-130-150z" fill="#1c1c1c" />
      <path d="M160 24c-70 0-118 52-118 140v110c0 70 52 122 118 122s118-52 118-122V164c0-88-48-140-118-140z" fill="#2c2c2c" />
      <path d="M160 24c-70 0-118 52-118 140v20h236v-20c0-88-48-140-118-140z" fill="#3a3a3a" />
      <rect x="157" y="24" width="6" height="160" fill="#1c1c1c" />
      <rect x="146" y="72" width="28" height="56" rx="14" fill="#141414" />
      <rect x="152" y="80" width="16" height="40" rx="8" fill={accentColor} />
      <rect x="36" y="200" width="16" height="44" rx="6" fill={accentColor} />
      <rect x="36" y="254" width="16" height="44" rx="6" fill={accentColor} />
      <rect x="120" y="300" width="80" height="6" rx="3" fill="#1c1c1c" />
    </svg>
  )
}

// Căști over-ear, din față.
function HeadphonesArt({ accent = 'orange' }) {
  const accentColor = ACCENTS[accent] ?? ACCENTS.orange
  return (
    <svg viewBox="0 0 420 400" style={{ height: '88%', width: 'auto' }} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Headset illustration">
      <path d="M60 230V190C60 100 126 30 210 30s150 70 150 160v40" fill="none" stroke="#2c2c2c" strokeWidth="34" strokeLinecap="round" />
      <path d="M60 230V190C60 100 126 30 210 30s150 70 150 160v40" fill="none" stroke="#3a3a3a" strokeWidth="18" strokeLinecap="round" />
      <rect x="28" y="200" width="82" height="150" rx="34" fill="#1c1c1c" />
      <rect x="40" y="212" width="58" height="126" rx="28" fill="#2c2c2c" />
      <rect x="310" y="200" width="82" height="150" rx="34" fill="#1c1c1c" />
      <rect x="322" y="212" width="58" height="126" rx="28" fill="#2c2c2c" />
      <circle cx="69" cy="275" r="14" fill={accentColor} />
      <circle cx="351" cy="275" r="14" fill={accentColor} />
      <path d="M330 345c14 22 6 42-14 48" fill="none" stroke="#2c2c2c" strokeWidth="10" strokeLinecap="round" />
      <circle cx="312" cy="396" r="10" fill={accentColor} />
    </svg>
  )
}

// Desk mat / mousepad, de sus.
function MousepadArt({ accent = 'orange' }) {
  const accentColor = ACCENTS[accent] ?? ACCENTS.orange
  return (
    <svg viewBox="0 0 900 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Desk mat illustration">
      <rect x="10" y="16" width="880" height="380" rx="24" fill="#111" />
      <rect x="10" y="6" width="880" height="380" rx="24" fill="#1f1f1f" />
      <rect x="26" y="22" width="848" height="348" rx="16" fill="none" stroke="#3a3a3a" strokeWidth="2" strokeDasharray="8 8" />
      <rect x="60" y="300" width="14" height="14" rx="3" fill={accentColor} />
      <rect x="78" y="300" width="14" height="14" rx="3" fill="#e8e6e0" />
      <rect x="60" y="318" width="14" height="14" rx="3" fill="#e8e6e0" />
      <rect x="78" y="318" width="14" height="14" rx="3" fill={accentColor} />
      <text x="102" y="330" fontFamily="Inter Tight, Inter, sans-serif" fontWeight="600" fontSize="26" fill="#e8e6e0" letterSpacing="-1">nexa</text>
    </svg>
  )
}

function BoxArt({ label }) {
  return (
    <div className="pic-box">
      <span>{label}</span>
    </div>
  )
}

/**
 * Afișează imaginea reală dacă e configurată în images.js, altfel un
 * placeholder desenat (kind: 'keyboard' | 'keycaps' | 'switch' | 'mouse' | 'headphones' | 'mousepad' | 'box').
 */
export default function Picture({ name, kind = 'box', accent = 'orange', variant = 'light', alt = '', className = '', style, ...rest }) {
  const source = name ? images[name] : null
  if (source) {
    return <img src={source} alt={alt} className={className} style={style} />
  }

  let art
  if (kind === 'keyboard') art = <KeyboardArt variant={variant} accent={accent} style={{ width: '92%', height: 'auto' }} {...rest} />
  else if (kind === 'keycaps') art = <KeycapsArt accent={accent} {...rest} />
  else if (kind === 'switch') art = <SwitchArt accent={accent} />
  else if (kind === 'mouse') art = <MouseArt accent={accent} />
  else if (kind === 'headphones') art = <HeadphonesArt accent={accent} />
  else if (kind === 'mousepad') art = <MousepadArt accent={accent} />
  else art = <BoxArt label={alt || name || 'image'} />

  return (
    <div className={`pic pic-${kind} ${className}`} style={style} data-image-key={name || undefined}>
      {art}
    </div>
  )
}
