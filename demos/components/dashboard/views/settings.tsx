'use client';

import { Building2, Clock, Info, Palette, RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { PageHeader, Panel } from '@/components/dashboard/ui';
import { Field, TextField } from '@/components/booking/field';
import { Button } from '@/components/ui/button';
import { useBookings } from '@/hooks/use-bookings';
import { cn } from '@/lib/cn';
import { formatTime, WEEKDAY_LONG } from '@/lib/date';
import { formatDuration } from '@/lib/format';
import type { DemoConfig } from '@/types/demo';

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

export function SettingsView({ config }: { config: DemoConfig }) {
  const { bookings, clearBookings } = useBookings();
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2400);
  };

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Everything on this page is driven by the demo's config file."
        actions={
          <Button size="sm" onClick={save}>
            {saved ? 'Saved' : 'Save changes'}
          </Button>
        }
      />

      <div className="mb-4 flex items-start gap-3 rounded-brand-lg border border-[color:var(--brand)]/35 bg-[color:var(--brand-soft)] px-4 py-3.5 text-[13px] text-brand">
        <Info className="mt-0.5 size-4 shrink-0" />
        <p>
          In the live product these fields write to your database. In the demo they show how the
          business is configured — <code className="font-mono text-[12px]">config/demos/{config.slug}.ts</code>{' '}
          is the single source of truth for content, pricing, hours and booking rules.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Business details">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Business name" defaultValue={config.businessName} className="sm:col-span-2" />
            <Field label="Phone" defaultValue={config.contact.phone} />
            <Field label="Email" defaultValue={config.contact.email} />
            <TextField
              label="Address"
              defaultValue={config.contact.addressLines.join('\n')}
              className="sm:col-span-2"
            />
            <Field label="Tagline" defaultValue={config.tagline} className="sm:col-span-2" />
          </div>
        </Panel>

        <Panel title="Opening hours">
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
                    {WEEKDAY_LONG[day]}
                  </span>
                  <span className="text-[13px] tabular-nums text-muted">
                    {hours ? (
                      <>
                        {formatTime(hours.open)} – {formatTime(hours.close)}
                        {hours.breakFrom ? (
                          <span className="ml-2 text-[11.5px]">
                            (break {formatTime(hours.breakFrom)}–{formatTime(hours.breakTo ?? '')})
                          </span>
                        ) : null}
                      </>
                    ) : (
                      'Closed'
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </Panel>

        <Panel title="Booking rules">
          <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
            <Row label="Mode" value={config.booking.mode} />
            <Row label="Slot interval" value={formatDuration(config.booking.slotMinutes)} />
            <Row label="Minimum notice" value={`${config.booking.leadTimeHours} hours`} />
            <Row label="Booking window" value={`${config.booking.horizonDays} days ahead`} />
            <Row label="Currency" value={config.booking.currency} />
            <Row label="Steps" value={config.booking.steps.join(' → ')} />
            {config.booking.guests ? (
              <Row
                label="Party size"
                value={`${config.booking.guests.min}–${config.booking.guests.max}`}
              />
            ) : null}
            <Row label="Services" value={String(config.services.length)} />
          </dl>
        </Panel>

        <Panel title="Brand tokens">
          <div className="flex flex-wrap gap-3">
            {(
              [
                ['Brand', config.theme.brand],
                ['Accent', config.theme.accent],
                ['Background', config.theme.bg],
                ['Surface', config.theme.surface],
                ['Ink', config.theme.ink],
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
            Change these five values and the entire site, booking flow and dashboard re-skin.
          </p>
        </Panel>

        <Panel title="Demo session" className="xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-brand bg-[color:var(--surface-alt)] text-muted">
                <Building2 className="size-4" />
              </span>
              <div>
                <p className="text-[13.5px]">
                  {bookings.length} booking{bookings.length === 1 ? '' : 's'} made in this demo
                  session
                </p>
                <p className="mt-1 text-[12.5px] text-muted">
                  Stored in your browser only. Clearing removes them from the dashboard and frees
                  their time slots.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button href={`/${config.slug}/book`} variant="outline" size="sm">
                <Clock className="size-4" />
                New booking
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearBookings}
                disabled={bookings.length === 0}
              >
                <Trash2 className="size-4" />
                Clear
              </Button>
            </div>
          </div>
        </Panel>
      </div>

      {saved ? (
        <p className="mt-4 flex items-center gap-2 text-[13px] text-emerald-500">
          <RotateCcw className="size-4" />
          Demo mode — changes are not persisted.
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
