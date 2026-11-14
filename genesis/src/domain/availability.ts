/**
 * Availability & booking-rule engine.
 *
 * Pure functions over a snapshot of business data — no storage, no clock.
 * The demo repository calls these locally; a future API would run the same
 * rules server-side (with database-level locking for multi-user safety).
 */
import type { Booking, Business, Resource, Service, TimeRange, Weekday } from "./types";
import { BLOCKING_STATUSES } from "./types";
import {
  addDaysToKey,
  addMinutes,
  diffDaysKeys,
  formatHM,
  parseHM,
  rangesOverlap,
  toDateKey,
  weekdayOfKey,
  zonedToInstant,
  type DateKey,
} from "./time";

export interface AvailabilityContext {
  business: Business;
  services: Service[];
  resources: Resource[];
  bookings: Booking[];
  now: Date;
}

export interface SlotQuery {
  serviceId: string;
  dateKey: DateKey;
  /** Specific staff member, or undefined for "any available". */
  staffId?: string;
  branchId?: string;
  /** Ignore this booking when checking conflicts (used for rescheduling). */
  excludeBookingId?: string;
  seats?: number;
}

export type SlotUnavailableReason = "taken" | "full" | "too_soon";

export interface Slot {
  /** Wall-clock start in the business zone. */
  time: string;
  start: string;
  end: string;
  available: boolean;
  reason?: SlotUnavailableReason;
  /** Staff who can take this slot, best candidate first. */
  staffIds: string[];
  /** Group sessions: seats remaining in the best session. */
  seatsLeft?: number;
  capacity: number;
}

export type ClosedReason = "closed_day" | "holiday" | "past" | "beyond_window" | "no_staff";

export interface DayAvailability {
  dateKey: DateKey;
  closed: boolean;
  closedReason?: ClosedReason;
  slots: Slot[];
}

export type BookingErrorCode =
  | "SERVICE_NOT_FOUND"
  | "STAFF_NOT_FOUND"
  | "CLOSED"
  | "OUTSIDE_HOURS"
  | "TOO_SOON"
  | "SLOT_TAKEN"
  | "SESSION_FULL"
  | "DUPLICATE"
  | "INVALID_STATUS";

export interface Alternative {
  start: string;
  dateKey: DateKey;
  time: string;
  staffId: string;
}

export type ValidationResult =
  | { ok: true; staffId: string; resourceIds: string[]; end: string; seatsLeft?: number }
  | { ok: false; code: BookingErrorCode };

const blocking = (b: Booking) => BLOCKING_STATUSES.includes(b.status);

export function serviceBuffer(service: Service, business: Business): number {
  return service.bufferMin ?? business.rules.bufferMin;
}

/** Intersects two lists of wall-clock ranges (minutes). */
function intersect(a: TimeRange[], b: TimeRange[]): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  for (const x of a) {
    for (const y of b) {
      const s = Math.max(parseHM(x.start), parseHM(y.start));
      const e = Math.min(parseHM(x.end), parseHM(y.end));
      if (e > s) out.push([s, e]);
    }
  }
  return out;
}

function fitsIn(ranges: Array<[number, number]>, start: number, end: number): boolean {
  return ranges.some(([s, e]) => start >= s && end <= e);
}

export function todayKey(ctx: Pick<AvailabilityContext, "business" | "now">): DateKey {
  return toDateKey(ctx.now, ctx.business.timezone);
}

/** Why a whole day is unbookable, or null if the day is open. */
export function dayClosedReason(ctx: AvailabilityContext, dateKey: DateKey): ClosedReason | null {
  const { business } = ctx;
  const offset = diffDaysKeys(dateKey, todayKey(ctx));
  if (offset < 0) return "past";
  if (offset > business.rules.maxAdvanceDays) return "beyond_window";
  if (business.rules.closedDates.includes(dateKey)) return "holiday";
  if (business.openingHours[weekdayOfKey(dateKey)].length === 0) return "closed_day";
  return null;
}

export function eligibleStaff(ctx: AvailabilityContext, service: Service, branchId?: string): Resource[] {
  return ctx.resources.filter(
    (r) => r.kind === "staff" && r.active && r.serviceIds.includes(service.id) && (!branchId || r.branchId === branchId),
  );
}

interface Interval {
  start: number;
  end: number;
}

