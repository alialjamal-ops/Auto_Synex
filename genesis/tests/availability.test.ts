import { describe, expect, it } from "vitest";
import { findAlternatives, getDayAvailability, validateBooking } from "@/domain/availability";
import { zonedToInstant } from "@/domain/time";
import { booking, makeCtx, MONDAY, TUESDAY } from "./fixtures";

const at = (day: string, time: string) => zonedToInstant(day, time, "Asia/Dubai").toISOString();

describe("working hours & closed days", () => {
  it("offers slots only inside staff ∩ business hours, in the business time zone", () => {
    const day = getDayAvailability(makeCtx(), { serviceId: "consult", dateKey: TUESDAY, staffId: "a" });
    expect(day.closed).toBe(false);
    expect(day.slots[0].time).toBe("09:00");
    expect(day.slots.at(-1)!.time).toBe("16:30"); // 30-min service must end by 17:00
    expect(day.slots[0].start).toBe("2026-03-03T05:00:00.000Z"); // 09:00 +04:00
  });

  it("marks a weekly closed day as closed", () => {
    const day = getDayAvailability(makeCtx(), { serviceId: "consult", dateKey: "2026-03-07" }); // Saturday
    expect(day).toMatchObject({ closed: true, closedReason: "closed_day", slots: [] });
  });

  it("respects holiday closures", () => {
    const day = getDayAvailability(makeCtx([], { closedDates: [TUESDAY] }), { serviceId: "consult", dateKey: TUESDAY });
    expect(day.closedReason).toBe("holiday");
  });

  it("rejects dates beyond the booking window and in the past", () => {
    expect(getDayAvailability(makeCtx(), { serviceId: "consult", dateKey: "2026-05-04" }).closedReason).toBe("beyond_window");
    expect(getDayAvailability(makeCtx(), { serviceId: "consult", dateKey: "2026-03-01" }).closedReason).toBe("past");
  });

  it("reports no_staff when the chosen staff member is off that day", () => {
    const day = getDayAvailability(makeCtx(), { serviceId: "consult", dateKey: "2026-03-05", staffId: "a" }); // Thursday
    expect(day.closedReason).toBe("no_staff");
  });

  it("enforces minimum notice", () => {
    // now = 06:00 Monday, notice 4h → 09:00 and 09:30 are too soon, 10:00 is fine.
    const day = getDayAvailability(makeCtx([], { minNoticeMin: 240 }), { serviceId: "consult", dateKey: MONDAY, staffId: "a" });
    expect(day.slots.find((s) => s.time === "09:30")).toMatchObject({ available: false, reason: "too_soon" });
    expect(day.slots.find((s) => s.time === "10:00")?.available).toBe(true);
  });
});

describe("conflicts, durations and buffers", () => {
  it("blocks overlapping times for the same staff member", () => {
    const existing = booking({ start: at(TUESDAY, "10:00"), end: at(TUESDAY, "10:30") });
    const day = getDayAvailability(makeCtx([existing]), { serviceId: "consult", dateKey: TUESDAY, staffId: "a" });
    expect(day.slots.find((s) => s.time === "10:00")).toMatchObject({ available: false, reason: "taken" });
    expect(day.slots.find((s) => s.time === "09:30")?.available).toBe(true);
    expect(day.slots.find((s) => s.time === "10:30")?.available).toBe(true);
  });

  it("applies the buffer after an existing appointment", () => {
    const existing = booking({ start: at(TUESDAY, "10:00"), end: at(TUESDAY, "10:30") });
    const day = getDayAvailability(makeCtx([existing], { bufferMin: 15 }), { serviceId: "consult", dateKey: TUESDAY, staffId: "a" });
    expect(day.slots.find((s) => s.time === "10:30")?.available).toBe(false);
    expect(day.slots.find((s) => s.time === "09:30")?.available).toBe(false); // its own buffer would hit 10:00
    expect(day.slots.find((s) => s.time === "11:00")?.available).toBe(true);
  });

  it("cancelled bookings free the slot", () => {
    const existing = booking({ start: at(TUESDAY, "10:00"), end: at(TUESDAY, "10:30"), status: "cancelled" });
    const day = getDayAvailability(makeCtx([existing]), { serviceId: "consult", dateKey: TUESDAY, staffId: "a" });
    expect(day.slots.find((s) => s.time === "10:00")?.available).toBe(true);
  });

  it("'any staff' falls back to another available staff member", () => {
    const existing = booking({ start: at(TUESDAY, "14:00"), end: at(TUESDAY, "14:30") });
    const day = getDayAvailability(makeCtx([existing]), { serviceId: "consult", dateKey: TUESDAY });
    const slot = day.slots.find((s) => s.time === "14:00")!;
    expect(slot.available).toBe(true);
    expect(slot.staffIds).toEqual(["b"]);
  });
});

