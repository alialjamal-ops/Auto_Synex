# Design libraries: shortlist for Genesis

A curated list of GitHub libraries that fit the Genesis stack (Next.js 16,
React 19, Tailwind CSS v4, Radix / shadcn-style components, Motion, RTL). Each
entry says **when** to pull it in, so we add libraries only when a feature
needs them. Nothing here is installed yet.

Stars and last-push dates are from a GitHub search on 2026-11-14.

## Already in use

| Library | Role in Genesis |
| --- | --- |
| [shadcn-ui/ui](https://github.com/shadcn-ui/ui) ★128k · MIT | Component patterns (`components.json` is configured) |
| Radix primitives (`radix-ui`) | Accessible dialogs, selects, popovers, switches |
| [lucide-icons/lucide](https://github.com/lucide-icons/lucide) ★25.7k | Icon set |
| Motion · Sonner · next-themes | Animation, toasts, light/dark |

## Recommended when needed

| Need | Library | Fit / notes |
| --- | --- | --- |
| **Theme per tenant** (brand colours for each business) | [jnsahaj/tweakcn](https://github.com/jnsahaj/tweakcn) ★10.5k · Apache-2.0 | Visual theme editor that exports shadcn CSS variables. Our tokens in `globals.css` use the same model, so exported themes drop in. Good for a future "brand settings" screen. |
| **Advanced data tables** (column sorting, server pagination, saved views) | [sadmann7/tablecn](https://github.com/sadmann7/tablecn) ★6.4k · MIT | shadcn + TanStack Table. Upgrade path for Appointments and Customers once the API paginates. |
| **Drag-and-drop rescheduling** on the calendar | [clauderic/dnd-kit](https://github.com/clauderic/dnd-kit) ★17.8k · MIT | Accessible (keyboard drag), headless, works with our custom calendar grid. Preferred over swapping the calendar. |
| **Full calendar engine** (only if the custom calendar is outgrown: recurring events, resource timelines) | [schedule-x/schedule-x](https://github.com/schedule-x/schedule-x) ★2.6k · MIT | Modern, actively maintained, has React bindings and resource views. Alternative: [fullcalendar/fullcalendar](https://github.com/fullcalendar/fullcalendar) ★20.8k (MIT core; resource/timeline views are premium). |
| **Date-range and date pickers** in forms | [gpbl/react-day-picker](https://github.com/gpbl/react-day-picker) ★6.9k · MIT | What shadcn's Calendar uses. Supports RTL and custom locales. Time-zone variant for shadcn: [huybuidac/shadcn-datetime-picker](https://github.com/huybuidac/shadcn-datetime-picker) (check its licence before use). |
| **Richer charts** (tooltips, zoom, stacked/area) | [recharts/recharts](https://github.com/recharts/recharts) ★27.7k · MIT | The library behind shadcn Charts. Styled examples: [legions-developer/evilcharts](https://github.com/legions-developer/evilcharts) ★3.2k · MIT. Keep the current SVG charts until interactivity is needed (smaller bundle). |
| **Dashboard building blocks** (KPI cards, bar lists, charts) | [tremorlabs/tremor](https://github.com/tremorlabs/tremor) ★3.7k · Apache-2.0 | Copy-paste Tailwind components. The npm package [tremor-npm](https://github.com/tremorlabs/tremor-npm) is no longer actively updated, so copy components rather than depend on it. |
| **Command palette** (⌘K: jump to a booking or customer) | [dip/cmdk](https://github.com/dip/cmdk) ★13.1k · MIT | Unstyled; shadcn has a Command component on top of it. A natural next feature for the dashboard. |
| **Mobile bottom sheets** (booking details on phones) | [emilkowalski/vaul](https://github.com/emilkowalski/vaul) ★8.7k · MIT | Drawer with swipe gestures. Its repo was last updated in 2025 and is now low-activity; [SameerJS6/revola](https://github.com/SameerJS6/revola) gives modal-on-desktop / drawer-on-mobile in one. |
| **Marketing polish** (animated hero effects, marquees, number tickers) | [magicuidesign/magicui](https://github.com/magicuidesign/magicui) ★23.3k · MIT | shadcn-compatible, copy-paste. Use sparingly: the brief asks for no excessive animation. Also [nolly-studio/cult-ui](https://github.com/nolly-studio/cult-ui) ★7.4k · MIT. |
| **More icons** (domain-specific glyphs Lucide lacks) | [tabler/tabler-icons](https://github.com/tabler/tabler-icons) ★22.7k · MIT | 6,500+ icons, same stroke style as Lucide. |
| **Transactional e-mail templates** (confirmation / reminder e-mails, when the backend exists) | [resend/react-email](https://github.com/resend/react-email) ★19.9k · MIT | Build e-mails with React components. Pairs with the NestJS backend. |

## Use with caution

- [DavidHDev/react-bits](https://github.com/DavidHDev/react-bits) ★52k: impressive
  animated components, but GitHub reports its licence as `NOASSERTION`
  (non-standard). Read the licence before using it commercially.
- Avoid copying from AGPL projects (e.g. `lukevella/rallly`) into Genesis. The licence
  would apply to the whole product.

## How to add one

1. Confirm the need (a feature in the backlog), the licence, and recent activity.
2. Prefer copy-in shadcn-style components (`npx shadcn add …` or a manual copy into
   `src/components/ui`) over runtime dependencies.
3. Re-map its colours to our tokens (`--primary`, `--muted`, …) so light/dark and
   tenant themes keep working, and check RTL (`dir="rtl"`) on mobile.
4. Run `npm run check` and the overflow sweep before merging.
