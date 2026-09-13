import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

import { images } from '../images.js'
import { ArrowRight } from './Icons.jsx'

const FEATURES = [
  { title: 'Remap any key', text: 'Layers, tap-hold, dual-function keys — every key on every NEXA device.' },
  { title: 'Macros in seconds', text: 'Record a sequence once, bind it to a key or a knob turn.' },
  { title: 'Per-key lighting', text: 'Paint colours key by key or pick from ready-made effects.' },
  { title: 'Profiles that follow you', text: 'Settings live on the device — plug into any computer, it just works.' },
]

// Secțiunea aplicației de configurare: o fereastră de aplicație în care
// rulează în buclă secvența generată (pornește doar când e vizibilă).
export default function StudioSection() {
  const videoRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return undefined
    video.muted = true
    video.setAttribute('muted', '')
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {})
        else video.pause()
      },
      { threshold: 0.35 },
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="studio" id="studio">
      <div className="studio-head">
        <span className="eyebrow">NEXA Studio</span>
        <h2>One app. Every device.</h2>
        <p>
          Program, customise and update your keyboard, mouse and headset from a single place —
          macOS, Windows and Linux.
        </p>
      </div>

      <div className="studio-window">
        <div className="studio-titlebar">
          <span /><span /><span />
          <em>NEXA Studio</em>
        </div>
        <div className="studio-screen">
          {images.studioVideo ? (
            <video
              ref={videoRef}
              src={images.studioVideo}
              poster={images.studioScreen || undefined}
              muted
              loop
              playsInline
              preload="metadata"
            />
          ) : images.studioScreen ? (
            <img src={images.studioScreen} alt="NEXA Studio app" />
          ) : (
            <div className="studio-placeholder">NEXA Studio</div>
          )}
        </div>
      </div>

      <div className="studio-features">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="studio-feature">
            <h3>{feature.title}</h3>
            <p>{feature.text}</p>
          </div>
        ))}
      </div>

      <div className="studio-actions">
        <a href="#download" className="btn btn-dark">DOWNLOAD FOR MACOS</a>
        <Link to="/shop" className="link-arrow">Works with every NEXA device <ArrowRight /></Link>
      </div>
    </section>
  )
}
