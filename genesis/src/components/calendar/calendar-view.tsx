"use client";

import { ChevronLeft, ChevronRight, Plus, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useWeekStart } from "@/components/booking/month-calendar";
import { useOpenBooking } from "@/components/dashboard/booking-details";
import { PageHeader, useNewBooking } from "@/components/dashboard/shell";
import { statusDot } from "@/components/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Segmented } from "@/components/ui/segmented";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  addDaysToKey,
  addMonthsToKey,
  daysInMonthOfKey,
  minutesInZone,
  parseHM,
  startOfMonthKey,
  startOfWeekKey,
  toDateKey,
  weekdayOfKey,
  type DateKey,
} from "@/domain/time";
import type { Booking, Resource, TimeRange } from "@/domain/types";
import { useBusiness, useRepoQuery, useRepository } from "@/data/repository-context";
import { useCatalog, type Catalog } from "@/hooks/use-catalog";
import { useI18n } from "@/i18n/provider";
import { cn, hueStyle } from "@/lib/utils";

type View = "day" | "week" | "month";
const HOUR_PX = 60;
const ALL = "all";

/** A calendar entry: a single booking, or a group session merging several bookings. */
interface Entry {
  id: string;
  bookings: Booking[];
  start: string;
  end: string;
  staffId: string;
  serviceId: string;
  status: Booking["status"];
  seats: number;
}

function toEntries(bookings: Booking[], catalog: Catalog): Entry[] {
  const map = new Map<string, Entry>();
  for (const b of bookings) {
    const isGroup = (catalog.service(b.serviceId)?.capacity ?? 1) > 1 && b.status !== "cancelled";
    const key = isGroup ? `g|${b.staffId}|${b.start}|${b.serviceId}` : b.id;
    const e = map.get(key);
    if (e) {
      e.bookings.push(b);
      e.seats += b.seats;
      if (b.status === "pending") e.status = "pending";
    } else {
      map.set(key, { id: key, bookings: [b], start: b.start, end: b.end, staffId: b.staffId, serviceId: b.serviceId, status: b.status, seats: b.seats });
    }
  }
  return [...map.values()];
}

/** Assigns side-by-side lanes to overlapping entries. */
function layout(entries: Entry[]) {
  const sorted = [...entries].sort((a, b) => Date.parse(a.start) - Date.parse(b.start) || Date.parse(b.end) - Date.parse(a.end));
  const out: Array<{ e: Entry; lane: number; lanes: number }> = [];
  let cluster: Array<{ e: Entry; lane: number }> = [];
  let clusterEnd = 0;
  const flush = () => {
    const lanes = Math.max(1, ...cluster.map((c) => c.lane + 1));
    for (const c of cluster) out.push({ ...c, lanes });
    cluster = [];
  };
  for (const e of sorted) {
    const s = Date.parse(e.start);
    if (cluster.length && s >= clusterEnd) flush();
    const used = new Set(cluster.filter((c) => Date.parse(c.e.end) > s).map((c) => c.lane));
    let lane = 0;
    while (used.has(lane)) lane++;
    cluster.push({ e, lane });
    clusterEnd = Math.max(clusterEnd, Date.parse(e.end));
  }
  flush();
  return out;
}

function intersectRanges(a: TimeRange[], b: TimeRange[]): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  for (const x of a)
    for (const y of b) {
      const s = Math.max(parseHM(x.start), parseHM(y.start));
      const e = Math.min(parseHM(x.end), parseHM(y.end));
      if (e > s) out.push([s, e]);
    }
  return out.sort((p, q) => p[0] - q[0]);
}

/** Complement of working ranges inside [from, to] → unavailable stripes. */
function gaps(working: Array<[number, number]>, from: number, to: number): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  let cursor = from;
  for (const [s, e] of working) {
    if (s > cursor) out.push([cursor, Math.min(s, to)]);
    cursor = Math.max(cursor, e);
  }
  if (cursor < to) out.push([cursor, to]);
  return out.filter(([s, e]) => e > s);
}

