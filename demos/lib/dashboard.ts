import type { Booking, BookingStatus } from '@/lib/booking';
import {
  addDays,
  addMinutes,
  diffDays,
  minutesToTime,
  timeToMinutes,
  weekdayOf,
} from '@/lib/date';
import { createRng, seededInt, seededPick, seededUnit } from '@/lib/random';
import type { DemoConfig } from '@/types/demo';

export type BookingChannel = 'online' | 'phone' | 'walk-in';

export interface Appointment extends Booking {
  readonly channel: BookingChannel;
  readonly durationMin: number;
}

/** Window of generated history / future used by every dashboard screen. */
export const HISTORY_DAYS = 28;
export const FUTURE_DAYS = 21;

const FIRST_NAMES = [
  'Amara', 'Julian', 'Noor', 'Marcus', 'Helena', 'Daniel', 'Sofia', 'Elias',
  'Priya', 'Tomás', 'Ines', 'Rowan', 'Dahlia', 'Noel', 'Farrah', 'Céline',
  'Nadia', 'Rosa', 'Adrienne', 'Hugo', 'Sana', 'Elliot', 'Devon', 'Ilse',
  'Peter', 'Grace', 'Kofi', 'Marie', 'Amir', 'Lena', 'Oscar', 'Yara',
  'Mateo', 'Freya', 'Idris', 'Talia', 'Mira', 'Juno', 'Isla', 'Hana',
] as const;

const LAST_NAMES = [
  'Whitfield', 'Reyes', 'Haddad', 'Hale', 'Barros', 'Okafor', 'Marchetti',
  'Fontaine', 'Raman', 'Ferreira', 'Cardoso', 'Vance', 'Okoro', 'Barrett',
  'Nazari', 'Dubois', 'Okonkwo', 'Milani', 'Vos', 'Almeida', 'Qureshi',
  'Grange', 'Achebe', 'Brandt', 'Nakamura', 'Molnar', 'Mensah', 'Lindqvist',
  'Rahman', 'Novak', 'Bergman', 'Haddadi', 'Silva', 'Ashby', 'Park', 'Brenner',
] as const;

const CHANNELS: readonly BookingChannel[] = ['online', 'online', 'online', 'phone', 'walk-in'];

function customerFor(seed: string): Booking['customer'] {
  const first = seededPick(`${seed}:first`, FIRST_NAMES);
  const last = seededPick(`${seed}:last`, LAST_NAMES);
  const name = `${first} ${last}`;
  const digits = 1000 + seededInt(`${seed}:phone`, 0, 8999);
  return {
    name,
    phone: `+1 (${200 + seededInt(`${seed}:area`, 0, 699)}) 555-0${String(digits % 1000).padStart(3, '0')}`,
    email: `${first.toLowerCase().replace(/[^a-z]/g, '')}.${last.toLowerCase().replace(/[^a-z]/g, '')}@example.com`,
    notes: '',
  };
}

function statusFor(seed: string, dateIso: string, time: string, todayIso: string, nowMinutes: number): BookingStatus {
  const delta = diffDays(todayIso, dateIso);
  if (delta < 0) {
    const roll = seededUnit(`${seed}:status`);
    if (roll < 0.08) return 'cancelled';
    return 'completed';
  }
  if (delta === 0) {
    if (timeToMinutes(time) + 30 < nowMinutes) {
      return seededUnit(`${seed}:status`) < 0.06 ? 'cancelled' : 'completed';
    }
    return 'confirmed';
  }
  const roll = seededUnit(`${seed}:status`);
  if (roll < 0.07) return 'cancelled';
  if (roll < 0.18) return 'pending';
  return 'confirmed';
}

/**
 * Deterministic appointment book for a demo.
 *
 * Same `todayIso` → same appointments, on the server and in the browser. That
 * is what keeps the dashboard stable across refreshes and free of hydration
 * warnings, while still looking like a business that is actually running.
 */
