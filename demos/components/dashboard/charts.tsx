'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { EASE } from '@/components/animations/motion-primitives';
import { cn } from '@/lib/cn';
import { formatCompactMoney } from '@/lib/format';

/**
 * Hand-built SVG charts — no charting dependency, no runtime cost, and they
 * inherit the demo's theme variables like everything else.
 */

/* ------------------------------------------------------------------ */
/* Bar chart                                                           */
/* ------------------------------------------------------------------ */

export function BarChart({
  data,
  currencySymbol,
  height = 168,
}: {
  data: readonly { iso: string; label: string; value: number; bookings: number }[];
  currencySymbol: string;
  height?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...data.map((point) => point.value), 1);

  return (
    <div>
      <div className="flex items-end gap-2 sm:gap-3" style={{ height }}>
        {data.map((point, index) => {
          const ratio = point.value / max;
          const active = hover === index || (hover === null && index === data.length - 1);
          return (
            <div
              key={point.iso}
              className="group relative flex h-full flex-1 flex-col justify-end"
              onMouseEnter={() => setHover(index)}
              onMouseLeave={() => setHover(null)}
            >
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(ratio * 100, 3)}%` }}
                transition={{ duration: 0.8, delay: index * 0.05, ease: EASE }}
                className={cn(
                  'w-full rounded-t-[4px] transition-colors duration-200',
                  active ? 'bg-brand' : 'bg-[color:var(--brand-soft)]',
                )}
              />
              {active ? (
                <div className="pointer-events-none absolute -top-1 left-1/2 z-10 w-max -translate-x-1/2 -translate-y-full rounded-brand border border-line bg-surface px-2.5 py-1.5 text-center shadow-lg">
                  <p className="text-[12px] font-medium tabular-nums">
                    {formatCompactMoney(point.value, currencySymbol)}
                  </p>
                  <p className="text-[10px] text-muted">{point.bookings} bookings</p>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      <div className="mt-2.5 flex gap-2 sm:gap-3">
        {data.map((point, index) => (
          <span
            key={point.iso}
            className={cn(
              'flex-1 text-center text-[11px]',
              index === data.length - 1 ? 'font-medium text-ink' : 'text-muted',
            )}
          >
            {point.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Donut                                                               */
/* ------------------------------------------------------------------ */

export function Donut({
  segments,
  centerLabel,
  centerValue,
}: {
  segments: readonly { label: string; value: number }[];
  centerLabel: string;
  centerValue: string;
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0) || 1;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const opacities = [1, 0.62, 0.34, 0.2];
  // Offsets are computed up front so nothing mutates during render.
  const arcs = segments.reduce<{ label: string; dash: number; offset: number }[]>(
    (acc, segment) => {
      const dash = (segment.value / total) * circumference;
      const previous = acc[acc.length - 1];
      acc.push({
        label: segment.label,
        dash,
        offset: previous ? previous.offset + previous.dash : 0,
      });
      return acc;
    },
    [],
  );

  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="relative size-[144px] shrink-0">
        <svg viewBox="0 0 140 140" className="size-full -rotate-90">
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="var(--line)"
            strokeWidth="16"
          />
          {arcs.map((arc, index) => (
            <motion.circle
              key={arc.label}
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="var(--brand)"
              strokeOpacity={opacities[index] ?? 0.15}
              strokeWidth="16"
              strokeLinecap="butt"
              strokeDasharray={`${arc.dash} ${circumference - arc.dash}`}
              strokeDashoffset={-arc.offset}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: index * 0.12 }}
            />
          ))}
        </svg>
        <div className="absolute inset-0 grid place-content-center text-center">
          <p className="font-display text-xl tabular-nums">{centerValue}</p>
          <p className="text-[10px] uppercase tracking-[0.12em] text-muted">{centerLabel}</p>
        </div>
      </div>

      <ul className="min-w-0 flex-1 space-y-2.5">
        {segments.map((segment, index) => (
          <li key={segment.label} className="flex items-center justify-between gap-3 text-[13px]">
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-full bg-brand"
                style={{ opacity: opacities[index] ?? 0.15 }}
              />
              <span className="truncate capitalize text-muted">{segment.label}</span>
            </span>
            <span className="tabular-nums">
              {Math.round((segment.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Ranked bars                                                         */
/* ------------------------------------------------------------------ */

export function RankedBars({
  items,
  valueFormatter,
}: {
  items: readonly { id: string; name: string; count: number; revenue: number }[];
  valueFormatter: (item: { count: number; revenue: number }) => string;
}) {
  const max = Math.max(...items.map((item) => item.count), 1);

  return (
    <ul className="space-y-4">
      {items.map((item, index) => (
        <li key={item.id}>
          <div className="flex items-baseline justify-between gap-3 text-[13px]">
            <span className="truncate">{item.name}</span>
            <span className="shrink-0 tabular-nums text-muted">{valueFormatter(item)}</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[color:var(--surface-alt)]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(item.count / max) * 100}%` }}
              transition={{ duration: 0.8, delay: index * 0.06, ease: EASE }}
              className="h-full rounded-full bg-brand"
              style={{ opacity: 1 - index * 0.12 }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Occupancy ring                                                      */
/* ------------------------------------------------------------------ */

export function OccupancyRing({ percent }: { percent: number }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const dash = (percent / 100) * circumference;

  return (
    <div className="relative size-[112px]">
      <svg viewBox="0 0 110 110" className="size-full -rotate-90">
        <circle cx="55" cy="55" r={radius} fill="none" stroke="var(--line)" strokeWidth="10" />
        <motion.circle
          cx="55"
          cy="55"
          r={radius}
          fill="none"
          stroke="var(--brand)"
          strokeWidth="10"
          strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{ strokeDasharray: `${dash} ${circumference - dash}` }}
          transition={{ duration: 1, ease: EASE }}
        />
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">
        <p className="font-display text-xl tabular-nums">{percent}%</p>
        <p className="text-[10px] uppercase tracking-[0.12em] text-muted">Today</p>
      </div>
    </div>
  );
}
