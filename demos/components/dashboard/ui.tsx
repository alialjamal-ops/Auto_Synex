'use client';

import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, Search, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { EASE } from '@/components/animations/motion-primitives';
import { useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/cn';
import type { BookingStatus } from '@/lib/booking';

/* ------------------------------------------------------------------ */
/* Page header                                                         */
/* ------------------------------------------------------------------ */

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-[clamp(1.5rem,3vw,2rem)]">{title}</h1>
        {subtitle ? <p className="mt-1.5 text-[13px] text-muted">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Panel                                                               */
/* ------------------------------------------------------------------ */

export function Panel({
  title,
  action,
  children,
  className,
  padded = true,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section className={cn('min-w-0 overflow-hidden rounded-brand-lg border border-line bg-surface', className)}>
      {title ? (
        <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <h2 className="text-[13px] font-medium">{title}</h2>
          {action}
        </header>
      ) : null}
      <div className={cn(padded && 'p-5')}>{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Stat card                                                           */
/* ------------------------------------------------------------------ */

export function StatCard({
  label,
  value,
  delta,
  hint,
  icon: Icon,
  index = 0,
}: {
  label: string;
  value: string;
  delta?: number;
  hint?: string;
  icon: LucideIcon;
  index?: number;
}) {
  const positive = (delta ?? 0) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: EASE }}
      className="rounded-brand-lg border border-line bg-surface p-5 transition-colors hover:border-[color:var(--brand)]/40"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[12px] text-muted">{label}</p>
        <span className="grid size-8 place-items-center rounded-brand bg-[color:var(--brand-soft)] text-brand">
          <Icon className="size-4" strokeWidth={1.7} />
        </span>
      </div>
      <p className="mt-4 font-display text-[26px] leading-none tabular-nums">{value}</p>
      <div className="mt-2.5 flex items-center gap-2 text-[12px]">
        {delta !== undefined ? (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5',
              positive ? 'bg-emerald-500/12 text-emerald-500' : 'bg-red-500/12 text-red-500',
            )}
          >
            {positive ? (
              <ArrowUpRight className="size-3" />
            ) : (
              <ArrowDownRight className="size-3" />
            )}
            {Math.abs(delta)}%
          </span>
        ) : null}
        {hint ? <span className="text-muted">{hint}</span> : null}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Status badge                                                        */
/* ------------------------------------------------------------------ */

const statusStyles: Record<BookingStatus, string> = {
  confirmed: 'bg-[color:var(--brand-soft)] text-brand',
  completed: 'bg-emerald-500/12 text-emerald-500',
  pending: 'bg-amber-500/14 text-amber-500',
  cancelled: 'bg-red-500/12 text-red-500',
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  const { ui } = useLocale();

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium capitalize',
        statusStyles[status],
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {ui.dashboard.status[status]}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Toolbar controls                                                    */
/* ------------------------------------------------------------------ */

export function SearchInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const { rtl } = useLocale();

  return (
    <div className={cn('relative', className)}>
      <Search
        className={cn(
          'pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 text-muted',
          rtl ? 'right-3' : 'left-3',
        )}
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-brand border border-line bg-surface py-2.5 ps-9 pe-3 text-[13px] outline-none transition-colors placeholder:text-muted/60 focus:border-[color:var(--brand)]"
      />
    </div>
  );
}

export function FilterTabs<T extends string>({
  options,
  value,
  onChange,
  counts,
}: {
  options: readonly { id: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  counts?: Partial<Record<T, number>>;
}) {
  return (
    <div className="scrollbar-none flex gap-1.5 overflow-x-auto" role="tablist">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          role="tab"
          aria-selected={option.id === value}
          onClick={() => onChange(option.id)}
          className={cn(
            'flex shrink-0 items-center gap-1.5 rounded-brand border px-3 py-2 text-[12.5px] transition-colors duration-200',
            option.id === value
              ? 'border-transparent bg-brand text-[color:var(--brand-contrast)]'
              : 'border-line text-muted hover:border-[color:var(--brand)] hover:text-ink',
          )}
        >
          {option.label}
          {counts?.[option.id] !== undefined ? (
            <span
              className={cn(
                'rounded-full px-1.5 text-[10px] tabular-nums',
                option.id === value ? 'bg-black/15' : 'bg-[color:var(--surface-alt)]',
              )}
            >
              {counts[option.id]}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Table shell                                                         */
/* ------------------------------------------------------------------ */

export function DataTable({
  head,
  children,
  className,
}: {
  head: readonly string[];
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full min-w-[46rem] border-collapse text-left">
        <thead>
          <tr className="border-b border-line">
            {head.map((cell) => (
              <th
                key={cell}
                scope="col"
                className="whitespace-nowrap px-5 py-3 text-[11px] font-medium uppercase tracking-[0.1em] text-muted"
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Empty + loading states                                              */
/* ------------------------------------------------------------------ */

export function EmptyState({
  title,
  text,
  icon: Icon,
  action,
}: {
  title: string;
  text: string;
  icon?: LucideIcon;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      {Icon ? (
        <span className="mb-4 grid size-12 place-items-center rounded-full bg-[color:var(--surface-alt)] text-muted">
          <Icon className="size-5" strokeWidth={1.6} />
        </span>
      ) : null}
      <p className="font-display text-[17px]">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-[13px] text-muted">{text}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function SkeletonRows({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex}>
          {Array.from({ length: cols }).map((__, colIndex) => (
            <td key={colIndex} className="px-5 py-4">
              <span className="media-skeleton block h-3 animate-shimmer rounded-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function SkeletonBlock({ className }: { className?: string }) {
  return <span className={cn('media-skeleton block animate-shimmer rounded-brand', className)} />;
}
