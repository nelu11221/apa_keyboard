# NEXA — mechanical keyboards store

Proiect de an la disciplina **Analiza și proiectarea algoritmilor** (UTM, F.O.010).

Magazin online de tastaturi mecanice (design după referințele Nexa + Keymon) al cărui motor de
căutare rulează unul din trei algoritmi de potrivire a șabloanelor — **Knuth–Morris–Pratt**,
**Boyer–Moore–Horspool**, **Rabin–Karp** — cu plăți integrate prin **Stripe** (mod test).

Clientul vede un magazin normal (căutarea „pur și simplu merge”, cu algoritmul setat din admin).
Toată partea de comparație, benchmark, statistici și jurnal de căutări este în **/admin**.

Modalitate de proiect: *Problemă → algoritmi* (o problemă, trei algoritmi diferiți care o rezolvă).

## Arhitectură

```
web/      React (Vite)        — landing, catalog, produs, coș, checkout Stripe; /admin: dashboard, comenzi, produse, algoritmi, setări
   │  HTTP /api  (proxy Vite → :8000)
server/   Python FastAPI      — catalog, comenzi, orchestrare căutare, Stripe Checkout + webhook, benchmark
   │  subprocess (stdin → JSON)
engine/   C++17               — cei trei algoritmi + cronometrare cu std::chrono
```

- Algoritmii sunt implementați **o singură dată**, în C++ (`engine/src/`), și sunt folosiți atât
  pentru căutarea reală din aplicație, cât și pentru benchmark-uri — deci graficele reflectă exact
  codul care rulează în produs.
- Textul căutat și șablonul sunt normalizate în Python (fără diacritice, minuscule) înainte de a
  ajunge la motorul C++ — căutarea e insensibilă la diacritice/majuscule, iar pozițiile returnate
  de motor (în octeți) coincid cu indicii din șirul Python.

## Rulare

### 1. Motorul C++

```bash
cd engine && make && make test
```

`make test` rulează 207 teste de corectitudine (cazuri manuale + 200 aleatorii) care compară
cei trei algoritmi cu o căutare brută de referință.

Utilizare directă (util pentru raport):

```bash
./engine/build/search_engine all fisier.txt "sablon"
```

### 2. Backend (FastAPI)

```bash
cd server
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # apoi completează cheile Stripe
uvicorn app.main:app --reload --port 8000
```

Documentația API generată automat: http://127.0.0.1:8000/docs

### 3. Front-end (React)

```bash
cd web
npm install
npm run dev
```

Aplicația: http://localhost:5173

## Configurare Stripe (mod test)

1. Creează un cont gratuit pe https://dashboard.stripe.com și activează modul **Test**.
2. Copiază cheia secretă din *Developers → API keys* (`sk_test_…`) în `server/.env`
   la `STRIPE_SECRET_KEY`.
3. Pentru ca statusul comenzii să devină `paid` după plată, backend-ul trebuie să primească
   webhook-ul `checkout.session.completed`. Local, cel mai simplu e cu Stripe CLI:

   ```bash
   stripe listen --forward-to localhost:8000/api/stripe/webhook
   ```

   Comanda afișează un secret `whsec_…` — pune-l în `.env` la `STRIPE_WEBHOOK_SECRET`.
4. Card de test: `4242 4242 4242 4242`, orice dată viitoare, orice CVC.

## Imagini

Fotografiile de produs nu sunt incluse; site-ul desenează placeholder-e SVG. Vezi
`web/public/images/README.md` și `web/src/images.js` pentru a le înlocui.

## Pagini

| Rută | Conținut |
|---|---|
| `/` | landing (hero, bandă orizontală cu gama de produse derulată de scroll, caracteristici, tastatura/switch-ul/mouse-ul care se desfac la scroll — clipuri generate cu Higgsfield, switch-uri, keycaps, CTA, footer) |
| `/shop?category=…` | catalog cu filtre pe categorie și căutare |
| `/product/:slug` | pagină de produs cu specificații și adăugare în coș |
| `/cart` | coș + checkout Stripe |
| `/admin` | dashboard: venit, comenzi, produse top, stoc scăzut, căutări per algoritm |
| `/admin/orders` | comenzi, cu căutare comparativă între cei 3 algoritmi |
| `/admin/products` | CRUD produse |
| `/admin/algorithms` | teorie, benchmark (scară liniară/log), jurnalul căutărilor reale |
| `/admin/settings` | algoritmul folosit de căutarea din magazin |

## Deploy

**Front-end (Netlify):** repo-ul are `netlify.toml` (base `web/`, publish `web/dist`, redirect SPA).
Setează în Netlify → *Site configuration → Environment variables*:
`VITE_API_BASE = https://<adresa-backend>` (fără slash la final), apoi *Trigger deploy*.

**Backend (FastAPI + motor C++):** găzduit separat (Render / Railway / Fly.io — orice mediu cu
Python 3 și un compilator C++). Comenzi de build/start:

```bash
cd engine && make && cd ../server && pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Variabile de mediu pe backend: `FRONTEND_URL=https://<site>.netlify.app`, `ENGINE_PATH=../engine/build/search_engine`,
`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`. Fără backend, site-ul se încarcă, dar catalogul, căutarea
și checkout-ul nu au de unde lua date.

## Endpoint-uri principale

| Metodă | Rută | Rol |
|---|---|---|
| GET | `/api/products` | catalogul de produse |
| GET | `/api/search?q=…&scope=products\|orders[&algorithm=kmp\|bmh\|rk]` | căutare; fără `algorithm` se folosește setarea din admin; fiecare căutare e jurnalizată |
| GET | `/api/products/{slug}` | detalii produs |
| GET | `/api/admin/stats` | statistici dashboard |
| GET/PUT | `/api/admin/settings` | algoritmul implicit al magazinului |
| GET | `/api/admin/search-logs` | jurnalul căutărilor |
| POST/PUT/DELETE | `/api/admin/products[/{id}]` | CRUD produse |
| GET | `/api/benchmark?pattern=…&alphabet=natural\|mic&repeats=3` | rulează cei trei algoritmi pe texte sintetice crescătoare |
| POST | `/api/checkout` | creează comanda + sesiunea Stripe Checkout |
| POST | `/api/stripe/webhook` | confirmă plata (marchează comanda `paid`) |
| GET | `/api/orders` | lista comenzilor (admin) |
