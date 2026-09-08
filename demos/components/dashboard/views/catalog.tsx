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
import { useLocale } from '@/hooks/use-locale';
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
  const { ui, locale, href } = useLocale();
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
        title={ui.dashboard.services.title}
        subtitle={`${config.services.length} ${config.services.length === 1 ? ui.dashboard.services.bookableOne : ui.dashboard.services.bookableMany} · ${ui.dashboard.services.last30}`}
        actions={
          <Button href={href(`/${config.slug}`)} variant="outline" size="sm">
            {ui.dashboard.services.viewOnSite}
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          index={0}
          label={ui.dashboard.services.revenue30}
          value={formatCompactMoney(totalRevenue, symbol)}
          icon={TrendingUp}
        />
        <StatCard
          index={1}
          label={ui.dashboard.services.mostBooked}
          value={busiest?.service.name ?? '—'}
          hint={`${busiest?.count ?? 0} ${ui.dashboard.overview.bookings}`}
          icon={Star}
        />
        <StatCard
          index={2}
          label={isStay ? ui.dashboard.services.roomTypes : ui.dashboard.services.avgDuration}
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
              placeholder={ui.dashboard.filters.searchServices}
              className="sm:max-w-xs"
            />
          </div>
          {rows.length === 0 ? (
            <EmptyState
              title={ui.dashboard.filters.noServicesMatch}
              text={ui.dashboard.filters.noServicesMatchText}
              action={
                <Button size="sm" variant="outline" onClick={() => setQuery('')}>
                  {ui.dashboard.filters.clearSearch}
                </Button>
              }
            />
          ) : (
            <DataTable
              head={[
                config.booking.labels.service,
                isStay ? ui.dashboard.table.rate : ui.dashboard.table.duration,
                ui.dashboard.table.price,
                ui.dashboard.table.bookings,
                ui.dashboard.table.revenue,
                ui.dashboard.table.status,
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
                      {isStay ? ui.dashboard.table.perNight : formatDuration(service.durationMin, locale)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-[13px] tabular-nums">
                      {service.price === 0
                        ? '—'
                        : `${service.priceFrom ? `${ui.common.from} ` : ''}${formatMoney(service.price, symbol)}`}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] tabular-nums">{count}</td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-[13px] tabular-nums">
                      {formatMoney(revenue, symbol)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/12 px-2.5 py-1 text-[11px] font-medium text-emerald-500">
                        <span className="size-1.5 rounded-full bg-current" />
                        {ui.dashboard.table.active}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </DataTable>
          )}
        </Panel>

        <Panel title={ui.dashboard.services.share}>
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
  const { ui, locale } = useLocale();
  const { appointments, summary } = useAppointmentBook(config, todayIso);
  const symbol = config.booking.currencySymbol;
  const label = pluralize(2, config.booking.labels.staff);

  if (config.staff.length === 0) {
    return (
      <>
        <PageHeader title={ui.dashboard.nav.services} />
        <Panel padded={false}>
          <EmptyState
            title={ui.dashboard.staff.noTeam}
            text={ui.dashboard.staff.noTeamText}
          />
        </Panel>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={label.charAt(0).toUpperCase() + label.slice(1)}
        subtitle={`${config.staff.length} ${ui.dashboard.staff.people}`}
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
                    {member.experienceYears ? (
                      <span>
                        {member.experienceYears} {ui.dashboard.staff.years}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <dl className="grid grid-cols-2 divide-x divide-line border-y border-line">
                <div className="px-5 py-3">
                  <dt className="text-[11px] text-muted">{ui.dashboard.staff.bookings7}</dt>
                  <dd className="mt-0.5 font-display text-lg tabular-nums">{load?.count ?? 0}</dd>
                </div>
                <div className="px-5 py-3">
                  <dt className="text-[11px] text-muted">{ui.dashboard.staff.revenue7}</dt>
                  <dd className="mt-0.5 font-display text-lg tabular-nums">
                    {formatCompactMoney(load?.revenue ?? 0, symbol)}
                  </dd>
                </div>
              </dl>

              <div className="p-5">
                <p className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-muted">
                  <CalendarRange className="size-3.5" />
                  {ui.dashboard.staff.nextUp}
                </p>
                {upcoming.length === 0 ? (
                  <p className="text-[13px] text-muted">{ui.dashboard.staff.nothingScheduled}</p>
                ) : (
                  <ul className="space-y-2.5">
                    {upcoming.map((appointment) => (
                      <li
                        key={appointment.id}
                        className="flex items-center justify-between gap-3 text-[13px]"
                      >
                        <span className="min-w-0 truncate">{appointment.customer.name}</span>
                        <span className="shrink-0 tabular-nums text-muted">
                          {formatDayShort(appointment.date, locale)}
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
