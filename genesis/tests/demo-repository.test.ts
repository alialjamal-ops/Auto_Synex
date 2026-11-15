import { describe, expect, it } from "vitest";
import { createMemoryStorage, DemoBookingRepository, storageKey } from "@/data/demo-repository";
import { validateBooking } from "@/domain/availability";
import { INDUSTRY_IDS, BLOCKING_STATUSES } from "@/domain/types";

const NOW = new Date("2026-03-02T06:00:00.000Z"); // Monday 10:00 Dubai

function repo(industry: (typeof INDUSTRY_IDS)[number] = "clinic", storage = createMemoryStorage()) {
  return new DemoBookingRepository(industry, { storage, clock: () => NOW });
}

const customer = { name: "Test Person", phone: "+971 50 000 0000", email: "test.person@example.com" };

async function firstOpenSlot(r: DemoBookingRepository, serviceId: string, staffId?: string) {
  const biz = await r.getBusiness();
  const { addDaysToKey, toDateKey } = await import("@/domain/time");
  for (let i = 1; i < 30; i++) {
    const day = await r.getAvailability({ serviceId, staffId, dateKey: addDaysToKey(toDateKey(NOW, biz.timezone), i) });
    const slot = day.slots.find((s) => s.available);
    if (slot) return slot;
  }
  throw new Error("no slot");
}

describe("DemoBookingRepository", () => {
  it.each(INDUSTRY_IDS)("seeds a conflict-free, rule-respecting snapshot for %s", async (industry) => {
    const r = repo(industry);
    const [business, services, resources, bookings] = await Promise.all([
      r.getBusiness(),
      r.listServices({ includeInactive: true }),
      r.listResources({ includeInactive: true }),
      r.listBookings(),
    ]);
    expect(bookings.length).toBeGreaterThan(40);
    expect(services.length).toBeGreaterThan(4);
    // Re-validate every blocking booking against all the others.
    const blocking = bookings.filter((b) => BLOCKING_STATUSES.includes(b.status));
    const relaxed = { ...business, rules: { ...business.rules, minNoticeMin: 0, maxAdvanceDays: 1000 } };
    for (const b of blocking) {
      const others = blocking.filter((x) => x.id !== b.id);
      const v = validateBooking(
        { business: relaxed, services, resources, bookings: others, now: new Date("2026-01-01T00:00:00Z") },
        { serviceId: b.serviceId, start: b.start, staffId: b.staffId, seats: b.seats, customerId: b.customerId },
      );
      expect(v.ok, `${industry} ${b.reference}`).toBe(true);
    }
  });

  it("keeps industries isolated", async () => {
    const storage = createMemoryStorage();
    const clinic = repo("clinic", storage);
    const salon = repo("salon", storage);
    const slot = await firstOpenSlot(clinic, "gp");
    await clinic.createBooking({ serviceId: "gp", start: slot.start, customer, source: "online" });
    expect(storage.getItem(storageKey("salon"))).toBeNull();
    expect((await salon.listBookings({ search: "test.person" })).length).toBe(0);
    expect((await clinic.listBookings({ search: "test.person" })).length).toBe(1);
  });

  it("creates a booking, persists it and blocks the slot", async () => {
    const storage = createMemoryStorage();
    const r = repo("clinic", storage);
    const slot = await firstOpenSlot(r, "derma", "dr-omar");
    const res = await r.createBooking({ serviceId: "derma", staffId: "dr-omar", start: slot.start, customer, source: "online" });
    expect(res.ok).toBe(true);

    // A fresh repository instance over the same storage sees the booking.
    const reloaded = repo("clinic", storage);
    const again = await reloaded.createBooking({
      serviceId: "derma",
      staffId: "dr-omar",
      start: slot.start,
      customer: { name: "Someone Else", phone: "+971 50 111 1111", email: "else@example.com" },
      source: "online",
    });
    expect(again.ok).toBe(false);
    if (!again.ok) {
      expect(again.code).toBe("SLOT_TAKEN");
      expect(again.alternatives.length).toBeGreaterThan(0);
      expect(again.alternatives.length).toBeLessThanOrEqual(3);
    }
  });

  it("prevents duplicate submissions from the same customer", async () => {
    const r = repo("salon");
    const slot = await firstOpenSlot(r, "gel-mani");
    const input = { serviceId: "gel-mani", start: slot.start, customer, source: "online" as const };
    expect((await r.createBooking(input)).ok).toBe(true);
    const dup = await r.createBooking(input);
    expect(dup).toMatchObject({ ok: false, code: "DUPLICATE" });
  });

  it("cancels and reschedules with state checks", async () => {
    const r = repo("clinic");
    const slot = await firstOpenSlot(r, "gp", "dr-layla");
    const res = await r.createBooking({ serviceId: "gp", staffId: "dr-layla", start: slot.start, customer, source: "dashboard" });
    if (!res.ok) throw new Error("expected ok");

    const alts = await r.findAlternatives({ serviceId: "gp", staffId: "dr-layla" }, slot.start);
    const moved = await r.rescheduleBooking(res.booking.id, { start: alts[0].start, staffId: "dr-layla" });
    expect(moved.ok).toBe(true);
    if (moved.ok) expect(moved.booking.history.at(-1)?.type).toBe("rescheduled");

    const cancelled = await r.cancelBooking(res.booking.id, "Travelling");
    expect(cancelled.status).toBe("cancelled");
    await expect(r.cancelBooking(res.booking.id)).rejects.toThrow(/Cannot cancel/);
    await expect(r.updateBookingStatus(res.booking.id, "completed")).rejects.toThrow();
  });

  it("fills group sessions to capacity then reports SESSION_FULL", async () => {
    const r = repo("academy");
    const service = (await r.listServices()).find((s) => s.id === "english")!;
    const slot = await firstOpenSlot(r, "english");
    let left = slot.seatsLeft!;
    let i = 0;
    while (left > 0) {
      const res = await r.createBooking({
        serviceId: "english",
        staffId: slot.staffIds[0],
        start: slot.start,
        customer: { name: `S${i}`, phone: `+966 50 000 ${1000 + i}`, email: `s${i}@example.com` },
        source: "online",
      });
      expect(res.ok).toBe(true);
      left -= 1;
      i += 1;
    }
    const full = await r.createBooking({
      serviceId: "english",
      staffId: slot.staffIds[0],
      start: slot.start,
      customer: { name: "Late", phone: "+966 50 999 9999", email: "late@example.com" },
      source: "online",
    });
    expect(full.ok).toBe(false);
    expect(service.capacity).toBe(8);
  });

  it("reset restores seeded data", async () => {
    const r = repo("studio");
    const before = (await r.listBookings()).length;
    const slot = await firstOpenSlot(r, "headshots");
    await r.createBooking({ serviceId: "headshots", start: slot.start, customer, source: "online" });
    expect((await r.listBookings()).length).toBe(before + 1);
    await r.reset();
    expect((await r.listBookings()).length).toBe(before);
  });

  it("notifies subscribers on change", async () => {
    const r = repo("clinic");
    let calls = 0;
    const off = r.subscribe(() => calls++);
    await r.updateBusinessSettings({ rules: { bufferMin: 10 } });
    off();
    await r.updateBusinessSettings({ rules: { bufferMin: 5 } });
    expect(calls).toBe(1);
  });
});

