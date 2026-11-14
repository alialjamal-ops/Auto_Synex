"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export interface BarDatum {
  key: string;
  label: string;
  value: number;
  /** Visual emphasis (e.g. today). */
  highlight?: boolean;
  muted?: boolean;
  title?: string;
}

/** Vertical bars with value labels; pure SVG/CSS, theme-aware via tokens. */
export function ColumnChart({ data, height = 180, format = String, ariaLabel }: {
  data: BarDatum[];
  height?: number;
  format?: (n: number) => string;
  ariaLabel: string;
}) {
  const reduce = useReducedMotion();
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <figure aria-label={ariaLabel} className="w-full">
      <div className="flex items-end gap-1.5 sm:gap-2" style={{ height }}>
        {data.map((d, i) => (
          <div key={d.key} className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5" title={d.title ?? `${d.label}: ${format(d.value)}`}>
            <span className={cn("text-[11px] font-medium tabular text-muted-foreground transition-opacity", d.value === 0 && "opacity-0")}>{format(d.value)}</span>
            <motion.div
              initial={reduce ? false : { scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.45, delay: i * 0.025, ease: [0.2, 0.7, 0.2, 1] }}
              style={{ height: `${Math.max(2, (d.value / max) * (height - 28))}px`, transformOrigin: "bottom" }}
              className={cn(
                "w-full max-w-10 rounded-t-md transition-colors",
                d.highlight ? "bg-primary" : d.muted ? "bg-primary/25 group-hover:bg-primary/40" : "bg-primary/60 group-hover:bg-primary/80",
              )}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-1.5 border-t pt-2 sm:gap-2">
        {data.map((d) => (
          <span key={d.key} className={cn("min-w-0 flex-1 truncate text-center text-[11px] text-muted-foreground", d.highlight && "font-semibold text-foreground")}>
            {d.label}
          </span>
        ))}
      </div>
      <table className="sr-only">
        <tbody>
          {data.map((d) => (
            <tr key={d.key}>
              <th>{d.label}</th>
              <td>{format(d.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

export interface Segment {
  key: string;
  label: string;
  value: number;
  className: string; // tailwind stroke/bg colour class pair e.g. "text-primary"
}

export function Donut({ segments, center, sub, ariaLabel }: { segments: Segment[]; center: string; sub: string; ariaLabel: string }) {
  const total = Math.max(1, segments.reduce((n, s) => n + s.value, 0));
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-6">
      <figure aria-label={ariaLabel} className="relative size-36 shrink-0">
        <svg viewBox="0 0 100 100" className="size-full -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" strokeWidth="11" className="stroke-muted" />
          {segments.map((s, i) => {
            const len = (s.value / total) * c;
            const offset = segments.slice(0, i).reduce((n, x) => n + (x.value / total) * c, 0);
            return (
              <circle
                key={s.key}
                cx="50"
                cy="50"
                r={r}
                fill="none"
                strokeWidth="11"
                stroke="currentColor"
                strokeDasharray={`${Math.max(0, len - 1.2)} ${c}`}
                strokeDashoffset={-offset}
                className={cn("transition-all duration-500", s.className)}
              />
            );
          })}
        </svg>
        <figcaption className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold tabular">{center}</span>
          <span className="text-[11px] text-muted-foreground">{sub}</span>
        </figcaption>
      </figure>
      <ul className="grid w-full gap-2 text-sm">
        {segments.map((s) => (
          <li key={s.key} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <span className={cn("size-2.5 rounded-full bg-current", s.className)} aria-hidden />
              <span className="text-muted-foreground">{s.label}</span>
            </span>
            <span className="font-medium tabular">
              {s.value} <span className="text-xs font-normal text-muted-foreground">({Math.round((s.value / total) * 100)}%)</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Horizontal bar list (ranking). */
export function BarList({ items, format = String }: { items: Array<{ key: string; label: React.ReactNode; value: number; sub?: string }>; format?: (n: number) => string }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <ul className="grid gap-3">
      {items.map((i) => (
        <li key={i.key} className="grid gap-1.5">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate">{i.label}</span>
            <span className="shrink-0 font-medium tabular">
              {format(i.value)}
              {i.sub ? <span className="ms-1.5 text-xs font-normal text-muted-foreground">{i.sub}</span> : null}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary/75 transition-[width] duration-500" style={{ width: `${(i.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
