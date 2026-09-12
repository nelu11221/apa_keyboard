// Iconițe SVG mici, inline — fără dependențe.

export function Logo({ dark = false, size = 22 }) {
  const ink = dark ? '#FFFFFF' : '#131313'
  return (
    <span className="logo" style={{ color: ink, fontSize: size }}>
      <svg width={size * 0.8} height={size * 0.8} viewBox="0 0 20 20" aria-hidden="true">
        <rect x="1" y="1" width="8" height="8" rx="1.5" fill="#FF4F1F" />
        <rect x="11" y="1" width="8" height="8" rx="1.5" fill={ink} />
        <rect x="1" y="11" width="8" height="8" rx="1.5" fill={ink} />
        <rect x="11" y="11" width="8" height="8" rx="1.5" fill="#FF4F1F" />
      </svg>
      <span>nexa</span>
    </span>
  )
}

export function ArrowRight({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  )
}

export function CheckBadge({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="8" fill="#12B981" />
      <path d="M4.5 8.2l2.3 2.3 4.7-4.8" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Diamond({ size = 10 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" aria-hidden="true">
      <rect x="1.5" y="1.5" width="7" height="7" rx="1" transform="rotate(45 5 5)" fill="#FF4F1F" />
    </svg>
  )
}

export function Bolt() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#FF4F1F" />
      <path d="M13 5l-5 8h4l-1 6 5-8h-4z" fill="#fff" />
    </svg>
  )
}

export function Speaker() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FF4F1F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 9v6h4l5 4V5L8 9H4z" fill="#FF4F1F" />
      <path d="M16 8.5a5 5 0 010 7M18.5 6a8.5 8.5 0 010 12" />
    </svg>
  )
}

export function Grid() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="#FF4F1F" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="3" fill="none" stroke="#FF4F1F" strokeWidth="2" />
      {[7, 12, 17].map((x) => [8, 12, 16].map((y) => <rect key={`${x}-${y}`} x={x - 1.3} y={y - 1.3} width="2.6" height="2.6" rx="0.6" />))}
    </svg>
  )
}

export function Shield() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5l8-3z" fill="#FF4F1F" />
      <path d="M12 8l1.2 2.5 2.8.4-2 2 .5 2.7L12 14.3l-2.5 1.3.5-2.7-2-2 2.8-.4z" fill="#fff" />
    </svg>
  )
}

export function Cart({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 4h2l2.4 11.2a2 2 0 002 1.6h8.4a2 2 0 002-1.6L21 8H7" />
      <circle cx="10" cy="20" r="1" /><circle cx="17" cy="20" r="1" />
    </svg>
  )
}

export function Search({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
    </svg>
  )
}
