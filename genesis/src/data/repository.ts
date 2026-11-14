/**
 * BookingRepository — the only data contract the UI depends on.
 *
 * Today it is implemented by DemoBookingRepository (browser-local sample data).
 * A future ApiBookingRepository can implement the same interface against the
 * NestJS + PostgreSQL backend without touching any component.
 */
import type {
  Alternative,
  BookingErrorCode,
  ClosedReason,
  DayAvailability,
  SlotQuery,
} from "@/domain/availability";
import type {
  ActivityEntry,
  Booking,
  BookingRules,
  BookingSource,
  BookingStatus,
  Business,
  Customer,
  IndustryId,
  Resource,
  ResourceKind,
  Service,
  WeeklyHours,
} from "@/domain/types";
import type { DateKey } from "@/domain/time";

export interface BookingFilter {
  /** Inclusive range of business-zone dates. */
  fromKey?: DateKey;
  toKey?: DateKey;
  statuses?: BookingStatus[];
  staffId?: string;
  serviceId?: string;
  customerId?: string;
  /** Matches reference, customer name, phone or email. */
  search?: string;
}

export interface CustomerInput {
  name: string;
  phone: string;
  email: string;
}

export interface CreateBookingInput {
  serviceId: string;
  start: string;
  staffId?: string;
  branchId?: string;
  seats?: number;
  customer: CustomerInput;
  notes?: string;
  source: BookingSource;
}

export interface RescheduleInput {
  start: string;
  staffId?: string;
}

export type BookingResult =
  | { ok: true; booking: Booking }
  | { ok: false; code: BookingErrorCode; alternatives: Alternative[] };

export interface CustomerSummary extends Customer {
  totalBookings: number;
  upcoming: number;
  completed: number;
  cancelled: number;
  lifetimeValue: number;
  lastVisit?: string;
  nextVisit?: string;
}

export type ServiceInput = Omit<Service, "id"> & { id?: string };

export interface BusinessSettingsPatch {
  rules?: Partial<BookingRules>;
  openingHours?: WeeklyHours;
}

export interface BookingRepository {
  readonly industry: IndustryId;

  getBusiness(): Promise<Business>;
  updateBusinessSettings(patch: BusinessSettingsPatch): Promise<Business>;

  listServices(options?: { includeInactive?: boolean }): Promise<Service[]>;
  saveService(input: ServiceInput): Promise<Service>;

  listResources(options?: { kind?: ResourceKind; includeInactive?: boolean }): Promise<Resource[]>;
  updateResourceAvailability(id: string, weeklyHours: WeeklyHours, active?: boolean): Promise<Resource>;

  getAvailability(query: SlotQuery): Promise<DayAvailability>;
  getAvailabilitySummary(
    query: Omit<SlotQuery, "dateKey">,
    fromKey: DateKey,
    days: number,
  ): Promise<Record<DateKey, { open: number; closedReason?: ClosedReason }>>;
  findAlternatives(query: Omit<SlotQuery, "dateKey">, desiredStart: string): Promise<Alternative[]>;

  createBooking(input: CreateBookingInput): Promise<BookingResult>;
  cancelBooking(id: string, reason?: string): Promise<Booking>;
  rescheduleBooking(id: string, input: RescheduleInput): Promise<BookingResult>;
  updateBookingStatus(id: string, status: Extract<BookingStatus, "confirmed" | "completed" | "no_show">): Promise<Booking>;
  listBookings(filter?: BookingFilter): Promise<Booking[]>;
  getBooking(id: string): Promise<Booking | null>;

  listCustomers(search?: string): Promise<CustomerSummary[]>;
  listActivity(limit?: number): Promise<ActivityEntry[]>;

  /** Current server/business clock. Lets the UI agree with the rules engine on "now". */
  now(): Date;
  /** Notifies when data changes (another tab, or a mutation in this one). */
  subscribe(listener: () => void): () => void;
  /** Demo only: restore the seeded sample data. */
  reset(): Promise<void>;
}

export class RepositoryError extends Error {
  constructor(
    public readonly code: "NOT_FOUND" | "INVALID_STATE" | "VALIDATION",
    message: string,
  ) {
    super(message);
    this.name = "RepositoryError";
  }
}
