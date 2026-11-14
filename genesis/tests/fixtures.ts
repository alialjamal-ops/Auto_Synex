import type { AvailabilityContext } from "@/domain/availability";
import type { Booking, Business, Resource, Service } from "@/domain/types";
import { week } from "@/data/seed/helpers";

const L = (en: string) => ({ en, ar: en });

/** Minimal deterministic business: Dubai (UTC+4), open Mon–Fri 09:00–17:00. */
export function makeBusiness(overrides: Partial<Business["rules"]> = {}): Business {
  return {
    id: "clinic",
    name: L("Test Clinic"),
    tagline: L(""),
    industryLabel: L("Clinic"),
    timezone: "Asia/Dubai",
    currency: "AED",
    phone: "",
    email: "",
    monogram: "TC",
    hue: 200,
    branches: [{ id: "main", name: L("Main"), address: L("") }],
    openingHours: week({ 1: "09:00-17:00", 2: "09:00-17:00", 3: "09:00-17:00", 4: "09:00-17:00", 5: "09:00-17:00" }),
    rules: {
      slotIntervalMin: 30,
      bufferMin: 0,
      minNoticeMin: 60,
      maxAdvanceDays: 30,
      allowStaffSelection: true,
      autoConfirm: true,
      cancellationWindowHours: 24,
      closedDates: [],
      ...overrides,
    },
    staffNoun: { singular: L("Doctor"), plural: L("Doctors") },
    customerNoun: { singular: L("Patient"), plural: L("Patients") },
  };
}

export const consult: Service = {
  id: "consult",
  name: L("Consultation"),
  description: L(""),
  category: L(""),
  durationMin: 30,
  price: 300,
  capacity: 1,
  active: true,
};

export const workshop: Service = {
  id: "workshop",
  name: L("Workshop"),
  description: L(""),
  category: L(""),
  durationMin: 120,
  price: 500,
  capacity: 3,
  fixedStartTimes: ["10:00", "14:00"],
  requirements: [{ kind: "room", label: L("Room"), resourceIds: ["room-1"] }],
  active: true,
};

export const staffA: Resource = {
  id: "a",
  kind: "staff",
  name: L("Dr A"),
  title: L(""),
  branchId: "main",
  hue: 1,
  serviceIds: ["consult", "workshop"],
  weeklyHours: week({ 1: "09:00-17:00", 2: "09:00-17:00", 3: "09:00-12:00" }),
  active: true,
};

export const staffB: Resource = {
  ...staffA,
  id: "b",
  name: L("Dr B"),
  serviceIds: ["consult"],
  weeklyHours: week({ 1: "13:00-17:00", 2: "13:00-17:00" }),
};

export const room: Resource = {
  ...staffA,
  id: "room-1",
  kind: "room",
  serviceIds: [],
  weeklyHours: week({ 1: "09:00-17:00", 2: "09:00-17:00", 3: "09:00-17:00", 4: "09:00-17:00", 5: "09:00-17:00" }),
};

/** Monday 2026-03-02 06:00 Dubai time. */
export const NOW = new Date("2026-03-02T02:00:00.000Z");
export const MONDAY = "2026-03-02";
export const TUESDAY = "2026-03-03";

export function makeCtx(bookings: Booking[] = [], rules: Partial<Business["rules"]> = {}): AvailabilityContext {
  return {
    business: makeBusiness(rules),
    services: [consult, workshop],
    resources: [staffA, staffB, room],
    bookings,
    now: NOW,
  };
}

let n = 0;
export function booking(partial: Partial<Booking> & Pick<Booking, "start" | "end">): Booking {
  n += 1;
  return {
    id: `t${n}`,
    reference: `GN-T${n}`,
    serviceId: "consult",
    staffId: "a",
    resourceIds: [],
    branchId: "main",
    customerId: `c${n}`,
    seats: 1,
    price: 300,
    status: "confirmed",
    source: "online",
    createdAt: NOW.toISOString(),
    history: [],
    ...partial,
  };
}
