"use client";

import { useMemo, useState } from "react";
import { BarList, ColumnChart, Donut } from "@/components/charts/charts";
import { useWeekStart } from "@/components/booking/month-calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Segmented } from "@/components/ui/segmented";
import { Skeleton } from "@/components/ui/skeleton";
import { addDaysToKey, parseHM, toDateKey, weekdayOfKey } from "@/domain/time";
import type { Weekday } from "@/domain/types";
import { useBusiness, useRepoQuery, useRepository } from "@/data/repository-context";
import { useCatalog } from "@/hooks/use-catalog";
import { useI18n } from "@/i18n/provider";
import { PageHeader } from "./shell";

export function Analytics() {
  const { t, tx } = useI18n();
  const { business, fmt } = useBusiness();
  const repo = useRepository();
  const catalog = useCatalog();
  const weekStart = useWeekStart();
  const [period, setPeriod] = useState<"30" | "90">("30");
  const todayKey = toDateKey(repo.now(), business.timezone);
  const fromKey = addDaysToKey(todayKey, -Number(period) + 1);
  const { data } = useRepoQuery((r) => r.listBookings({ fromKey, toKey: todayKey }), [fromKey, todayKey]);

  const a = useMemo(() => {
    if (!data || !catalog.ready) return null;
    const nowMs = repo.now().getTime();
    const past = data.filter((b) => Date.parse(b.start) <= nowMs);
    const completed = past.filter((b) => b.status === "completed");
    const revenue = completed.reduce((n, b) => n + b.price, 0);
    const byService = new Map<string, number>();
    for (const b of completed) byService.set(b.serviceId, (byService.get(b.serviceId) ?? 0) + b.price);
    const byStaff = new Map<string, { n: number; minutes: number }>();
    for (const b of past.filter((x) => x.status === "completed" || x.status === "no_show")) {
      const cur = byStaff.get(b.staffId) ?? { n: 0, minutes: 0 };
      cur.n += 1;
      // Group-session seats share time: count each session's minutes once.
      cur.minutes += (Date.parse(b.end) - Date.parse(b.start)) / 60_000 / ((catalog.service(b.serviceId)?.capacity ?? 1) > 1 ? Math.max(1, past.filter((x) => x.start === b.start && x.staffId === b.staffId && x.serviceId === b.serviceId).length) : 1);
      byStaff.set(b.staffId, cur);
    }
    const days = Number(period);
    const scheduled = (staffId: string) => {
      const s = catalog.resource(staffId);
      if (!s) return 0;
      let total = 0;
      for (let i = 0; i < days; i++) {
        const k = addDaysToKey(fromKey, i);
        if (business.rules.closedDates.includes(k)) continue;
        const wd = weekdayOfKey(k);
        total += s.weeklyHours[wd].reduce((n, r) => n + parseHM(r.end) - parseHM(r.start), 0);
      }
      return total;
    };
    const weekdayCounts = Array.from({ length: 7 }, () => 0);
    for (const b of past) if (b.status !== "cancelled") weekdayCounts[weekdayOfKey(toDateKey(b.start, business.timezone))] += 1;
    const sources = new Map<string, number>();
    for (const b of past) sources.set(b.source, (sources.get(b.source) ?? 0) + 1);
    return {
      total: past.length,
      revenue,
      avg: completed.length ? revenue / completed.length : 0,
      noShow: past.length ? past.filter((b) => b.status === "no_show").length / past.length : 0,
      cancel: past.length ? past.filter((b) => b.status === "cancelled").length / past.length : 0,
      byService: [...byService.entries()].sort((x, y) => y[1] - x[1]),
      byStaff: [...byStaff.entries()].map(([id, v]) => ({ id, ...v, util: scheduled(id) ? v.minutes / scheduled(id) : 0 })).sort((x, y) => y.n - x.n),
      weekdays: Array.from({ length: 7 }, (_, i) => (weekStart + i) % 7).map((d) => ({ key: String(d), label: t.weekdays.short[d as Weekday], value: weekdayCounts[d] })),
      sources: [...sources.entries()],
    };
  }, [data, catalog, repo, period, fromKey, business, weekStart, t]);

  const kpis = a
    ? [
        [t.analytics.totalBookings, fmt.number(a.total)],
        [t.analytics.revenue, fmt.money(a.revenue)],
        [t.analytics.avgValue, fmt.money(a.avg)],
        [t.analytics.cancelRate, fmt.percent(a.cancel)],
        [t.analytics.noShowRate, fmt.percent(a.noShow)],
      ]
    : [];

  return (
    <div>
      <PageHeader
        title={t.analytics.title}
        subtitle={t.analytics.subtitle}
        actions={<Segmented ariaLabel={t.analytics.title} value={period} onValueChange={setPeriod} options={(["30", "90"] as const).map((p) => ({ value: p, label: t.analytics.period[p] }))} />}
      />
      {!a ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">{Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      ) : a.total === 0 ? (
        <Card><CardContent><p className="py-10 text-center text-sm text-muted-foreground">{t.analytics.noData}</p></CardContent></Card>
      ) : (
        <div className="grid gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {kpis.map(([k, v]) => (
              <Card key={k} className="p-5">
                <p className="text-[13px] font-medium text-muted-foreground">{k}</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight tabular">{v}</p>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>{t.analytics.byService}</CardTitle></CardHeader>
              <CardContent className="pt-4">
                <BarList format={fmt.money} items={a.byService.map(([id, v]) => ({ key: id, label: catalog.service(id) ? tx(catalog.service(id)!.name) : id, value: v }))} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t.analytics.byStaff}</CardTitle>
                <span className="text-xs text-muted-foreground">{t.analytics.utilisation}: {t.analytics.utilisationHint}</span>
              </CardHeader>
              <CardContent className="pt-4">
                <BarList
                  format={fmt.number}
                  items={a.byStaff.map((s) => ({
                    key: s.id,
                    label: catalog.resource(s.id) ? tx(catalog.resource(s.id)!.name) : s.id,
                    value: s.n,
                    sub: `${t.analytics.utilisation} ${fmt.percent(Math.min(1, s.util))}`,
                  }))}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>{t.analytics.byWeekday}</CardTitle></CardHeader>
              <CardContent><ColumnChart ariaLabel={t.analytics.byWeekday} data={a.weekdays} /></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>{t.analytics.bySource}</CardTitle></CardHeader>
              <CardContent>
                <Donut
                  ariaLabel={t.analytics.bySource}
                  center={fmt.number(a.total)}
                  sub={t.analytics.totalBookings}
                  segments={a.sources.map(([k, v], i) => ({
                    key: k,
                    label: t.source[k as keyof typeof t.source],
                    value: v,
                    className: ["text-chart-1", "text-chart-2", "text-chart-3", "text-chart-4"][i % 4],
                  }))}
                />
              </CardContent>
            </Card>
          </div>
          <p className="text-xs text-muted-foreground">{t.analytics.note}</p>
        </div>
      )}
    </div>
  );
}
