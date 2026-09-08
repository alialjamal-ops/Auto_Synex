import type { BookingSettings, DemoConfig, ServiceItem, StaffItem, WorkingHours } from '@/types/demo';
import {
  addDays,
  addMinutes,
  diffDays,
  minutesToTime,
  timeToMinutes,
  weekdayOf,
} from '@/lib/date';
import { createRng, seededUnit } from '@/lib/random';

/* ------------------------------------------------------------------ */
/* Records                                                             */
/* ------------------------------------------------------------------ */

export type BookingStatus = 'confirmed' | 'completed' | 'cancelled' | 'pending';

export interface Booking {
  readonly id: string;
  readonly reference: string;
  readonly demo: string;
  readonly serviceId: string;
  readonly staffId: string | null;
  /** Check-in date for stays, appointment date otherwise. */
  readonly date: string;
  /** Check-out date — stays only. */
  readonly endDate: string | null;
  /** "HH:mm" — null for stays. */
  readonly time: string | null;
  readonly guests: number | null;
  readonly customer: {
    readonly name: string;
    readonly phone: string;
    readonly email: string;
    readonly notes: string;
  };
  readonly status: BookingStatus;
  readonly createdAt: string;
  /** Marks bookings made by the visitor during this demo session. */
  readonly source: 'seed' | 'visitor';
  readonly price: number;
}

export interface BookingDraft {
  serviceId: string | null;
  staffId: string | null;
  date: string | null;
  endDate: string | null;
  time: string | null;
  guests: number | null;
  name: string;
  phone: string;
  email: string;
  notes: string;
}

export const emptyDraft: BookingDraft = {
  serviceId: null,
  staffId: null,
  date: null,
  endDate: null,
  time: null,
  guests: null,
  name: '',
  phone: '',
  email: '',
  notes: '',
};

/* ------------------------------------------------------------------ */
/* Slots                                                               */
/* ------------------------------------------------------------------ */

export type SlotState = 'open' | 'booked' | 'past' | 'break';

export interface Slot {
  readonly time: string;
  readonly end: string;
  readonly state: SlotState;
}

export interface DayAvailability {
  readonly iso: string;
  readonly closed: boolean;
  readonly slots: readonly Slot[];
  readonly openCount: number;
}

interface SlotOptions {
  readonly hours: WorkingHours;
  readonly booking: BookingSettings;
  readonly demo: string;
  readonly dateIso: string;
  readonly staffId: string | null;
  readonly durationMin: number;
  /** Today's ISO date — slots earlier than `nowMinutes` on this date are past. */
  readonly todayIso: string;
  readonly nowMinutes: number;
  /** Slots already taken (visitor bookings + seeded load). */
  readonly taken: readonly string[];
}

/**
 * Deterministic "already booked" load: closer dates are busier, mid-morning and
 * early evening are the peaks. Same input → same result, always.
 */
function seededLoad(
  demo: string,
  staffId: string | null,
  dateIso: string,
  time: string,
  daysAhead: number,
): boolean {
  const minutes = timeToMinutes(time);
  const peak = minutes >= 600 && minutes <= 780 ? 0.16 : minutes >= 990 ? 0.1 : 0;
  const proximity = daysAhead <= 1 ? 0.22 : daysAhead <= 4 ? 0.12 : 0.04;
  const threshold = 0.2 + peak + proximity;
  return seededUnit(`${demo}|${staffId ?? 'any'}|${dateIso}|${time}`) < threshold;
}