/** Occupied interval of a booking including its trailing buffer (epoch ms). */
function occupied(b: Booking, ctx: AvailabilityContext): Interval {
  const svc = ctx.services.find((s) => s.id === b.serviceId);
  const buffer = svc ? serviceBuffer(svc, ctx.business) : ctx.business.rules.bufferMin;
  return { start: Date.parse(b.start), end: Date.parse(b.end) + buffer * 60_000 };
}

function isSameSession(b: Booking, serviceId: string, startIso: string, staffId: string): boolean {
  return b.serviceId === serviceId && b.staffId === staffId && Date.parse(b.start) === Date.parse(startIso);
}

/** Blocking bookings with pre-computed occupied intervals (incl. trailing buffer). */
interface Occupancy {
  b: Booking;
  start: number;
  end: number;
}

function occupancyOf(ctx: AvailabilityContext): Occupancy[] {
  return ctx.bookings.filter(blocking).map((b) => {
    const o = occupied(b, ctx);
    return { b, start: o.start, end: o.end };
  });
}

function resourceBusy(
  occ: Occupancy[],
  resourceId: string,
  want: Interval,
  excludeBookingId?: string,
  sameSession?: { serviceId: string; start: string; staffId: string },
): boolean {
  return occ.some(({ b, start, end }) => {
    if (b.id === excludeBookingId) return false;
    if (!rangesOverlap(want.start, want.end, start, end)) return false;
    if (b.staffId !== resourceId && !b.resourceIds.includes(resourceId)) return false;
    return !(sameSession && isSameSession(b, sameSession.serviceId, sameSession.start, sameSession.staffId));
  });
}

function allocateRequirements(
  ctx: AvailabilityContext,
  occ: Occupancy[],
  service: Service,
  dateKey: DateKey,
  want: Interval,
  startMin: number,
  endMin: number,
  excludeBookingId?: string,
): string[] | null {
  const weekday = weekdayOfKey(dateKey);
  const picked: string[] = [];
  for (const req of service.requirements ?? []) {
    const free = req.resourceIds.find((id) => {
      const r = ctx.resources.find((x) => x.id === id);
      if (!r || !r.active) return false;
      const hours = intersect(r.weeklyHours[weekday], ctx.business.openingHours[weekday]);
      if (!fitsIn(hours, startMin, endMin)) return false;
      return !resourceBusy(occ, id, want, excludeBookingId);
    });
    if (!free) return null;
    picked.push(free);
  }
  return picked;
}

function candidateTimes(ctx: AvailabilityContext, service: Service, weekday: Weekday): number[] {
  const opening = ctx.business.openingHours[weekday];
  if (service.fixedStartTimes?.length) {
    if (service.fixedWeekdays && !service.fixedWeekdays.includes(weekday)) return [];
    return service.fixedStartTimes
      .map(parseHM)
      .filter((s) => opening.some((o) => s >= parseHM(o.start) && s + service.durationMin <= parseHM(o.end)))
      .sort((a, b) => a - b);
  }
  const step = ctx.business.rules.slotIntervalMin;
  const times = new Set<number>();
  for (const o of opening) {
    for (let t = parseHM(o.start); t + service.durationMin <= parseHM(o.end); t += step) times.add(t);
  }
  return [...times].sort((a, b) => a - b);
}

/** Narrows the context to bookings near one day — keeps per-slot checks cheap. */
function scopeToDay(ctx: AvailabilityContext, dateKey: DateKey): { scoped: AvailabilityContext; dayStart: number; dayEnd: number } {
  const dayStart = zonedToInstant(dateKey, "00:00", ctx.business.timezone).getTime();
  const dayEnd = zonedToInstant(addDaysToKey(dateKey, 1), "00:00", ctx.business.timezone).getTime();
  const margin = 86_400_000;
  const bookings = ctx.bookings.filter((b) => Date.parse(b.start) < dayEnd + margin && Date.parse(b.end) > dayStart - margin);
  return { scoped: { ...ctx, bookings }, dayStart, dayEnd };
}

/** Bookings per staff on a day — used to balance "any available" assignments. */
function dailyLoad(ctx: AvailabilityContext, dayStart: number, dayEnd: number): Map<string, number> {
  const load = new Map<string, number>();
  for (const b of ctx.bookings) {
    const t = Date.parse(b.start);
    if (!blocking(b) || t < dayStart || t >= dayEnd) continue;
    load.set(b.staffId, (load.get(b.staffId) ?? 0) + 1);
  }
  return load;
}

