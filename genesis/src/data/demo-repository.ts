/**
 * DemoBookingRepository — BookingRepository backed by seeded sample data and
 * browser storage (one isolated snapshot per industry).
 *
 * IMPORTANT: conflict checks here run in a single browser. They prevent
 * double-booking within this demo session only and are NOT multi-user safe.
 * The production ApiBookingRepository must enforce the same rules server-side
 * inside a transaction (e.g. PostgreSQL exclusion constraints).
 */
import {
  availableDays,
  findAlternatives,
  getDayAvailability,
  validateBooking,
  type AvailabilityContext,
  type SlotQuery,
} from "@/domain/availability";
import { diffDaysKeys, toDateKey } from "@/domain/time";
import type { ActivityEntry, Booking, BookingStatus, Customer, DemoSnapshot, IndustryId, WeeklyHours } from "@/domain/types";
import { BLOCKING_STATUSES } from "@/domain/types";
import {
  RepositoryError,
  type BookingFilter,
  type BookingRepository,
  type BookingResult,
  type BusinessSettingsPatch,
  type CreateBookingInput,
  type CustomerSummary,
  type RescheduleInput,
  type ServiceInput,
} from "./repository";
import { generateSnapshot, makeReference, SNAPSHOT_VERSION } from "./seed/generate";
import { industrySeeds } from "./seed";

export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function createMemoryStorage(): KeyValueStorage {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
  };
}

export interface DemoRepositoryOptions {
  storage: KeyValueStorage;
  /** Clock override (tests). */
  clock?: () => Date;
  /** Simulated network latency in ms, to exercise loading states. */
  latencyMs?: number;
}

export const storageKey = (industry: IndustryId) => `autosynex.genesis.v${SNAPSHOT_VERSION}.${industry}`;

const clone = <T,>(v: T): T => structuredClone(v);
const normalisePhone = (p: string) => p.replace(/[^\d+]/g, "");
const normaliseEmail = (e: string) => e.trim().toLowerCase();

export class DemoBookingRepository implements BookingRepository {
  private snapshot: DemoSnapshot | null = null;
  private listeners = new Set<() => void>();
  private readonly storage: KeyValueStorage;
  private readonly clock: () => Date;
  private readonly latencyMs: number;
  private idCounter = 0;

  constructor(
    public readonly industry: IndustryId,
    options: DemoRepositoryOptions,
  ) {
    this.storage = options.storage;
    this.clock = options.clock ?? (() => new Date());
    this.latencyMs = options.latencyMs ?? 0;
  }

  // ---------------------------------------------------------------- internals

  now(): Date {
    return this.clock();
  }

