import { describe, expect, it } from "vitest";
import { addDaysToKey, startOfWeekKey, toDateKey, toWallTime, weekdayOfKey, zonedToInstant } from "@/domain/time";

describe("time-zone helpers", () => {
  it("converts wall-clock times across DST in Beirut", () => {
    // Lebanon is UTC+2 in winter and UTC+3 in summer.
    expect(zonedToInstant("2026-01-15", "10:00", "Asia/Beirut").toISOString()).toBe("2026-01-15T08:00:00.000Z");
    expect(zonedToInstant("2026-07-15", "10:00", "Asia/Beirut").toISOString()).toBe("2026-07-15T07:00:00.000Z");
  });

  it("derives calendar dates in the business zone, not UTC", () => {
    const lateEvening = "2026-03-02T21:30:00.000Z"; // 01:30 next day in Dubai
    expect(toDateKey(lateEvening, "Asia/Dubai")).toBe("2026-03-03");
    expect(toWallTime(lateEvening, "Asia/Dubai")).toBe("01:30");
  });

  it("does calendar arithmetic on date keys", () => {
    expect(addDaysToKey("2026-02-28", 1)).toBe("2026-03-01");
    expect(weekdayOfKey("2026-03-02")).toBe(1);
    expect(startOfWeekKey("2026-03-04", 6)).toBe("2026-02-28");
    expect(startOfWeekKey("2026-03-04", 0)).toBe("2026-03-01");
  });
});