describe("group sessions & capacity", () => {
  it("only offers fixed start times and shares seats until full", () => {
    const seats = [1, 2, 3].map((i) =>
      booking({ serviceId: "workshop", start: at(TUESDAY, "10:00"), end: at(TUESDAY, "12:00"), customerId: `g${i}`, resourceIds: ["room-1"] }),
    );
    const two = getDayAvailability(makeCtx(seats.slice(0, 2)), { serviceId: "workshop", dateKey: TUESDAY });
    expect(two.slots.map((s) => s.time)).toEqual(["10:00", "14:00"]);
    expect(two.slots[0]).toMatchObject({ available: true, seatsLeft: 1, capacity: 3 });

    const full = getDayAvailability(makeCtx(seats), { serviceId: "workshop", dateKey: TUESDAY });
    expect(full.slots[0]).toMatchObject({ available: false, reason: "full" });
  });

  it("requires a free room for a new session", () => {
    const roomTaken = booking({ serviceId: "consult", staffId: "b", start: at(TUESDAY, "14:00"), end: at(TUESDAY, "14:30"), resourceIds: ["room-1"] });
    const day = getDayAvailability(makeCtx([roomTaken]), { serviceId: "workshop", dateKey: TUESDAY });
    expect(day.slots.find((s) => s.time === "14:00")?.available).toBe(false);
  });
});

describe("validateBooking", () => {
  it("prevents the same customer booking overlapping appointments (duplicates)", () => {
    const existing = booking({ start: at(TUESDAY, "10:00"), end: at(TUESDAY, "10:30"), customerId: "me", staffId: "a" });
    const r = validateBooking(makeCtx([existing]), { serviceId: "consult", start: at(TUESDAY, "10:00"), customerId: "me" });
    expect(r).toEqual({ ok: false, code: "DUPLICATE" });
  });

  it("returns SLOT_TAKEN for a specific staff conflict and resolves staff otherwise", () => {
    const existing = booking({ start: at(TUESDAY, "14:00"), end: at(TUESDAY, "14:30") });
    const ctx = makeCtx([existing]);
    expect(validateBooking(ctx, { serviceId: "consult", start: at(TUESDAY, "14:00"), staffId: "a" })).toEqual({ ok: false, code: "SLOT_TAKEN" });
    expect(validateBooking(ctx, { serviceId: "consult", start: at(TUESDAY, "14:00") })).toMatchObject({ ok: true, staffId: "b" });
  });

  it("rejects starts that are off-grid or outside hours", () => {
    const ctx = makeCtx();
    expect(validateBooking(ctx, { serviceId: "consult", start: at(TUESDAY, "10:10") })).toEqual({ ok: false, code: "OUTSIDE_HOURS" });
    expect(validateBooking(ctx, { serviceId: "consult", start: at(TUESDAY, "18:00") })).toEqual({ ok: false, code: "OUTSIDE_HOURS" });
    expect(validateBooking(ctx, { serviceId: "consult", start: at("2026-03-07", "10:00") })).toEqual({ ok: false, code: "CLOSED" });
  });

  it("allows rescheduling into the booking's own slot when excluded", () => {
    const own = booking({ start: at(TUESDAY, "10:00"), end: at(TUESDAY, "10:30"), customerId: "me" });
    const r = validateBooking(makeCtx([own]), {
      serviceId: "consult",
      start: at(TUESDAY, "10:00"),
      staffId: "a",
      customerId: "me",
      excludeBookingId: own.id,
    });
    expect(r.ok).toBe(true);
  });
});

describe("findAlternatives", () => {
  it("suggests up to three nearest available times", () => {
    const existing = booking({ start: at(TUESDAY, "10:00"), end: at(TUESDAY, "10:30") });
    const alts = findAlternatives(makeCtx([existing]), { serviceId: "consult", staffId: "a" }, at(TUESDAY, "10:00"));
    expect(alts).toHaveLength(3);
    expect(alts.map((a) => a.time).sort()).toEqual(["09:00", "09:30", "10:30"]);
  });

  it("looks at following days when the day is full", () => {
    const alts = findAlternatives(makeCtx(), { serviceId: "consult", staffId: "a" }, at("2026-03-05", "10:00"));
    expect(alts[0].dateKey).toBe("2026-03-09"); // Thu/Fri/Sat/Sun off for A → next Monday
  });
});
