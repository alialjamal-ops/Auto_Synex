'use client';

import { Building2, Clock, Info, Palette, RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { PageHeader, Panel } from '@/components/dashboard/ui';
import { Field, TextField } from '@/components/booking/field';
import { Button } from '@/components/ui/button';
import { useBookings } from '@/hooks/use-bookings';
import { useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/cn';
import { formatTime, weekdayLong } from '@/lib/date';
import { formatDuration } from '@/lib/format';
import type { DemoConfig } from '@/types/demo';

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

export function SettingsView({ config }: { config: DemoConfig }) {
  const { ui, locale } = useLocale();
  const { bookings, clearBookings } = useBookings();
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2400);
  };

  return (
    <>
      <PageHeader
        title={ui.dashboard.settings.title}
        subtitle={ui.dashboard.settings.subtitle}
        actions={
          <Button size="sm" onClick={save}>
            {saved ? ui.dashboard.settings.saved : ui.dashboard.settings.save}
          </Button>
        }
      />

      <div className="mb-4 flex items-start gap-3 rounded-brand-lg border border-[color:var(--brand)]/35 bg-[color:var(--brand-soft)] px-4 py-3.5 text-[13px] text-brand">
        <Info className="mt-0.5 size-4 shrink-0" />
        <p>
          {ui.dashboard.settings.configNote}{' '}
          <code className="font-mono text-[12px]">config/demos/{config.slug}.ts</code>{' '}
          {ui.dashboard.settings.isTruth}
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title={ui.dashboard.settings.businessDetails}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label={ui.dashboard.settings.businessName}
              defaultValue={config.businessName}
              className="sm:col-span-2"
            />
            <Field label={ui.common.phone} defaultValue={config.contact.phone} />
            <Field label={ui.common.email} defaultValue={config.contact.email} />
            <TextField
              label={ui.common.address}
              defaultValue={config.contact.addressLines.join('\n')}
              className="sm:col-span-2"
            />
            <Field
              label={ui.dashboard.settings.tagline}
              defaultValue={config.tagline}
              className="sm:col-span-2"
            />
          </div>
        </Panel>

        <Panel title={ui.common.openingHours}>
          <ul className="divide-y divide-line">
            {DAY_ORDER.map((day) => {
              const hours = config.hours[day];
              return (
                <li key={day} className="flex items-center justify-between gap-4 py-3 first:pt-0">
                  <span className="flex items-center gap-3 text-[13.5px]">
                    <span
                      className={cn(
                        'inline-block size-2 rounded-full',
                        hours ? 'bg-emerald-500' : 'bg-line',
                      )}
                    />
                    {weekdayLong(day, locale)}
                  </span>
                  <span className="text-[13px] tabular-nums text-muted">
                    {hours ? (
                      <>
                        {formatTime(hours.open, locale)} – {formatTime(hours.close, locale)}
                        {hours.breakFrom ? (
                          <span className="ml-2 text-[11.5px]">
                            ({ui.dashboard.settings.break} {formatTime(hours.breakFrom, locale)}–
                            {formatTime(hours.breakTo ?? '', locale)})
                          </span>
                        ) : null}
                      </>
                    ) : (
                      ui.common.closed
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </Panel>

        <Panel title={ui.dashboard.settings.bookingRules}>
          <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
            <Row label={ui.dashboard.settings.mode} value={config.booking.mode} />
            <Row
              label={ui.dashboard.settings.slotInterval}
              value={formatDuration(config.booking.slotMinutes, locale)}
            />
            <Row
              label={ui.dashboard.settings.minNotice}
              value={`${config.booking.leadTimeHours} ${ui.dashboard.settings.hours}`}
            />
            <Row
              label={ui.dashboard.settings.bookingWindow}
              value={`${config.booking.horizonDays} ${ui.dashboard.settings.daysAhead}`}
            />
            <Row label={ui.dashboard.settings.currency} value={config.booking.currency} />
            <Row label={ui.dashboard.settings.steps} value={config.booking.steps.join(' → ')} />
            {config.booking.guests ? (
              <Row
                label={ui.dashboard.settings.partySize}
                value={`${config.booking.guests.min}–${config.booking.guests.max}`}
              />
            ) : null}
            <Row label={ui.dashboard.settings.servicesCount} value={String(config.services.length)} />
          </dl>
        </Panel>

        <Panel title={ui.dashboard.settings.brandTokens}>
          <div className="flex flex-wrap gap-3">
            {(
              [
                [ui.dashboard.settings.brand, config.theme.brand],
                [ui.dashboard.settings.accent, config.theme.accent],
                [ui.dashboard.settings.background, config.theme.bg],
                [ui.dashboard.settings.surface, config.theme.surface],
                [ui.dashboard.settings.ink, config.theme.ink],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="flex items-center gap-2.5 rounded-brand border border-line px-3 py-2">
                <span
                  className="size-6 rounded-[4px] border border-line"
                  style={{ background: value }}
                />
                <span className="text-[12px]">
                  <span className="block">{label}</span>
                  <span className="block font-mono text-[11px] text-muted">{value}</span>
                </span>
              </div>
            ))}
          </div>
          <p className="mt-5 flex items-center gap-2 text-[12.5px] text-muted">
            <Palette className="size-4 text-brand" />
            {ui.dashboard.settings.reskinNote}
          </p>
        </Panel>

        <Panel title={ui.dashboard.settings.demoSession} className="xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-brand bg-[color:var(--surface-alt)] text-muted">
                <Building2 className="size-4" />
              </span>
              <div>
                <p className="text-[13.5px]">
                  {bookings.length}{' '}
                  {bookings.length === 1
                    ? ui.dashboard.settings.bookingMade
                    : ui.dashboard.settings.bookingsMade}
                </p>
                <p className="mt-1 text-[12.5px] text-muted">
                  {ui.dashboard.settings.storedNote}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button href={`/${config.slug}/book`} variant="outline" size="sm">
                <Clock className="size-4" />
                {ui.dashboard.settings.newBooking}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearBookings}
                disabled={bookings.length === 0}
              >
                <Trash2 className="size-4" />
                {ui.dashboard.settings.clear}
              </Button>
            </div>
          </div>
        </Panel>
      </div>

      {saved ? (
        <p className="mt-4 flex items-center gap-2 text-[13px] text-emerald-500">
          <RotateCcw className="size-4" />
          {ui.dashboard.settings.demoModeNote}
        </p>
      ) : null}
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
      <dt className="text-[13px] text-muted">{label}</dt>
      <dd className="text-right text-[13px] capitalize">{value}</dd>
    </div>
  );
}
