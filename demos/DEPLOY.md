# Auto Synex — Demo Templates

Five complete, clickable demo businesses. Each one ships three products: a
marketing site, a working booking flow with real availability logic, and an
operations dashboard.

This folder is a self-contained Next.js app inside the `Auto_Synex` repository.
It does not affect the main site build — the root Vite project ignores it.

| Route | Business | Booking mode |
| --- | --- | --- |
| `/clinic` | Vita Medical — multi-specialty clinic | appointment |
| `/dental` | Smileora Dental — cosmetic + general dentistry | appointment |
| `/salon` | Lumé Beauty — hair, skin & nails | appointment |
| `/hotel` | Noiré — 42-key luxury hotel | stay (date range) |
| `/restaurant` | Ember & Stone — live-fire restaurant | table (party size) |

Each has `/[demo]`, `/[demo]/book` and `/[demo]/dashboard` (with
`appointments`, `calendar`, `services`, `staff`, `customers`, `settings`).

---

## Deploying it

On Vercel, create a **second project** from this same repository:

1. vercel.com → **Add New → Project** → import `alialjamal-ops/Auto_Synex`
2. Open **Root Directory** and set it to **`demos`**
3. Framework preset: **Next.js** (auto-detected once the root directory is set)
4. **Deploy** — no environment variables required

The main site keeps deploying from the repository root exactly as before; the
two projects live side by side.

Optional: set `NEXT_PUBLIC_SITE_URL` to the final public origin so Open Graph
tags resolve correctly.

---

## Linking it from the main site

`integration/TemplatesSection.jsx` is a drop-in React + Tailwind section written
in the main site's own design system (`#0a1628` canvas, `blue-500 → cyan-400`
gradients, `bg-white/10` glass) and bilingual via the same `lang` prop the rest
of the site uses.

Once the main site's `src/` is in this repository:

```jsx
import TemplatesSection from './components/TemplatesSection';

<ServicesSection lang={lang} />
<TemplatesSection lang={lang} />   {/* ← new */}
<AboutSection lang={lang} />
```

Set `DEMOS_URL` at the top of that file to the deployed demos origin.

**To serve the demos under your own domain** instead of a separate
`*.vercel.app` host, add this to the *main site's* `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/demos", "destination": "https://<demos-project>.vercel.app" },
    { "source": "/demos/:path*", "destination": "https://<demos-project>.vercel.app/:path*" }
  ]
}
```

Then set `DEMOS_URL = '/demos'` and drop the `target="_blank"` attributes.

---

## Running locally

```bash
cd demos
npm install
npm run dev          # http://localhost:3000
npm run build
npm run typecheck
npm run lint
```

`npm run dev` and `npm run build` both run `scripts/fetch-assets.mjs` first,
which restores any missing photo or font and skips whatever is already on disk.

---

## Two notes for the main site

1. **`src/` is missing from this repository.** `index.html` loads
   `/src/main.tsx`, but the folder is not committed — only the built
   `dist/index.html`. The repo cannot be rebuilt from source as it stands.
   Committing `src/` would fix that and would also let the Templates section
   above be wired in directly.

2. **`public/assets/logo.svg` is broken.** It draws the S as two overlapping
   paths (which renders as a solid blue blob) and the A as an inverted V that
   all but disappears. `demos/public/brand/logo.svg` is a clean rebuild of the
   real mark using the same gradient stops — copy it over
   `public/assets/logo.svg` to fix the header logo on the main site.