describe("customer self-service & staff assignment", () => {
  it("finds a booking only with the matching reference and contact", async () => {
    const r = repo("clinic");
    const slot = await firstOpenSlot(r, "gp");
    const res = await r.createBooking({ serviceId: "gp", start: slot.start, customer, source: "online" });
    if (!res.ok) throw new Error("expected ok");
    const ref = res.booking.reference;
    expect((await r.findBookingByReference(ref.toLowerCase(), "+971500000000"))?.id).toBe(res.booking.id);
    expect((await r.findBookingByReference(ref, "TEST.person@example.com"))?.id).toBe(res.booking.id);
    expect(await r.findBookingByReference(ref, "+971 50 123 9999")).toBeNull();
    expect(await r.findBookingByReference("GN-NOPE00", customer.email)).toBeNull();
    expect(await r.findBookingByReference(ref, "")).toBeNull();
  });

  it("enforces the cancellation window for customers but not for staff", async () => {
    const r = repo("clinic"); // window: 12 hours, notice: 1 hour
    const biz = await r.getBusiness();
    const { toDateKey } = await import("@/domain/time");
    const today = await r.getAvailability({ serviceId: "follow-up", dateKey: toDateKey(NOW, biz.timezone) });
    const soon = today.slots.find((s) => s.available);
    if (!soon) throw new Error("no same-day slot");
    const res = await r.createBooking({ serviceId: "follow-up", start: soon.start, customer, source: "online" });
    if (!res.ok) throw new Error("expected ok");
    await expect(r.cancelBooking(res.booking.id, undefined, "customer")).rejects.toMatchObject({ code: "POLICY_WINDOW" });
    await expect(r.rescheduleBooking(res.booking.id, { start: soon.start }, "customer")).rejects.toMatchObject({ code: "POLICY_WINDOW" });
    expect((await r.cancelBooking(res.booking.id, "Front desk")).status).toBe("cancelled");

    const later = await firstOpenSlot(r, "follow-up"); // tomorrow or later → outside the window
    const res2 = await r.createBooking({ serviceId: "follow-up", start: later.start, customer, source: "online" });
    if (!res2.ok) throw new Error("expected ok");
    if (Date.parse(later.start) - NOW.getTime() > 12 * 3_600_000) {
      expect((await r.cancelBooking(res2.booking.id, undefined, "customer")).status).toBe("cancelled");
    }
  });

  it("reassigning staff changes who can be booked", async () => {
    const r = repo("salon");
    await r.setServiceStaff("hydrafacial", ["rania"]);
    const staff = await r.listResources({ kind: "staff" });
    expect(staff.filter((s) => s.serviceIds.includes("hydrafacial")).map((s) => s.id)).toEqual(["rania"]);
    const slot = await firstOpenSlot(r, "hydrafacial");
    expect(slot.staffIds).toEqual(["rania"]);
    const none = await r.getAvailability({ serviceId: "hydrafacial", staffId: "joanna", dateKey: slot.start.slice(0, 10) });
    expect(none.closedReason).toBe("no_staff");
  });
});
