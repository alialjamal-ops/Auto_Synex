'use client';

import { CalendarX2, Download, SearchX } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  DataTable,
  EmptyState,
  FilterTabs,
  PageHeader,
  Panel,
  SearchInput,
  SkeletonRows,
  StatusBadge,
} from '@/components/dashboard/ui';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/hooks/use-locale';
import { useAppointmentBook } from '@/hooks/use-appointment-book';
import { appointmentEnd } from '@/lib/dashboard';
import { diffDays, formatDayShort, formatTime, relativeDayLabel } from '@/lib/date';
import { formatMoney } from '@/lib/format';
import type { BookingStatus } from '@/lib/booking';
import type { DemoConfig } from '@/types/demo';

type RangeFilter = 'today' | 'upcoming' | 'past' | 'all';
type StatusFilter = 'all' | BookingStatus;

const RANGE_IDS: readonly RangeFilter[] = ['today', 'upcoming', 'past', 'all'];

const STATUS_IDS: readonly StatusFilter[] = ['all', 'confirmed', 'pending', 'completed', 'cancelled'];

const PAGE_SIZE = 12;

export function AppointmentsView({ config, todayIso }: { config: DemoConfig; todayIso: string }) {
  const { ui, locale, href } = useLocale();
  const { appointments, ready } = useAppointmentBook(config, todayIso);
  const [range, setRange] = useState<RangeFilter>('today');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);

  const symbol = config.booking.currencySymbol;
  const serviceName = (id: string) =>
    config.services.find((service) => service.id === id)?.name ?? '—';
  const staffName = (id: string | null) =>
    config.staff.find((member) => member.id === id)?.name ?? ui.dashboard.staff.noTeam;

  const byRange = useMemo(
    () => ({
      today: appointments.filter((item) => item.date === todayIso),
      upcoming: appointments.filter((item) => item.date > todayIso),
      past: appointments.filter((item) => item.date < todayIso),
      all: appointments,
    }),
    [appointments, todayIso],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return byRange[range]
      .filter((item) => (status === 'all' ? true : item.status === status))
      .filter((item) =>
        term
          ? item.customer.name.toLowerCase().includes(term) ||
            item.customer.email.toLowerCase().includes(term) ||
            item.reference.toLowerCase().includes(term) ||
            serviceName(item.serviceId).toLowerCase().includes(term)
          : true,
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [byRange, range, status, query]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const rows = filtered.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);

  const exportCsv = () => {
    const header = ['Reference', 'Name', 'Email', 'Phone', 'Service', 'Staff', 'Date', 'Time', 'Status', 'Value'];
    const body = filtered.map((item) => [
      item.reference,
      item.customer.name,
      item.customer.email,
      item.customer.phone,
      serviceName(item.serviceId),
      staffName(item.staffId),
      item.date,
      item.time ?? '',
      item.status,
      String(item.price),
    ]);
    const csv = [header, ...body]
      .map((line) => line.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${config.slug}-appointments.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeader
        title={ui.dashboard.nav.appointments}
        subtitle={`${filtered.length} ${ui.dashboard.table.recordsOf} ${appointments.length} ${ui.dashboard.table.records}`}
        actions={
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="size-4" />
            {ui.dashboard.table.exportCsv}
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <FilterTabs
          options={RANGE_IDS.map((id) => ({ id, label: ui.dashboard.filters[id === 'all' ? 'all' : id] }))}
          value={range}
          onChange={(value) => {
            setRange(value);
            setPage(0);
          }}
          counts={{
            today: byRange.today.length,
            upcoming: byRange.upcoming.length,
            past: byRange.past.length,
            all: byRange.all.length,
          }}
        />
        <div className="flex flex-col gap-3 sm:flex-row lg:items-center">
          <SearchInput
            value={query}
            onChange={(value) => {
              setQuery(value);
              setPage(0);
            }}
            placeholder={ui.dashboard.filters.searchAppointments}
            className="sm:w-64"
          />
          <label className="sr-only" htmlFor="status-filter">
            Status
          </label>
          <select
            id="status-filter"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as StatusFilter);
              setPage(0);
            }}
            className="rounded-brand border border-line bg-surface px-3 py-2.5 text-[13px] outline-none focus:border-[color:var(--brand)]"
          >
            {STATUS_IDS.map((id) => (
              <option key={id} value={id}>
                {id === 'all' ? ui.dashboard.filters.anyStatus : ui.dashboard.filters[id]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Panel padded={false}>
        {ready && filtered.length === 0 ? (
          query || status !== 'all' ? (
            <EmptyState
              icon={SearchX}
              title={ui.dashboard.filters.noMatches}
              text={ui.dashboard.filters.noMatchesText}
              action={
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setQuery('');
                    setStatus('all');
                  }}
                >
                  {ui.dashboard.filters.clearFilters}
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={CalendarX2}
              title={ui.dashboard.filters.nothingInRange}
              text={ui.dashboard.filters.nothingInRangeText}
              action={
                <Button href={href(`/${config.slug}/book`)} size="sm">
                  {ui.dashboard.filters.makeDemoBooking}
                </Button>
              }
            />
          )
        ) : (
          <>
            <DataTable
              head={[
                config.dashboard.customerLabel,
                config.booking.labels.service,
                config.booking.labels.staff,
                ui.dashboard.table.date,
                ui.dashboard.table.time,
                ui.dashboard.table.status,
                ui.dashboard.table.value,
              ]}
            >
              {!ready ? (
                <SkeletonRows rows={8} cols={7} />
              ) : (
                rows.map((appointment) => (
                  <tr
                    key={appointment.id}
                    className="transition-colors hover:bg-[color:var(--surface-alt)]"
                  >
                    <td className="px-5 py-3.5">
                      <span className="block text-[13.5px]">{appointment.customer.name}</span>
                      <span className="block text-[11.5px] text-muted">
                        {appointment.reference} · {appointment.customer.phone}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-muted">
                      {serviceName(appointment.serviceId)}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-muted">
                      {staffName(appointment.staffId)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-[13px]">
                      {relativeDayLabel(appointment.date, todayIso, locale) ??
                        formatDayShort(appointment.date, locale)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-[13px] tabular-nums text-muted">
                      {config.booking.mode === 'stay'
                        ? `${appointment.endDate ? diffDays(appointment.date, appointment.endDate) : 1} ${ui.common.nights} · ${appointment.guests ?? 1} ${ui.common.guests}`
                        : appointment.time
                          ? `${formatTime(appointment.time, locale)} – ${formatTime(appointmentEnd(appointment), locale)}`
                          : `${appointment.guests ?? 1} ${ui.common.guests}`}
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

            {pages > 1 ? (
              <div className="flex items-center justify-between gap-4 border-t border-line px-5 py-3.5 text-[13px]">
                <span className="text-muted">
                  {ui.dashboard.table.page} {current + 1} {ui.dashboard.table.pageOf} {pages}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((value) => Math.max(0, value - 1))}
                    disabled={current === 0}
                    className="rounded-brand border border-line px-3 py-1.5 transition-colors enabled:hover:border-[color:var(--brand)] disabled:opacity-40"
                  >
                    {ui.dashboard.table.previous}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((value) => Math.min(pages - 1, value + 1))}
                    disabled={current >= pages - 1}
                    className="rounded-brand border border-line px-3 py-1.5 transition-colors enabled:hover:border-[color:var(--brand)] disabled:opacity-40"
                  >
                    {ui.dashboard.table.next}
                  </button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </Panel>
    </>
  );
}
