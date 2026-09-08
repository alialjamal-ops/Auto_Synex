'use client';

import { Check, Clock, Minus, Plus, Sunrise, Sun, Sunset, UserRound } from 'lucide-react';
import { SmartImage } from '@/components/ui/smart-image';
import { Rating } from '@/components/ui/primitives';
import { cn } from '@/lib/cn';
import { formatDuration, formatMoney } from '@/lib/format';
import { formatTime, timeToMinutes } from '@/lib/date';
import { getIcon } from '@/lib/icons';
import type { DayAvailability, Slot } from '@/lib/booking';
import type { DemoConfig, ServiceItem, StaffItem } from '@/types/demo';

/* ------------------------------------------------------------------ */
/* Step 1 — service                                                    */
/* ------------------------------------------------------------------ */

export function ServiceStep({
  config,
  services,
  value,
  onChange,
}: {
  config: DemoConfig;
  services: readonly ServiceItem[];
  value: string | null;
  onChange: (id: string) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {services.map((service) => {
        const Icon = getIcon(service.icon);
        const selected = service.id === value;
        return (
          <button
            key={service.id}
            type="button"
            onClick={() => onChange(service.id)}
            aria-pressed={selected}
            className={cn(
              'group relative flex gap-4 rounded-brand-lg border p-4 text-left transition-all duration-300',
              selected
                ? 'border-[color:var(--brand)] bg-[color:var(--brand-soft)]'
                : 'border-line bg-surface hover:border-[color:var(--brand)]/50 hover:-translate-y-0.5',
            )}
          >
            {service.image ? (
              <SmartImage
                asset={service.image}
                alt=""
                ratio="1/1"
                sizes="90px"
                className="size-[74px] shrink-0 rounded-brand"
              />
            ) : (
              <span
                className={cn(
                  'grid size-[46px] shrink-0 place-items-center rounded-brand transition-colors',
                  selected ? 'bg-brand text-[color:var(--brand-contrast)]' : 'bg-[color:var(--brand-soft)] text-brand',
                )}
              >
                <Icon className="size-5" strokeWidth={1.6} />
              </span>
            )}

            <span className="min-w-0 flex-1">
              <span className="flex items-start justify-between gap-2">
                <span className="font-display text-[15px] font-semibold leading-tight">
                  {service.name}
                </span>
                {selected ? (
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand text-[color:var(--brand-contrast)]">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                ) : null}
              </span>
              <span className="mt-1.5 line-clamp-2 block text-[13px] leading-relaxed text-muted">
                {service.description}
              </span>
              <span className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted">
                {config.booking.mode !== 'stay' ? (
                  <span className="flex items-center gap-1">
                    <Clock className="size-3.5" />
                    {formatDuration(service.durationMin)}
                  </span>
                ) : null}
                <span className="font-medium text-ink">
                  {service.price === 0
                    ? 'No deposit'
                    : `${service.priceFrom ? 'from ' : ''}${formatMoney(service.price, config.booking.currencySymbol)}${
                        config.booking.mode === 'stay' ? ' / night' : ''
                      }`}
                </span>
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 2 — staff                                                      */
/* ------------------------------------------------------------------ */

export function StaffStep({
  staff,
  value,
  onChange,
  allowAny = true,
  anyLabel,
}: {
  staff: readonly StaffItem[];
  value: string | null;
  onChange: (id: string) => void;
  allowAny?: boolean;
  anyLabel: string;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {allowAny ? (
        <button
          type="button"
          onClick={() => onChange('any')}
          aria-pressed={value === 'any'}
          className={cn(
            'flex items-center gap-4 rounded-brand-lg border p-4 text-left transition-all duration-300',
            value === 'any'
              ? 'border-[color:var(--brand)] bg-[color:var(--brand-soft)]'
              : 'border-line bg-surface hover:border-[color:var(--brand)]/50 hover:-translate-y-0.5',
          )}
        >
          <span className="grid size-14 shrink-0 place-items-center rounded-full border border-dashed border-line text-brand">
            <UserRound className="size-5" strokeWidth={1.5} />
          </span>
          <span>
            <span className="block font-display text-[15px] font-semibold">{anyLabel}</span>
            <span className="mt-1 block text-[13px] text-muted">
              Fastest availability — we assign the best match.
            </span>
          </span>
        </button>
      ) : null}

      {staff.map((member) => {
        const selected = member.id === value;
        return (
          <button
            key={member.id}
            type="button"
            onClick={() => onChange(member.id)}
            aria-pressed={selected}
            className={cn(
              'flex items-center gap-4 rounded-brand-lg border p-4 text-left transition-all duration-300',
              selected
                ? 'border-[color:var(--brand)] bg-[color:var(--brand-soft)]'
                : 'border-line bg-surface hover:border-[color:var(--brand)]/50 hover:-translate-y-0.5',
            )}
          >
            <SmartImage
              asset={member.image}
              alt={member.name}
              ratio="1/1"
              sizes="72px"
              className="size-14 shrink-0 rounded-full"
            />
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2">
                <span className="truncate font-display text-[15px] font-semibold">{member.name}</span>
                {selected ? (
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand text-[color:var(--brand-contrast)]">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                ) : null}
              </span>
              <span className="mt-0.5 block truncate text-[12px] text-muted">{member.role}</span>
              {member.rating ? (
                <Rating value={member.rating} size={12} className="mt-1.5" showValue />
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 4 — time slots                                                 */
/* ------------------------------------------------------------------ */

const PARTS = [
  { id: 'morning', label: 'Morning', icon: Sunrise, from: 0, to: 719 },
  { id: 'afternoon', label: 'Afternoon', icon: Sun, from: 720, to: 1019 },
  { id: 'evening', label: 'Evening', icon: Sunset, from: 1020, to: 1440 },
] as const;

export function TimeStep({
  availability,
  value,
  onChange,
}: {
  availability: DayAvailability;
  value: string | null;
  onChange: (time: string) => void;
}) {
  if (availability.closed) {
    return (
      <EmptyState
        title="Closed on this date"
        text="Pick another day from the calendar — closed days are greyed out."
      />
    );
  }

  const usable = availability.slots.filter((slot) => slot.state !== 'break');
  if (usable.length === 0) {
    return (
      <EmptyState
        title="No slots left on this date"
        text="This day is fully booked. Try the next available day."
      />
    );
  }

  return (
    <div className="space-y-7">
      {PARTS.map((part) => {
        const slots = usable.filter((slot) => {
          const minutes = timeToMinutes(slot.time);
          return minutes >= part.from && minutes <= part.to;
        });
        if (slots.length === 0) return null;

        return (
          <div key={part.id}>
            <p className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-muted">
              <part.icon className="size-3.5" />
              {part.label}
              <span className="ml-1 text-muted/60">
                {slots.filter((slot) => slot.state === 'open').length} open
              </span>
            </p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
              {slots.map((slot) => (
                <SlotButton
                  key={slot.time}
                  slot={slot}
                  selected={slot.time === value}
                  onSelect={() => onChange(slot.time)}
                />
              ))}
            </div>
          </div>
        );
      })}

      <p className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-4 text-[11px] text-muted">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-brand" /> Selected
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full border border-line" /> Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-line" /> Taken
        </span>
      </p>
    </div>
  );
}

function SlotButton({
  slot,
  selected,
  onSelect,
}: {
  slot: Slot;
  selected: boolean;
  onSelect: () => void;
}) {
  const disabled = slot.state !== 'open';

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      aria-pressed={selected}
      title={slot.state === 'booked' ? 'Already booked' : slot.state === 'past' ? 'Too soon' : undefined}
      className={cn(
        'rounded-brand border px-2 py-2.5 text-[13px] tabular-nums transition-all duration-200',
        disabled && 'cursor-not-allowed border-transparent bg-[color:var(--surface-alt)] text-muted/45 line-through',
        !disabled && !selected && 'border-line text-ink hover:-translate-y-0.5 hover:border-[color:var(--brand)] hover:text-brand',
        selected && 'border-transparent bg-brand text-[color:var(--brand-contrast)]',
      )}
    >
      {formatTime(slot.time)}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Step — guests / party size                                          */
/* ------------------------------------------------------------------ */

export function GuestsStep({
  min,
  max,
  label,
  helper,
  value,
  onChange,
}: {
  min: number;
  max: number;
  label: string;
  helper: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="max-w-md">
      <div className="flex items-center justify-between rounded-brand-lg border border-line bg-surface p-6">
        <div>
          <p className="font-display text-lg">{label}</p>
          <p className="mt-1 text-[13px] text-muted">{helper}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onChange(Math.max(min, value - 1))}
            disabled={value <= min}
            className="grid size-10 place-items-center rounded-full border border-line transition-colors enabled:hover:border-[color:var(--brand)] enabled:hover:text-brand disabled:opacity-35"
            aria-label="Fewer"
          >
            <Minus className="size-4" />
          </button>
          <span className="w-8 text-center font-display text-2xl tabular-nums">{value}</span>
          <button
            type="button"
            onClick={() => onChange(Math.min(max, value + 1))}
            disabled={value >= max}
            className="grid size-10 place-items-center rounded-full border border-line transition-colors enabled:hover:border-[color:var(--brand)] enabled:hover:text-brand disabled:opacity-35"
            aria-label="More"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {Array.from({ length: max - min + 1 }, (_, index) => min + index).map((count) => (
          <button
            key={count}
            type="button"
            onClick={() => onChange(count)}
            className={cn(
              'rounded-brand border py-2 text-[13px] tabular-nums transition-all duration-200',
              count === value
                ? 'border-transparent bg-brand text-[color:var(--brand-contrast)]'
                : 'border-line hover:border-[color:var(--brand)] hover:text-brand',
            )}
          >
            {count}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared empty state                                                  */
/* ------------------------------------------------------------------ */

export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-brand-lg border border-dashed border-line bg-surface px-6 py-12 text-center">
      <p className="font-display text-lg">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted">{text}</p>
    </div>
  );
}
