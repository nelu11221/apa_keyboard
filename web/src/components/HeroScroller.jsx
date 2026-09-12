import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { heroSlides } from '../heroSlides.js'
import Picture from './Picture.jsx'

// Panoul portocaliu cu toată gama de produse: secțiunea e înaltă cât
// (număr de produse) × înălțimea ferestrei, iar panoul vizibil rămâne fix
// (sticky) în timp ce banda de produse glisează orizontal proporțional cu
// cât ai derulat. După ultimul produs, secțiunea se termină și pagina
// continuă normal în jos.
export default function HeroScroller() {
  const sectionRef = useRef(null)
  const trackRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [activeHotspot, setActiveHotspot] = useState(null)

  const count = heroSlides.length

  useEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track) return undefined

    // Pe ecrane mici banda devine un carusel nativ cu swipe (CSS scroll-snap);
    // nu mai legăm poziția de scroll-ul vertical.
    const mobile = window.matchMedia('(max-width: 760px)')

    let frame = 0
    function update() {
      frame = 0
      if (mobile.matches) {
        track.style.transform = ''
        return
      }
      const rect = section.getBoundingClientRect()
      const scrollable = rect.height - window.innerHeight
      const progress = scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0
      track.style.transform = `translate3d(${-progress * (count - 1) * window.innerWidth}px, 0, 0)`
      setActiveIndex(Math.round(progress * (count - 1)))
    }
    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update)
    }

    // pe mobil, punctul activ urmărește slide-ul derulat orizontal
    function onTrackScroll() {
      if (!mobile.matches) return
      setActiveIndex(Math.round(track.scrollLeft / track.clientWidth))
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    track.addEventListener('scroll', onTrackScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      track.removeEventListener('scroll', onTrackScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [count])

  return (
    <section ref={sectionRef} className="hero-scroller" style={{ '--slides': count }}>
      <div className="hero-scroller-sticky">
        <div ref={trackRef} className="hero-track">
          {heroSlides.map((slide, slideIndex) => (
            <div key={slide.id} className="hero-scroll-slide">
              <div className="hero-slide-figure">
                <Link to={`/product/${slide.productSlug}`} className="hero-slide-media" aria-label={slide.name}>
                  <Picture name={slide.imageKey} kind={slide.kind} accent="orange" alt={slide.name} />
                </Link>

                {slide.hotspots.map((spot, spotIndex) => {
                  const key = `${slideIndex}-${spotIndex}`
                  return (
                    <div
                      key={key}
                      className={`hotspot ${activeHotspot === key ? 'active' : ''}`}
                      style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                      onMouseEnter={() => setActiveHotspot(key)}
                      onMouseLeave={() => setActiveHotspot(null)}
                      onFocus={() => setActiveHotspot(key)}
                      onBlur={() => setActiveHotspot(null)}
                      tabIndex={0}
                      role="button"
                      aria-label={spot.title}
                    >
                      <span className="hotspot-ring" />
                      <div className="hotspot-tip">
                        <strong>{spot.title}</strong>
                        <span>{spot.text}</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="hero-slide-caption">
                <span className="hero-slide-name">{slide.name}</span>
                <Link to={`/product/${slide.productSlug}`} className="hero-slide-link">View product →</Link>
              </div>
            </div>
          ))}
        </div>

        <div className="hero-dots" aria-hidden="true">
          {heroSlides.map((slide, index) => (
            <span key={slide.id} className={index === activeIndex ? 'active' : ''} />
          ))}
        </div>
      </div>
    </section>
  )
}
