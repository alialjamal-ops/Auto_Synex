"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addDaysToKey, addMonthsToKey, daysInMonthOfKey, startOfMonthKey, weekdayOfKey, type DateKey } from "@/domain/time";
import type { Weekday } from "@/domain/types";
import { useBusiness } from "@/data/repository-context";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";

export function useWeekStart(): Weekday {
  const { locale } = useI18n();
  return locale === "ar" ? 6 : 1;
}

export interface DayInfo {
  disabled?: boolean;
  /** Small indicator under the number (e.g. availability). */
  marker?: "open" | "few" | null;
}

/** Accessible month grid (arrow-key friendly via native buttons in a grid). */
export function MonthCalendar({
  monthKey,
  onMonthChange,
  selectedKey,
  onSelect,
  todayKey,
  getDayInfo,
  minMonthKey,
  maxMonthKey,
  loading,
}: {
  monthKey: DateKey;
  onMonthChange: (key: DateKey) => void;
  selectedKey?: DateKey;
  onSelect: (key: DateKey) => void;
  todayKey: DateKey;
  getDayInfo?: (key: DateKey) => DayInfo;
  minMonthKey?: DateKey;
  maxMonthKey?: DateKey;
  loading?: boolean;
}) {
  const { t } = useI18n();
  const { fmt } = useBusiness();
  const weekStart = useWeekStart();
  const first = startOfMonthKey(monthKey);
  const lead = (weekdayOfKey(first) - weekStart + 7) % 7;
  const total = daysInMonthOfKey(first);
  const cells: Array<DateKey | null> = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: total }, (_, i) => addDaysToKey(first, i)),
  ];
  while (cells.length % 7) cells.push(null);
  const weekdays = Array.from({ length: 7 }, (_, i) => ((weekStart + i) % 7) as Weekday);
  const canPrev = !minMonthKey || first > startOfMonthKey(minMonthKey);
  const canNext = !maxMonthKey || first < startOfMonthKey(maxMonthKey);

  return (
    <div className="select-none">
      <div className="mb-3 flex items-center justify-between">
        <Button variant="ghost" size="icon-sm" disabled={!canPrev} onClick={() => onMonthChange(addMonthsToKey(first, -1))} aria-label={t.common.previous}>
          <ChevronLeft className="rtl:-scale-x-100" />
        </Button>
        <p className="text-sm font-semibold" aria-live="polite">
          {fmt.keyMonthYear(first)}
        </p>
        <Button variant="ghost" size="icon-sm" disabled={!canNext} onClick={() => onMonthChange(addMonthsToKey(first, 1))} aria-label={t.common.nextPeriod}>
          <ChevronRight className="rtl:-scale-x-100" />
        </Button>
      </div>
      <div role="grid" aria-label={fmt.keyMonthYear(first)} className={cn("grid grid-cols-7 gap-y-1 transition-opacity", loading && "opacity-60")}>
        <div role="row" className="contents">
          {weekdays.map((d) => (
            <span role="columnheader" key={d} className="pb-1 text-center text-[11px] font-medium text-muted-foreground">
              {t.weekdays.short[d]}
            </span>
          ))}
        </div>
        {cells.map((key, i) => {
          if (!key) return <span key={`e${i}`} />;
          const info = getDayInfo?.(key) ?? {};
          const selected = key === selectedKey;
          const isToday = key === todayKey;
          return (
            <button
              key={key}
              type="button"
              role="gridcell"
              aria-selected={selected}
              aria-current={isToday ? "date" : undefined}
              aria-label={fmt.keyLong(key)}
              disabled={info.disabled}
              onClick={() => onSelect(key)}
              className={cn(
                "relative mx-auto flex size-10 flex-col items-center justify-center rounded-full text-sm tabular transition-colors",
                "hover:bg-muted disabled:cursor-not-allowed disabled:text-muted-foreground/45 disabled:hover:bg-transparent",
                isToday && !selected && "font-semibold text-primary",
                selected && "bg-primary font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover",
              )}
            >
              {fmt.keyDay(key)}
              {info.marker && !selected ? (
                <span
                  aria-hidden
                  className={cn("absolute bottom-1 size-1 rounded-full", info.marker === "few" ? "bg-warning" : "bg-success")}
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
