// Slide-urile din panoul portocaliu al paginii principale.
// Coordonatele hotspot-urilor (x, y) sunt procente din lățimea/înălțimea
// imaginii, ca să rămână la locul lor la orice dimensiune de ecran.

export const heroSlides = [
  {
    id: 'keyboard',
    name: 'NEXA 65',
    productSlug: 'nexa-65',
    imageKey: 'heroKeyboard',
    kind: 'keyboard',
    hotspots: [
      { x: 6.9, y: 24, title: 'Hot-swappable switches', text: 'Swap any switch in seconds — no soldering, no tools.' },
      { x: 86.9, y: 26, title: 'Dual control knobs', text: 'Volume, scrolling, zoom — or anything you map them to.' },
      { x: 86.9, y: 44, title: 'Custom OLED display', text: 'Time, system info and the active profile at a glance.' },
      { x: 47, y: 77, title: 'PBT keycaps', text: 'Thick, textured keycaps with legends that never fade.' },
      { x: 81.5, y: 78, title: 'Signature accents', text: 'Arrow cluster and Esc in NEXA orange.' },
    ],
  },
  {
    id: 'mouse',
    name: 'NEXA Pulse',
    productSlug: 'nexa-pulse-mouse',
    imageKey: 'heroMouse',
    kind: 'mouse',
    hotspots: [
      { x: 38, y: 48, title: 'Free-spin scroll wheel', text: 'Notched or free-spin — switch with a click.' },
      { x: 48.5, y: 34, title: 'DPI switch', text: 'Cycle through five sensitivity profiles on the fly.' },
      { x: 68, y: 46, title: 'Programmable side buttons', text: 'Two buttons, any macro or shortcut.' },
      { x: 26, y: 74, title: 'USB-C fast charging', text: '10 minutes of charge for a full day of use.' },
    ],
  },
  {
    id: 'headset',
    name: 'NEXA Aura',
    productSlug: 'nexa-aura-headset',
    imageKey: 'heroHeadset',
    kind: 'headphones',
    hotspots: [
      { x: 50, y: 12, title: 'Memory-foam headband', text: 'Light enough to forget for a full day of calls and games.' },
      { x: 36, y: 62, title: 'Active noise cancelling', text: 'Hybrid ANC with a transparency mode one tap away.' },
      { x: 70, y: 68, title: 'Touch controls', text: 'Tap to pause, swipe for volume, hold for the assistant.' },
    ],
  },
  {
    id: 'mousepad',
    name: 'NEXA Desk Mat',
    productSlug: 'nexa-desk-mat',
    imageKey: 'heroMousepad',
    kind: 'mousepad',
    hotspots: [
      { x: 56, y: 50, title: 'Micro-textured cloth', text: 'Balanced glide and control for any sensor.' },
      { x: 53, y: 17, title: 'Stitched edges', text: 'No fraying, even after years on the desk.' },
      { x: 8, y: 48, title: 'Non-slip rubber base', text: 'Rolls up for travel, stays put on any desk.' },
    ],
  },
]
