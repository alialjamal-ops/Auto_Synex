/**
 * Deterministic sample-booking generator.
 *
 * Bookings are placed with the real availability engine, so seeded data never
 * violates the rules (hours, buffers, resources, capacity). Dates are relative
 * to "now" so the demo always looks alive.
 */
import { getDayAvailability, validateBooking, type AvailabilityContext } from "@/domain/availability";
import { addDaysToKey, toDateKey, weekdayOfKey } from "@/domain/time";
import type {
  ActivityEntry,
  Booking,
  BookingEvent,
  BookingSource,
  BookingStatus,
  Customer,
  DemoSnapshot,
} from "@/domain/types";
import type { IndustrySeed } from "./types";

export const SNAPSHOT_VERSION = 8;

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

const REF_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export function makeReference(rand: () => number): string {
  let out = "";
  for (let i = 0; i < 6; i++) out += REF_ALPHABET[Math.floor(rand() * REF_ALPHABET.length)];
  return `GN-${out}`;
}

export interface GenerateOptions {
  now: Date;
  pastDays?: number;
  futureDays?: number;
}

export function generateSnapshot(seed: IndustrySeed, options: GenerateOptions): DemoSnapshot {
  const { now } = options;
  const pastDays = options.pastDays ?? 28;
  const futureDays = options.futureDays ?? 21;
  const tz = seed.business.timezone;
  const rand = mulberry32(hashString(seed.business.id) ^ hashString(toDateKey(now, tz)));
  const pick = <T,>(list: T[]): T => list[Math.floor(rand() * list.length)];

  const todayKey = toDateKey(now, tz);
  const customers: Customer[] = seed.customers.map((p, i) => ({
    id: `cu_${seed.business.id}_${i + 1}`,
    name: p.name,
    phone: p.phone,
    email: p.email,
    createdAt: new Date(now.getTime() - (90 + i * 3) * 86_400_000).toISOString(),
  }));

  // Seeding ignores lead-time and booking-window rules; it uses the engine purely for conflicts.
  const seedBusiness = {
    ...seed.business,
    // A coarser grid while seeding keeps first load fast; every 30-min start is also valid on a 15-min grid.
    rules: {
      ...seed.business.rules,
      minNoticeMin: 0,
      maxAdvanceDays: pastDays + futureDays + 2,
      slotIntervalMin: Math.max(30, seed.business.rules.slotIntervalMin),
    },
  };
  const seedNow = new Date(now.getTime() - (pastDays + 1) * 86_400_000);

  const bookings: Booking[] = [];
  let counter = 0;
  const staff = seed.resources.filter((r) => r.kind === "staff" && r.active);

  for (let offset = -pastDays; offset <= futureDays; offset++) {
    const dateKey = addDaysToKey(todayKey, offset);
    if (seed.business.openingHours[weekdayOfKey(dateKey)].length === 0) continue;
    const dayBookings: Booking[] = [];
    const ctx: AvailabilityContext = {
      business: seedBusiness,
      services: seed.services,
      resources: seed.resources,
      bookings: dayBookings,
      now: seedNow,
    };
    // Busier in the recent past and the next few days, tapering further out.
    const density = offset < -14 ? 0.7 : offset < 0 ? 0.8 : offset === 0 ? 0.62 : offset <= 3 ? 0.55 : offset <= 10 ? 0.4 : 0.25;

    const place = (serviceId: string, staffId: string, start: string, seats = 1) => {
      let customer = pick(customers);
      for (let tries = 0; tries < 6; tries++) {
        const r = validateBooking(ctx, { serviceId, staffId, start, seats, customerId: customer.id });
        if (r.ok) {
          const service = seed.services.find((s) => s.id === serviceId)!;
          const b: Booking = {
            id: `bk_${seed.business.id}_${++counter}`,
            reference: makeReference(rand),
            serviceId,
            staffId: r.staffId,
            resourceIds: r.resourceIds,
            branchId: staff.find((s) => s.id === r.staffId)!.branchId,
            customerId: customer.id,
            start,
            end: r.end,
            seats,
            price: service.price * seats,
            status: "confirmed",
            source: "online",
            createdAt: start,
            history: [],
          };
          dayBookings.push(b);
          return true;
        }
        if (r.code !== "DUPLICATE") return false;
        customer = pick(customers);
      }
      return false;
    };

    for (const member of staff) {
      const services = seed.services.filter((s) => s.active && member.serviceIds.includes(s.id));
      const privateServices = services.filter((s) => s.capacity === 1);
      const groupServices = services.filter((s) => s.capacity > 1);

      // Group sessions: fill a share of seats.
      for (const svc of groupServices) {
        const day = getDayAvailability(ctx, { serviceId: svc.id, dateKey, staffId: member.id });
        for (const slot of day.slots.filter((s) => s.available)) {
          const fill = Math.round(svc.capacity * (0.35 + rand() * 0.65) * Math.min(1, density + 0.2));
          for (let i = 0; i < fill; i++) place(svc.id, member.id, slot.start);
        }
      }

      if (privateServices.length === 0) continue;
      const attempts = Math.round((groupServices.length ? 2 : 9) * density);
      for (let i = 0; i < attempts; i++) {
        const svc = pick(privateServices);
        const day = getDayAvailability(ctx, { serviceId: svc.id, dateKey, staffId: member.id });
        const open = day.slots.filter((s) => s.available);
        if (open.length === 0 || rand() > density + 0.1) continue;
        place(svc.id, member.id, pick(open).start);
      }
    }
    bookings.push(...dayBookings);
  }

  // Assign realistic lifecycle states relative to now.
  const nowMs = now.getTime();
  const sources: BookingSource[] = ["online", "online", "online", "online", "phone", "phone", "dashboard", "walk_in"];
  for (const b of bookings) {
    const startMs = Date.parse(b.start);
    const endMs = Date.parse(b.end);
    const leadDays = 1 + Math.floor(rand() * 12);
    const created = Math.min(startMs - leadDays * 86_400_000 + Math.floor(rand() * 8) * 3_600_000, nowMs - 3_600_000 * (1 + rand() * 30));
    b.createdAt = new Date(created).toISOString();
    b.source = startMs < nowMs ? pick(sources) : pick(sources.filter((s) => s !== "walk_in"));
    const history: BookingEvent[] = [{ at: b.createdAt, type: "created" }];
    const roll = rand();
    let status: BookingStatus;
    if (endMs <= nowMs) status = roll < 0.86 ? "completed" : roll < 0.92 ? "no_show" : "cancelled";
    else if (startMs <= nowMs) status = "confirmed";
    else if (roll < 0.06) status = "cancelled";
    else status = !seed.business.rules.autoConfirm && roll < 0.3 ? "pending" : roll < 0.12 ? "pending" : "confirmed";

    if (status !== "pending") history.push({ at: b.createdAt, type: "confirmed" });
    if (status === "completed") history.push({ at: b.end, type: "completed" });
    if (status === "no_show") history.push({ at: b.end, type: "no_show" });
    if (status === "cancelled") {
      const latest = Math.min(startMs, nowMs) - 60_000;
      const at = new Date(created + rand() * Math.max(60_000, latest - created)).toISOString();
      b.cancelReason = "Schedule conflict";
      history.push({ at, type: "cancelled" });
    }
    b.status = status;
    b.history = history;
  }

  bookings.sort((a, b) => Date.parse(a.start) - Date.parse(b.start));

  const activity: ActivityEntry[] = bookings
    .flatMap((b) => b.history.map((h) => ({ b, h })))
    .filter(({ h }) => Date.parse(h.at) <= nowMs && h.type !== "confirmed")
    .sort((x, y) => Date.parse(y.h.at) - Date.parse(x.h.at))
    .slice(0, 40)
    .map(({ b, h }, i) => ({
      id: `act_seed_${i}`,
      at: h.at,
      bookingId: b.id,
      type: h.type,
      params: { reference: b.reference },
    }));

  return {
    version: SNAPSHOT_VERSION,
    business: seed.business,
    services: seed.services,
    resources: seed.resources,
    customers,
    bookings,
    activity,
    seededAt: now.toISOString(),
  };
}