export function CalendarView() {
  const { t, tx } = useI18n();
  const { business, fmt } = useBusiness();
  const repo = useRepository();
  const catalog = useCatalog();
  const weekStart = useWeekStart();
  const tz = business.timezone;
  const [todayKey] = useState(() => toDateKey(repo.now(), tz));
  const [view, setView] = useState<View>("day");
  const [anchor, setAnchor] = useState<DateKey>(todayKey);
  const [staffFilter, setStaffFilter] = useState<string>(ALL);
  const [showCancelled, setShowCancelled] = useState(false);

  const range = useMemo(() => {
    if (view === "day") return { from: anchor, to: anchor };
    if (view === "week") {
      const from = startOfWeekKey(anchor, weekStart);
      return { from, to: addDaysToKey(from, 6) };
    }
    const first = startOfMonthKey(anchor);
    const from = startOfWeekKey(first, weekStart);
    const last = addDaysToKey(first, daysInMonthOfKey(first) - 1);
    const to = addDaysToKey(startOfWeekKey(last, weekStart), 6);
    return { from, to };
  }, [view, anchor, weekStart]);

  const bookings = useRepoQuery((r) => r.listBookings({ fromKey: range.from, toKey: range.to }), [range.from, range.to]);
  const staff = catalog.staff.filter((s) => s.active);
  const visibleStaff = staffFilter === ALL ? staff : staff.filter((s) => s.id === staffFilter);
  const filtered = (bookings.data ?? []).filter(
    (b) => (showCancelled || b.status !== "cancelled") && (staffFilter === ALL || b.staffId === staffFilter),
  );

  // Visible hours: span of the week's opening hours.
  const [dayStart, dayEnd] = useMemo(() => {
    const all = Object.values(business.openingHours).flat();
    if (!all.length) return [8 * 60, 20 * 60];
    return [Math.floor(Math.min(...all.map((r) => parseHM(r.start))) / 60) * 60, Math.ceil(Math.max(...all.map((r) => parseHM(r.end))) / 60) * 60];
  }, [business.openingHours]);

  const step = (dir: number) => {
    if (view === "day") setAnchor((a) => addDaysToKey(a, dir));
    else if (view === "week") setAnchor((a) => addDaysToKey(a, 7 * dir));
    else setAnchor((a) => addMonthsToKey(startOfMonthKey(a), dir));
  };

  const title =
    view === "day"
      ? fmt.keyLong(anchor)
      : view === "week"
        ? `${fmt.keyMonthShort(range.from)} – ${fmt.keyMonthShort(range.to)}`
        : fmt.keyMonthYear(anchor);

  return (
    <div>
      <PageHeader title={t.nav.calendar} />
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b p-3 sm:p-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setAnchor(todayKey)} disabled={anchor === todayKey && view === "day"}>
              {t.common.today}
            </Button>
            <div className="flex">
              <Button variant="ghost" size="icon-sm" onClick={() => step(-1)} aria-label={t.common.previous}>
                <ChevronLeft className="rtl:-scale-x-100" />
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={() => step(1)} aria-label={t.common.nextPeriod}>
                <ChevronRight className="rtl:-scale-x-100" />
              </Button>
            </div>
            <h2 className="truncate text-[15px] font-semibold" aria-live="polite">
              {title}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Select
              ariaLabel={t.appointments.staff}
              className="h-9 w-full sm:w-52"
              value={staffFilter}
              onValueChange={setStaffFilter}
              options={[{ value: ALL, label: t.calendar.allStaff }, ...staff.map((s) => ({ value: s.id, label: tx(s.name) }))]}
            />
            <label className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <Switch checked={showCancelled} onCheckedChange={setShowCancelled} aria-label={t.calendar.showCancelled} />
              {t.calendar.showCancelled}
            </label>
            <Segmented
              ariaLabel={t.nav.calendar}
              value={view}
              onValueChange={setView}
              options={[
                { value: "day", label: t.calendar.day },
                { value: "week", label: t.calendar.week },
                { value: "month", label: t.calendar.month },
              ]}
            />
          </div>
        </div>

        {!bookings.data || !catalog.ready ? (
          <div className="p-4">
            <Skeleton className="h-[520px]" />
          </div>
        ) : view === "month" ? (
          <MonthGrid
            from={range.from}
            anchor={anchor}
            todayKey={todayKey}
            entries={toEntries(filtered, catalog)}
            catalog={catalog}
            onPickDay={(k) => {
              setAnchor(k);
              setView("day");
            }}
          />
        ) : (
          <TimeGrid
            view={view}
            days={view === "day" ? [anchor] : Array.from({ length: 7 }, (_, i) => addDaysToKey(range.from, i))}
            staff={visibleStaff}
            entries={toEntries(filtered, catalog)}
            catalog={catalog}
            dayStart={dayStart}
            dayEnd={dayEnd}
            todayKey={todayKey}
            onPickDay={(k) => {
              setAnchor(k);
              setView("day");
            }}
          />
        )}
        <Legend />
      </Card>
    </div>
  );
}

