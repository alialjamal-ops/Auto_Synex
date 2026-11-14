"use client";

import { ArrowDownRight, ArrowUpRight, CalendarCheck2, CalendarClock, CircleDollarSign, Clock, History, XCircle, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { BarList, ColumnChart, Donut } from "@/components/charts/charts";
import { StatusBadge } from "@/components/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { addDaysToKey, addMonthsToKey, diffDaysKeys, startOfMonthKey, toDateKey } from "@/domain/time";
import { BLOCKING_STATUSES, type ActivityEntry, type Booking } from "@/domain/types";
import { useBusiness, useRepoQuery, useRepository } from "@/data/repository-context";
import { useCatalog } from "@/hooks/use-catalog";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";
import { useOpenBooking } from "./booking-details";
import { PageHeader } from "./shell";

export function Overview() {
  const { t, tx } = useI18n();
  const { business, fmt } = useBusiness();
  const repo = useRepository();
  const catalog = useCatalog();
  const openBooking = useOpenBooking();
  const now = repo.now();
  const tz = business.timezone;
  const todayKey = toDateKey(now, tz);
  const monthKey = startOfMonthKey(todayKey);
  const prevMonthKey = addMonthsToKey(monthKey, -1);

  const bookings = useRepoQuery(
    (r) => r.listBookings({ fromKey: prevMonthKey < addDaysToKey(todayKey, -30) ? prevMonthKey : addDaysToKey(todayKey, -30), toKey: addDaysToKey(todayKey, 7) }),
    [todayKey],
  );
  const activity = useRepoQuery((r) => r.listActivity(8), []);

  const m = useMemo(() => {
    if (!bookings.data) return null;
    const list = bookings.data;
    const nowMs = now.getTime();
    const keyOf = (b: Booking) => toDateKey(b.start, tz);
    const active = (b: Booking) => BLOCKING_STATUSES.includes(b.status);
    const today = list.filter((b) => keyOf(b) === todayKey && b.status !== "cancelled");
    const upcoming = list.filter((b) => active(b) && Date.parse(b.start) > nowMs && diffDaysKeys(keyOf(b), todayKey) <= 7);
    const inMonth = list.filter((b) => keyOf(b) >= monthKey && keyOf(b) <= todayKey);
    const dayOfMonth = diffDaysKeys(todayKey, monthKey);
    const prevSameRange = list.filter((b) => keyOf(b) >= prevMonthKey && diffDaysKeys(keyOf(b), prevMonthKey) <= dayOfMonth && keyOf(b) < monthKey);
    const revenue = inMonth.filter((b) => b.status === "completed").reduce((n, b) => n + b.price, 0);
    const prevRevenue = prevSameRange.filter((b) => b.status === "completed").reduce((n, b) => n + b.price, 0);
    const cancelled = inMonth.filter((b) => b.status === "cancelled").length;

    const trend = Array.from({ length: 14 }, (_, i) => {
      const key = addDaysToKey(todayKey, i - 6);
      return {
        key,
        label: fmt.keyWeekdayShort(key),
        value: list.filter((b) => keyOf(b) === key && b.status !== "cancelled").length,
        highlight: key === todayKey,
        muted: key > todayKey,
        title: fmt.keyShort(key),
      };
    });
    const last30 = list.filter((b) => diffDaysKeys(todayKey, keyOf(b)) <= 30 && keyOf(b) <= todayKey);
    const count = (s: Booking["status"]) => last30.filter((b) => b.status === s).length;
    const byService = new Map<string, number>();
    for (const b of upcoming) byService.set(b.serviceId, (byService.get(b.serviceId) ?? 0) + 1);

    const series = (days: number, offset: number, fn: (b: Booking) => number) =>
      Array.from({ length: days }, (_, i) => {
        const key = addDaysToKey(todayKey, offset + i);
        return list.filter((b) => keyOf(b) === key).reduce((n, b) => n + fn(b), 0);
      });
    const sparks = {
      today: series(14, -13, (b) => (b.status !== "cancelled" ? 1 : 0)),
      upcoming: series(8, 0, (b) => (active(b) ? 1 : 0)),
      completed: series(14, -13, (b) => (b.status === "completed" ? 1 : 0)),
      cancelled: series(14, -13, (b) => (b.status === "cancelled" ? 1 : 0)),
      revenue: series(14, -13, (b) => (b.status === "completed" ? b.price : 0)),
    };
    return {
      sparks,
      today: today.sort((a, b) => Date.parse(a.start) - Date.parse(b.start)),
      remaining: today.filter((b) => Date.parse(b.start) > nowMs && active(b)).length,
      upcoming: upcoming.length,
      pending: upcoming.filter((b) => b.status === "pending").length,
      completed: inMonth.filter((b) => b.status === "completed").length,
      cancelled,
      cancelRate: inMonth.length ? cancelled / inMonth.length : 0,
      revenue,
      delta: prevRevenue ? (revenue - prevRevenue) / prevRevenue : null,
      trend,
      status: { completed: count("completed"), confirmed: count("confirmed") + count("pending"), cancelled: count("cancelled"), no_show: count("no_show"), total: last30.length },
      topServices: [...byService.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4),
    };
  }, [bookings.data, now, tz, todayKey, monthKey, prevMonthKey, fmt]);

  const base = `/${business.id}/dashboard`;

  return (
    <div>
      <PageHeader title={t.nav.overview} subtitle={`${fmt.keyLong(todayKey)} · ${t.overview.greeting}`} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Kpi icon={CalendarCheck2} label={t.overview.todays} value={m ? fmt.number(m.today.length) : null} sub={m ? t.overview.remaining(m.remaining) : ""} tone="primary" spark={m?.sparks.today} />
        <Kpi icon={CalendarClock} label={t.overview.upcoming} value={m ? fmt.number(m.upcoming) : null} sub={m ? t.overview.pendingCount(m.pending) : ""} tone="warning" spark={m?.sparks.upcoming} />
        <Kpi icon={History} label={t.overview.completed} value={m ? fmt.number(m.completed) : null} sub={t.overview.completedRevenue} tone="success" spark={m?.sparks.completed} />
        <Kpi icon={XCircle} label={t.overview.cancellations} value={m ? fmt.number(m.cancelled) : null} sub={m ? t.overview.cancelRate(fmt.percent(m.cancelRate)) : ""} tone="danger" spark={m?.sparks.cancelled} />
        <Kpi
          icon={CircleDollarSign}
          label={t.overview.revenue}
          value={m ? fmt.money(m.revenue) : null}
          sub={
            m && m.delta !== null ? (
              <span className={cn("inline-flex items-center gap-0.5", m.delta >= 0 ? "text-success-foreground" : "text-danger-foreground")}>
                {m.delta >= 0 ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
                {t.overview.vsLastMonth(fmt.percent(Math.abs(m.delta)))}
              </span>
            ) : (
              t.overview.completedRevenue
            )
          }
          tone="primary"
          spark={m?.sparks.revenue}
          className="sm:col-span-2 xl:col-span-1"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card>
          <CardHeader>
            <CardTitle>{t.overview.trendTitle}</CardTitle>
            <div className="hidden items-center gap-3 text-xs text-muted-foreground sm:flex">
              <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-sm bg-primary/60" />{t.overview.past}</span>
              <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-sm bg-primary/25" />{t.overview.future}</span>
            </div>
          </CardHeader>
          <CardContent>{m ? <ColumnChart data={m.trend} ariaLabel={t.overview.trendTitle} /> : <Skeleton className="h-[210px]" />}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t.overview.statusTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            {m ? (
              <Donut
                ariaLabel={t.overview.statusTitle}
                center={fmt.number(m.status.total)}
                sub={t.analytics.totalBookings}
                segments={[
                  { key: "completed", label: t.status.completed, value: m.status.completed, className: "text-success" },
                  { key: "confirmed", label: `${t.status.confirmed} / ${t.status.pending}`, value: m.status.confirmed, className: "text-primary" },
                  { key: "cancelled", label: t.status.cancelled, value: m.status.cancelled, className: "text-danger" },
                  { key: "no_show", label: t.status.no_show, value: m.status.no_show, className: "text-muted-foreground" },
                ]}
              />
            ) : (
              <Skeleton className="h-36" />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card>
          <CardHeader>
            <CardTitle>{t.overview.scheduleTitle}</CardTitle>
            <Button asChild variant="link" size="sm">
              <Link href={`${base}/calendar`}>{t.overview.viewAll}</Link>
            </Button>
          </CardHeader>
          <CardContent className="px-2 pb-2 pt-3 sm:px-3">
            {!m || !catalog.ready ? (
              <div className="grid gap-2 p-2">
                {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-14" />)}
              </div>
            ) : m.today.length === 0 ? (
              <EmptyState icon={CalendarCheck2} title={t.overview.scheduleEmpty} />
            ) : (
              <ul className="grid">
                {(m.today.filter((b) => Date.parse(b.end) >= now.getTime()).length ? m.today.filter((b) => Date.parse(b.end) >= now.getTime()) : m.today).slice(0, 8).map((b) => {
                  const c = catalog.customer(b.customerId);
                  const s = catalog.service(b.serviceId);
                  const st = catalog.resource(b.staffId);
                  const past = Date.parse(b.end) < now.getTime();
                  return (
                    <li key={b.id}>
                      <button
                        type="button"
                        onClick={() => openBooking(b.id)}
                        className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-start transition-colors hover:bg-muted", past && "opacity-60")}
                      >
                        <span className="w-12 shrink-0 text-sm font-semibold tabular" dir="ltr">{fmt.time(b.start)}</span>
                        <Avatar name={c?.name ?? "?"} hue={st?.hue ?? 220} size="sm" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">{c?.name}</span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {s ? tx(s.name) : ""} · {st ? tx(st.name) : ""}
                          </span>
                        </span>
                        <StatusBadge status={b.status} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="grid content-start gap-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.overview.activityTitle}</CardTitle>
            </CardHeader>
            <CardContent className="pt-3">
              {!activity.data ? (
                <div className="grid gap-3">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-9" />)}</div>
              ) : activity.data.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t.overview.activityEmpty}</p>
              ) : (
                <ol className="grid gap-3.5">
                  {activity.data.map((a) => (
                    <li key={a.id}>
                      <ActivityLine entry={a} onOpen={a.bookingId ? () => openBooking(a.bookingId!) : undefined} />
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
          {m && m.topServices.length ? (
            <Card>
              <CardHeader>
                <CardTitle>{t.nav.services} · {t.overview.upcoming}</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <BarList items={m.topServices.map(([id, n]) => ({ key: id, label: catalog.service(id) ? tx(catalog.service(id)!.name) : id, value: n }))} format={fmt.number} />
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}

const toneClass = {
  primary: "bg-primary-soft text-primary-soft-foreground",
  warning: "bg-warning-soft text-warning-foreground",
  success: "bg-success-soft text-success-foreground",
  danger: "bg-danger-soft text-danger-foreground",
};
const toneStroke = { primary: "text-primary", warning: "text-warning", success: "text-success", danger: "text-danger" };

/** Tiny trend line; decorative (the figure itself carries the meaning). */
function Sparkline({ values, tone }: { values: number[]; tone: keyof typeof toneStroke }) {
  const max = Math.max(1, ...values);
  const w = 96;
  const h = 28;
  const step = w / Math.max(1, values.length - 1);
  const pts = values.map((v, i) => [i * step, h - 2 - (v / max) * (h - 4)] as const);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const id = `spark-${tone}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} aria-hidden preserveAspectRatio="none" className={cn("h-8 w-full overflow-visible rtl:-scale-x-100", toneStroke[tone])}>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.22" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L${w},${h} L0,${h} Z`} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke="currentColor" strokeWidth="1.75" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Kpi({ icon: Icon, label, value, sub, tone, spark, className }: {
  icon: LucideIcon;
  label: string;
  value: string | null;
  sub: React.ReactNode;
  tone: keyof typeof toneClass;
  spark?: number[];
  className?: string;
}) {
  return (
    <Card className={cn("group relative overflow-hidden p-5 transition-shadow hover:shadow-md", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
        <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-105", toneClass[tone])}>
          <Icon className="size-4" aria-hidden />
        </span>
      </div>
      {value === null ? <Skeleton className="mt-2 h-8 w-24" /> : <p className="mt-1 truncate text-[28px] font-semibold leading-tight tracking-tight tabular">{value}</p>}
      <p className="mt-1 truncate text-xs text-muted-foreground">{sub}</p>
      <div className="-mx-1 mt-3 h-8">{spark ? <Sparkline values={spark} tone={tone} /> : null}</div>
    </Card>
  );
}

export function ActivityLine({ entry, onOpen }: { entry: ActivityEntry; onOpen?: () => void }) {
  const { t, locale } = useI18n();
  const { fmt } = useBusiness();
  const a = t.overview.activity;
  const ref = entry.params.reference ?? "";
  const text = (() => {
    switch (entry.type) {
      case "service_saved":
        return a.service_saved(locale === "ar" ? entry.params.serviceAr : entry.params.service);
      case "hours_updated":
        return a.hours_updated((locale === "ar" ? entry.params.resourceAr : entry.params.resource) ?? "");
      case "settings_updated":
        return a.settings_updated();
      default:
        return a[entry.type](ref);
    }
  })();
  const dot = {
    created: "bg-primary",
    confirmed: "bg-primary",
    rescheduled: "bg-warning",
    cancelled: "bg-danger",
    completed: "bg-success",
    no_show: "bg-muted-foreground",
    service_saved: "bg-chart-2",
    hours_updated: "bg-chart-2",
    settings_updated: "bg-chart-2",
  }[entry.type];
  const content = (
    <>
      <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", dot)} aria-hidden />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm">{text}</span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="size-3" aria-hidden /> {fmt.dateTime(entry.at)}
        </span>
      </span>
    </>
  );
  return onOpen ? (
    <button type="button" onClick={onOpen} className="-mx-2 flex w-[calc(100%+1rem)] items-start gap-3 rounded-md px-2 py-1 text-start transition-colors hover:bg-muted">
      {content}
    </button>
  ) : (
    <div className="flex items-start gap-3">{content}</div>
  );
}
