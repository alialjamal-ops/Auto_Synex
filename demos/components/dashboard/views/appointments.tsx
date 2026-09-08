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
import { useAppointmentBook } from '@/hooks/use-appointment-book';
import { appointmentEnd } from '@/lib/dashboard';
import { diffDays, formatDayShort, formatTime, relativeDayLabel } from '@/lib/date';
import { formatMoney } from '@/lib/format';
import type { BookingStatus } from '@/lib/booking';
import type { DemoConfig } from '@/types/demo';

type RangeFilter = 'today' | 'upcoming' | 'past' | 'all';
type StatusFilter = 'all' | BookingStatus;

const RANGES: readonly { id: RangeFilter; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'past', label: 'Past' },
  { id: 'all', label: 'All' },
];

const STATUSES: readonly { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'Any status' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'pending', label: 'Pending' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

const PAGE_SIZE = 12;

export function AppointmentsView({ config, todayIso }: { config: DemoConfig; todayIso: string }) {
  const { appointments, ready } = useAppointmentBook(config, todayIso);
  const [range, setRange] = useState<RangeFilter>('today');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);

  const symbol = config.booking.currencySymbol;
  const serviceName = (id: string) =>
    config.services.find((service) => service.id === id)?.name ?? '—';
  const staffName = (id: string | null) =>
    config.staff.find((member) => member.id === id)?.name ?? 'Unassigned';

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
        title="Appointments"
        subtitle={`${filtered.length} of ${appointments.length} records`}
        actions={
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="size-4" />
            Export CSV
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <FilterTabs
          options={RANGES}
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
            placeholder={`Search ${config.dashboard.customerLabelPlural.toLowerCase()}, reference…`}
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
            {STATUSES.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
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
              title="No matching appointments"
              text="Try a different search term, status or date range."
              action={
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setQuery('');
                    setStatus('all');
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={CalendarX2}
              title="Nothing in this range"
              text="When bookings come in they appear here in real time."
              action={
                <Button href={`/${config.slug}/book`} size="sm">
                  Make a demo booking
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
                'Date',
                'Time',
                'Status',
                'Value',
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
                      {relativeDayLabel(appointment.date, todayIso) ?? formatDayShort(appointment.date)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-[13px] tabular-nums text-muted">
                      {config.booking.mode === 'stay'
                        ? `${appointment.endDate ? diffDays(appointment.date, appointment.endDate) : 1} nights · ${appointment.guests ?? 1} guests`
                        : appointment.time
                          ? `${formatTime(appointment.time)} – ${formatTime(appointmentEnd(appointment))}`
                          : `${appointment.guests ?? 1} guests`}
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
                  Page {current + 1} of {pages}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((value) => Math.max(0, value - 1))}
                    disabled={current === 0}
                    className="rounded-brand border border-line px-3 py-1.5 transition-colors enabled:hover:border-[color:var(--brand)] disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((value) => Math.min(pages - 1, value + 1))}
                    disabled={current >= pages - 1}
                    className="rounded-brand border border-line px-3 py-1.5 transition-colors enabled:hover:border-[color:var(--brand)] disabled:opacity-40"
                  >
                    Next
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
