// Harta imaginilor site-ului. Pune fișierele în web/public/images/ și
// completează calea aici (ex. '/images/hero-keyboard.png'). Cât timp o
// cheie e null, componenta <Picture> desenează un placeholder la aceleași
// dimensiuni — nu trebuie modificat nimic altceva în cod.

export const images = {
  // Pagina principală
  heroKeyboard: '/images/hero-keyboard.png',        // tastatura mare pe panoul portocaliu (≈ 1400×520)
  featureCloseup: '/images/keyboard-closeup.png',      // close-up keycaps, lângă cardurile "More than just a keyboard" (≈ 700×900)
  heroMouse: '/images/hero-mouse.png',           // slide 2 din hero — mouse (fundal transparent, ≈ 900×900)
  heroHeadset: '/images/hero-headset.png',         // slide 3 — căști (fundal transparent, ≈ 900×900)
  heroMousepad: '/images/hero-deskmat.png',        // slide 4 — desk mat (fundal transparent, ≈ 1400×620)
  explodedVideo: '/images/keyboard-explode.mp4',      // clip generat (Higgsfield): tastatura se desface în straturi; derulat de scroll
  switchAssembled: '/images/switch-assembled.png',     // secțiunea "Inside the switch": switch-ul întreg (16:9)
  switchExploded: '/images/switch-exploded.png',      // switch-ul desfăcut în componente (16:9)
  switchExplodedCut: '/images/switch-exploded-cut.png', // același, fundal transparent (imaginea statică de pe mobil)
  switchVideo: '/images/switch-explode.mp4',         // clip: switch-ul se desface (derulat de scroll)
  mouseExploded: '/images/mouse-exploded.png',       // secțiunea mouse: desfăcut în componente (16:9)
  mouseExplodedCut: '/images/mouse-exploded-cut.png', // același, fundal transparent (mobil)
  mouseVideo: '/images/mouse-explode.mp4',          // clip: mouse-ul se desface (derulat de scroll)
  mouseStart: '/images/mouse-start.png',          // cadrul asamblat al mouse-ului, pe fundalul site-ului
  studioScreen: '/images/studio-screen.png',        // secțiunea NEXA Studio: captura aplicației (16:9)
  studioVideo: '/images/studio-demo.mp4',         // clip cu aplicația în folosire (buclă)
  explodedKeyboard: '/images/keyboard-exploded.png',    // vederea explodată cu straturi (≈ 900×700) — dacă e null, se desenează cu CSS
  switchesCloseup: null,     // (nefolosit)
  switchBlockCherry: '/images/switch-cherry.png',   // blocurile esc/1/2 din lista de switch-uri (Home)
  switchBlockKailh: '/images/switch-kailh.png',
  switchBlockOutemu: '/images/switch-outemu.png',
  switchBlockRomerG: '/images/switch-romerg.png',
  keycapsCollage: '/images/keycaps-sunset.png',      // imaginile din secțiunea "Elevate Your Keyboard Experience" (≈ 900×600)
  footerKeycap: '/images/keycaps-sunset-card.png',        // decorația din colțul footer-ului (≈ 320×320)

  // Produse (cheia = product.image_key din baza de date)
  productNexa65: '/images/product-nexa-65.png',
  productNexa75: '/images/hero-keyboard.png',
  productNexaTkl: '/images/product-nexa-tkl.png',
  productNexaMini: '/images/product-nexa-mini.png',
  switchCherry: '/images/product-switch-cherry.png',
  switchKailh: '/images/product-switch-kailh.png',
  switchOutemu: '/images/product-switch-outemu.png',
  switchRomerG: '/images/product-switch-romerg.png',
  keycapsSunset: '/images/keycaps-sunset-card.png',
  keycapsBlossom: '/images/keycaps-blossom-card.png',
  keycapsSky: '/images/keycaps-sky-card.png',
  keycapsMono: '/images/keycaps-mono-card.png',
  accessoryWristRest: '/images/product-wrist-rest.png',
  accessoryCable: '/images/product-cable.png',
  accessoryPuller: '/images/product-puller.png',
  accessoryCase: '/images/product-case.png',
  productMouse: '/images/hero-mouse.png',
  productHeadset: '/images/hero-headset.png',
  productDeskMat: '/images/product-deskmat.png',

  // Clipuri de prezentare per produs (generate cu Higgsfield), pe slug.
  productVideos: {
    'nexa-65': '/images/promo-nexa-65.mp4',
    'nexa-75': '/images/ad-nexa-75.mp4',
    'nexa-tkl': '/images/promo-nexa-tkl.mp4',
    'nexa-mini-60': '/images/promo-nexa-mini.mp4',
    'nexa-pulse-mouse': '/images/promo-nexa-pulse.mp4',
    'nexa-aura-headset': '/images/promo-nexa-aura.mp4',
  },

  // Randări ale tastaturii cu alt set de keycaps montat (configurator):
  // { [slug tastatură]: { [slug set keycaps]: '/images/...' } }
  keycapVariants: {
    'nexa-75': {
      'artisan-keycaps-blossom': '/images/nexa-75-blossom.png',
      'minimal-keycaps-mono': '/images/nexa-75-mono.png',
      'artisan-keycaps-sky': '/images/nexa-75-sky.png',
    },
  },
}
