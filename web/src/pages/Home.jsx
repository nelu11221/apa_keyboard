import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import ExplodedScroll from '../components/ExplodedScroll.jsx'
import { images } from '../images.js'
import HeroScroller from '../components/HeroScroller.jsx'
import StudioSection from '../components/StudioSection.jsx'
import { ArrowRight, Bolt, CheckBadge, Diamond, Grid, Logo, Shield, Speaker } from '../components/Icons.jsx'
import Picture from '../components/Picture.jsx'

const FEATURE_PILLS = [
  { label: 'MECHANICAL SWITCHES', to: '/shop?category=switches' },
  { label: 'PBT KEYCAPS', to: '/shop?category=keycaps' },
  { label: 'HOT-SWAPPABLE', to: '/shop?category=keyboards' },
  { label: 'RGB LIGHTING', to: '/product/nexa-tkl' },
]

const SWITCHES = [
  { index: '01', name: 'Cherry Mix', slug: 'cherry-mix-switches', accent: 'orange', imageKey: 'switchBlockCherry' },
  { index: '02', name: 'Kailh/Kaihua', slug: 'kailh-kaihua-box-white', accent: 'cream', imageKey: 'switchBlockKailh' },
  { index: '03', name: 'Outemu', slug: 'outemu-silent-peach', accent: 'dark', imageKey: 'switchBlockOutemu' },
  { index: '04', name: 'Romer G', slug: 'romer-g-tactile', accent: 'orange', imageKey: 'switchBlockRomerG' },
]

const SWITCH_LABELS = [
  { side: 'left', top: 12, order: 0, text: 'Top housing', hint: 'polycarbonate, smoky clear' },
  { side: 'right', top: 30, order: 1, text: 'Stem', hint: 'POM, factory lubed' },
  { side: 'left', top: 50, order: 2, text: 'Spring', hint: '45 g, gold-plated steel' },
  { side: 'right', top: 68, order: 3, text: 'Contact leaf', hint: 'gold alloy, 100M actuations' },
  { side: 'left', top: 87, order: 4, text: 'Bottom housing', hint: 'nylon, 5-pin' },
]

const MOUSE_LABELS = [
  { side: 'left', top: 10, order: 0, text: 'Top shell', hint: 'PBT, 58 g total weight' },
  { side: 'right', top: 26, order: 1, text: 'Scroll wheel', hint: 'notched or free-spin' },
  { side: 'left', top: 42, order: 2, text: 'Main body', hint: '2 programmable side buttons' },
  { side: 'right', top: 58, order: 3, text: 'PCB & sensor', hint: '26K optical, 1 ms wireless' },
  { side: 'left', top: 74, order: 4, text: 'Battery', hint: '90 h, USB-C fast charge' },
  { side: 'right', top: 90, order: 5, text: 'Base', hint: 'pure PTFE feet' },
]

const BENEFITS = [
  { icon: <Bolt />, title: 'Ultra-responsive typing', text: 'Fast, consistent, and satisfying with every press.' },
  { icon: <Speaker />, title: 'Premium acoustic design', text: 'Engineered layers reduce unwanted noise and vibration.' },
  { icon: <Grid />, title: 'Ergonomic layout', text: 'Compact design without sacrificing essential functionality.' },
  { icon: <Shield />, title: 'Built to last', text: 'Premium materials designed for thousands of hours of use.' },
]

