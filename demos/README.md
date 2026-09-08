# Demo Suite — interactive website + booking + dashboard demos

Five complete, clickable demo businesses built to be sent straight from a paid ad.
Every demo ships three products: a marketing site, a working booking flow with real
availability logic, and an operations dashboard.

| Demo | Business | Identity | Booking mode |
| --- | --- | --- | --- |
| `/clinic` | **Vita Medical** — multi-specialty clinic | Emerald / ivory, Manrope | appointment |
| `/dental` | **Smileora Dental** — cosmetic + general dentistry | Azure / mint, Sora | appointment |
| `/salon` | **Lumé Beauty** — hair, skin & nails | Bone / bronze, Cormorant italic | appointment |
| `/hotel` | **Noiré** — 42-key luxury hotel | Near-black / gold, Playfair | stay (date range) |
| `/restaurant` | **Ember & Stone** — live-fire restaurant | Charcoal / ember, Fraunces | table (party size) |

## Routes

```
/                          Demo selector + service presentation
/[demo]                    Marketing site        (static, SSG)
/[demo]/book               Booking flow          (dynamic — needs today's date)
/[demo]/dashboard          Overview
/[demo]/dashboard/appointments
/[demo]/dashboard/calendar
/[demo]/dashboard/services
/[demo]/dashboard/staff
/[demo]/dashboard/customers
/[demo]/dashboard/settings
```

`[demo]` resolves to `clinic | dental | salon | hotel | restaurant`.

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
npm start            # serve the production build
npm run typecheck    # tsc --noEmit
npm run lint
```

## Architecture

The whole suite is **config-driven**. One file describes a business; nothing else
needs to change.

```
config/
  demos/<slug>.ts    ← a business: theme, hours, services, staff, sections, booking rules
  demos/index.ts     ← the registry (routing + metadata read from here)
  media.ts           ← every image path in the project
  site.ts            ← the agency landing page copy
types/demo.ts        ← the DemoConfig contract
lib/                 ← date maths, slot engine, deterministic mock data, formatting
components/
  animations/        ← Reveal, Stagger, TextReveal, ImageReveal, Parallax, Marquee, Counter
  ui/                ← Button, SmartImage, section primitives
  site/sections/     ← one component per section type, each with variants
  booking/           ← the multi-step booking engine
  dashboard/         ← shell, SVG charts, tables, and one view per screen
```

### Adding a new demo

1. Copy `config/demos/clinic.ts` to `config/demos/<slug>.ts` and edit the data.
2. Register it in `config/demos/index.ts`.
3. Add `<slug>` to `DemoSlug` in `types/demo.ts`.

Routing, metadata, the demo selector card, the booking flow and the dashboard all
pick it up automatically.

### Theming

Each demo's `theme` block is written to CSS custom properties on the demo root
(`lib/theme.ts`), and Tailwind utilities (`bg-brand`, `text-ink`, `border-line`,
`rounded-brand`, `font-display`…) read those variables. Change five colours and the
site, the booking flow and the dashboard all re-skin.

Display-type personality (`tight` / `airy` / `italic` / `caps`) is applied through a
`data-display` attribute on the same root.

### Sections

`config.sections` is a typed discriminated union rendered by
`components/site/section-renderer.tsx`. Section types available:

`hero` (5 variants) · `stats` · `marquee` · `split` · `features` (3 variants) ·
`services` (4 variants) · `staff` (3 variants) · `gallery` (3 variants + lightbox) ·
`beforeAfter` · `menu` · `membership` · `testimonials` (2 variants) · `faq` · `cta` ·
`contact`

Adding a section type = extend the union in `types/demo.ts` and add a case to the
renderer.

## Booking engine

`lib/booking.ts` is the real thing, minus a database:

- **Working hours** per weekday, including mid-day breaks, from `config.hours`.
- **Slot generation** from service duration + slot interval; a slot that would run
  into a break or past closing is never offered.
- **Lead time** — today's slots before `now + leadTimeHours` are shown as past.
- **Per-staff availability** — choosing a different practitioner changes the grid.
- **Deterministic load** — "already booked" slots are derived from a seeded hash, so
  the same date always looks the same instead of reshuffling on every refresh.
- **Double-booking prevention** — bookings made in the demo block their slot, and the
  slot is re-checked at submit time (the flow surfaces an error if it was taken).
- **Validation** with per-field errors that clear as you type; loading, success and
  error states.
- **Three flows** driven by `booking.steps`: appointment, stay (check-in/check-out +
  guests) and table (party size).

Bookings are stored per demo in `localStorage` through a `useSyncExternalStore`-based
store, so a booking made on the site immediately appears in that demo's dashboard.

## Dashboard data

`lib/dashboard.ts` generates a full appointment book (28 days back, 21 forward) from a
seeded PRNG keyed on the demo slug and today's date. It is computed identically on the
server and the client, so there are no hydration mismatches and no reshuffling between
refreshes — but it still looks like a business that is actually trading. Visitor
bookings are merged on top.

Charts are hand-built SVG (bar, donut, ranked bars, occupancy ring) — no charting
dependency.

## Assets

- **Photography** — 87 images under `public/media/<demo>/`, sourced from
  [StockSnap.io](https://stocksnap.io) (CC0). Self-hosted so the demos load fast and
  keep working with no third-party dependency. Every path lives in `config/media.ts`.
- **Fonts** — Inter, Manrope, Sora, Cormorant Garamond, Playfair Display and Fraunces
  as self-hosted variable woff2 (`app/fonts/`, wired up in `lib/fonts.ts`). No request
  to Google at build or run time.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript (strict) · Tailwind CSS v4 ·
Framer Motion · Lucide icons. No UI framework, no chart library.

## Notes

- Every demo business is fictional. The floating "Interactive demo" pill on each page
  makes that clear and doubles as a switcher between site / booking / dashboard.
- `/[demo]/book` and `/[demo]/dashboard/*` render per request because they depend on
  the real current date; the marketing sites are fully static.
