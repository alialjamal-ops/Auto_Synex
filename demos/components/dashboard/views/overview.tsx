'use client';

import {
  ArrowUpRight,
  CalendarCheck,
  CalendarClock,
  CircleCheck,
  CircleSlash,
  Coins,
  Inbox,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { BarChart, Donut, OccupancyRing, RankedBars } from '@/components/dashboard/charts';
import {
  DataTable,
  EmptyState,
  PageHeader,
  Panel,
  SkeletonRows,
  StatCard,
  StatusBadge,
} from '@/components/dashboard/ui';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/hooks/use-locale';
import { useAppointmentBook } from '@/hooks/use-appointment-book';
import { formatDayShort, formatTime, relativeDayLabel } from '@/lib/date';
import { formatCompactMoney, formatMoney, percentDelta } from '@/lib/format';
import type { DemoConfig } from '@/types/demo';

export function OverviewView({ config, todayIso }: { config: DemoConfig; todayIso: string }) {
  const { ui, locale, href } = useLocale();
  const { summary, visitor, ready } = useAppointmentBook(config, todayIso);
  const symbol = config.booking.currencySymbol;
  const delta = percentDelta(summary.weekRevenue, summary.previousWeekRevenue);

  const serviceName = (id: string) =>
    config.services.find((service) => service.id === id)?.name ?? '—';
  const staffName = (id: string | null) =>
    config.staff.find((member) => member.id === id)?.name ?? ui.dashboard.staff.noTeam;

  return (
    <>
      <PageHeader
        title={ui.dashboard.overview.title}
        subtitle={`${ui.dashboard.overview.subtitle} ${config.businessName}`}
        actions={
          <>
            <Button href={href(`/${config.slug}/book`)} variant="outline" size="sm">
              <Sparkles className="size-4" />
              {ui.dashboard.overview.tryBooking}
            </Button>
            <Button href={href(`/${config.slug}/dashboard/calendar`)} size="sm">
              {ui.dashboard.overview.openCalendar}
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          index={0}
          label={ui.dashboard.overview.today}
          value={String(summary.today.length)}
          hint={`${summary.today.filter((item) => item.status === 'confirmed').length} ${ui.dashboard.overview.stillToCome}`}
          icon={CalendarCheck}
        />
        <StatCard
          index={1}
          label={ui.dashboard.overview.upcoming}
          value={String(summary.upcoming.length)}
          hint={`${summary.newCustomers} ${ui.dashboard.overview.newThisWeek}`}
          icon={CalendarClock}
        />
        <StatCard
          index={2}
          label={ui.dashboard.overview.completed}
          value={String(summary.completed.length)}
          hint={`${summary.cancelled.length} ${ui.dashboard.overview.cancelled}`}
          icon={CircleCheck}
        />
        <StatCard
          index={3}
          label={ui.dashboard.overview.revenue}
          value={formatCompactMoney(summary.weekRevenue, symbol)}
          delta={delta}
          hint={ui.dashboard.overview.vsPrevious}
          icon={Coins}
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel
          title={ui.dashboard.overview.revenueChart}
          className="min-w-0 xl:col-span-2"
          action={
            <span className="text-[12px] text-muted">
              {formatMoney(summary.weekRevenue, symbol)} {ui.dashboard.overview.totalLabel}
            </span>
          }
        >
          <BarChart data={summary.weekSeries} currencySymbol={symbol} />
        </Panel>

        <Panel title={ui.dashboard.overview.capacity}>
          <div className="flex items-center gap-6">
            <OccupancyRing percent={summary.occupancy} />
            <div className="min-w-0 flex-1 space-y-3 text-[13px]">
              <div className="flex justify-between gap-3">
                <span className="text-muted">{ui.dashboard.overview.bookedToday}</span>
                <span className="tabular-nums">{summary.today.length}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted">{ui.dashboard.filters.cancelled}</span>
                <span className="tabular-nums">
                  {summary.today.filter((item) => item.status === 'cancelled').length}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted">{ui.dashboard.overview.revenueToday}</span>
                <span className="tabular-nums">{formatMoney(summary.todayRevenue, symbol)}</span>
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel
          title={ui.dashboard.overview.todaySchedule}
          className="min-w-0 xl:col-span-2"
          padded={false}
          action={
            <Link
              href={href(`/${config.slug}/dashboard/appointments`)}
              className="inline-flex items-center gap-1 text-[12px] text-brand"
            >
              {ui.dashboard.overview.viewAll}
              <ArrowUpRight className="size-3.5" />
            </Link>
          }
        >
          {summary.today.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title={ui.dashboard.overview.nothingToday}
              text={ui.dashboard.overview.nothingTodayText}
              action={
                <Button href={href(`/${config.slug}/book`)} size="sm" variant="outline">
                  {ui.dashboard.overview.createTest}
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-line">
              {summary.today.slice(0, 7).map((appointment) => (
                <li key={appointment.id} className="flex items-center gap-4 px-5 py-3.5">
                  <span className="w-16 shrink-0 text-[13px] tabular-nums text-muted">
                    {appointment.time ? formatTime(appointment.time, locale) : '—'}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px]">
                      {appointment.customer.name}
                    </span>
                    <span className="block truncate text-[12px] text-muted">
                      {serviceName(appointment.serviceId)} · {staffName(appointment.staffId)}
                    </span>
                  </span>
                  <StatusBadge status={appointment.status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title={ui.dashboard.overview.channels}>
          <Donut
            segments={summary.channelSplit.map((item) => ({
              label: item.channel,
              value: item.count,
            }))}
            centerLabel={ui.dashboard.overview.last30}
            centerValue={String(
              summary.channelSplit.reduce((total, item) => total + item.count, 0),
            )}
          />
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel title={ui.dashboard.overview.recent} className="min-w-0 xl:col-span-2" padded={false}>
          <DataTable
            head={[
              config.dashboard.customerLabel,
              config.booking.labels.service,
              ui.dashboard.table.when,
              ui.dashboard.table.channel,
              ui.dashboard.table.status,
              ui.dashboard.table.value,
            ]}
          >
            {!ready ? (
              <SkeletonRows rows={5} cols={6} />
            ) : (
              summary.recent.map((appointment) => (
                <tr key={appointment.id} className="transition-colors hover:bg-[color:var(--surface-alt)]">
                  <td className="px-5 py-3.5">
                    <span className="block text-[13.5px]">{appointment.customer.name}</span>
                    <span className="block text-[11.5px] text-muted">{appointment.reference}</span>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-muted">
                    {serviceName(appointment.serviceId)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-[13px] text-muted">
                    {relativeDayLabel(appointment.date, todayIso, locale) ??
                      formatDayShort(appointment.date, locale)}
                    {appointment.time ? ` · ${formatTime(appointment.time, locale)}` : ''}
                  </td>
                  <td className="px-5 py-3.5 text-[13px] capitalize text-muted">
                    {appointment.channel}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={appointment.status} />
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-[13px] tabular-nums">
                    {formatMoney(appointment.price, symbol)}
                  </td>
                </tr>
              ))
            )}
          </DataTable>
        </Panel>

        <div className="space-y-4">
          <Panel title={ui.dashboard.overview.topServices}>
            <RankedBars
              items={summary.serviceSplit.slice(0, 5)}
              valueFormatter={(item) => `${item.count} · ${formatCompactMoney(item.revenue, symbol)}`}
            />
          </Panel>

          <Panel title={ui.dashboard.overview.teamLoad}>
            {summary.staffLoad.length === 0 ? (
              <EmptyState
                icon={CircleSlash}
                title={ui.dashboard.overview.noTeam}
                text={ui.dashboard.overview.noTeamText}
              />
            ) : (
              <RankedBars
                items={summary.staffLoad}
                valueFormatter={(item) => `${item.count} ${ui.dashboard.overview.bookings}`}
              />
            )}
          </Panel>
        </div>
      </div>

      {visitor.length > 0 ? (
        <Panel
          title={ui.dashboard.overview.yourBookings}
          className="mt-4 border-[color:var(--brand)]/40"
          padded={false}
        >
          <ul className="divide-y divide-line">
            {visitor.map((appointment) => (
              <li key={appointment.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                <span className="rounded-full bg-[color:var(--brand-soft)] px-2.5 py-1 text-[11px] text-brand">
                  {appointment.reference}
                </span>
                <span className="text-[13.5px]">{appointment.customer.name}</span>
                <span className="text-[13px] text-muted">
                  {serviceName(appointment.serviceId)} ·{' '}
                  {formatDayShort(appointment.date, locale)}
                  {appointment.time ? ` · ${formatTime(appointment.time, locale)}` : ''}
                </span>
                <StatusBadge status={appointment.status} />
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}
    </>
  );
}