function Legend() {
  const { t } = useI18n();
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t px-4 py-3 text-xs text-muted-foreground">
      <span className="font-medium text-foreground">{t.calendar.legend}</span>
      {(["confirmed", "pending", "completed", "cancelled", "no_show"] as const).map((s) => (
        <span key={s} className="inline-flex items-center gap-1.5">
          <span className={cn("size-2 rounded-full", statusDot[s])} aria-hidden />
          {t.status[s]}
        </span>
      ))}
      <span className="inline-flex items-center gap-1.5">
        <span className="hatch size-3 rounded-sm border" aria-hidden />
        {t.calendar.unavailable}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ day / week grid */

function TimeGrid({
  view,
  days,
  staff,
  entries,
  catalog,
  dayStart,
  dayEnd,
  todayKey,
  onPickDay,
}: {
  view: "day" | "week";
  days: DateKey[];
  staff: Resource[];
  entries: Entry[];
  catalog: Catalog;
  dayStart: number;
  dayEnd: number;
  todayKey: DateKey;
  onPickDay: (k: DateKey) => void;
}) {
  const { t, tx } = useI18n();
  const { business, fmt } = useBusiness();
  const repo = useRepository();
  const newBooking = useNewBooking();
  const tz = business.timezone;
  const height = ((dayEnd - dayStart) / 60) * HOUR_PX;
  const hours = Array.from({ length: (dayEnd - dayStart) / 60 }, (_, i) => dayStart + i * 60);
  const nowMin = minutesInZone(repo.now(), tz);

  // Day view: one column per staff member. Week view: one column per day.
  const columns =
    view === "day"
      ? staff.map((s) => ({ key: s.id, day: days[0], staff: s }))
      : days.map((d) => ({ key: d, day: d, staff: staff.length === 1 ? staff[0] : undefined }));

  if (view === "day" && staff.length === 0) {
    return <p className="p-8 text-center text-sm text-muted-foreground">{t.calendar.noStaffWorking}</p>;
  }

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <div style={{ minWidth: view === "day" ? 64 + columns.length * 150 : 64 + 7 * 110 }}>
        {/* Column headers */}
        <div className="sticky top-0 z-10 flex border-b bg-card">
          <div className="w-16 shrink-0" />
          {columns.map((c) => (
            <div key={c.key} className="flex min-w-0 flex-1 items-center justify-between gap-2 border-s px-2.5 py-2.5">
              {view === "day" && c.staff ? (
                <div className="flex min-w-0 items-center gap-2">
                  <Avatar name={c.staff.name.en} hue={c.staff.hue} photo={c.staff.photo} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium">{tx(c.staff.name)}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{tx(c.staff.title)}</p>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onPickDay(c.day)}
                  className={cn("flex items-baseline gap-1.5 rounded-md px-1 text-start hover:text-primary", c.day === todayKey && "text-primary")}
                >
                  <span className="text-xs text-muted-foreground">{fmt.keyWeekdayShort(c.day)}</span>
                  <span className={cn("text-[15px] font-semibold tabular", c.day === todayKey && "rounded-full bg-primary px-1.5 text-primary-foreground")}>
                    {fmt.keyDay(c.day)}
                  </span>
                </button>
              )}
              <Button
                variant="ghost"
                size="icon-sm"
                className="size-7 shrink-0 text-muted-foreground"
                onClick={() => newBooking({ dateKey: c.day, staffId: c.staff?.id })}
                aria-label={`${t.nav.newBooking}, ${c.staff ? tx(c.staff.name) : fmt.keyShort(c.day)}`}
              >
                <Plus />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex">
          {/* Hour gutter */}
          <div className="relative w-16 shrink-0" style={{ height }}>
            {hours.map((h, i) => (
              <span key={h} className="absolute end-2 -translate-y-1/2 text-[11px] tabular text-muted-foreground" style={{ top: i * HOUR_PX }} dir="ltr">
                {i === 0 ? "" : `${String(h / 60).padStart(2, "0")}:00`}
              </span>
            ))}
          </div>

          {columns.map((c) => {
            const weekday = weekdayOfKey(c.day);
            const opening = business.rules.closedDates.includes(c.day) ? [] : business.openingHours[weekday];
            const working = c.staff ? intersectRanges(c.staff.weeklyHours[weekday], opening) : intersectRanges(opening, [{ start: "00:00", end: "23:59" }]);
            const off = gaps(working, dayStart, dayEnd);
            const colEntries = entries.filter(
              (e) => toDateKey(e.start, tz) === c.day && (view === "week" || e.staffId === c.staff?.id),
            );
            return (
              <div key={c.key} className="relative min-w-0 flex-1 border-s" style={{ height }}>
                {hours.map((h, i) => (
                  <div key={h} className="absolute inset-x-0 border-t border-dashed border-border/70" style={{ top: i * HOUR_PX }} aria-hidden />
                ))}
                {off.map(([s, e]) => (
                  <div
                    key={s}
                    className="hatch absolute inset-x-0 opacity-80"
                    style={{ top: ((s - dayStart) / 60) * HOUR_PX, height: ((e - s) / 60) * HOUR_PX }}
                    title={t.calendar.unavailable}
                    aria-hidden
                  />
                ))}
                {c.day === todayKey && nowMin >= dayStart && nowMin <= dayEnd ? (
                  <div className="pointer-events-none absolute inset-x-0 z-[5] flex items-center" style={{ top: ((nowMin - dayStart) / 60) * HOUR_PX }} aria-label={t.calendar.now}>
                    <span className="-ms-1 size-2 rounded-full bg-danger" />
                    <span className="h-px flex-1 bg-danger" />
                  </div>
                ) : null}
                {layout(colEntries).map(({ e, lane, lanes }) => {
                  const s = minutesInZone(e.start, tz);
                  const en = minutesInZone(e.end, tz);
                  const top = ((Math.max(s, dayStart) - dayStart) / 60) * HOUR_PX;
                  const h = Math.max(22, ((Math.min(en, dayEnd) - Math.max(s, dayStart)) / 60) * HOUR_PX - 2);
                  return (
                    <EntryBlock
                      key={e.id}
                      entry={e}
                      catalog={catalog}
                      style={{ top, height: h, insetInlineStart: `calc(${(lane / lanes) * 100}% + 2px)`, width: `calc(${100 / lanes}% - 4px)` }}
                      compact={h < 44}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function EntryBlock({ entry, catalog, style, compact }: { entry: Entry; catalog: Catalog; style: React.CSSProperties; compact: boolean }) {
  const { t, tx } = useI18n();
  const { fmt } = useBusiness();
  const openBooking = useOpenBooking();
  const service = catalog.service(entry.serviceId);
  const staff = catalog.resource(entry.staffId);
  const first = entry.bookings[0];
  const isGroup = (service?.capacity ?? 1) > 1;
  const name = isGroup ? (service ? tx(service.name) : "") : (catalog.customer(first.customerId)?.name ?? "");
  const cancelled = entry.status === "cancelled";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          style={{ ...style, ...hueStyle(staff?.hue ?? 220) }}
          className={cn(
            "lane absolute z-[2] overflow-hidden rounded-md border-s-[3px] border-[var(--lane-border)] bg-[var(--lane-bg)] px-1.5 py-1 text-start text-[var(--lane-fg)] shadow-xs outline-offset-1 transition-[box-shadow,filter] hover:z-[3] hover:shadow-md hover:brightness-[0.98] focus-visible:z-[4]",
            entry.status === "pending" && "border-dashed bg-[repeating-linear-gradient(135deg,var(--lane-bg)_0_8px,transparent_8px_10px)] ring-1 ring-inset ring-[var(--lane-border)]/40",
            cancelled && "opacity-55 line-through",
            (entry.status === "completed" || entry.status === "no_show") && "saturate-[0.6]",
          )}
          aria-label={`${fmt.time(entry.start)} ${name}, ${t.status[entry.status]}`}
        >
          <span className="flex items-center gap-1 text-[11px] font-semibold leading-tight">
            <span className={cn("size-1.5 shrink-0 rounded-full", statusDot[entry.status])} aria-hidden />
            <span className="truncate">{name}</span>
          </span>
          {!compact ? (
            <span className="mt-0.5 block truncate text-[10.5px] leading-tight opacity-80">
              <span dir="ltr">{fmt.time(entry.start)}</span>
              {isGroup ? ` · ${entry.seats}/${service?.capacity}` : service ? ` · ${tx(service.name)}` : ""}
            </span>
          ) : null}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-semibold">{service ? tx(service.name) : ""}</p>
              <p className="text-sm text-muted-foreground">
                {fmt.dateShort(entry.start)} · <span dir="ltr">{fmt.time(entry.start)}–{fmt.time(entry.end)}</span>
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium">
              <span className={cn("size-2 rounded-full", statusDot[entry.status])} />
              {t.status[entry.status]}
            </span>
          </div>
          {staff ? (
            <div className="flex items-center gap-2 text-sm">
              <Avatar name={staff.name.en} hue={staff.hue} photo={staff.photo} size="sm" />
              {tx(staff.name)}
            </div>
          ) : null}
          {isGroup ? (
            <div className="grid gap-1.5">
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Users className="size-3.5" /> {entry.seats}/{service?.capacity}
              </p>
              <ul className="grid max-h-40 gap-1 overflow-y-auto">
                {entry.bookings.map((b) => (
                  <li key={b.id}>
                    <button type="button" onClick={() => openBooking(b.id)} className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1 text-sm hover:bg-muted">
                      <span className="truncate">{catalog.customer(b.customerId)?.name}</span>
                      <span className="font-mono text-[11px] text-muted-foreground" dir="ltr">{b.reference}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-sm">
              <p className="font-medium">{catalog.customer(first.customerId)?.name}</p>
              <p className="text-muted-foreground" dir="ltr">{catalog.customer(first.customerId)?.phone}</p>
            </div>
          )}
          {!isGroup ? (
            <Button size="sm" variant="secondary" onClick={() => openBooking(first.id)}>
              {t.calendar.openDetails}
            </Button>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* ------------------------------------------------------------------ month grid */

function MonthGrid({ from, anchor, todayKey, entries, catalog, onPickDay }: {
  from: DateKey;
  anchor: DateKey;
  todayKey: DateKey;
  entries: Entry[];
  catalog: Catalog;
  onPickDay: (k: DateKey) => void;
}) {
  const { t, tx } = useI18n();
  const { business, fmt } = useBusiness();
  const weekStart = useWeekStart();
  const month = anchor.slice(0, 7);
  const byDay = new Map<DateKey, Entry[]>();
  for (const e of entries) {
    const k = toDateKey(e.start, business.timezone);
    byDay.set(k, [...(byDay.get(k) ?? []), e]);
  }
  const cells = Array.from({ length: 42 }, (_, i) => addDaysToKey(from, i)).filter((k, i) => i < 35 || k.slice(0, 7) === month);

  return (
    <div>
      <div className="grid grid-cols-7 border-b bg-subtle">
        {Array.from({ length: 7 }, (_, i) => (weekStart + i) % 7).map((d) => (
          <span key={d} className="px-2 py-2 text-center text-[11px] font-medium text-muted-foreground sm:text-start">
            {t.weekdays.short[d]}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((k) => {
          const list = (byDay.get(k) ?? []).sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
          const out = k.slice(0, 7) !== month;
          const closed = business.openingHours[weekdayOfKey(k)].length === 0 || business.rules.closedDates.includes(k);
          return (
            <button
              key={k}
              type="button"
              onClick={() => onPickDay(k)}
              aria-label={`${fmt.keyLong(k)}, ${list.length}`}
              className={cn(
                "flex min-h-20 flex-col gap-1 border-b border-e p-1.5 text-start transition-colors hover:bg-muted/60 sm:min-h-28 sm:p-2 [&:nth-child(7n)]:border-e-0",
                out && "bg-subtle/60 text-muted-foreground",
                closed && "hatch",
              )}
            >
              <span className={cn("inline-flex size-6 items-center justify-center rounded-full text-xs font-medium tabular", k === todayKey && "bg-primary text-primary-foreground")}>
                {fmt.keyDay(k)}
              </span>
              {/* Mobile: dots + count. Desktop: chips. */}
              {list.length ? <span className="text-[11px] font-medium text-muted-foreground sm:hidden">{list.length}</span> : null}
              <span className="hidden w-full gap-1 sm:grid">
                {list.slice(0, 3).map((e) => {
                  const staff = catalog.resource(e.staffId);
                  const svc = catalog.service(e.serviceId);
                  return (
                    <span
                      key={e.id}
                      style={hueStyle(staff?.hue ?? 220)}
                      className={cn("lane flex items-center gap-1 truncate rounded bg-[var(--lane-bg)] px-1.5 py-0.5 text-[11px] text-[var(--lane-fg)]", e.status === "cancelled" && "line-through opacity-60")}
                    >
                      <span className={cn("size-1.5 shrink-0 rounded-full", statusDot[e.status])} aria-hidden />
                      <span dir="ltr" className="tabular">{fmt.time(e.start)}</span>
                      <span className="truncate">{svc ? tx(svc.name) : ""}</span>
                    </span>
                  );
                })}
                {list.length > 3 ? <span className="px-1 text-[11px] font-medium text-muted-foreground">{t.calendar.moreCount(list.length - 3)}</span> : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
