'use client';

import { CalendarRange, Clock, Star, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  DataTable,
  EmptyState,
  PageHeader,
  Panel,
  SearchInput,
  StatCard,
} from '@/components/dashboard/ui';
import { RankedBars } from '@/components/dashboard/charts';
import { SmartImage } from '@/components/ui/smart-image';
import { Button } from '@/components/ui/button';
import { useAppointmentBook } from '@/hooks/use-appointment-book';
import { cn } from '@/lib/cn';
import { formatDayShort } from '@/lib/date';
import { formatCompactMoney, formatDuration, formatMoney, pluralize } from '@/lib/format';
import { getIcon } from '@/lib/icons';
import type { DemoConfig } from '@/types/demo';

/* ------------------------------------------------------------------ */
/* Services                                                            */
/* ------------------------------------------------------------------ */

export function ServicesView({ config, todayIso }: { config: DemoConfig; todayIso: string }) {
  const { summary } = useAppointmentBook(config, todayIso);
  const [query, setQuery] = useState('');
  const symbol = config.booking.currencySymbol;
  // Rooms are priced per night, so a "duration" column would be meaningless.
  const isStay = config.booking.dateMode === 'range';

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase();
    return config.services
      .map((service) => {
        const stats = summary.serviceSplit.find((item) => item.id === service.id);
        return { service, count: stats?.count ?? 0, revenue: stats?.revenue ?? 0 };
      })
      .filter((row) => (term ? row.service.name.toLowerCase().includes(term) : true))
      .sort((a, b) => b.count - a.count);
  }, [config.services, summary.serviceSplit, query]);

  const totalRevenue = rows.reduce((total, row) => total + row.revenue, 0);
  const busiest = rows[0];

  return (
    <>
      <PageHeader
        title="Services"
        subtitle={`${config.services.length} bookable ${config.services.length === 1 ? 'service' : 'services'} · last 30 days`}
        actions={
          <Button href={`/${config.slug}`} variant="outline" size="sm">
            View on site
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          index={0}
          label="Revenue (30 days)"
          value={formatCompactMoney(totalRevenue, symbol)}
          icon={TrendingUp}
        />
        <StatCard
          index={1}
          label="Most booked"
          value={busiest?.service.name ?? '—'}
          hint={`${busiest?.count ?? 0} bookings`}
          icon={Star}
        />
        <StatCard
          index={2}
          label={isStay ? 'Room types' : 'Average duration'}
          value={
            isStay
              ? String(config.services.length)
              : formatDuration(
                  Math.round(
                    config.services.reduce((total, service) => total + service.durationMin, 0) /
                      Math.max(1, config.services.length),
                  ),
                )
          }
          icon={Clock}
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel className="min-w-0 xl:col-span-2" padded={false}>
          <div className="border-b border-line p-4">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search services…"
              className="sm:max-w-xs"
            />
          </div>
          {rows.length === 0 ? (
            <EmptyState
              title="No services match"
              text="Try a different search term."
              action={
                <Button size="sm" variant="outline" onClick={() => setQuery('')}>
                  Clear search
                </Button>
              }
            />
          ) : (
            <DataTable
              head={[
                config.booking.labels.service,
                isStay ? 'Rate' : 'Duration',
                'Price',
                'Bookings',
                'Revenue',
                'Status',
              ]}
            >
              {rows.map(({ service, count, revenue }) => {
                const Icon = getIcon(service.icon);
                return (
                  <tr key={service.id} className="transition-colors hover:bg-[color:var(--surface-alt)]">
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-brand bg-[color:var(--brand-soft)] text-brand">
                          <Icon className="size-4" strokeWidth={1.7} />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-[13.5px]">{service.name}</span>
                          <span className="block truncate text-[11.5px] text-muted">
                            {service.highlights?.[0] ?? service.description.slice(0, 46)}
                          </span>
                        </span>
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-[13px] text-muted">
                      {isStay ? 'per night' : formatDuration(service.durationMin)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-[13px] tabular-nums">
                      {service.price === 0
                        ? '—'
                        : `${service.priceFrom ? 'from ' : ''}${formatMoney(service.price, symbol)}`}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] tabular-nums">{count}</td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-[13px] tabular-nums">
                      {formatMoney(revenue, symbol)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/12 px-2.5 py-1 text-[11px] font-medium text-emerald-500">
                        <span className="size-1.5 rounded-full bg-current" />
                        Active
                      </span>
                    </td>
                  </tr>
                );
              })}
            </DataTable>
          )}
        </Panel>

        <Panel title="Share of bookings">
          <RankedBars
            items={summary.serviceSplit.slice(0, 8)}
            valueFormatter={(item) => `${item.count}`}
          />
        </Panel>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Staff                                                               */
/* ------------------------------------------------------------------ */

export function StaffView({ config, todayIso }: { config: DemoConfig; todayIso: string }) {
  const { appointments, summary } = useAppointmentBook(config, todayIso);
  const symbol = config.booking.currencySymbol;
  const label = pluralize(2, config.booking.labels.staff);

  if (config.staff.length === 0) {
    return (
      <>
        <PageHeader title="Team" />
        <Panel padded={false}>
          <EmptyState
            title="No team members yet"
            text="This business books at venue level. Add team members in settings to enable per-person scheduling."
          />
        </Panel>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={label.charAt(0).toUpperCase() + label.slice(1)}
        subtitle={`${config.staff.length} people · load over the last 7 days`}
      />

      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {config.staff.map((member) => {
          const load = summary.staffLoad.find((item) => item.id === member.id);
          const upcoming = appointments
            .filter(
              (item) =>
                item.staffId === member.id && item.date >= todayIso && item.status !== 'cancelled',
            )
            .slice(0, 3);

          return (
            <Panel key={member.id} padded={false}>
              <div className="flex gap-4 p-5">
                <SmartImage
                  asset={member.image}
                  alt={member.name}
                  ratio="1/1"
                  sizes="80px"
                  className="size-16 shrink-0 rounded-brand"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-[16px]">{member.name}</p>
                  <p className="truncate text-[12px] text-muted">{member.role}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-muted">
                    {member.rating ? (
                      <span className="flex items-center gap-1">
                        <Star className="size-3.5 fill-current text-brand" />
                        {member.rating.toFixed(1)}
                      </span>
                    ) : null}
                    {member.experienceYears ? <span>{member.experienceYears} yrs</span> : null}
                  </div>
                </div>
              </div>

              <dl className="grid grid-cols-2 divide-x divide-line border-y border-line">
                <div className="px-5 py-3">
                  <dt className="text-[11px] text-muted">Bookings · 7d</dt>
                  <dd className="mt-0.5 font-display text-lg tabular-nums">{load?.count ?? 0}</dd>
                </div>
                <div className="px-5 py-3">
                  <dt className="text-[11px] text-muted">Revenue · 7d</dt>
                  <dd className="mt-0.5 font-display text-lg tabular-nums">
                    {formatCompactMoney(load?.revenue ?? 0, symbol)}
                  </dd>
                </div>
              </dl>

              <div className="p-5">
                <p className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-muted">
                  <CalendarRange className="size-3.5" />
                  Next up
                </p>
                {upcoming.length === 0 ? (
                  <p className="text-[13px] text-muted">Nothing scheduled.</p>
                ) : (
                  <ul className="space-y-2.5">
                    {upcoming.map((appointment) => (
                      <li
                        key={appointment.id}
                        className="flex items-center justify-between gap-3 text-[13px]"
                      >
                        <span className="min-w-0 truncate">{appointment.customer.name}</span>
                        <span className="shrink-0 tabular-nums text-muted">
                          {formatDayShort(appointment.date)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[color:var(--surface-alt)]">
                  <div
                    className={cn('h-full rounded-full bg-brand')}
                    style={{
                      width: `${Math.min(100, ((load?.count ?? 0) / Math.max(1, summary.staffLoad[0]?.count ?? 1)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </Panel>
          );
        })}
      </div>
    </>
  );
}
