'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarPlus,
  Check,
  LayoutDashboard,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import { EASE } from '@/components/animations/motion-primitives';
import { Calendar } from '@/components/booking/calendar';
import { Field, TextField } from '@/components/booking/field';
import { GuestsStep, ServiceStep, StaffStep, TimeStep } from '@/components/booking/steps';
import { Button } from '@/components/ui/button';
import { useBookings } from '@/hooks/use-bookings';
import {
  buildDayAvailability,
  buildReference,
  bookingTotal,
  emptyDraft,
  findService,
  findStaff,
  staffForService,
  validateDetails,
  type Booking,
  type BookingDraft,
  type FieldErrors,
} from '@/lib/booking';
import { cn } from '@/lib/cn';
import {
  addDays,
  addMinutes,
  formatDayLong,
  formatDayShort,
  formatTime,
} from '@/lib/date';
import { formatDuration, formatMoney } from '@/lib/format';
import type { BookingStepId, DemoConfig } from '@/types/demo';

interface BookingFlowProps {
  config: DemoConfig;
  todayIso: string;
  nowMinutes: number;
  initialServiceId: string | null;
  initialStaffId: string | null;
}

type Status = 'idle' | 'submitting' | 'success' | 'error';

export function BookingFlow({
  config,
  todayIso,
  nowMinutes,
  initialServiceId,
  initialStaffId,
}: BookingFlowProps) {
  const { bookings, addBooking } = useBookings();
  const { booking: settings } = config;

  const [stepIndex, setStepIndex] = useState(0);
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<Booking | null>(null);
  const [draft, setDraft] = useState<BookingDraft>(() => ({
    ...emptyDraft,
    serviceId: initialServiceId,
    staffId: initialStaffId ?? (settings.steps.includes('staff') ? null : 'any'),
    guests: settings.guests ? Math.min(2, settings.guests.max) : null,
  }));

  const steps = settings.steps;
  const currentStep = steps[stepIndex] as BookingStepId;

  const patch = useCallback((changes: Partial<BookingDraft>) => {
    setDraft((current) => ({ ...current, ...changes }));
    // Clear a field's error as soon as the visitor edits it.
    setErrors((current) => {
      const next = { ...current };
      let touched = false;
      for (const key of Object.keys(changes) as (keyof BookingDraft)[]) {
        if (key === 'name' || key === 'phone' || key === 'email') {
          delete next[key];
          touched = true;
        }
      }
      return touched ? next : current;
    });
  }, []);

  /* ---------------------------------------------------------------- */
  /* Derived booking state                                            */
  /* ---------------------------------------------------------------- */

  const service = findService(config, draft.serviceId);
  const eligibleStaff = useMemo(
    () => staffForService(config, draft.serviceId),
    [config, draft.serviceId],
  );
  const staffMember = draft.staffId === 'any' ? null : findStaff(config, draft.staffId);
  const durationMin = service?.durationMin ?? settings.slotMinutes;

  const takenSlots = useMemo(
    () =>
      bookings
        .filter(
          (item) =>
            item.date === draft.date &&
            item.status !== 'cancelled' &&
            (draft.staffId === 'any' || !draft.staffId ? true : item.staffId === draft.staffId),
        )
        .map((item) => item.time)
        .filter((time): time is string => Boolean(time)),
    [bookings, draft.date, draft.staffId],
  );

  const availability = useMemo(
    () =>
      buildDayAvailability({
        hours: config.hours,
        booking: settings,
        demo: config.slug,
        dateIso: draft.date ?? todayIso,
        staffId: draft.staffId === 'any' ? null : draft.staffId,
        durationMin,
        todayIso,
        nowMinutes,
        taken: takenSlots,
      }),
    [config.hours, config.slug, settings, draft.date, draft.staffId, durationMin, todayIso, nowMinutes, takenSlots],
  );

  /** Days with no remaining capacity — greyed out in the calendar. */
  const fullDates = useMemo(() => {
    if (settings.dateMode === 'range' || !steps.includes('time')) return [];
    const result: string[] = [];
    const span = Math.min(settings.horizonDays, 62);
    for (let offset = 0; offset <= span; offset += 1) {
      const iso = addDays(todayIso, offset);
      const day = buildDayAvailability({
        hours: config.hours,
        booking: settings,
        demo: config.slug,
        dateIso: iso,
        staffId: draft.staffId === 'any' ? null : draft.staffId,
        durationMin,
        todayIso,
        nowMinutes,
        taken: [],
      });
      if (!day.closed && day.openCount === 0) result.push(iso);
    }
    return result;
  }, [config.hours, config.slug, settings, steps, draft.staffId, durationMin, todayIso, nowMinutes]);

  const { nights, total } = bookingTotal(config, draft);

  /* ---------------------------------------------------------------- */
  /* Step gating                                                      */
  /* ---------------------------------------------------------------- */

  const canAdvance = (step: BookingStepId): boolean => {
    switch (step) {
      case 'service':
        return Boolean(draft.serviceId);
      case 'staff':
        return Boolean(draft.staffId);
      case 'date':
        return settings.dateMode === 'range'
          ? Boolean(draft.date && draft.endDate)
          : Boolean(draft.date);
      case 'time':
        return Boolean(draft.time);
      case 'guests':
        return Boolean(draft.guests);
      case 'details':
        return Object.keys(validateDetails(draft)).length === 0;
      default:
        return true;
    }
  };

  const goNext = () => {
    if (!canAdvance(currentStep)) return;
    setFailure(null);
    setStepIndex((index) => Math.min(index + 1, steps.length - 1));
  };

  const goBack = () => {
    setFailure(null);
    setStepIndex((index) => Math.max(index - 1, 0));
  };

  const handleServiceChange = (id: string) => {
    const nextStaff = staffForService(config, id);
    const stillValid =
      draft.staffId === 'any' || nextStaff.some((member) => member.id === draft.staffId);
    patch({
      serviceId: id,
      staffId: stillValid ? draft.staffId : null,
      // Duration changes shift the slot grid, so a held time may no longer exist.
      time: null,
    });
  };

  const handleDateSelect = (iso: string) => {
    if (settings.dateMode === 'range') {
      if (!draft.date || draft.endDate || iso <= draft.date) {
        patch({ date: iso, endDate: null });
      } else {
        patch({ endDate: iso });
      }
      return;
    }
    patch({ date: iso, time: null });
  };

  /* ---------------------------------------------------------------- */
  /* Submit                                                           */
  /* ---------------------------------------------------------------- */

  const submit = async () => {
    const fieldErrors = validateDetails(draft);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setStatus('submitting');
    setFailure(null);

    await new Promise((resolve) => setTimeout(resolve, 1100));

    // Re-check the slot: another tab (or another visitor, in the real product)
    // may have taken it while this form was open.
    if (draft.time) {
      const stillOpen = availability.slots.some(
        (slot) => slot.time === draft.time && slot.state === 'open',
      );
      if (!stillOpen) {
        setStatus('error');
        setFailure(
          'That time was taken while you were filling in your details. Please choose another slot.',
        );
        return;
      }
    }

    const record: Booking = {
      id: `visitor-${Date.now()}`,
      reference: buildReference(config.slug, draft, bookings.length),
      demo: config.slug,
      serviceId: draft.serviceId ?? '',
      staffId: draft.staffId === 'any' ? null : draft.staffId,
      date: draft.date ?? todayIso,
      endDate: draft.endDate,
      time: draft.time,
      guests: draft.guests,
      customer: {
        name: draft.name.trim(),
        phone: draft.phone.trim(),
        email: draft.email.trim(),
        notes: draft.notes.trim(),
      },
      status: 'confirmed',
      createdAt: todayIso,
      source: 'visitor',
      price: total,
    };

    addBooking(record);
    setConfirmed(record);
    setStatus('success');
    setStepIndex(steps.length - 1);
  };

  const restart = () => {
    setDraft({
      ...emptyDraft,
      guests: settings.guests ? Math.min(2, settings.guests.max) : null,
    });
    setConfirmed(null);
    setStatus('idle');
    setErrors({});
    setFailure(null);
    setStepIndex(0);
  };

  /* ---------------------------------------------------------------- */
  /* Render                                                           */
  /* ---------------------------------------------------------------- */

  const stepLabels: Record<BookingStepId, string> = {
    service: settings.labels.service,
    staff: settings.labels.staff,
    date: settings.labels.date,
    time: settings.labels.time,
    guests: settings.labels.guests,
    details: settings.labels.customer,
    confirm: 'Confirmation',
  };

  if (status === 'success' && confirmed) {
    return <Confirmation booking={confirmed} config={config} onRestart={restart} />;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
      <div className="min-w-0 lg:col-span-8">
        <Stepper steps={steps} labels={stepLabels} current={stepIndex} onJump={setStepIndex} />

        <div className="mt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.32, ease: EASE }}
            >
              <StepHeader
                index={stepIndex}
                total={steps.length}
                title={headingFor(currentStep, settings.labels)}
                subtitle={subtitleFor(currentStep, config, draft)}
              />

              <div className="mt-6">
                {currentStep === 'service' ? (
                  <ServiceStep
                    config={config}
                    services={config.services}
                    value={draft.serviceId}
                    onChange={handleServiceChange}
                  />
                ) : null}

                {currentStep === 'staff' ? (
                  <StaffStep
                    staff={eligibleStaff}
                    value={draft.staffId}
                    onChange={(id) => patch({ staffId: id, time: null })}
                    anyLabel={`Any available ${settings.labels.staff.toLowerCase()}`}
                  />
                ) : null}

                {currentStep === 'date' ? (
                  <div className="rounded-brand-lg border border-line bg-surface p-5 sm:p-6">
                    <Calendar
                      todayIso={todayIso}
                      horizonDays={settings.horizonDays}
                      hours={config.hours}
                      value={draft.date}
                      endValue={draft.endDate}
                      mode={settings.dateMode}
                      onSelect={handleDateSelect}
                      fullDates={fullDates}
                    />
                    {settings.dateMode === 'range' ? (
                      <p className="mt-4 rounded-brand bg-[color:var(--brand-soft)] px-4 py-3 text-[13px] text-brand">
                        {!draft.date
                          ? 'Select your check-in date.'
                          : !draft.endDate
                            ? 'Now select your check-out date.'
                            : `${formatDayShort(draft.date)} → ${formatDayShort(draft.endDate)} · ${nights} night${nights > 1 ? 's' : ''}`}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                {currentStep === 'time' ? (
                  <TimeStep
                    availability={availability}
                    value={draft.time}
                    onChange={(time) => patch({ time })}
                  />
                ) : null}

                {currentStep === 'guests' && settings.guests ? (
                  <GuestsStep
                    min={settings.guests.min}
                    max={settings.guests.max}
                    label={settings.guests.label}
                    helper={settings.guests.helper}
                    value={draft.guests ?? settings.guests.min}
                    onChange={(guests) => patch({ guests })}
                  />
                ) : null}

                {currentStep === 'details' ? (
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                      label="Full name"
                      required
                      autoComplete="name"
                      placeholder="Alex Moreau"
                      value={draft.name}
                      error={errors.name}
                      onChange={(event) => patch({ name: event.target.value })}
                    />
                    <Field
                      label="Phone"
                      required
                      type="tel"
                      autoComplete="tel"
                      placeholder="+1 415 555 0142"
                      value={draft.phone}
                      error={errors.phone}
                      onChange={(event) => patch({ phone: event.target.value })}
                    />
                    <Field
                      label="Email"
                      required
                      type="email"
                      autoComplete="email"
                      placeholder="alex@example.com"
                      className="sm:col-span-2"
                      value={draft.email}
                      error={errors.email}
                      onChange={(event) => patch({ email: event.target.value })}
                    />
                    <TextField
                      label="Notes (optional)"
                      className="sm:col-span-2"
                      placeholder={settings.notesPlaceholder}
                      value={draft.notes}
                      onChange={(event) => patch({ notes: event.target.value })}
                    />
                  </div>
                ) : null}
              </div>
            </motion.div>
          </AnimatePresence>

          {failure ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
              className="mt-6 flex items-start gap-3 rounded-brand border border-red-500/40 bg-red-500/10 px-4 py-3 text-[13px] text-red-500"
            >
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <div className="flex-1">
                <p>{failure}</p>
                <button
                  type="button"
                  onClick={() => {
                    const timeIndex = steps.indexOf('time');
                    setStatus('idle');
                    setFailure(null);
                    if (timeIndex >= 0) setStepIndex(timeIndex);
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 font-medium underline underline-offset-4"
                >
                  <RotateCcw className="size-3.5" />
                  Choose another time
                </button>
              </div>
            </motion.div>
          ) : null}

          <div className="mt-9 flex items-center justify-between gap-4 border-t border-line pt-6">
            <button
              type="button"
              onClick={goBack}
              disabled={stepIndex === 0}
              className="inline-flex items-center gap-2 text-[13px] text-muted transition-colors enabled:hover:text-ink disabled:opacity-35"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>

            {currentStep === 'details' ? (
              <Button size="lg" onClick={submit} disabled={status === 'submitting'}>
                {status === 'submitting' ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Confirming…
                  </>
                ) : (
                  <>
                    {settings.labels.submit}
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button size="lg" onClick={goNext} disabled={!canAdvance(currentStep)}>
                Continue
                <ArrowRight className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <aside className="min-w-0 lg:col-span-4">
        <div className="lg:sticky lg:top-24">
          <Summary
            config={config}
            draft={draft}
            serviceName={service?.name ?? null}
            staffName={staffMember?.name ?? (draft.staffId === 'any' ? 'Any available' : null)}
            durationMin={durationMin}
            nights={nights}
            total={total}
          />
        </div>
      </aside>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

function headingFor(step: BookingStepId, labels: DemoConfig['booking']['labels']): string {
  switch (step) {
    case 'service':
      return labels.servicePlural;
    case 'staff':
      return labels.staffPlural;
    case 'date':
      return `Select your ${labels.date.toLowerCase()}`;
    case 'time':
      return `Select a ${labels.time.toLowerCase()}`;
    case 'guests':
      return labels.guests;
    case 'details':
      return labels.customer;
    default:
      return labels.successTitle;
  }
}

function subtitleFor(step: BookingStepId, config: DemoConfig, draft: BookingDraft): string {
  switch (step) {
    case 'service':
      return 'Prices include everything shown — nothing is added afterwards.';
    case 'staff':
      return 'Availability updates instantly for the person you choose.';
    case 'date':
      return config.booking.dateMode === 'range'
        ? 'Closed days and unavailable dates are greyed out.'
        : 'Greyed-out days are closed or fully booked.';
    case 'time':
      return draft.date ? formatDayLong(draft.date) : '';
    case 'guests':
      return 'We match the room or table to your party.';
    case 'details':
      return 'We only use this to confirm and remind you.';
    default:
      return '';
  }
}

function Stepper({
  steps,
  labels,
  current,
  onJump,
}: {
  steps: readonly BookingStepId[];
  labels: Record<BookingStepId, string>;
  current: number;
  onJump: (index: number) => void;
}) {
  return (
    <ol className="scrollbar-none -mx-1 flex gap-1 overflow-x-auto pb-1">
      {steps.map((step, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={step} className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => (done ? onJump(index) : undefined)}
              disabled={!done}
              className={cn(
                'w-full border-t-2 px-1 pt-3 text-left transition-colors duration-300',
                active ? 'border-[color:var(--brand)]' : done ? 'border-[color:var(--brand)]/45' : 'border-line',
                done && 'cursor-pointer',
              )}
            >
              <span
                className={cn(
                  'flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em]',
                  active ? 'text-brand' : done ? 'text-muted' : 'text-muted/50',
                )}
              >
                {done ? <Check className="size-3" strokeWidth={3} /> : String(index + 1).padStart(2, '0')}
                <span className="truncate">{labels[step]}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function StepHeader({
  index,
  total,
  title,
  subtitle,
}: {
  index: number;
  total: number;
  title: string;
  subtitle: string;
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.2em] text-brand">
        Step {index + 1} of {total}
      </p>
      <h2 className="mt-3 font-display text-[clamp(1.6rem,3.4vw,2.3rem)]">{title}</h2>
      {subtitle ? <p className="mt-2 text-sm text-muted">{subtitle}</p> : null}
    </div>
  );
}

function Summary({
  config,
  draft,
  serviceName,
  staffName,
  durationMin,
  nights,
  total,
}: {
  config: DemoConfig;
  draft: BookingDraft;
  serviceName: string | null;
  staffName: string | null;
  durationMin: number;
  nights: number;
  total: number;
}) {
  const { labels, currencySymbol, mode } = config.booking;

  const rows: { label: string; value: string | null }[] = [
    { label: labels.service, value: serviceName },
    ...(config.booking.steps.includes('staff') ? [{ label: labels.staff, value: staffName }] : []),
    {
      label: labels.date,
      value:
        mode === 'stay'
          ? draft.date && draft.endDate
            ? `${formatDayShort(draft.date)} → ${formatDayShort(draft.endDate)}`
            : draft.date
              ? `${formatDayShort(draft.date)} → …`
              : null
          : draft.date
            ? formatDayShort(draft.date)
            : null,
    },
    ...(config.booking.steps.includes('time')
      ? [
          {
            label: labels.time,
            value: draft.time
              ? `${formatTime(draft.time)} – ${formatTime(addMinutes(draft.time, durationMin))}`
              : null,
          },
        ]
      : []),
    ...(config.booking.guests
      ? [{ label: labels.guests, value: draft.guests ? String(draft.guests) : null }]
      : []),
  ];

  return (
    <div className="overflow-hidden rounded-brand-lg border border-line bg-surface">
      <div className="border-b border-line px-6 py-5">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Your booking</p>
        <p className="mt-1.5 font-display text-lg">{config.businessName}</p>
      </div>

      <dl className="divide-y divide-line">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start justify-between gap-4 px-6 py-3.5">
            <dt className="text-[13px] text-muted">{row.label}</dt>
            <dd
              className={cn(
                'max-w-[62%] text-right text-[13px]',
                row.value ? 'text-ink' : 'text-muted/45',
              )}
            >
              {row.value ?? 'Not selected'}
            </dd>
          </div>
        ))}
      </dl>

      <div className="border-t border-line px-6 py-5">
        <div className="flex items-baseline justify-between">
          <span className="text-[13px] text-muted">
            {mode === 'stay' && nights > 0 ? `Total · ${nights} night${nights > 1 ? 's' : ''}` : 'Estimated total'}
          </span>
          <span className="font-display text-2xl">
            {total > 0 ? formatMoney(total, currencySymbol) : '—'}
          </span>
        </div>
        {mode !== 'stay' && durationMin ? (
          <p className="mt-1.5 text-[12px] text-muted">
            Duration {formatDuration(durationMin)} · payable at the venue
          </p>
        ) : (
          <p className="mt-1.5 text-[12px] text-muted">No card required · pay on arrival</p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Confirmation                                                        */
/* ------------------------------------------------------------------ */

function Confirmation({
  booking,
  config,
  onRestart,
}: {
  booking: Booking;
  config: DemoConfig;
  onRestart: () => void;
}) {
  const service = findService(config, booking.serviceId);
  const staffMember = findStaff(config, booking.staffId);
  const { labels, currencySymbol } = config.booking;

  const rows = [
    { label: labels.service, value: service?.name ?? '—' },
    ...(config.booking.steps.includes('staff')
      ? [{ label: labels.staff, value: staffMember?.name ?? 'Any available' }]
      : []),
    {
      label: labels.date,
      value: booking.endDate
        ? `${formatDayLong(booking.date)} → ${formatDayLong(booking.endDate)}`
        : formatDayLong(booking.date),
    },
    ...(booking.time
      ? [
          {
            label: labels.time,
            value: `${formatTime(booking.time)} – ${formatTime(addMinutes(booking.time, service?.durationMin ?? 60))}`,
          },
        ]
      : []),
    ...(booking.guests ? [{ label: labels.guests, value: String(booking.guests) }] : []),
    { label: 'Reference', value: booking.reference },
    { label: 'Name', value: booking.customer.name },
    { label: 'Contact', value: `${booking.customer.phone} · ${booking.customer.email}` },
  ];

  const downloadIcs = () => {
    const start = `${booking.date.replace(/-/g, '')}T${(booking.time ?? '15:00').replace(':', '')}00`;
    const endTime = addMinutes(booking.time ?? '15:00', service?.durationMin ?? 60);
    const endDate = booking.endDate ?? booking.date;
    const end = `${endDate.replace(/-/g, '')}T${endTime.replace(':', '')}00`;
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      `PRODID:-//${config.businessName}//Demo//EN`,
      'BEGIN:VEVENT',
      `UID:${booking.reference}@demo`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${service?.name ?? 'Booking'} — ${config.businessName}`,
      `DESCRIPTION:Reference ${booking.reference}`,
      `LOCATION:${config.contact.addressLines.join(', ')}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${config.slug}-${booking.reference}.ics`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="mx-auto max-w-2xl"
    >
      <div className="overflow-hidden rounded-brand-lg border border-line bg-surface">
        <div className="flex flex-col items-center border-b border-line px-6 py-10 text-center">
          <motion.span
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 220, damping: 16 }}
            className="grid size-16 place-items-center rounded-full bg-brand text-[color:var(--brand-contrast)]"
          >
            <Check className="size-8" strokeWidth={2.4} />
          </motion.span>
          <h1 className="mt-6 font-display text-[clamp(1.8rem,4vw,2.6rem)]">
            {labels.successTitle}
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">{labels.successText}</p>
          <p className="mt-5 rounded-full border border-line px-4 py-1.5 font-mono text-[13px] tracking-wider">
            {booking.reference}
          </p>
        </div>

        <dl className="divide-y divide-line">
          {rows.map((row) => (
            <div key={row.label} className="flex items-start justify-between gap-4 px-6 py-3.5">
              <dt className="text-[13px] text-muted">{row.label}</dt>
              <dd className="max-w-[62%] text-right text-[13px]">{row.value}</dd>
            </div>
          ))}
          {booking.price > 0 ? (
            <div className="flex items-baseline justify-between gap-4 bg-[color:var(--brand-soft)] px-6 py-4">
              <dt className="text-[13px] text-brand">Total</dt>
              <dd className="font-display text-xl text-brand">
                {formatMoney(booking.price, currencySymbol)}
              </dd>
            </div>
          ) : null}
        </dl>

        <div className="flex flex-col gap-3 border-t border-line p-6 sm:flex-row">
          <Button onClick={downloadIcs} variant="outline" className="flex-1">
            <CalendarPlus className="size-4" />
            Add to calendar
          </Button>
          <Button href={`/${config.slug}/dashboard`} className="flex-1">
            <LayoutDashboard className="size-4" />
            See it in the dashboard
          </Button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-muted">
        <button type="button" onClick={onRestart} className="hover:text-ink">
          Make another booking
        </button>
        <Link href={`/${config.slug}`} className="hover:text-ink">
          Back to {config.businessName}
        </Link>
        <Link href="/" className="hover:text-ink">
          All demos
        </Link>
      </div>

      <p className="mt-6 text-center text-[12px] text-muted/70">
        This booking is stored in your browser only — it appears in the demo dashboard, and nothing
        is sent anywhere.
      </p>
    </motion.div>
  );
}
