import { useEffect, useRef, useState } from 'react'

import { images } from '../images.js'

// Etichetele straturilor tastaturii: partea (stânga/dreapta), poziția
// verticală pe imaginea explodată (procent din înălțime) și ordinea în care apar.
export const KEYBOARD_LABELS = [
  { side: 'left', top: 13, order: 0, text: 'Top Cover Keycaps', hint: 'PBT, dye-sub legends' },
  { side: 'right', top: 33, order: 1, text: 'Switches', hint: 'hot-swappable, 5-pin' },
  { side: 'left', top: 49, order: 2, text: 'Plate', hint: 'aluminium, gasket mount' },
  { side: 'right', top: 63, order: 3, text: 'PCB', hint: 'per-key RGB, USB-C' },
  { side: 'left', top: 76, order: 4, text: 'Sound Dampening Foam', hint: 'two layers, silicone + poron' },
  { side: 'right', top: 89, order: 5, text: 'Bottom Case', hint: 'CNC aluminium' },
]

// Secțiune "lipicioasă" reutilizabilă: la intrare se vede produsul întreg;
// pe măsură ce derulezi, clipul generat (sau, fără clip, imaginea explodată
// desfășurată pe verticală) îl desface în componente și etichetele apar una
// câte una. Progresul (0 → 1) e scris în variabila CSS --p, iar animațiile
// de fallback sunt calculate în CSS din ea.
export default function ExplodedScroll({
  id = 'explore',
  intro = 'Every component works together to deliver precision, customization, comfort, and a satisfying typing experience.',
  hint = 'Scroll to open the keyboard',
  assembled = images.heroKeyboard,
  exploded = images.explodedKeyboard,
  staticImage = null, // varianta cu fundal transparent, folosită pe mobil (static)
  video = images.explodedVideo,
  labels = KEYBOARD_LABELS,
  alt = 'Exploded view of the NEXA keyboard',
  heading = null,
}) {
  const sectionRef = useRef(null)
  const stageRef = useRef(null)
  const videoRef = useRef(null)
  const [videoReady, setVideoReady] = useState(false)
  // Pe telefon secțiunea e statică: titlu, imaginea explodată și etichetele,
  // fără clip, fără lipire la scroll și fără efecte.
  const [isStatic, setIsStatic] = useState(() => window.matchMedia('(max-width: 760px)').matches)
  useEffect(() => {
    const query = window.matchMedia('(max-width: 760px)')
    const onChange = () => setIsStatic(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])
  const hasVideo = Boolean(video) && !isStatic

  useEffect(() => {
    const section = sectionRef.current
    const stage = stageRef.current
    if (!section || !stage || isStatic) return undefined

    // Pe ecrane tactile (iOS mai ales) derularea clipului cadru cu cadru prin
    // currentTime nu e de încredere: browserul nu preîncarcă și rămâne pe primul
    // cadru. Acolo redăm clipul normal (mut, inline) când secțiunea intră în
    // ecran și îl lăsăm pe ultimul cadru; dacă ieși în sus, se resetează.
    const touch = window.matchMedia('(hover: none)').matches
    let started = false
    let rewindTimer = 0

    let frame = 0
    function update() {
      frame = 0
      const rect = section.getBoundingClientRect()
      const scrollable = rect.height - window.innerHeight
      let progress
      if (scrollable > 0) {
        progress = Math.min(1, Math.max(0, -rect.top / scrollable))
      } else {
        // pe mobil secțiunea nu e lipicioasă: produsul se desface pe măsură ce
        // figura urcă din partea de jos a ecranului spre mijloc
        const figure = stage.querySelector('.explode-figure')
        const top = (figure || section).getBoundingClientRect().top
        progress = Math.min(1, Math.max(0, (window.innerHeight * 0.95 - top) / (window.innerHeight * 0.5)))
      }
      stage.style.setProperty('--p', progress.toFixed(4))

      // Clipul e "derulat" de scroll: poziția din clip = progresul secțiunii,
      // în primele 60%; restul e rezervat apariției etichetelor.
      const player = videoRef.current
      if (!player) return
      if (touch) {
        if (progress > 0.03 && !started) {
          started = true
          player.muted = true
          player.setAttribute('muted', '')
          player.play().catch(() => setVideoReady(false)) // fără redare → rămân imaginile
        } else if (progress === 0 && started) {
          // întoarcere lină: clipul se estompează peste imaginea produsului
          // întreg, abia apoi sare la începutul clipului (identic cu imaginea)
          started = false
          player.pause()
          const figure = stage.querySelector('.explode-figure')
          figure?.classList.add('is-rewinding')
          clearTimeout(rewindTimer)
          rewindTimer = setTimeout(() => {
            player.currentTime = 0
            figure?.classList.remove('is-rewinding')
          }, 600)
        }
        return
      }
      if (player.duration) {
        const t = Math.min(1, progress / 0.6) * (player.duration - 0.05)
        if (Math.abs(player.currentTime - t) > 0.02) player.currentTime = t
      }
    }
    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
      clearTimeout(rewindTimer)
    }
  }, [isStatic])

  return (
    <section ref={sectionRef} className={`explode-scroll ${isStatic ? 'is-static' : ''}`} id={id}>
      <div ref={stageRef} className="explode-sticky">
        <div className="explode-head">
          {heading && <h2>{heading}</h2>}
          <p className="explode-intro">{intro}</p>
        </div>

        <div className="explode-stage">
          <div className={`explode-figure ${hasVideo && videoReady ? 'has-video' : ''}`}>
            {hasVideo && (
              <video
                ref={videoRef}
                className="explode-video"
                src={video}
                muted
                playsInline
                preload="auto"
                poster={assembled || undefined}
                onLoadedMetadata={() => setVideoReady(true)}
                onError={() => setVideoReady(false)}
              />
            )}
            <img className="explode-assembled" src={assembled} alt="" aria-hidden="true" />
            <img className="explode-open" src={isStatic && staticImage ? staticImage : exploded} alt={alt} />
          </div>

          {/* pe desktop etichetele plutesc lângă figură; pe ecrane mici stau într-un rând sub ea */}
          <div className="explode-labels">
            {labels.map((label) => (
              <div
                key={label.text}
                className={`explode-label explode-label-${label.side}`}
                style={{ top: `${label.top}%`, '--i': label.order }}
              >
                {label.side === 'right' && <i />}
                <span>
                  {label.text}
                  <small>{label.hint}</small>
                </span>
                {label.side === 'left' && <i />}
              </div>
            ))}
          </div>
        </div>

        <p className="explode-hint">{hint}</p>
      </div>
    </section>
  )
}
