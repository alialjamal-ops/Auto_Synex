'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, RotateCcw, X, XCircle } from 'lucide-react';
import { useEffect } from 'react';
import { EASE } from '@/components/animations/motion-primitives';
import { FollowUpBadge, StatusBadge } from '@/components/dashboard/ui';
import { Button } from '@/components/ui/button';
import { isRtl } from '@/config/i18n';
import { useBookings } from '@/hooks/use-bookings';
import { useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/cn';
import type { FollowUp, FollowUpState } from '@/lib/booking';
import { appointmentEnd, type Appointment } from '@/lib/dashboard';
import { formatDayLong, formatTime } from '@/lib/date';
import { formatMoney } from '@/lib/format';
import type { DemoConfig } from '@/types/demo';

const FOLLOW_UP_STATES: readonly FollowUpState[] = ['none', 'needed', 'done'];
const NO_FOLLOW_UP: FollowUp = { state: 'none', dueDate: null, note: '' };

/**
 * Side panel for one appointment: confirm or change its status by hand, and
 * keep a follow-up (state, due date, note) on it. Edits go through
 * `updateAppointment`, so they apply to seeded and visitor bookings alike.
 */
export function AppointmentDrawer({
  appointment,
  config,
  onClose,
}: {
  appointment: Appointment | null;
  config: DemoConfig;
  onClose: () => void;
}) {
  const { ui, locale } = useLocale();
  const { updateAppointment } = useBookings();
  const rtl = isRtl(locale);

  useEffect(() => {
    if (!appointment) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [appointment, onClose]);

  const service = appointment ? config.services.find((item) => item.id === appointment.serviceId) : null;
  const staff = appointment ? config.staff.find((item) => item.id === appointment.staffId) : null;
  const followUp = appointment?.followUp ?? NO_FOLLOW_UP;
  const setFollowUp = (patch: Partial<FollowUp>) => {
    if (appointment) updateAppointment(appointment.id, { followUp: { ...followUp, ...patch } });
  };
  const setStatus = (status: Appointment['status']) => {
    if (appointment) updateAppointment(appointment.id, { status });
  };

  return (
    <AnimatePresence>
      {appointment ? (
        <>
          <motion.button
            key="scrim"
            type="button"
            aria-label={ui.dashboard.detail.close}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
          />
          <motion.aside
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label={ui.dashboard.detail.title}
            initial={{ x: rtl ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: rtl ? '-100%' : '100%' }}
            transition={{ duration: 0.35, ease: EASE }}
            className="fixed inset-y-0 end-0 z-50 flex w-full max-w-md flex-col overflow-y-auto border-s border-line bg-surface shadow-2xl"
          >
            <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
              <div>
                <p className="text-[12px] text-muted">{ui.dashboard.detail.title}</p>
                <h2 className="mt-1 font-display text-2xl">{appointment.customer.name}</h2>
                <p className="mt-1 font-mono text-[12px] tracking-wider text-muted">
                  {appointment.reference}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={ui.dashboard.detail.close}
                className="rounded-full p-2 text-muted transition-colors hover:bg-[color:var(--surface-alt)] hover:text-ink"
              >
                <X className="size-5" />
              </button>
            </header>

            <dl className="divide-y divide-line text-[13.5px]">
              <Row label={config.booking.labels.service} value={service?.name ?? '—'} />
              {config.booking.steps.includes('staff') ? (
                <Row label={config.booking.labels.staff} value={staff?.name ?? ui.booking.anyAvailable} />
              ) : null}
              <Row
                label={config.booking.labels.date}
                value={
                  formatDayLong(appointment.date, locale) +
                  (appointment.time
                    ? ` · ${formatTime(appointment.time, locale)} – ${formatTime(appointmentEnd(appointment), locale)}`
                    : '')
                }
              />
              <Row
                label={ui.dashboard.detail.contact}
                value={`${appointment.customer.phone}${appointment.customer.email ? ` · ${appointment.customer.email}` : ''}`}
              />
              {appointment.customer.notes ? (
                <Row label={ui.dashboard.detail.notes} value={appointment.customer.notes} />
              ) : null}
              {appointment.price > 0 ? (
                <Row
                  label={ui.dashboard.table.value}
                  value={formatMoney(appointment.price, config.booking.currencySymbol)}
                />
              ) : null}
            </dl>

            <section className="border-t border-line px-6 py-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-[13px] font-medium">{ui.dashboard.detail.status}</h3>
                <StatusBadge status={appointment.status} />
              </div>
              {appointment.status === 'pending' ? (
                <p className="mt-2 text-[12.5px] text-muted">{ui.dashboard.detail.pendingHint}</p>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-2">
                {appointment.status === 'pending' ? (
                  <Button size="sm" onClick={() => setStatus('confirmed')}>
                    <Check className="size-4" />
                    {ui.dashboard.detail.confirm}
                  </Button>
                ) : null}
                {appointment.status === 'confirmed' ? (
                  <Button size="sm" variant="subtle" onClick={() => setStatus('completed')}>
                    <Check className="size-4" />
                    {ui.dashboard.detail.markCompleted}
                  </Button>
                ) : null}
                {appointment.status !== 'pending' ? (
                  <Button size="sm" variant="ghost" onClick={() => setStatus('pending')}>
                    <RotateCcw className="size-4" />
                    {ui.dashboard.detail.reopen}
                  </Button>
                ) : null}
                {appointment.status !== 'cancelled' ? (
                  <Button size="sm" variant="ghost" onClick={() => setStatus('cancelled')}>
                    <XCircle className="size-4" />
                    {ui.dashboard.detail.cancel}
                  </Button>
                ) : null}
              </div>
            </section>

            <section className="border-t border-line px-6 py-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-[13px] font-medium">{ui.dashboard.followUp.title}</h3>
                <FollowUpBadge state={followUp.state} />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2" role="radiogroup" aria-label={ui.dashboard.followUp.title}>
                {FOLLOW_UP_STATES.map((state) => (
                  <button
                    key={state}
                    type="button"
                    role="radio"
                    aria-checked={followUp.state === state}
                    onClick={() => setFollowUp({ state })}
                    className={cn(
                      'rounded-brand border px-2 py-2 text-[12.5px] transition-colors',
                      followUp.state === state
                        ? 'border-[color:var(--brand)] bg-[color:var(--brand-soft)] text-brand'
                        : 'border-line text-muted hover:border-[color:var(--brand)]',
                    )}
                  >
                    {ui.dashboard.followUp[state]}
                  </button>
                ))}
              </div>
              <label className="mt-4 block text-[12.5px] text-muted" htmlFor="follow-up-due">
                {ui.dashboard.followUp.due}
              </label>
              <input
                id="follow-up-due"
                type="date"
                value={followUp.dueDate ?? ''}
                onChange={(event) => setFollowUp({ dueDate: event.target.value || null })}
                className="mt-1.5 w-full rounded-brand border border-line bg-surface px-3 py-2.5 text-[13px] outline-none focus:border-[color:var(--brand)]"
              />
              <label className="mt-4 block text-[12.5px] text-muted" htmlFor="follow-up-note">
                {ui.dashboard.followUp.note}
              </label>
              <textarea
                id="follow-up-note"
                rows={3}
                value={followUp.note}
                placeholder={ui.dashboard.followUp.notePlaceholder}
                onChange={(event) => setFollowUp({ note: event.target.value })}
                className="mt-1.5 w-full resize-none rounded-brand border border-line bg-surface px-3 py-2.5 text-[13px] outline-none focus:border-[color:var(--brand)]"
              />
            </section>

            <p className="mt-auto border-t border-line px-6 py-4 text-[11.5px] text-muted/80">
              {ui.dashboard.detail.savedLocally}
            </p>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 px-6 py-3.5">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className="text-end">{value}</dd>
    </div>
  );
}
