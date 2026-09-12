# Imagini

Pune aici fotografiile reale (PNG/JPG/WebP), apoi completează calea în `web/src/images.js`:

```js
heroKeyboard: '/images/hero-keyboard.png',
productNexa65: '/images/nexa-65.png',
```

Cât timp o cheie rămâne `null`, site-ul desenează un placeholder (ilustrație SVG) la aceleași
dimensiuni — nu trebuie modificat nimic altceva.

Dimensiuni orientative (lățime × înălțime, px):

| Cheie | Unde apare | Dimensiune |
|---|---|---|
| heroKeyboard | panoul portocaliu din hero | 1400 × 520 |
| featureCloseup | dreapta cardurilor "More than just a keyboard" | 700 × 900 |
| explodedKeyboard | vederea explodată (dacă lipsește, se desenează cu CSS) | 900 × 700 |
| switchesCloseup | thumbnail din lista de switch-uri | 320 × 240 |
| keycapsCollage | imaginea mare din "Elevate Your Keyboard Experience" | 900 × 600 |
| footerKeycap | decorația din colțul footer-ului (fundal transparent) | 320 × 320 |
| product* / switch* / keycaps* / accessory* | cardurile de produs și pagina de produs | 900 × 600 |