export default function Home() {
  const [activeSwitch, setActiveSwitch] = useState(0)
  const filmRef = useRef(null)
  const [filmNeedsTap, setFilmNeedsTap] = useState(false)

  // Clipul de reclamă din secțiunea de keycaps rulează doar cât e vizibil.
  // Pe iOS redarea automată merge doar dacă atributele muted/playsinline sunt
  // chiar în DOM (React setează doar proprietatea `muted`); dacă telefonul tot
  // refuză (ex. Low Power Mode), arătăm un buton ▶ și pornim la atingere.
  useEffect(() => {
    const video = filmRef.current
    if (!video) return undefined
    video.muted = true
    video.defaultMuted = true
    video.setAttribute('muted', '')
    video.setAttribute('playsinline', '')
    video.setAttribute('webkit-playsinline', '')

    function tryPlay() {
      const attempt = video.play()
      if (attempt && attempt.catch) {
        attempt.then(() => setFilmNeedsTap(false)).catch(() => setFilmNeedsTap(true))
      }
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) tryPlay()
        else video.pause()
      },
      { threshold: 0.3 },
    )
    observer.observe(video)
    // prima atingere oriunde pe pagină deblochează redarea pe telefoanele stricte
    const unlock = () => { if (video.paused && video.getBoundingClientRect().top < window.innerHeight) tryPlay() }
    window.addEventListener('touchend', unlock, { passive: true, once: true })
    return () => {
      observer.disconnect()
      window.removeEventListener('touchend', unlock)
    }
  }, [])

  function playFilm() {
    const video = filmRef.current
    if (!video) return
    video.muted = true
    video.play().then(() => setFilmNeedsTap(false)).catch(() => {})
  }

  return (
    <div className="home">
      {/* ---------- Hero (Nexa) ---------- */}
      <section className="hero">
        <div className="hero-inner">
          <span className="hero-tag hero-tag-left"><CheckBadge /> HOT-SWAPPABLE SWITCHES</span>
          <span className="hero-tag hero-tag-right-top"><CheckBadge /> CUSTOM OLED DISPLAY</span>
          <span className="hero-tag hero-tag-right-bottom"><CheckBadge /> DUAL CONTROL KNOBS</span>
          {/* pe mobil etichetele înclinate nu încap: le arătăm ca un rând de cipuri */}
          <div className="hero-chips" aria-hidden="true">
            <span><CheckBadge /> HOT-SWAPPABLE</span>
            <span><CheckBadge /> OLED DISPLAY</span>
            <span><CheckBadge /> DUAL KNOBS</span>
          </div>
          <h1>Built for the<br />way you work<br />and play.</h1>
          <p className="hero-sub">
            A premium mechanical keyboard designed for performance, customization,
            and complete control down to every key.
          </p>
          <div className="hero-actions">
            <Link to="/product/nexa-65" className="btn btn-orange">EXPLORE KEYBOARD</Link>
            <Link to="/shop?category=keycaps" className="btn btn-white">CUSTOMIZE YOURS</Link>
          </div>
        </div>

      </section>

      <HeroScroller />

      {/* ---------- Feature pills (Keymon) ---------- */}
      <section className="pills-row">
        {FEATURE_PILLS.map((pill) => (
          <Link key={pill.label} to={pill.to} className="pill">
            <Diamond /> {pill.label} <ArrowRight />
          </Link>
        ))}
      </section>

      {/* ---------- Statement (Keymon) ---------- */}
      <section className="statement">
        <h2>Work Smarter, Not<br />Harder. Seamless Typing.</h2>
        <p>
          Say goodbye to mushy membrane keys and scattered focus. Our intuitive mechanical
          keyboards help <span className="muted">enthusiasts</span>—from programmers to
          designers—stay in flow with switches, keycaps and layouts tuned for the way you work.
        </p>
      </section>

      {/* ---------- More than just a keyboard (Nexa) ---------- */}
      <section className="more" id="features">
        <div className="section-head">
          <h2>More than just a keyboard.</h2>
          <p>Every detail is designed to deliver a smoother, faster, and more personal typing experience.</p>
        </div>
        <div className="more-grid">
          <div className="more-cards">
            <article className="card">
              <span className="card-icon">⚡</span>
              <h3>Precision Performance</h3>
              <p>Responsive mechanical switches engineered for every keystroke.</p>
            </article>
            <article className="card">
              <span className="card-icon">🎛️</span>
              <h3>Total Control</h3>
              <p>Two programmable knobs for volume, scrolling, zoom, or anything you map them to.</p>
            </article>
            <article className="card">
              <span className="card-icon">🖥️</span>
              <h3>Smart Display</h3>
              <p>Access time, system information, profiles, and more with the integrated display.</p>
            </article>
          </div>
          <div className="more-visual">
            <Picture name="featureCloseup" kind="keycaps" accent="orange" rows={5} cols={4} alt="Keyboard close-up" />
          </div>
        </div>
      </section>

      {/* ---------- Exploded view (Nexa) — se deschide la scroll ---------- */}
      {/* pe mobil: static — titlu, imaginea desfăcută și etichetele (vezi ExplodedScroll) */}
      <ExplodedScroll staticImage={images.explodedKeyboardCut} staticHeading="Inside the keyboard." />

      {/* ---------- Benefits (Nexa) ---------- */}
      <section className="benefits" id="benefits">
        <div className="section-head">
          <h2>Designed for speed. Built for comfort.</h2>
          <p>Every detail of NEXA is engineered to deliver a faster, smoother, and more comfortable typing experience.</p>
        </div>
        <div className="benefits-grid">
          {BENEFITS.map((benefit) => (
            <article key={benefit.title} className="card benefit">
              <div className="benefit-icon">{benefit.icon}</div>
              <h3>{benefit.title}</h3>
              <p>{benefit.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ---------- Switch list (Keymon) ---------- */}
      <section className="switches">
        <span className="eyebrow">Switch <Diamond size={8} /></span>
        <div className="switches-head">
          <h2>Tuned For Every<br />Typing Style</h2>
          <p className="switches-note">
            The component that determines the feel, sound and speed of every keystroke. Pick yours,
            swap it in seconds — no soldering required.
          </p>
        </div>
        <ul className="switch-list">
          {SWITCHES.map((item, index) => (
            <li key={item.slug} className={index === activeSwitch ? 'active' : ''} onMouseEnter={() => setActiveSwitch(index)}>
              <Link to={`/product/${item.slug}`}>
                <span className="switch-index">{item.index}</span>
                <span className="switch-name">{item.name}</span>
              </Link>
              {index === activeSwitch && (
                <div className="switch-thumb">
                  <Picture name={item.imageKey} kind="keycaps" accent={item.accent} rows={2} cols={3} tilt={false} alt={item.name} />
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- Inside the switch — se desface la scroll ---------- */}
      <ExplodedScroll
        id="switch"
        heading="Inside the switch."
        intro="Five parts, one keystroke. Every NEXA switch is factory lubed and rated for 100 million presses."
        hint="Scroll to open the switch"
        assembled={images.switchAssembled}
        exploded={images.switchExploded}
        staticImage={images.switchExplodedCut}
        video={images.switchVideo}
        labels={SWITCH_LABELS}
        alt="Exploded view of a NEXA switch"
      />

      {/* ---------- Keycaps (Keymon) ---------- */}
      <section className="keycaps">
        <div className="keycaps-head">
          <h2>Elevate Your<br />Keyboard Experience</h2>
          <p className="keycaps-note">
            The keycaps are designed and engineered for the best feel, standing out even after hours of use.
          </p>
        </div>
        <div className="keycaps-grid">
          <div className="keycaps-text">
            <h3>Artisan Keycaps</h3>
            <p>
              We offer decorative keycaps and premium surface materials that balance aesthetics,
              consistency, and durability — perfect for gaming, productivity, and collectible setups.
            </p>
            <Link to="/shop?category=keycaps" className="btn btn-dark btn-sm">Shop Now <ArrowRight /></Link>
          </div>
          <div className="keycaps-film">
            <video
              ref={filmRef}
              src={images.productVideos?.['nexa-75'] || undefined}
              poster={images.heroKeyboard || undefined}
              muted
              loop
              autoPlay
              playsInline
              preload="auto"
              onPlaying={() => setFilmNeedsTap(false)}
            />
            {filmNeedsTap && (
              <button type="button" className="film-play" onClick={playFilm} aria-label="Play the film">▶</button>
            )}
            <Link to="/product/nexa-75" className="keycaps-film-tag">NEXA 75 · The film <ArrowRight /></Link>
          </div>
        </div>
      </section>

      {/* ---------- NEXA Pulse mouse — se desface la scroll ---------- */}
      <ExplodedScroll
        id="mouse"
        heading="Meet NEXA Pulse."
        intro="A 58-gram wireless mouse built around a 26K sensor, optical switches and a wheel that goes from notched to free-spin with a click."
        hint="Scroll to open the mouse"
        assembled={images.mouseStart}
        exploded={images.mouseExploded}
        staticImage={images.mouseExplodedCut}
        video={images.mouseVideo}
        labels={MOUSE_LABELS}
        alt="Exploded view of the NEXA Pulse mouse"
      />

      {/* ---------- NEXA Studio — aplicația de configurare ---------- */}
      <StudioSection />

      {/* ---------- CTA (Nexa) ---------- */}
      <section className="cta">
        <Logo size={22} />
        <h2>Your setup deserves better.</h2>
        <p>Experience a keyboard built around performance, creativity, and complete customization.</p>
        <Link to="/shop" className="btn btn-orange">EXPLORE THE KEYBOARD</Link>
      </section>
    </div>
  )
}
