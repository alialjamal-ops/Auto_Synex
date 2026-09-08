'use client';

import { CalendarOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { EmptyState, PageHeader, Panel, StatusBadge } from '@/components/dashboard/ui';
import { Button } from '@/components/ui/button';
import { useAppointmentBook } from '@/hooks/use-appointment-book';
import { appointmentEnd, type Appointment } from '@/lib/dashboard';
import { cn } from '@/lib/cn';
import {
  addDays,
  formatDayShort,
  formatTime,
  fromISODate,
  minutesToTime,
  startOfWeek,
  timeToMinutes,
  WEEKDAY_SHORT,
  weekdayOf,
} from '@/lib/date';
import { formatMoney } from '@/lib/format';
import type { DemoConfig } from '@/types/demo';

const ROW_HEIGHT = 56;

export function CalendarView({ config, todayIso }: { config: DemoConfig; todayIso: string }) {
  const { appointments } = useAppointmentBook(config, todayIso);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(todayIso));
  const [selectedDay, setSelectedDay] = useState(todayIso);

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)),
    [weekStart],
  );

  // Vertical extent of the grid: earliest open → latest close across the week.
  const { startMinutes, endMinutes } = useMemo(() => {
    const opens: number[] = [];
    const closes: number[] = [];
    for (const iso of days) {
      const hours = config.hours[weekdayOf(iso)];
      if (!hours) continue;
      opens.push(timeToMinutes(hours.open));
      closes.push(timeToMinutes(hours.close));
    }
    if (opens.length === 0) return { startMinutes: 9 * 60, endMinutes: 18 * 60 };
    return {
      startMinutes: Math.floor(Math.min(...opens) / 60) * 60,
      endMinutes: Math.ceil(Math.max(...closes) / 60) * 60,
    };
  }, [config.hours, days]);

  const hourMarks = useMemo(() => {
    const marks: number[] = [];
    for (let minute = startMinutes; minute <= endMinutes; minute += 60) marks.push(minute);
    return marks;
  }, [startMinutes, endMinutes]);

  const byDay = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const appointment of appointments) {
      if (appointment.status === 'cancelled') continue;
      map.set(appointment.date, [...(map.get(appointment.date) ?? []), appointment]);
    }
    return map;
  }, [appointments]);

  /**
   * Lays concurrent appointments side by side instead of stacking them, the way
   * a real scheduling calendar does.
   */
  const laneLayout = useMemo(() => {
    const layout = new Map<string, { lane: number; lanes: number }>();

    for (const iso of days) {
      const items = [...(byDay.get(iso) ?? [])]
        .filter((item) => item.time)
        .sort((a, b) => (a.time ?? '').localeCompare(b.time ?? ''));

      let cluster: Appointment[] = [];
      let clusterEnd = -1;

      const flush = () => {
        if (cluster.length === 0) return;
        const laneEnds: number[] = [];
        const assigned: number[] = [];
        for (const item of cluster) {
          const start = timeToMinutes(item.time as string);
          let lane = laneEnds.findIndex((end) => end <= start);
          if (lane === -1) {
            lane = laneEnds.length;
            laneEnds.push(0);
          }
          laneEnds[lane] = start + item.durationMin;
          assigned.push(lane);
        }
        cluster.forEach((item, index) => {
          layout.set(item.id, { lane: assigned[index] ?? 0, lanes: laneEnds.length });
        });
        cluster = [];
        clusterEnd = -1;
      };

      for (const item of items) {
        const start = timeToMinutes(item.time as string);
        if (cluster.length > 0 && start >= clusterEnd) flush();
        cluster.push(item);
        clusterEnd = Math.max(clusterEnd, start + item.durationMin);
      }
      flush();
    }

    return layout;
  }, [byDay, days]);

  const gridHeight = ((endMinutes - startMinutes) / 60) * ROW_HEIGHT;
  const weekAppointments = days.reduce((total, iso) => total + (byDay.get(iso)?.length ?? 0), 0);
  const selected = byDay.get(selectedDay) ?? [];

  const serviceName = (id: string) =>
    config.services.find((service) => service.id === id)?.name ?? '—';

  return (
    <>
      <PageHeader
        title="Calendar"
        subtitle={`${formatDayShort(days[0]!)} – ${formatDayShort(days[6]!)} · ${weekAppointments} bookings`}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setWeekStart((current) => addDays(current, -7))}
              className="grid size-9 place-items-center rounded-brand border border-line transition-colors hover:border-[color:var(--brand)]"
              aria-label="Previous week"
            >
              <ChevronLeft className="size-4" />
            </button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setWeekStart(startOfWeek(todayIso));
                setSelectedDay(todayIso);
              }}
            >
              This week
            </Button>
            <button
              type="button"
              onClick={() => setWeekStart((current) => addDays(current, 7))}
              className="grid size-9 place-items-center rounded-brand border border-line transition-colors hover:border-[color:var(--brand)]"
              aria-label="Next week"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        }
      />

      {/* Desktop week grid */}
      <Panel className="hidden lg:block" padded={false}>
        <div className="grid grid-cols-[64px_repeat(7,minmax(0,1fr))] border-b border-line">
          <span />
          {days.map((iso) => {
            const closed = !config.hours[weekdayOf(iso)];
            return (
              <div
                key={iso}
                className={cn(
                  'border-l border-line px-3 py-3 text-center',
                  iso === todayIso && 'bg-[color:var(--brand-soft)]',
                )}
              >
                <p className="text-[11px] uppercase tracking-[0.1em] text-muted">
                  {WEEKDAY_SHORT[weekdayOf(iso)]}
                </p>
                <p
                  className={cn(
                    'mt-0.5 font-display text-lg tabular-nums',
                    iso === todayIso && 'text-brand',
                  )}
                >
                  {fromISODate(iso).getDate()}
                </p>
                <p className="text-[10.5px] text-muted">
                  {closed ? 'Closed' : `${byDay.get(iso)?.length ?? 0} booked`}
                </p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-[64px_repeat(7,minmax(0,1fr))]">
          <div className="relative" style={{ height: gridHeight }}>
            {hourMarks.map((minute) => (
              <span
                key={minute}
                className="absolute right-2 -translate-y-1/2 text-[11px] tabular-nums text-muted"
                style={{ top: ((minute - startMinutes) / 60) * ROW_HEIGHT }}
              >
                {formatTime(minutesToTime(minute))}
              </span>
            ))}
          </div>

          {days.map((iso) => {
            const hours = config.hours[weekdayOf(iso)];
            const items = byDay.get(iso) ?? [];
            return (
              <div
                key={iso}
                className={cn(
                  'relative border-l border-line',
                  !hours && 'bg-[color:var(--surface-alt)]/60',
                )}
                style={{ height: gridHeight }}
              >
                {hourMarks.map((minute) => (
                  <span
                    key={minute}
                    className="absolute inset-x-0 border-t border-line/60"
                    style={{ top: ((minute - startMinutes) / 60) * ROW_HEIGHT }}
                  />
                ))}

                {items.map((appointment) => {
                  if (!appointment.time) return null;
                  const start = timeToMinutes(appointment.time);
                  const top = ((start - startMinutes) / 60) * ROW_HEIGHT;
                  const height = Math.max(
                    22,
                    (appointment.durationMin / 60) * ROW_HEIGHT - 3,
                  );
                  const { lane, lanes } = laneLayout.get(appointment.id) ?? { lane: 0, lanes: 1 };
                  const width = 100 / lanes;

                  return (
                    <div
                      key={appointment.id}
                      title={`${appointment.customer.name} · ${serviceName(appointment.serviceId)} · ${formatTime(appointment.time)}`}
                      className={cn(
                        'absolute overflow-hidden rounded-[4px] border-l-2 px-1.5 py-1 text-[11px] leading-tight transition-transform duration-200 hover:z-20 hover:scale-[1.03]',
                        appointment.source === 'visitor'
                          ? 'border-l-[color:var(--accent)] bg-[color:var(--accent)]/20'
                          : 'border-l-[color:var(--brand)] bg-[color:var(--brand-soft)]',
                      )}
                      style={{
                        top,
                        height,
                        left: `calc(${lane * width}% + 2px)`,
                        width: `calc(${width}% - 4px)`,
                      }}
                    >
                      <p className="truncate font-medium text-ink">{appointment.customer.name}</p>
                      {lanes <= 2 ? (
                        <p className="truncate text-muted">{serviceName(appointment.serviceId)}</p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </Panel>

      {/* Mobile day list */}
      <div className="lg:hidden">
        <div className="scrollbar-none -mx-4 mb-4 flex gap-2 overflow-x-auto px-4">
          {days.map((iso) => {
            const closed = !config.hours[weekdayOf(iso)];
            return (
              <button
                key={iso}
                type="button"
                onClick={() => setSelectedDay(iso)}
                className={cn(
                  'flex min-w-[62px] shrink-0 flex-col items-center rounded-brand border px-3 py-2.5 transition-colors',
                  iso === selectedDay
                    ? 'border-transparent bg-brand text-[color:var(--brand-contrast)]'
                    : 'border-line text-muted',
                )}
              >
                <span className="text-[10px] uppercase tracking-[0.1em]">
                  {WEEKDAY_SHORT[weekdayOf(iso)]}
                </span>
                <span className="mt-0.5 font-display text-lg tabular-nums">
                  {fromISODate(iso).getDate()}
                </span>
                <span className="text-[10px]">
                  {closed ? '—' : (byDay.get(iso)?.length ?? 0)}
                </span>
              </button>
            );
          })}
        </div>

        <Panel padded={false}>
          {selected.length === 0 ? (
            <EmptyState
              icon={CalendarOff}
              title="Nothing booked"
              text="Pick another day, or create a booking from the public site to see it land here."
            />
          ) : (
            <ul className="divide-y divide-line">
              {selected.map((appointment) => (
                <li key={appointment.id} className="flex items-start gap-4 px-4 py-3.5">
                  <span className="w-[68px] shrink-0 text-[12.5px] tabular-nums text-muted">
                    {appointment.time ? formatTime(appointment.time) : '—'}
                    <span className="block text-[10.5px] text-muted/70">
                      {appointment.time ? formatTime(appointmentEnd(appointment)) : ''}
                    </span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px]">{appointment.customer.name}</span>
                    <span className="block truncate text-[12px] text-muted">
                      {serviceName(appointment.serviceId)}
                    </span>
                    <span className="mt-1.5 flex items-center gap-2">
                      <StatusBadge status={appointment.status} />
                      <span className="text-[11.5px] tabular-nums text-muted">
                        {formatMoney(appointment.price, config.booking.currencySymbol)}
                      </span>
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
