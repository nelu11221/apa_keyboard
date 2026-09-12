from sqlalchemy.orm import Session

from . import models

DEFAULT_SETTINGS = {
    "search_algorithm": "bmh",  # algoritmul folosit de bara de căutare din magazin
}

_SEED_PRODUCTS = [
    # --- Keyboards ---
    {
        "slug": "nexa-65", "name": "NEXA 65", "tagline": "Compact 65% layout with dual control knobs",
        "category": "keyboards", "price_cents": 18900, "stock": 42, "badge": "Best seller",
        "image_key": "productNexa65", "accent": "orange",
        "description": "Our flagship compact board. Hot-swappable switches, a custom OLED display and two control knobs give you complete control down to every key, without giving up desk space.",
        "specs": "Layout: 65% (68 keys)\nSwitches: Hot-swappable, 5-pin\nCase: CNC aluminium\nDisplay: 0.96\" OLED\nConnectivity: USB-C, Bluetooth 5.1, 2.4 GHz\nBattery: 4000 mAh",
    },
    {
        "slug": "nexa-75", "name": "NEXA 75", "tagline": "Function row, gasket mount, all-day comfort",
        "category": "keyboards", "price_cents": 20900, "stock": 31, "badge": "New",
        "image_key": "productNexa75", "accent": "cream",
        "description": "A 75% layout with a full function row, gasket-mounted plate and layered sound dampening foam for a deep, satisfying typing sound.",
        "specs": "Layout: 75% (84 keys)\nSwitches: Hot-swappable, 5-pin\nMount: Gasket\nCase: Aluminium\nConnectivity: USB-C, Bluetooth 5.1\nBattery: 4000 mAh",
    },
    {
        "slug": "nexa-tkl", "name": "NEXA TKL", "tagline": "Tenkeyless layout for work and play",
        "category": "keyboards", "price_cents": 22900, "stock": 18, "badge": "",
        "image_key": "productNexaTkl", "accent": "dark",
        "description": "Everything from a full-size board except the numpad. Arrow cluster, navigation keys and a full function row, built on a rigid aluminium frame.",
        "specs": "Layout: TKL (87 keys)\nSwitches: Hot-swappable, 5-pin\nCase: Aluminium\nConnectivity: USB-C wired\nRGB: Per-key",
    },
    {
        "slug": "nexa-mini-60", "name": "NEXA Mini 60", "tagline": "Ultra-portable 60% board",
        "category": "keyboards", "price_cents": 14900, "stock": 55, "badge": "",
        "image_key": "productNexaMini", "accent": "orange",
        "description": "Drop it in a bag and go. The Mini 60 keeps the same switches and keycaps as its bigger siblings in the smallest possible footprint.",
        "specs": "Layout: 60% (61 keys)\nSwitches: Hot-swappable, 5-pin\nCase: Polycarbonate\nConnectivity: USB-C, Bluetooth 5.1\nBattery: 3000 mAh",
    },
    # --- Switches ---
    {
        "slug": "cherry-mix-switches", "name": "Cherry Mix Switches", "tagline": "70-pack · linear, tactile and clicky sampler",
        "category": "switches", "price_cents": 4900, "stock": 120, "badge": "",
        "image_key": "switchCherry", "accent": "orange",
        "description": "A mixed pack of Cherry MX Red, Brown and Blue switches so you can tune every key to your taste. Fully compatible with all NEXA boards.",
        "specs": "Quantity: 70\nType: Linear / Tactile / Clicky\nActuation: 45–60 g\nPins: 3\nLifespan: 100M keystrokes",
    },
    {
        "slug": "kailh-kaihua-box-white", "name": "Kailh / Kaihua Box White", "tagline": "70-pack · crisp clicky switches",
        "category": "switches", "price_cents": 3900, "stock": 80, "badge": "",
        "image_key": "switchKailh", "accent": "cream",
        "description": "Box-stem clicky switches with a sharp, consistent click bar. Dust and water resistant housing keeps them feeling new for years.",
        "specs": "Quantity: 70\nType: Clicky\nActuation: 50 g\nPins: 3\nLifespan: 80M keystrokes",
    },
    {
        "slug": "outemu-silent-peach", "name": "Outemu Silent Peach", "tagline": "70-pack · silent linear switches",
        "category": "switches", "price_cents": 3500, "stock": 64, "badge": "Popular",
        "image_key": "switchOutemu", "accent": "dark",
        "description": "Factory-lubed silent linears with dampened top and bottom-out. Ideal for shared offices and late-night sessions.",
        "specs": "Quantity: 70\nType: Silent linear\nActuation: 45 g\nPins: 5\nLifespan: 60M keystrokes",
    },
    {
        "slug": "romer-g-tactile", "name": "Romer G Tactile", "tagline": "70-pack · short travel tactile switches",
        "category": "switches", "price_cents": 4200, "stock": 27, "badge": "",
        "image_key": "switchRomerG", "accent": "orange",
        "description": "Short 1.5 mm actuation with a distinct tactile bump, designed for fast, precise keystrokes in games and code editors alike.",
        "specs": "Quantity: 70\nType: Tactile\nActuation: 45 g at 1.5 mm\nPins: 3\nLifespan: 70M keystrokes",
    },
    # --- Keycaps ---
    {
        "slug": "artisan-keycaps-sunset", "name": "Artisan Keycaps · Sunset", "tagline": "PBT dye-sub set in orange, cream and black",
        "category": "keycaps", "price_cents": 8900, "stock": 36, "badge": "Limited",
        "image_key": "keycapsSunset", "accent": "orange",
        "description": "Decorative and premium keycaps that balance aesthetics, consistency and durability — perfect for gaming, productivity and collectible setups.",
        "specs": "Profile: Cherry\nMaterial: PBT, 1.5 mm\nLegends: Dye-sublimated\nKeys: 140 (covers 60% to full-size)",
    },
    {
        "slug": "artisan-keycaps-blossom", "name": "Artisan Keycaps · Blossom", "tagline": "PBT set in pink, burgundy and white",
        "category": "keycaps", "price_cents": 8900, "stock": 22, "badge": "",
        "image_key": "keycapsBlossom", "accent": "pink",
        "description": "Soft pink tones with deep burgundy accents. Thick PBT keycaps with crisp dye-sub legends that never fade.",
        "specs": "Profile: Cherry\nMaterial: PBT, 1.5 mm\nLegends: Dye-sublimated\nKeys: 140",
    },
    {
        "slug": "artisan-keycaps-sky", "name": "Artisan Keycaps · Sky", "tagline": "PBT set in sky blue, off-white and black",
        "category": "keycaps", "price_cents": 8900, "stock": 30, "badge": "New",
        "image_key": "keycapsSky", "accent": "cream",
        "description": "Cool sky-blue accents on thick off-white PBT. Crisp dye-sub legends that never fade, in a Cherry profile that fits every NEXA board.",
        "specs": "Profile: Cherry\nMaterial: PBT, 1.5 mm\nLegends: Dye-sublimated\nKeys: 140",
    },
    {
        "slug": "minimal-keycaps-mono", "name": "Minimal Keycaps · Mono", "tagline": "Blank white PBT set for a clean look",
        "category": "keycaps", "price_cents": 6900, "stock": 48, "badge": "",
        "image_key": "keycapsMono", "accent": "cream",
        "description": "No legends, no distractions. A blank white PBT set for touch typists who want the cleanest possible desk.",
        "specs": "Profile: Cherry\nMaterial: PBT, 1.5 mm\nLegends: None\nKeys: 140",
    },
    # --- Accessories ---
    {
        "slug": "wrist-rest-walnut", "name": "Wrist Rest · Walnut", "tagline": "Solid wood wrist rest, 65% / 75% sizes",
        "category": "accessories", "price_cents": 3900, "stock": 40, "badge": "",
        "image_key": "accessoryWristRest", "accent": "dark",
        "description": "Hand-finished walnut with a subtle slope that matches NEXA case angles. Non-slip rubber feet keep it in place.",
        "specs": "Material: Walnut\nSizes: 65%, 75%, TKL\nFinish: Natural oil",
    },
    {
        "slug": "coiled-cable-orange", "name": "Coiled Cable · Orange", "tagline": "USB-C aviator cable, 1.5 m",
        "category": "accessories", "price_cents": 2900, "stock": 75, "badge": "",
        "image_key": "accessoryCable", "accent": "orange",
        "description": "Double-sleeved coiled cable with a detachable aviator connector. Matches the NEXA orange accent perfectly.",
        "specs": "Connector: USB-C to USB-A\nLength: 1.5 m coiled\nSleeve: Paracord + techflex",
    },
    {
        "slug": "switch-puller-kit", "name": "Switch & Keycap Puller Kit", "tagline": "Everything you need to hot-swap",
        "category": "accessories", "price_cents": 1200, "stock": 150, "badge": "",
        "image_key": "accessoryPuller", "accent": "cream",
        "description": "Steel switch puller, wire keycap puller and a small brush, in a compact carry pouch.",
        "specs": "Contents: Switch puller, keycap puller, brush, pouch",
    },
    {
        "slug": "carrying-case", "name": "Carrying Case", "tagline": "Hard-shell case for 65% and 75% boards",
        "category": "accessories", "price_cents": 3400, "stock": 33, "badge": "",
        "image_key": "accessoryCase", "accent": "dark",
        "description": "EVA hard shell with a soft microfiber lining and a mesh pocket for cables and pullers.",
        "specs": "Fits: 65%, 75%\nMaterial: EVA + microfiber\nColour: Black",
    },
    # --- Mice / audio / desk ---
    {
        "slug": "nexa-pulse-mouse", "name": "NEXA Pulse", "tagline": "Wireless gaming mouse with a free-spin wheel",
        "category": "mice", "price_cents": 9900, "stock": 60, "badge": "New",
        "image_key": "productMouse", "accent": "orange",
        "description": "A 58 g wireless mouse built around a 26K optical sensor, two programmable side buttons and a scroll wheel that switches between notched and free-spin with a click.",
        "specs": "Sensor: 26K DPI optical\nWeight: 58 g\nConnectivity: 2.4 GHz, Bluetooth, USB-C\nBattery: 90 h\nSwitches: Optical, 100M clicks",
    },
    {
        "slug": "nexa-aura-headset", "name": "NEXA Aura", "tagline": "Wireless ANC headset with detachable mic",
        "category": "audio", "price_cents": 17900, "stock": 35, "badge": "",
        "image_key": "productHeadset", "accent": "orange",
        "description": "Hybrid active noise cancelling, a memory-foam headband you forget you are wearing and a broadcast-grade detachable microphone.",
        "specs": "Drivers: 40 mm\nANC: Hybrid, with transparency mode\nBattery: 50 h (ANC on)\nConnectivity: 2.4 GHz, Bluetooth 5.3\nMic: Detachable, cardioid",
    },
    {
        "slug": "nexa-desk-mat", "name": "NEXA Desk Mat", "tagline": "900 × 400 mm micro-textured cloth mat",
        "category": "accessories", "price_cents": 3900, "stock": 80, "badge": "",
        "image_key": "productDeskMat", "accent": "orange",
        "description": "A full-desk mat with a micro-textured cloth surface, stitched edges and a non-slip rubber base.",
        "specs": "Size: 900 × 400 × 4 mm\nSurface: Micro-textured cloth\nBase: Natural rubber\nEdges: Stitched",
    },
]


def seed_if_empty(db: Session) -> None:
    # Adaugă orice produs din lista de seed care lipsește (după slug), ca
    # produsele noi să apară și într-o bază de date existentă.
    existing_slugs = {slug for (slug,) in db.query(models.Product.slug).all()}
    for entry in _SEED_PRODUCTS:
        if entry["slug"] not in existing_slugs:
            db.add(models.Product(**entry))

    for key, value in DEFAULT_SETTINGS.items():
        if db.get(models.Setting, key) is None:
            db.add(models.Setting(key=key, value=value))

    db.commit()


def get_setting(db: Session, key: str) -> str:
    setting = db.get(models.Setting, key)
    return setting.value if setting is not None else DEFAULT_SETTINGS.get(key, "")