export function getDayAvailability(fullCtx: AvailabilityContext, query: SlotQuery): DayAvailability {
  const { business } = fullCtx;
  const ctx = fullCtx;
  const service = ctx.services.find((s) => s.id === query.serviceId);
  const dateKey = query.dateKey;
  if (!service) return { dateKey, closed: true, closedReason: "no_staff", slots: [] };

  const closedReason = dayClosedReason(ctx, dateKey);
  if (closedReason) return { dateKey, closed: true, closedReason, slots: [] };

  const weekday = weekdayOfKey(dateKey);
  let staff = eligibleStaff(ctx, service, query.branchId);
  if (query.staffId) staff = staff.filter((s) => s.id === query.staffId);
  const staffHours = new Map(staff.map((s) => [s.id, intersect(s.weeklyHours[weekday], business.openingHours[weekday])]));
  staff = staff.filter((s) => (staffHours.get(s.id) ?? []).length > 0);
  if (staff.length === 0) return { dateKey, closed: true, closedReason: "no_staff", slots: [] };

  const { scoped, dayStart, dayEnd } = scopeToDay(fullCtx, dateKey);
  return computeSlots(scoped, query, service, staff, staffHours, dailyLoad(scoped, dayStart, dayEnd));
}

function computeSlots(
  ctx: AvailabilityContext,
  query: SlotQuery,
  service: Service,
  staff: Resource[],
  staffHours: Map<string, Array<[number, number]>>,
  load: Map<string, number>,
): DayAvailability {
  const { business } = ctx;
  const dateKey = query.dateKey;
  const weekday = weekdayOfKey(dateKey);
  const occ = occupancyOf(ctx);
  // Seats already taken per existing group session, keyed by staff + start instant.
  const sessions = new Map<string, number>();
  if (service.capacity > 1) {
    for (const { b, start } of occ) {
      if (b.serviceId !== service.id || b.id === query.excludeBookingId) continue;
      const key = `${b.staffId}|${start}`;
      sessions.set(key, (sessions.get(key) ?? 0) + b.seats);
    }
  }
  const seats = query.seats ?? 1;
  const buffer = serviceBuffer(service, business);
  const earliest = ctx.now.getTime() + business.rules.minNoticeMin * 60_000;
  const isGroup = service.capacity > 1;
  const slots: Slot[] = [];

  for (const startMin of candidateTimes(ctx, service, weekday)) {
    const endMin = startMin + service.durationMin;
    const working = staff.filter((s) => fitsIn(staffHours.get(s.id) ?? [], startMin, endMin));
    if (working.length === 0) continue; // outside everyone's hours: not offered at all

    const time = formatHM(startMin);
    const startDate = zonedToInstant(dateKey, time, business.timezone);
    const start = startDate.toISOString();
    const end = addMinutes(startDate, service.durationMin).toISOString();
    const want: Interval = { start: startDate.getTime(), end: Date.parse(end) + buffer * 60_000 };

    const candidates: Array<{ id: string; seatsLeft: number; rank: number }> = [];
    let anyFull = false;
    for (const s of working) {
      const session = isGroup ? sessions.get(`${s.id}|${startDate.getTime()}`) : undefined;
      const seatsLeft = service.capacity - (session ?? 0);
      if (session !== undefined) {
        // Joining an existing group session: only seat count matters.
        if (seatsLeft >= seats) candidates.push({ id: s.id, seatsLeft, rank: -1 });
        else anyFull = true;
        continue;
      }
      const sameSession = isGroup ? { serviceId: service.id, start, staffId: s.id } : undefined;
      if (resourceBusy(occ, s.id, want, query.excludeBookingId, sameSession)) continue;
      if (!allocateRequirements(ctx, occ, service, dateKey, want, startMin, endMin, query.excludeBookingId)) continue;
      if (seats > service.capacity) continue;
      candidates.push({ id: s.id, seatsLeft: service.capacity, rank: load.get(s.id) ?? 0 });
    }
    // Prefer filling existing group sessions, then the least-loaded staff member.
    candidates.sort((a, b) => a.rank - b.rank);

    let reason: SlotUnavailableReason | undefined;
    if (startDate.getTime() < earliest) reason = "too_soon";
    else if (candidates.length === 0) reason = anyFull ? "full" : "taken";

    slots.push({
      time,
      start,
      end,
      available: !reason,
      reason,
      staffIds: reason ? [] : candidates.map((c) => c.id),
      seatsLeft: isGroup ? (candidates[0]?.seatsLeft ?? 0) : undefined,
      capacity: service.capacity,
    });
  }
  return { dateKey, closed: false, slots };
}

/**
 * Up to `limit` bookable alternatives closest to `desiredStart`: same day
 * first (by distance), then the following days in order.
 */
