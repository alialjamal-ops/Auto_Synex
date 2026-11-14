# Genesis architecture

Genesis is a front-end demo that is structured like the real product, so the demo
data layer can be swapped for a NestJS + PostgreSQL backend without redesigning the UI.

```
┌──────────────────────── UI (React, Next.js App Router) ─────────────────────────┐
│ Demo Hub · Booking portal · Dashboard pages · Calendar · Dialogs                │
│        │  useRepository()  useRepoQuery(fn, deps)  useBusiness()                 │
└────────┼─────────────────────────────────────────────────────────────────────────┘
         ▼
┌──────────────── BookingRepository (src/data/repository.ts) ─────────────────────┐
│ getBusiness · updateBusinessSettings · listServices · saveService               │
│ listResources · updateResourceAvailability · getAvailability                     │
│ getAvailabilitySummary · findAlternatives · createBooking · cancelBooking        │
│ rescheduleBooking · updateBookingStatus · listBookings · getBooking             │
│ listCustomers · listActivity · subscribe · reset                                 │
└────────┬───────────────────────────────────────────────┬─────────────────────────┘
         ▼                                               ▼
  DemoBookingRepository (today)                 ApiBookingRepository (future)
  localStorage snapshot per industry            HTTP → NestJS → PostgreSQL
         │
         ▼
  Availability engine (src/domain/availability.ts) — pure functions, shared rules
```

## Layers

### 1. Domain (`src/domain`)

Framework-free TypeScript, no React and no storage.

- **`types.ts`**: `Business`, `BookingRules`, `Service`, `Resource` (staff, room, equipment),
  `Booking`, `Customer`, `ActivityEntry`. Instants are UTC ISO strings, so the shapes are
  ready to serialise over an API.
- **`time.ts`**: time-zone maths with `@date-fns/tz`. All rules (opening hours, "today",
  slot grids) are evaluated in the **business** zone. Days with a DST change fall back to
  exact per-instant conversion (tested with Asia/Beirut).
- **`availability.ts`**: the rules engine:
  - `getDayAvailability`: slots for a service/day, optionally for one staff member or
    branch, with reasons (`taken`, `full`, `too_soon`) and seats left for group sessions.
  - `validateBooking`: the full rule check used on create and reschedule. It resolves the
    staff member (least loaded first for "any available") and allocates rooms/equipment.
  - `findAlternatives`: the three nearest open slots.

  The engine takes an `AvailabilityContext` (business, services, resources, bookings,
  `now`), so it is deterministic and unit-testable.

### 2. Data access (`src/data`)

- **`BookingRepository`** is the only data contract the UI uses. Components never import
  seed arrays. Rule failures are returned as values (`{ ok: false, code, alternatives }`),
  mirroring an HTTP 409 response. Invalid state transitions throw `RepositoryError`.
- **`DemoBookingRepository`** holds one `DemoSnapshot` per industry under
  `autosynex.genesis.v{N}.{industry}` in `localStorage`. It adds simulated latency
  (160 ms) so loading states are real, notifies subscribers after every mutation, and
  reloads when another tab writes the same key.
- **Seed (`src/data/seed`)**: static industry configs plus `generateSnapshot()`, which
  places sample bookings **through the real engine**, so seeded data never breaks the rules.
  The tests re-validate every seeded booking. Dates are relative to "now", so the demo
  always shows today, a past month and a few upcoming weeks.
- **`repository-context.tsx`**: `RepositoryProvider` (the one place a repository is
  constructed), `useRepoQuery` (async query that re-runs on dependency change or
  repository mutation, keeping stale data while refreshing) and `BusinessGate`
  (loads the tenant profile once and provides time-zone-aware formatters).

### 3. UI (`src/components`, `src/app`)

- `app/[industry]/layout.tsx` validates the industry (unknown values return 404) and
  mounts `RepositoryProvider`, which gives each industry its own isolated data.
- The booking portal and dashboard share `SlotPicker`, which is used in the public flow,
  "New booking" and "Reschedule", so all three apply identical rules and alternatives.
- i18n: `en.ts` defines the dictionary and `ar.ts` must satisfy the same TypeScript
  type, so a missing translation fails the type check. The locale is stored in a
  cookie and read on the server, so `<html lang dir>` is correct on first paint
  (no RTL flash). Layouts use logical properties (`ps-`, `ms-`, `start-`, `border-s`).
- Theme: CSS variables in `globals.css` (light and dark), switched by `next-themes`.

## Moving to the real backend

1. Implement `ApiBookingRepository implements BookingRepository` with `fetch` calls
   (e.g. `GET /tenants/:id/availability?serviceId&date&staffId`,
   `POST /tenants/:id/bookings`). Map 409 responses to `{ ok: false, code, alternatives }`.
2. Swap the constructor in `RepositoryProvider`. For live updates, implement `subscribe()` with
   SSE or WebSockets, or keep it as a no-op and refetch after mutations.
3. Run `src/domain/availability.ts` on the server too (NestJS can import the same package).
   The browser keeps using it for instant feedback, but the server is authoritative.
4. **Concurrency:** create bookings in a transaction, and enforce non-overlap in PostgreSQL,
   e.g. an exclusion constraint on `(staff_id, tstzrange(start, end + buffer))` with
   `btree_gist`, plus a seat-count check (`SELECT … FOR UPDATE`) for group sessions.
   The demo cannot provide this guarantee and does not claim to.
5. Multi-tenancy: the `industry` route segment becomes a tenant slug, and `TenantDirectory`
   becomes `GET /tenants`.

## Testing

`tests/` (Vitest, Node environment):

- `availability.test.ts`: hours ∩ staff hours, closed days, holidays, booking window,
  minimum notice, overlaps, buffers, cancelled bookings freeing slots, "any staff"
  fallback, group capacity, room requirements, duplicates, off-grid times, reschedule
  self-exclusion, alternatives.
- `time.test.ts`: DST in Beirut, business-zone dates, date-key arithmetic.
- `demo-repository.test.ts`: every industry's seed passes the engine, industries stay
  isolated, persistence across instances, slot blocking with alternatives, duplicate
  submissions, reschedule/cancel state machine, group sessions filling to capacity,
  reset, subscriptions.
