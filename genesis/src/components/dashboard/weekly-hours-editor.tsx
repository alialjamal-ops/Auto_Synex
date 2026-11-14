"use client";

import { Plus, X } from "lucide-react";
import { useWeekStart } from "@/components/booking/month-calendar";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { formatHM, parseHM } from "@/domain/time";
import type { TimeRange, Weekday, WeeklyHours } from "@/domain/types";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";

const OPTIONS = Array.from({ length: 49 }, (_, i) => formatHM(i * 30)).map((v) => ({ value: v === "24:00" ? "23:59" : v, label: v === "24:00" ? "24:00" : v }));

/** Returns weekday → error message for invalid/overlapping ranges. */
export function validateWeek(hours: WeeklyHours): Partial<Record<Weekday, true>> {
  const errors: Partial<Record<Weekday, true>> = {};
  for (const [d, ranges] of Object.entries(hours) as unknown as Array<[Weekday, TimeRange[]]>) {
    const sorted = [...ranges].sort((a, b) => parseHM(a.start) - parseHM(b.start));
    sorted.forEach((r, i) => {
      if (parseHM(r.end) <= parseHM(r.start)) errors[d] = true;
      if (i > 0 && parseHM(r.start) < parseHM(sorted[i - 1].end)) errors[d] = true;
    });
  }
  return errors;
}

export function WeeklyHoursEditor({ value, onChange, idPrefix }: { value: WeeklyHours; onChange: (v: WeeklyHours) => void; idPrefix: string }) {
  const { t } = useI18n();
  const weekStart = useWeekStart();
  const errors = validateWeek(value);
  const days = Array.from({ length: 7 }, (_, i) => ((weekStart + i) % 7) as Weekday);
  const set = (d: Weekday, ranges: TimeRange[]) => onChange({ ...value, [d]: ranges });

  return (
    <div className="divide-y rounded-xl border">
      {days.map((d) => {
        const ranges = value[d];
        const on = ranges.length > 0;
        return (
          <div key={d} className="grid gap-2 px-3 py-3 sm:grid-cols-[150px_1fr] sm:items-start sm:px-4">
            <label className="flex h-9 items-center gap-3">
              <Switch
                checked={on}
                onCheckedChange={(c) => set(d, c ? [{ start: "09:00", end: "17:00" }] : [])}
                aria-label={t.weekdays.long[d]}
              />
              <span className={cn("text-sm font-medium", !on && "text-muted-foreground")}>{t.weekdays.long[d]}</span>
            </label>
            {on ? (
              <div className="grid gap-2">
                {ranges.map((r, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Select
                      id={`${idPrefix}-${d}-${i}-s`}
                      ariaLabel={`${t.weekdays.long[d]} ${t.common.from}`}
                      className="h-9 w-[104px]"
                      value={r.start}
                      onValueChange={(v) => set(d, ranges.map((x, j) => (j === i ? { ...x, start: v } : x)))}
                      options={OPTIONS.slice(0, -1)}
                      invalid={!!errors[d]}
                    />
                    <span className="text-muted-foreground" aria-hidden>–</span>
                    <Select
                      id={`${idPrefix}-${d}-${i}-e`}
                      ariaLabel={`${t.weekdays.long[d]} ${t.common.to}`}
                      className="h-9 w-[104px]"
                      value={r.end}
                      onValueChange={(v) => set(d, ranges.map((x, j) => (j === i ? { ...x, end: v } : x)))}
                      options={OPTIONS.slice(1)}
                      invalid={!!errors[d]}
                    />
                    {i === 0 && ranges.length === 1 ? (
                      <Button variant="ghost" size="icon-sm" onClick={() => set(d, [...ranges, { start: r.end < "20:00" ? r.end : "18:00", end: "21:00" }])} aria-label={t.staff.addBreak} title={t.staff.addBreak}>
                        <Plus />
                      </Button>
                    ) : i > 0 ? (
                      <Button variant="ghost" size="icon-sm" onClick={() => set(d, ranges.filter((_, j) => j !== i))} aria-label={t.staff.removeBreak} title={t.staff.removeBreak}>
                        <X />
                      </Button>
                    ) : null}
                  </div>
                ))}
                {errors[d] ? <p role="alert" className="text-xs font-medium text-danger-foreground">{t.staff.invalidRange}</p> : null}
              </div>
            ) : (
              <p className="flex h-9 items-center text-sm text-muted-foreground">{t.common.off}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
