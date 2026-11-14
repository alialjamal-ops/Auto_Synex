/**
 * Core domain model for Auto Synex Booking OS.
 *
 * These types are shared by the demo data layer, the availability engine and
 * the UI. They are intentionally transport-agnostic so a future NestJS API can
 * return the same shapes (instants are ISO-8601 strings in UTC).
 */

export type Locale = "en" | "ar";

/** A string localised into every supported UI language. */
export type LocalizedText = Record<Locale, string>;

export const INDUSTRY_IDS = ["clinic", "salon", "academy", "studio"] as const;
export type IndustryId = (typeof INDUSTRY_IDS)[number];

export function isIndustryId(value: string): value is IndustryId {
  return (INDUSTRY_IDS as readonly string[]).includes(value);
}

/** 0 = Sunday … 6 = Saturday (same as Date#getDay). */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export const WEEKDAYS: Weekday[] = [0, 1, 2, 3, 4, 5, 6];

/** Wall-clock interval in the business time zone, "HH:mm" 24h. */
export interface TimeRange {
  start: string;
  end: string;
}

/** Working intervals per weekday. An empty array means closed / day off. */
export type WeeklyHours = Record<Weekday, TimeRange[]>;

export interface Branch {
  id: string;
  name: LocalizedText;
  address: LocalizedText;
}

export interface BookingRules {
  /** Granularity of offered start times. */
  slotIntervalMin: number;
  /** Default gap kept free after every appointment. Services may override. */
  bufferMin: number;
  /** Bookings must start at least this long from now. */
  minNoticeMin: number;
  /** How far ahead customers can book. */
  maxAdvanceDays: number;
  /** Whether customers may pick a specific staff member (otherwise auto-assign). */
  allowStaffSelection: boolean;
  /** Whether new online bookings are confirmed immediately or wait for approval. */
  autoConfirm: boolean;
  /** Free cancellation window shown on the confirmation page. */
  cancellationWindowHours: number;
  /** Specific closed dates (yyyy-MM-dd, business time zone). */
  closedDates: string[];
}

export interface Business {
  id: IndustryId;
  name: LocalizedText;
  tagline: LocalizedText;
  industryLabel: LocalizedText;
  /** IANA zone used for all wall-clock maths. */
  timezone: string;
  currency: string;
  phone: string;
  email: string;
  /** Two-letter monogram rendered in the logo placeholder. */
  monogram: string;
  /** Tailwind-independent brand hue (oklch hue angle) for the logo placeholder. */
  hue: number;
  branches: Branch[];
  /** Brand imagery (paths or URLs). A real backend would serve CDN URLs. */
  media: { cover: string; card: string };
  openingHours: WeeklyHours;
  rules: BookingRules;
  /** Label for the person delivering the service, e.g. "Doctor", "Stylist". */
  staffNoun: { singular: LocalizedText; plural: LocalizedText };
  /** Label for the customer, e.g. "Patient", "Client", "Student". */
  customerNoun: { singular: LocalizedText; plural: LocalizedText };
}

export type ResourceKind = "staff" | "room" | "equipment";

export interface Resource {
  id: string;
  kind: ResourceKind;
  name: LocalizedText;
  /** Job title for staff, description for rooms/equipment. */
  title: LocalizedText;
  branchId: string;
  /** Hue for avatar / calendar lane colour. */
  hue: number;
  /** Optional profile photo (staff). Falls back to initials. */
  photo?: string;
  /** Staff only: services they can deliver. Rooms/equipment: ignored. */
  serviceIds: string[];
  /** Personal working hours, intersected with business opening hours. */
  weeklyHours: WeeklyHours;
  active: boolean;
}

/** A pool of non-staff resources; a booking needs one free member of each pool. */
export interface ResourceRequirement {
  kind: Exclude<ResourceKind, "staff">;
  label: LocalizedText;
  resourceIds: string[];
}

export interface Service {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  category: LocalizedText;
  durationMin: number;
  price: number;
  /** Overrides BookingRules.bufferMin when set. */
  bufferMin?: number;
  /** 1 = private appointment; >1 = group session with shared seats. */
  capacity: number;
  /** Group sessions only run at these wall-clock times. */
  fixedStartTimes?: string[];
  /** Group sessions only run on these weekdays (defaults to all open days). */
  fixedWeekdays?: Weekday[];
  requirements?: ResourceRequirement[];
  active: boolean;
}

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
export const BOOKING_STATUSES: BookingStatus[] = ["pending", "confirmed", "completed", "cancelled", "no_show"];

/** Statuses that occupy capacity on the calendar. */
export const BLOCKING_STATUSES: BookingStatus[] = ["pending", "confirmed", "completed"];

export type BookingSource = "online" | "dashboard" | "phone" | "walk_in";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  createdAt: string;
  notes?: string;
}

export interface BookingEvent {
  at: string;
  type: "created" | "confirmed" | "rescheduled" | "cancelled" | "completed" | "no_show";
  note?: string;
}

export interface Booking {
  id: string;
  /** Short human reference shown to customers. */
  reference: string;
  serviceId: string;
  staffId: string;
  /** Rooms / equipment allocated for the booking. */
  resourceIds: string[];
  branchId: string;
  customerId: string;
  start: string;
  end: string;
  seats: number;
  price: number;
  status: BookingStatus;
  source: BookingSource;
  notes?: string;
  cancelReason?: string;
  createdAt: string;
  history: BookingEvent[];
}

export interface ActivityEntry {
  id: string;
  at: string;
  bookingId?: string;
  type: BookingEvent["type"] | "service_saved" | "hours_updated" | "settings_updated";
  /** Pre-rendered parameters; the UI localises the sentence. */
  params: Record<string, string>;
}

/** Everything the demo repository persists for one industry. */
export interface DemoSnapshot {
  version: number;
  business: Business;
  services: Service[];
  resources: Resource[];
  customers: Customer[];
  bookings: Booking[];
  activity: ActivityEntry[];
  seededAt: string;
}
