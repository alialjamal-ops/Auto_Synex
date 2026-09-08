# Linking the demos from the main Auto Synex site

The demos live in their own Next.js app (this repo). The main marketing site
(`auto-synex-final.vercel.app`, Vite + React + Tailwind) links to them.

## 1 · Deploy this repo

Vercel → **Add New → Project** → import `rawexportchanel-droid/auto-synex-demos`.
Framework is auto-detected (Next.js); no environment variables are required.

Optional: set `NEXT_PUBLIC_SITE_URL` to the final public origin so Open Graph
tags point at the right domain.

## 2 · Add the section to the main site

Copy `TemplatesSection.jsx` into the main site's `src/components/`, set
`DEMOS_URL` at the top of the file to the deployed origin, then render it after
the Services section:

```jsx
import TemplatesSection from './components/TemplatesSection';

// ...
<ServicesSection lang={lang} />
<TemplatesSection lang={lang} />   {/* ← new */}
<AboutSection lang={lang} />
```

It follows the existing design system (`#0a1628` canvas, `blue-500 → cyan-400`
gradients, `rounded-xl`, `bg-white/10` glass) and takes the same `lang` prop the
rest of the site uses, so it works in both English and Arabic.

Add a nav entry too, next to the existing links:

```jsx
<a href="#templates" className="relative px-1 py-2 text-sm font-medium transition-colors text-gray-300 hover:text-white">
  {lang === 'ar' ? 'القوالب' : 'Templates'}
</a>
```

## 3 · Optional — serve the demos under your own domain

Instead of a separate `*.vercel.app` origin, proxy them from the main site so
they appear at `autosynex.com/demos/*`. In the **main site's** `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/demos", "destination": "https://auto-synex-demos.vercel.app" },
    { "source": "/demos/:path*", "destination": "https://auto-synex-demos.vercel.app/:path*" }
  ]
}
```

Then set `DEMOS_URL = '/demos'` in `TemplatesSection.jsx` and drop the
`target="_blank"` attributes so the demos open in the same tab.

## Routes exposed by the demos app

```
/                     template chooser
/clinic               /clinic/book        /clinic/dashboard
/dental               /dental/book        /dental/dashboard
/salon                /salon/book         /salon/dashboard
/hotel                /hotel/book         /hotel/dashboard
/restaurant           /restaurant/book    /restaurant/dashboard
```

Dashboards also have `/appointments`, `/calendar`, `/services`, `/staff`,
`/customers` and `/settings` sub-pages.

## Brand note

`public/brand/logo.svg` in this repo is a rebuilt vector of the Auto Synex mark
(clean A + S geometry, brand gradients `#5CB3FF → #1E90FF → #0A3D62`). The SVG
currently served by the main site at `/assets/logo.svg` renders the S as a solid
blob and all but hides the A — replacing it with this file fixes the header
logo there too.