export function buildDayAvailability(options: SlotOptions): DayAvailability {
  const {
    hours,
    booking,
    demo,
    dateIso,
    staffId,
    durationMin,
    todayIso,
    nowMinutes,
    taken,
  } = options;

  const day = hours[weekdayOf(dateIso)];
  if (!day) {
    return { iso: dateIso, closed: true, slots: [], openCount: 0 };
  }

  const open = timeToMinutes(day.open);
  const close = timeToMinutes(day.close);
  const breakFrom = day.breakFrom ? timeToMinutes(day.breakFrom) : null;
  const breakTo = day.breakTo ? timeToMinutes(day.breakTo) : null;
  const daysAhead = Math.max(0, diffDays(todayIso, dateIso));
  const leadCutoff = nowMinutes + booking.leadTimeHours * 60;

  const slots: Slot[] = [];
  for (let start = open; start + durationMin <= close; start += booking.slotMinutes) {
    const time = minutesToTime(start);
    const end = addMinutes(time, durationMin);

    if (breakFrom !== null && breakTo !== null && start < breakTo && start + durationMin > breakFrom) {
      slots.push({ time, end, state: 'break' });
      continue;
    }
    if (dateIso === todayIso && start < leadCutoff) {
      slots.push({ time, end, state: 'past' });
      continue;
    }
    if (taken.includes(time) || seededLoad(demo, staffId, dateIso, time, daysAhead)) {
      slots.push({ time, end, state: 'booked' });
      continue;
    }
    slots.push({ time, end, state: 'open' });
  }

  return {
    iso: dateIso,
    closed: false,
    slots,
    openCount: slots.filter((slot) => slot.state === 'open').length,
  };
}

/** Fast open/closed + capacity probe used to grey out calendar days. */
export function dayHasOpenSlots(options: SlotOptions): boolean {
  return buildDayAvailability(options).openCount > 0;
}

/* ------------------------------------------------------------------ */
/* Lookups                                                             */
/* ------------------------------------------------------------------ */

export function findService(config: DemoConfig, id: string | null): ServiceItem | null {
  return config.services.find((service) => service.id === id) ?? null;
}

export function findStaff(config: DemoConfig, id: string | null): StaffItem | null {
  return config.staff.find((member) => member.id === id) ?? null;
}

/** Staff able to deliver a service; falls back to the whole team. */
export function staffForService(config: DemoConfig, serviceId: string | null): readonly StaffItem[] {
  const service = findService(config, serviceId);
  if (!service?.staffIds?.length) return config.staff;
  return config.staff.filter((member) => service.staffIds?.includes(member.id));
}

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

export interface FieldErrors {
  name?: string;
  phone?: string;
  email?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

export function validateDetails(draft: BookingDraft): FieldErrors {
  const errors: FieldErrors = {};
  const name = draft.name.trim();
  const phone = draft.phone.trim();
  const email = draft.email.trim();

  if (name.length < 2) errors.name = 'Please enter your full name.';
  else if (!/[a-z]/i.test(name)) errors.name = 'Names need at least one letter.';

  const digits = phone.replace(/\D/g, '');
  if (!phone) errors.phone = 'A phone number is required for confirmation.';
  else if (digits.length < 7) errors.phone = 'That phone number looks too short.';
  else if (digits.length > 15) errors.phone = 'That phone number looks too long.';

  if (!email) errors.email = 'We send your confirmation by email.';
  else if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email address.';

  return errors;
}

/* ------------------------------------------------------------------ */
/* Reference + pricing                                                 */
/* ------------------------------------------------------------------ */

/**
 * Human-friendly booking reference — no look-alike characters (0/O, 1/I).
 * Driven by a seeded PRNG stream so the six characters are well distributed.
 */
export function buildReference(demo: string, draft: BookingDraft, salt: number): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const random = createRng(`${demo}|${draft.date ?? ''}|${draft.time ?? ''}|${draft.name}|${salt}`);
  let out = '';
  for (let i = 0; i < 6; i += 1) {
    out += alphabet.charAt(Math.floor(random() * alphabet.length));
  }
  return `${demo.slice(0, 2).toUpperCase()}-${out}`;
}

export function bookingTotal(
  config: DemoConfig,
  draft: BookingDraft,
): { nights: number; total: number } {
  const service = findService(config, draft.serviceId);
  if (!service) return { nights: 0, total: 0 };
  if (config.booking.dateMode === 'range' && draft.date && draft.endDate) {
    const nights = Math.max(1, diffDays(draft.date, draft.endDate));
    return { nights, total: service.price * nights };
  }
  return { nights: 0, total: service.price };
}

/** First date at or after `fromIso` the business is open. */
export function firstOpenDate(hours: WorkingHours, fromIso: string): string {
  let cursor = fromIso;
  for (let i = 0; i < 14; i += 1) {
    if (hours[weekdayOf(cursor)]) return cursor;
    cursor = addDays(cursor, 1);
  }
  return fromIso;
}