  private load(): DemoSnapshot {
    if (this.snapshot) return this.snapshot;
    const raw = this.storage.getItem(storageKey(this.industry));
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as DemoSnapshot;
        if (parsed.version === SNAPSHOT_VERSION && parsed.business?.id === this.industry) {
          this.snapshot = parsed;
          return parsed;
        }
      } catch {
        // Corrupt storage: fall through and reseed.
      }
    }
    this.snapshot = generateSnapshot(industrySeeds[this.industry], { now: this.now() });
    this.persist();
    return this.snapshot;
  }

  private persist() {
    if (!this.snapshot) return;
    try {
      this.storage.setItem(storageKey(this.industry), JSON.stringify(this.snapshot));
    } catch {
      // Quota exceeded or storage disabled: keep working in memory.
    }
  }

  private commit() {
    this.persist();
    for (const l of this.listeners) l();
  }

  /** Drops the in-memory copy so the next read picks up another tab's write. */
  invalidate() {
    this.snapshot = null;
    for (const l of this.listeners) l();
  }

  private async delay<T>(value: T): Promise<T> {
    if (this.latencyMs > 0) await new Promise((r) => setTimeout(r, this.latencyMs));
    return value;
  }

  private ctx(): AvailabilityContext {
    const s = this.load();
    return { business: s.business, services: s.services, resources: s.resources, bookings: s.bookings, now: this.now() };
  }

  private nextId(prefix: string) {
    this.idCounter += 1;
    return `${prefix}_${Date.now().toString(36)}${this.idCounter.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  }

  private log(type: ActivityEntry["type"], params: Record<string, string>, bookingId?: string) {
    const s = this.load();
    s.activity.unshift({ id: this.nextId("act"), at: this.now().toISOString(), type, params, bookingId });
    s.activity = s.activity.slice(0, 80);
  }

  private findBooking(id: string): Booking {
    const b = this.load().bookings.find((x) => x.id === id);
    if (!b) throw new RepositoryError("NOT_FOUND", `Booking ${id} not found`);
    return b;
  }

  private resolveCustomer(input: CreateBookingInput["customer"]): Customer {
    const s = this.load();
    const phone = normalisePhone(input.phone);
    const email = normaliseEmail(input.email);
    const existing = s.customers.find(
      (c) => (phone && normalisePhone(c.phone) === phone) || (email && normaliseEmail(c.email) === email),
    );
    if (existing) return existing;
    return {
      id: this.nextId("cu"),
      name: input.name.trim(),
      phone: input.phone.trim(),
      email: input.email.trim(),
      createdAt: this.now().toISOString(),
    };
  }

  // ---------------------------------------------------------------- business

  async getBusiness() {
    return this.delay(clone(this.load().business));
  }

  async updateBusinessSettings(patch: BusinessSettingsPatch) {
    const s = this.load();
    if (patch.rules) s.business.rules = { ...s.business.rules, ...patch.rules };
    if (patch.openingHours) s.business.openingHours = clone(patch.openingHours);
    this.log(patch.openingHours ? "hours_updated" : "settings_updated", {});
    this.commit();
    return this.delay(clone(s.business));
  }

  // ---------------------------------------------------------------- catalogue

  async listServices(options?: { includeInactive?: boolean }) {
    const list = this.load().services.filter((s) => options?.includeInactive || s.active);
    return this.delay(clone(list));
  }

  async saveService(input: ServiceInput) {
    const s = this.load();
    if (input.durationMin <= 0 || input.price < 0 || input.capacity < 1) {
      throw new RepositoryError("VALIDATION", "Invalid service values");
    }
    let saved;
    if (input.id) {
      const idx = s.services.findIndex((x) => x.id === input.id);
      if (idx < 0) throw new RepositoryError("NOT_FOUND", `Service ${input.id} not found`);
      saved = { ...s.services[idx], ...input, id: input.id };
      s.services[idx] = saved;
    } else {
      saved = { ...input, id: this.nextId("svc") };
      s.services.push(saved);
    }
    this.log("service_saved", { service: saved.name.en, serviceAr: saved.name.ar });
    this.commit();
    return this.delay(clone(saved));
  }

  async listResources(options?: { kind?: "staff" | "room" | "equipment"; includeInactive?: boolean }) {
    const list = this.load().resources.filter(
      (r) => (!options?.kind || r.kind === options.kind) && (options?.includeInactive || r.active),
    );
    return this.delay(clone(list));
  }

  async updateResourceAvailability(id: string, weeklyHours: WeeklyHours, active?: boolean) {
    const r = this.load().resources.find((x) => x.id === id);
    if (!r) throw new RepositoryError("NOT_FOUND", `Resource ${id} not found`);
    r.weeklyHours = clone(weeklyHours);
    if (active !== undefined) r.active = active;
    this.log("hours_updated", { resource: r.name.en, resourceAr: r.name.ar });
    this.commit();
    return this.delay(clone(r));
  }

  // ---------------------------------------------------------------- availability

  async getAvailability(query: SlotQuery) {
    return this.delay(getDayAvailability(this.ctx(), query));
  }

  async getAvailabilitySummary(query: Omit<SlotQuery, "dateKey">, fromKey: string, days: number) {
    return this.delay(availableDays(this.ctx(), query, fromKey, days));
  }

  async findAlternatives(query: Omit<SlotQuery, "dateKey">, desiredStart: string) {
    return this.delay(findAlternatives(this.ctx(), query, desiredStart, 3));
  }

  // ---------------------------------------------------------------- bookings

  async createBooking(input: CreateBookingInput): Promise<BookingResult> {
    const s = this.load();
    const ctx = this.ctx();
    const customer = this.resolveCustomer(input.customer);
    const seats = input.seats ?? 1;
    const result = validateBooking(ctx, {
      serviceId: input.serviceId,
      start: input.start,
      staffId: input.staffId,
      branchId: input.branchId,
      seats,
      customerId: customer.id,
    });
    if (!result.ok) {
      const alternatives =
        result.code === "SERVICE_NOT_FOUND" || result.code === "STAFF_NOT_FOUND"
          ? []
          : findAlternatives(ctx, { serviceId: input.serviceId, staffId: input.staffId, branchId: input.branchId, seats }, input.start, 3);
      return this.delay({ ok: false, code: result.code, alternatives });
    }

    if (!s.customers.some((c) => c.id === customer.id)) s.customers.push(customer);
    const service = s.services.find((x) => x.id === input.serviceId)!;
    const staff = s.resources.find((r) => r.id === result.staffId)!;
    const now = this.now().toISOString();
    const confirmed = input.source !== "online" || s.business.rules.autoConfirm;
    const booking: Booking = {
      id: this.nextId("bk"),
      reference: makeReference(Math.random),
      serviceId: service.id,
      staffId: result.staffId,
      resourceIds: result.resourceIds,
      branchId: staff.branchId,
      customerId: customer.id,
      start: new Date(input.start).toISOString(),
      end: result.end,
      seats,
      price: service.price * seats,
      status: confirmed ? "confirmed" : "pending",
      source: input.source,
      notes: input.notes?.trim() || undefined,
      createdAt: now,
      history: confirmed
        ? [
            { at: now, type: "created" },
            { at: now, type: "confirmed" },
          ]
        : [{ at: now, type: "created" }],
    };
    s.bookings.push(booking);
    s.bookings.sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
    this.log("created", { reference: booking.reference }, booking.id);
    this.commit();
    return this.delay({ ok: true, booking: clone(booking) });
  }

  async cancelBooking(id: string, reason?: string) {
    const b = this.findBooking(id);
    if (!["pending", "confirmed"].includes(b.status)) {
      throw new RepositoryError("INVALID_STATE", `Cannot cancel a ${b.status} booking`);
    }
    b.status = "cancelled";
    b.cancelReason = reason?.trim() || undefined;
    b.history.push({ at: this.now().toISOString(), type: "cancelled", note: b.cancelReason });
    this.log("cancelled", { reference: b.reference }, b.id);
    this.commit();
    return this.delay(clone(b));
  }

  async rescheduleBooking(id: string, input: RescheduleInput): Promise<BookingResult> {
    const b = this.findBooking(id);
    if (!["pending", "confirmed"].includes(b.status)) {
      throw new RepositoryError("INVALID_STATE", `Cannot reschedule a ${b.status} booking`);
    }
    const ctx = this.ctx();
    const query = { serviceId: b.serviceId, staffId: input.staffId, seats: b.seats, excludeBookingId: b.id };
    const result = validateBooking(ctx, { ...query, start: input.start, customerId: b.customerId });
    if (!result.ok) {
      return this.delay({ ok: false, code: result.code, alternatives: findAlternatives(ctx, query, input.start, 3) });
    }
    const from = b.start;
    b.start = new Date(input.start).toISOString();
    b.end = result.end;
    b.staffId = result.staffId;
    b.resourceIds = result.resourceIds;
    b.history.push({ at: this.now().toISOString(), type: "rescheduled", note: from });
    this.log("rescheduled", { reference: b.reference }, b.id);
    this.commit();
    return this.delay({ ok: true, booking: clone(b) });
  }

  async updateBookingStatus(id: string, status: Extract<BookingStatus, "confirmed" | "completed" | "no_show">) {
    const b = this.findBooking(id);
    const allowed: Record<typeof status, BookingStatus[]> = {
      confirmed: ["pending"],
      completed: ["confirmed", "pending"],
      no_show: ["confirmed", "pending"],
    };
    if (!allowed[status].includes(b.status)) {
      throw new RepositoryError("INVALID_STATE", `Cannot mark a ${b.status} booking as ${status}`);
    }
    if (status !== "confirmed" && Date.parse(b.start) > this.now().getTime()) {
      throw new RepositoryError("INVALID_STATE", "Cannot complete a booking that has not started");
    }
    b.status = status;
    b.history.push({ at: this.now().toISOString(), type: status });
    this.log(status, { reference: b.reference }, b.id);
    this.commit();
    return this.delay(clone(b));
  }

  async listBookings(filter: BookingFilter = {}) {
    const s = this.load();
    const tz = s.business.timezone;
    const q = filter.search?.trim().toLowerCase();
    const customers = new Map(s.customers.map((c) => [c.id, c]));
    const list = s.bookings.filter((b) => {
      if (filter.statuses && !filter.statuses.includes(b.status)) return false;
      if (filter.staffId && b.staffId !== filter.staffId) return false;
      if (filter.serviceId && b.serviceId !== filter.serviceId) return false;
      if (filter.customerId && b.customerId !== filter.customerId) return false;
      if (filter.fromKey || filter.toKey) {
        const key = toDateKey(b.start, tz);
        if (filter.fromKey && diffDaysKeys(key, filter.fromKey) < 0) return false;
        if (filter.toKey && diffDaysKeys(key, filter.toKey) > 0) return false;
      }
      if (q) {
        const c = customers.get(b.customerId);
        const hay = `${b.reference} ${c?.name ?? ""} ${c?.phone ?? ""} ${c?.email ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    return this.delay(clone(list));
  }

  async getBooking(id: string) {
    const b = this.load().bookings.find((x) => x.id === id);
    return this.delay(b ? clone(b) : null);
  }

  // ---------------------------------------------------------------- customers & activity

  async listCustomers(search?: string): Promise<CustomerSummary[]> {
    const s = this.load();
    const nowMs = this.now().getTime();
    const q = search?.trim().toLowerCase();
    const summaries = s.customers
      .filter((c) => !q || `${c.name} ${c.phone} ${c.email}`.toLowerCase().includes(q))
      .map((c): CustomerSummary => {
        const mine = s.bookings.filter((b) => b.customerId === c.id);
        const past = mine.filter((b) => b.status === "completed").sort((a, b) => Date.parse(b.start) - Date.parse(a.start));
        const upcoming = mine
          .filter((b) => BLOCKING_STATUSES.includes(b.status) && Date.parse(b.start) > nowMs)
          .sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
        return {
          ...c,
          totalBookings: mine.length,
          upcoming: upcoming.length,
          completed: past.length,
          cancelled: mine.filter((b) => b.status === "cancelled").length,
          lifetimeValue: past.reduce((n, b) => n + b.price, 0),
          lastVisit: past[0]?.start,
          nextVisit: upcoming[0]?.start,
        };
      })
      .sort((a, b) => b.totalBookings - a.totalBookings || a.name.localeCompare(b.name));
    return this.delay(clone(summaries));
  }

  async listActivity(limit = 20) {
    return this.delay(clone(this.load().activity.slice(0, limit)));
  }

  // ---------------------------------------------------------------- lifecycle

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => void this.listeners.delete(listener);
  }

  async reset() {
    this.storage.removeItem(storageKey(this.industry));
    this.snapshot = null;
    this.load();
    this.commit();
  }
}
