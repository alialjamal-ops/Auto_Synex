import type { LocalizedText, TimeRange, Weekday, WeeklyHours } from "@/domain/types";

export const L = (en: string, ar: string): LocalizedText => ({ en, ar });

/** Builds weekly hours: `schedule` maps weekdays to one or more "HH:mm-HH:mm" ranges. */
export function week(schedule: Partial<Record<Weekday, string | string[]>>): WeeklyHours {
  const out = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] } as WeeklyHours;
  for (const [day, value] of Object.entries(schedule)) {
    const list = Array.isArray(value) ? value : [value as string];
    out[Number(day) as Weekday] = list.map((r): TimeRange => {
      const [start, end] = r.split("-");
      return { start, end };
    });
  }
  return out;
}

export function sameHours(days: Weekday[], range: string | string[]): WeeklyHours {
  return week(Object.fromEntries(days.map((d) => [d, range])));
}

/** Seed customer pool: realistic, mixed-script names typical of Gulf/Levant clientele. */
export interface SeedPerson {
  name: string;
  phone: string;
  email: string;
}

export function people(prefix: string, names: Array<[string, string]>): SeedPerson[] {
  return names.map(([name, emailUser], i) => ({
    name,
    phone: `${prefix} ${String(500 + i * 37).padStart(3, "0")} ${String(1000 + ((i * 7919) % 9000)).padStart(4, "0")}`,
    email: `${emailUser}@example.com`,
  }));
}