export function generateAppointments(config: DemoConfig, todayIso: string, nowMinutes = 11 * 60): Appointment[] {
  const appointments: Appointment[] = [];
  const services = config.services;
  const staff = config.staff;

  for (let offset = -HISTORY_DAYS; offset <= FUTURE_DAYS; offset += 1) {
    const dateIso = addDays(todayIso, offset);
    const day = config.hours[weekdayOf(dateIso)];
    if (!day) continue;

    const daySeed = `${config.slug}:${dateIso}`;
    const rng = createRng(daySeed);
    const weekday = weekdayOf(dateIso);
    // Weekends run hotter for consumer businesses, quieter for clinics.
    const weekendFactor = weekday === 0 || weekday === 6 ? (config.booking.mode === 'appointment' ? 0.7 : 1.25) : 1;
    const drift = 0.78 + rng() * 0.5;
    const count = Math.max(2, Math.round(config.dashboard.dailyVolume * weekendFactor * drift));

    const open = timeToMinutes(day.open);
    const close = timeToMinutes(day.close);
    const usedByStaff = new Map<string, Set<string>>();

    for (let index = 0; index < count; index += 1) {
      const seed = `${daySeed}:${index}`;
      const service = seededPick(`${seed}:service`, services);
      const eligible = service.staffIds?.length
        ? staff.filter((member) => service.staffIds?.includes(member.id))
        : staff;
      const member = eligible.length ? seededPick(`${seed}:staff`, eligible) : null;

      const isStay = config.booking.dateMode === 'range';
      let time: string;
      if (isStay) {
        // Stays are not slot-based: everyone checks in at 15:00.
        time = '15:00';
      } else {
        const span = Math.max(1, close - open - service.durationMin);
        const rawStart = open + Math.floor(seededUnit(`${seed}:time`) * span);
        const snapped =
          Math.round(rawStart / config.booking.slotMinutes) * config.booking.slotMinutes;
        const start = Math.min(Math.max(snapped, open), close - config.booking.slotMinutes);
        time = minutesToTime(start);
      }

      // A staff member cannot be in two places at once. Rooms and tables can be
      // sold in parallel, so the conflict check only applies to appointments.
      if (config.booking.mode === 'appointment') {
        const key = member?.id ?? 'house';
        const used = usedByStaff.get(key) ?? new Set<string>();
        if (used.has(time)) continue;
        used.add(time);
        usedByStaff.set(key, used);
      }

      const guests = config.booking.guests
        ? seededInt(`${seed}:guests`, config.booking.guests.min, Math.min(config.booking.guests.max, 6))
        : null;

      const nights = config.booking.dateMode === 'range' ? seededInt(`${seed}:nights`, 1, 4) : 0;
      // Restaurants bill per cover, hotels per night, everyone else per booking.
      const covers = config.booking.mode === 'table' ? (guests ?? 1) : 1;
      const price = (service.price || config.dashboard.avgTicket) * (nights || 1) * covers;

      appointments.push({
        id: `${config.slug}-${dateIso}-${index}`,
        reference: `${config.slug.slice(0, 2).toUpperCase()}-${(seededInt(`${seed}:ref`, 100000, 999999)).toString(36).toUpperCase()}`,
        demo: config.slug,
        serviceId: service.id,
        staffId: member?.id ?? null,
        date: dateIso,
        endDate: nights ? addDays(dateIso, nights) : null,
        time,
        guests,
        customer: customerFor(seed),
        status: statusFor(seed, dateIso, time, todayIso, nowMinutes),
        createdAt: addDays(dateIso, -seededInt(`${seed}:lead`, 1, 14)),
        source: 'seed',
        price: Math.round(price),
        channel: seededPick(`${seed}:channel`, CHANNELS),
        durationMin: config.booking.dateMode === 'range' ? 120 : service.durationMin,
      });
    }
  }

  return appointments.sort((a, b) =>
    a.date === b.date ? (a.time ?? '').localeCompare(b.time ?? '') : a.date.localeCompare(b.date),
  );
}

/* ------------------------------------------------------------------ */
/* Derived metrics                                                     */
/* ------------------------------------------------------------------ */

export interface DashboardSummary {
  today: Appointment[];
  upcoming: Appointment[];
  completed: Appointment[];
  cancelled: Appointment[];
  todayRevenue: number;
  weekRevenue: number;
  previousWeekRevenue: number;
  monthRevenue: number;
  newCustomers: number;
  occupancy: number;
  recent: Appointment[];
  weekSeries: { iso: string; label: string; value: number; bookings: number }[];
  serviceSplit: { id: string; name: string; count: number; revenue: number }[];
  staffLoad: { id: string; name: string; count: number; revenue: number }[];
  channelSplit: { channel: BookingChannel; count: number }[];
}

const billable = (appointment: Appointment): boolean =>
  appointment.status === 'completed' || appointment.status === 'confirmed';

