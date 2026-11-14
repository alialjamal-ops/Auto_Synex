"use client";

import { AlertCircle, CalendarX2, Users } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Alternative, Slot } from "@/domain/availability";
import { addDaysToKey, diffDaysKeys, parseHM, startOfMonthKey, toDateKey, weekdayOfKey, zonedToInstant, type DateKey } from "@/domain/time";
import { useBusiness, useRepoQuery } from "@/data/repository-context";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";
import { MonthCalendar } from "./month-calendar";

export interface SlotSelection {
  dateKey: DateKey;
  start?: string;
  staffId?: string;
}

export interface SlotPickerProps {
  serviceId: string;
  staffId?: string;
  branchId?: string;
  excludeBookingId?: string;
  seats?: number;
  value: SlotSelection;
  onChange: (value: SlotSelection) => void;
  /** Stack calendar above slots (dialogs). */
  compact?: boolean;
}

function groupOf(time: string): "morning" | "afternoon" | "evening" {
  const m = parseHM(time);
  return m < 12 * 60 ? "morning" : m < 17 * 60 ? "afternoon" : "evening";
}

export function SlotPicker({ serviceId, staffId, branchId, excludeBookingId, seats, value, onChange, compact }: SlotPickerProps) {
  const { t } = useI18n();
  const { business, fmt } = useBusiness();
  const query = { serviceId, staffId, branchId, excludeBookingId, seats };
  const [now] = useState(() => new Date());
  const todayKey = toDateKey(now, business.timezone);
  const lastKey = addDaysToKey(todayKey, business.rules.maxAdvanceDays);
  const [monthKey, setMonthKey] = useState(() => startOfMonthKey(value.dateKey));
  const [blocked, setBlocked] = useState<Slot | null>(null);

  // Availability markers for the visible month.
  const from = monthKey < todayKey ? todayKey : monthKey;
  const monthDays = Math.max(0, Math.min(diffDaysKeys(addDaysToKey(startOfMonthKey(monthKey), 31), from), diffDaysKeys(lastKey, from) + 1));
  const summary = useRepoQuery((r) => (monthDays > 0 ? r.getAvailabilitySummary(query, from, monthDays) : Promise.resolve({} as Record<DateKey, { open: number; closedReason?: string }>)), [
    query,
    from,
    monthDays,
  ]);

  const day = useRepoQuery((r) => r.getAvailability({ ...query, dateKey: value.dateKey }), [query, value.dateKey]);
  const slots = (day.data?.slots ?? []).filter((s) => s.reason !== "too_soon");
  const hasOpen = slots.some((s) => s.available);

  // Alternatives: for a blocked slot the user tapped, or for an empty day.
  const desired =
    blocked?.start ??
    (day.data && !hasOpen ? zonedToInstant(value.dateKey, business.openingHours[weekdayOfKey(value.dateKey)][0]?.start ?? "09:00", business.timezone).toISOString() : null);
  const alternatives = useRepoQuery(
    (r) => (desired ? r.findAlternatives(query, desired) : Promise.resolve([] as Alternative[])),
    [query, desired],
  );

  const selectDay = (key: DateKey) => {
    setBlocked(null);
    onChange({ dateKey: key });
  };

  const pickAlternative = (a: Alternative) => {
    setBlocked(null);
    setMonthKey(startOfMonthKey(a.dateKey));
    onChange({ dateKey: a.dateKey, start: a.start, staffId: a.staffId });
  };

  const groups = (["morning", "afternoon", "evening"] as const)
    .map((g) => ({ g, slots: slots.filter((s) => groupOf(s.time) === g) }))
    .filter((x) => x.slots.length > 0);

  const loadingDay = day.loading && day.data?.dateKey !== value.dateKey;

  return (
    <div className={cn("grid gap-6", !compact && "md:grid-cols-[minmax(0,300px)_minmax(0,1fr)] md:gap-8")}>
      <div>
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">{t.booking.chooseDate}</h3>
        <MonthCalendar
          monthKey={monthKey}
          onMonthChange={setMonthKey}
          selectedKey={value.dateKey}
          onSelect={selectDay}
          todayKey={todayKey}
          minMonthKey={todayKey}
          maxMonthKey={lastKey}
          loading={summary.loading}
          getDayInfo={(key) => {
            if (key < todayKey || key > lastKey) return { disabled: true };
            const info = summary.data?.[key];
            if (!info) return {};
            if (info.closedReason) return { disabled: true };
            return { marker: info.open === 0 ? null : info.open <= 3 ? "few" : "open" };
          }}
        />
      </div>

      <div className="min-w-0">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h3 className="text-sm font-medium text-muted-foreground">{t.booking.chooseTime}</h3>
          <p className="truncate text-sm font-medium">{fmt.keyLong(value.dateKey)}</p>
        </div>

        {loadingDay || !day.data ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" aria-busy aria-label={t.booking.loadingTimes}>
            {Array.from({ length: 12 }, (_, i) => (
              <Skeleton key={i} className="h-10 rounded-lg" />
            ))}
          </div>
        ) : day.data.closed || !hasOpen ? (
          <div className="rounded-xl border border-dashed p-5">
            <div className="flex items-start gap-3">
              <CalendarX2 className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
              <div className="grid gap-1">
                <p className="text-sm font-medium">
                  {day.data.closedReason ? t.booking.closedReason[day.data.closedReason] : t.booking.noTimes}
                </p>
                <p className="text-sm text-muted-foreground">{t.booking.noTimesHint}</p>
              </div>
            </div>
            <AlternativeList loading={alternatives.loading} items={alternatives.data} onPick={pickAlternative} />
          </div>
        ) : (
          <div className="grid gap-5">
            {groups.map(({ g, slots: list }) => (
              <fieldset key={g}>
                <legend className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">{t.booking[g]}</legend>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                  {list.map((s) => {
                    const selected = value.start === s.start;
                    const label = s.available
                      ? `${s.time}${s.seatsLeft !== undefined ? `, ${t.common.seatsLeft(s.seatsLeft)}` : ""}`
                      : `${s.time}, ${s.reason === "full" ? t.booking.full : t.booking.unavailable}`;
                    return (
                      <button
                        key={s.start}
                        type="button"
                        aria-pressed={selected}
                        data-available={s.available}
                        aria-label={label}
                        onClick={() => {
                          if (!s.available) {
                            setBlocked(s);
                            return;
                          }
                          setBlocked(null);
                          onChange({ dateKey: value.dateKey, start: s.start, staffId: s.staffIds[0] });
                        }}
                        className={cn(
                          "relative flex h-11 flex-col items-center justify-center rounded-lg border text-sm font-medium tabular transition-all",
                          s.available
                            ? "bg-card hover:border-primary/60 hover:bg-primary-soft/40"
                            : "cursor-help border-dashed bg-transparent text-muted-foreground/60 line-through decoration-muted-foreground/40",
                          selected && "border-primary bg-primary text-primary-foreground shadow-sm hover:border-primary hover:bg-primary-hover",
                          blocked?.start === s.start && "border-warning/70 text-warning-foreground no-underline",
                        )}
                      >
                        <span dir="ltr">{s.time}</span>
                        {s.seatsLeft !== undefined && s.available ? (
                          <span className={cn("text-[10px] font-normal leading-none", selected ? "text-primary-foreground/85" : "text-muted-foreground")}>
                            <Users className="me-0.5 inline size-2.5" aria-hidden />
                            {s.seatsLeft}/{s.capacity}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}
            <AnimatePresence initial={false}>
              {blocked ? (
                <motion.div
                  key={blocked.start}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  role="status"
                  className="rounded-xl border border-warning/40 bg-warning-soft/50 p-4"
                >
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="mt-0.5 size-4 shrink-0 text-warning-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {t.booking.slotTakenTitle} <span dir="ltr">({blocked.time})</span>
                      </p>
                      <p className="text-sm text-muted-foreground">{t.booking.slotTakenBody}</p>
                    </div>
                  </div>
                  <AlternativeList loading={alternatives.loading} items={alternatives.data} onPick={pickAlternative} />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

export function AlternativeList({
  items,
  loading,
  onPick,
}: {
  items: Alternative[] | undefined;
  loading?: boolean;
  onPick: (a: Alternative) => void;
}) {
  const { t } = useI18n();
  const { fmt } = useBusiness();
  if (loading && !items) {
    return (
      <div className="mt-3 flex gap-2">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-9 w-32 rounded-lg" />
        ))}
      </div>
    );
  }
  if (!items?.length) return <p className="mt-3 text-sm text-muted-foreground">{t.booking.noAlternatives}</p>;
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {items.map((a) => (
        <Button key={a.start} variant="secondary" size="sm" onClick={() => onPick(a)} className="tabular">
          {fmt.keyShort(a.dateKey)} · <span dir="ltr">{a.time}</span>
        </Button>
      ))}
    </div>
  );
}
