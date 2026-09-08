'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { EASE } from '@/components/animations/motion-primitives';
import { cn } from '@/lib/cn';
import {
  addDays,
  addMonths,
  diffDays,
  formatMonthYear,
  fromISODate,
  monthMatrix,
  startOfMonth,
  WEEKDAY_SHORT,
  weekdayOf,
} from '@/lib/date';
import type { WorkingHours } from '@/types/demo';

const DAY_HEADS = [1, 2, 3, 4, 5, 6, 0].map((day) => WEEKDAY_SHORT[day]?.charAt(0));

export interface CalendarProps {
  todayIso: string;
  horizonDays: number;
  hours: WorkingHours;
  /** Selected day (or range start). */
  value: string | null;
  /** Range end — only used when `mode` is 'range'. */
  endValue?: string | null;
  mode?: 'single' | 'range';
  onSelect: (iso: string) => void;
  /** Days with zero remaining slots, greyed out but still visible. */
  fullDates?: readonly string[];
  className?: string;
}

export function Calendar({
  todayIso,
  horizonDays,
  hours,
  value,
  endValue = null,
  mode = 'single',
  onSelect,
  fullDates = [],
  className,
}: CalendarProps) {
  const [cursor, setCursor] = useState(() => startOfMonth(value ?? todayIso));
  const [direction, setDirection] = useState(1);

  const lastDate = addDays(todayIso, horizonDays);
  const cells = useMemo(() => monthMatrix(cursor), [cursor]);

  const canGoBack = cursor > startOfMonth(todayIso);
  const canGoForward = cursor < startOfMonth(lastDate);

  const shift = (delta: number) => {
    setDirection(delta);
    setCursor((current) => addMonths(current, delta));
  };

  return (
    <div className={cn('select-none', className)}>
      <div className="mb-4 flex items-center justify-between">
        <p className="font-display text-lg">{formatMonthYear(cursor)}</p>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => shift(-1)}
            disabled={!canGoBack}
            className="grid size-9 place-items-center rounded-brand border border-line text-ink transition-colors enabled:hover:border-[color:var(--brand)] enabled:hover:text-brand disabled:opacity-35"
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => shift(1)}
            disabled={!canGoForward}
            className="grid size-9 place-items-center rounded-brand border border-line text-ink transition-colors enabled:hover:border-[color:var(--brand)] enabled:hover:text-brand disabled:opacity-35"
            aria-label="Next month"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {DAY_HEADS.map((head, index) => (
          <span
            key={`${head}-${index}`}
            className="pb-2 text-[11px] uppercase tracking-[0.1em] text-muted"
          >
            {head}
          </span>
        ))}
      </div>

      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={cursor}
            initial={{ opacity: 0, x: direction * 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -24 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="grid grid-cols-7 gap-1"
          >
            {cells.map((cell) => {
              const closed = !hours[weekdayOf(cell.iso)];
              const past = cell.iso < todayIso;
              const beyond = cell.iso > lastDate;
              const full = fullDates.includes(cell.iso);
              const disabled = closed || past || beyond || full || !cell.inMonth;

              const isStart = value === cell.iso;
              const isEnd = endValue === cell.iso;
              const inRange =
                mode === 'range' &&
                value !== null &&
                endValue !== null &&
                cell.iso > value &&
                cell.iso < endValue;

              return (
                <button
                  key={cell.iso}
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelect(cell.iso)}
                  aria-label={cell.iso}
                  aria-current={isStart ? 'date' : undefined}
                  className={cn(
                    'relative aspect-square rounded-brand text-[13px] transition-all duration-200',
                    !cell.inMonth && 'invisible',
                    disabled && cell.inMonth && 'cursor-not-allowed text-muted/35 line-through',
                    !disabled &&
                      'text-ink hover:bg-[color:var(--brand-soft)] hover:text-brand',
                    inRange && 'bg-[color:var(--brand-soft)] text-brand',
                    (isStart || isEnd) &&
                      'bg-brand text-[color:var(--brand-contrast)] hover:bg-brand hover:text-[color:var(--brand-contrast)]',
                  )}
                >
                  {fromISODate(cell.iso).getDate()}
                  {cell.iso === todayIso && !isStart ? (
                    <span
                      aria-hidden
                      className="absolute bottom-1.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-brand"
                    />
                  ) : null}
                </button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-4 text-[11px] text-muted">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-brand" /> Selected
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-[color:var(--brand-soft)]" /> Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-line" /> Closed / full
        </span>
        {mode === 'range' && value && endValue ? (
          <span className="ml-auto text-brand">
            {diffDays(value, endValue)} night{diffDays(value, endValue) > 1 ? 's' : ''}
          </span>
        ) : null}
      </div>
    </div>
  );
}