export function summarize(
  appointments: readonly Appointment[],
  config: DemoConfig,
  todayIso: string,
): DashboardSummary {
  const today = appointments.filter((item) => item.date === todayIso);
  const upcoming = appointments.filter(
    (item) => item.date > todayIso && item.status !== 'cancelled',
  );
  const completed = appointments.filter((item) => item.status === 'completed');
  const cancelled = appointments.filter((item) => item.status === 'cancelled');

  const inRange = (item: Appointment, from: number, to: number): boolean => {
    const delta = diffDays(todayIso, item.date);
    return delta >= from && delta <= to;
  };

  const sum = (items: readonly Appointment[]): number =>
    items.filter(billable).reduce((total, item) => total + item.price, 0);

  const weekSeries = Array.from({ length: 7 }, (_, index) => {
    const iso = addDays(todayIso, index - 6);
    const dayItems = appointments.filter((item) => item.date === iso);
    return {
      iso,
      label: ['S', 'M', 'T', 'W', 'T', 'F', 'S'][weekdayOf(iso)] ?? '',
      value: sum(dayItems),
      bookings: dayItems.filter((item) => item.status !== 'cancelled').length,
    };
  });

  const serviceSplit = config.services
    .map((service) => {
      const items = appointments.filter(
        (item) => item.serviceId === service.id && inRange(item, -29, 0),
      );
      return {
        id: service.id,
        name: service.name,
        count: items.length,
        revenue: sum(items),
      };
    })
    .sort((a, b) => b.count - a.count);

  const staffLoad = config.staff
    .map((member) => {
      const items = appointments.filter(
        (item) => item.staffId === member.id && inRange(item, -6, 0),
      );
      return { id: member.id, name: member.name, count: items.length, revenue: sum(items) };
    })
    .sort((a, b) => b.count - a.count);

  const channels: BookingChannel[] = ['online', 'phone', 'walk-in'];
  const channelSplit = channels.map((channel) => ({
    channel,
    count: appointments.filter((item) => item.channel === channel && inRange(item, -29, 0)).length,
  }));

  const day = config.hours[weekdayOf(todayIso)];
  const capacity = day
    ? Math.max(
        1,
        Math.floor(
          ((timeToMinutes(day.close) - timeToMinutes(day.open)) / config.booking.slotMinutes) *
            Math.max(1, config.staff.length),
        ),
      )
    : 1;

  return {
    today,
    upcoming,
    completed,
    cancelled,
    todayRevenue: sum(today),
    weekRevenue: sum(appointments.filter((item) => inRange(item, -6, 0))),
    previousWeekRevenue: sum(appointments.filter((item) => inRange(item, -13, -7))),
    monthRevenue: sum(appointments.filter((item) => inRange(item, -29, 0))),
    newCustomers: new Set(
      appointments.filter((item) => inRange(item, -6, 0)).map((item) => item.customer.email),
    ).size,
    occupancy: Math.min(
      98,
      Math.round((today.filter((item) => item.status !== 'cancelled').length / capacity) * 100),
    ),
    recent: [...appointments]
      .filter((item) => diffDays(todayIso, item.date) >= -2)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 6),
    weekSeries,
    serviceSplit,
    staffLoad,
    channelSplit,
  };
}

/** Unique customer records derived from the appointment book. */
export interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  visits: number;
  /** Most recent completed appointment, or null for a first-time booking. */
  lastVisit: string | null;
  /** Next confirmed appointment, if any. */
  nextVisit: string | null;
  totalSpend: number;
  favouriteService: string;
  status: 'active' | 'new' | 'lapsed';
}

export function buildCustomers(
  appointments: readonly Appointment[],
  config: DemoConfig,
  todayIso: string,
): CustomerRecord[] {
  const map = new Map<string, Appointment[]>();
  for (const appointment of appointments) {
    const key = appointment.customer.email;
    map.set(key, [...(map.get(key) ?? []), appointment]);
  }

  return [...map.entries()]
    .map(([email, items]) => {
      const sorted = [...items].sort((a, b) => b.date.localeCompare(a.date));
      const latest = sorted[0] as Appointment;
      const attended = sorted.filter((item) => item.status === 'completed');
      const lastVisit = attended[0]?.date ?? null;
      const upcoming = [...items]
        .filter((item) => item.date > todayIso && item.status !== 'cancelled')
        .sort((a, b) => a.date.localeCompare(b.date))[0];

      const counts = new Map<string, number>();
      for (const item of items) counts.set(item.serviceId, (counts.get(item.serviceId) ?? 0) + 1);
      const favourite = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
      const daysSince = lastVisit ? diffDays(lastVisit, todayIso) : 0;

      return {
        id: email,
        name: latest.customer.name,
        email,
        phone: latest.customer.phone,
        visits: attended.length,
        lastVisit,
        nextVisit: upcoming?.date ?? null,
        totalSpend: attended.reduce((total, item) => total + item.price, 0),
        favouriteService:
          config.services.find((service) => service.id === favourite)?.name ?? '—',
        status: attended.length === 0 ? 'new' : daysSince > 21 ? 'lapsed' : 'active',
      } satisfies CustomerRecord;
    })
    .sort((a, b) => (b.lastVisit ?? '0').localeCompare(a.lastVisit ?? '0'));
}

/** Turns a stored visitor booking into a dashboard appointment row. */
export function visitorToAppointment(booking: Booking, config: DemoConfig): Appointment {
  const service = config.services.find((item) => item.id === booking.serviceId);
  return {
    ...booking,
    channel: 'online',
    durationMin: service?.durationMin ?? config.booking.slotMinutes,
  };
}

export function appointmentEnd(appointment: Appointment): string {
  return appointment.time ? addMinutes(appointment.time, appointment.durationMin) : '';
}