export function findAlternatives(
  ctx: AvailabilityContext,
  query: Omit<SlotQuery, "dateKey">,
  desiredStart: string,
  limit = 3,
  searchDays = 14,
): Alternative[] {
  const desired = Date.parse(desiredStart);
  const startKey = toDateKey(desiredStart, ctx.business.timezone);
  const out: Alternative[] = [];
  for (let i = 0; i <= searchDays && out.length < limit; i++) {
    const dateKey = addDaysToKey(startKey, i);
    const day = getDayAvailability(ctx, { ...query, dateKey });
    const open = day.slots.filter((s) => s.available && Date.parse(s.start) !== desired);
    if (i === 0) open.sort((a, b) => Math.abs(Date.parse(a.start) - desired) - Math.abs(Date.parse(b.start) - desired));
    for (const s of open) {
      if (out.length >= limit) break;
      out.push({ start: s.start, dateKey, time: s.time, staffId: s.staffIds[0] });
    }
  }
  return out.sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
}

export interface BookingCandidate {
  serviceId: string;
  start: string;
  staffId?: string;
  branchId?: string;
  seats?: number;
  customerId?: string;
  excludeBookingId?: string;
}

/** Validates a requested booking against every rule and resolves staff/resources. */
export function validateBooking(ctx: AvailabilityContext, input: BookingCandidate): ValidationResult {
  const service = ctx.services.find((s) => s.id === input.serviceId && s.active);
  if (!service) return { ok: false, code: "SERVICE_NOT_FOUND" };
  if (input.staffId && !ctx.resources.some((r) => r.id === input.staffId && r.kind === "staff" && r.active)) {
    return { ok: false, code: "STAFF_NOT_FOUND" };
  }
  const tz = ctx.business.timezone;
  const dateKey = toDateKey(input.start, tz);

  if (input.customerId) {
    const startMs = Date.parse(input.start);
    const endMs = startMs + service.durationMin * 60_000;
    const clash = ctx.bookings.some(
      (b) =>
        blocking(b) &&
        b.id !== input.excludeBookingId &&
        b.customerId === input.customerId &&
        rangesOverlap(startMs, endMs, Date.parse(b.start), Date.parse(b.end)),
    );
    if (clash) return { ok: false, code: "DUPLICATE" };
  }

  const day = getDayAvailability(ctx, {
    serviceId: service.id,
    dateKey,
    staffId: input.staffId,
    branchId: input.branchId,
    excludeBookingId: input.excludeBookingId,
    seats: input.seats,
  });
  if (day.closed) return { ok: false, code: day.closedReason === "no_staff" ? "OUTSIDE_HOURS" : "CLOSED" };
  const slot = day.slots.find((s) => Date.parse(s.start) === Date.parse(input.start));
  if (!slot) return { ok: false, code: "OUTSIDE_HOURS" };
  if (!slot.available) {
    return { ok: false, code: slot.reason === "too_soon" ? "TOO_SOON" : slot.reason === "full" ? "SESSION_FULL" : "SLOT_TAKEN" };
  }
  const staffId = slot.staffIds[0];
  const startMin = parseHM(slot.time);
  const buffer = serviceBuffer(service, ctx.business);
  const want = { start: Date.parse(slot.start), end: Date.parse(slot.end) + buffer * 60_000 };

  // Group sessions reuse the resources already held by the session.
  const existing = ctx.bookings.find(
    (b) => blocking(b) && b.id !== input.excludeBookingId && isSameSession(b, service.id, slot.start, staffId),
  );
  const resourceIds =
    existing?.resourceIds ??
    allocateRequirements(ctx, occupancyOf(ctx), service, dateKey, want, startMin, startMin + service.durationMin, input.excludeBookingId) ??
    [];
  return { ok: true, staffId, resourceIds, end: slot.end, seatsLeft: slot.seatsLeft };
}

/** Days in [fromKey, fromKey+count) with at least one open slot. */
export function availableDays(ctx: AvailabilityContext, query: Omit<SlotQuery, "dateKey">, fromKey: DateKey, count: number) {
  const out: Record<DateKey, { open: number; closedReason?: ClosedReason }> = {};
  for (let i = 0; i < count; i++) {
    const key = addDaysToKey(fromKey, i);
    const day = getDayAvailability(ctx, { ...query, dateKey: key });
    out[key] = { open: day.slots.filter((s) => s.available).length, closedReason: day.closedReason };
  }
  return out;
}
