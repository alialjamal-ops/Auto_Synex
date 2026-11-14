"use client";

import { ClipboardList, Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { StatusBadge } from "@/components/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Segmented } from "@/components/ui/segmented";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { addDaysToKey, toDateKey } from "@/domain/time";
import { BOOKING_STATUSES, type BookingStatus } from "@/domain/types";
import type { BookingFilter } from "@/data/repository";
import { useBusiness, useRepoQuery, useRepository } from "@/data/repository-context";
import { useCatalog } from "@/hooks/use-catalog";
import { useI18n } from "@/i18n/provider";
import { useOpenBooking } from "./booking-details";
import { PageHeader } from "./shell";

type Range = "upcoming" | "today" | "past" | "all";
const ALL = "all";
const PAGE = 30;

export function Appointments() {
  const { t, tx } = useI18n();
  const { business, fmt } = useBusiness();
  const repo = useRepository();
  const catalog = useCatalog();
  const openBooking = useOpenBooking();
  const params = useSearchParams();
  const router = useRouter();
  const [todayKey] = useState(() => toDateKey(repo.now(), business.timezone));

  const [range, setRange] = useState<Range>("upcoming");
  const [status, setStatus] = useState<string>(ALL);
  const [staffId, setStaffId] = useState<string>(ALL);
  const [serviceId, setServiceId] = useState<string>(ALL);
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(PAGE);

  // Deep link from the booking confirmation page: ?booking=<id>
  const deepLink = params.get("booking");
  useEffect(() => {
    if (!deepLink) return;
    openBooking(deepLink);
    router.replace(`/${business.id}/dashboard/appointments`, { scroll: false });
  }, [deepLink, openBooking, router, business.id]);

  const filter: BookingFilter = useMemo(() => {
    const f: BookingFilter = {};
    if (range === "upcoming") f.fromKey = todayKey;
    if (range === "today") {
      f.fromKey = todayKey;
      f.toKey = todayKey;
    }
    if (range === "past") f.toKey = addDaysToKey(todayKey, -1);
    if (status !== ALL) f.statuses = [status as BookingStatus];
    if (staffId !== ALL) f.staffId = staffId;
    if (serviceId !== ALL) f.serviceId = serviceId;
    if (search.trim()) f.search = search.trim();
    return f;
  }, [range, status, staffId, serviceId, search, todayKey]);

  const { data, loading } = useRepoQuery((r) => r.listBookings(filter), [filter]);
  const rows = useMemo(() => {
    const list = data ?? [];
    return range === "past" || range === "all" ? [...list].reverse() : list;
  }, [data, range]);
  const filtersActive = status !== ALL || staffId !== ALL || serviceId !== ALL || search !== "";
  const clear = () => {
    setStatus(ALL);
    setStaffId(ALL);
    setServiceId(ALL);
    setSearch("");
  };

  return (
    <div>
      <PageHeader title={t.appointments.title} subtitle={t.appointments.subtitle} />
      <Card>
        <div className="grid gap-3 border-b p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setLimit(PAGE);
                }}
                placeholder={t.appointments.searchPlaceholder}
                aria-label={t.appointments.searchPlaceholder}
                className="ps-9"
              />
            </div>
            <Segmented
              ariaLabel={t.appointments.title}
              value={range}
              onValueChange={(v) => {
                setRange(v);
                setLimit(PAGE);
              }}
              className="w-full overflow-x-auto lg:w-auto"
              options={(["upcoming", "today", "past", "all"] as const).map((r) => ({ value: r, label: t.appointments.range[r] }))}
            />
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:flex lg:items-center">
            <Select ariaLabel={t.appointments.status} className="lg:w-44" value={status} onValueChange={setStatus}
              options={[{ value: ALL, label: `${t.appointments.status}: ${t.common.all}` }, ...BOOKING_STATUSES.map((s) => ({ value: s, label: t.status[s] }))]} />
            <Select ariaLabel={t.appointments.staff} className="lg:w-52" value={staffId} onValueChange={setStaffId}
              options={[{ value: ALL, label: t.calendar.allStaff }, ...catalog.staff.map((s) => ({ value: s.id, label: tx(s.name) }))]} />
            <Select ariaLabel={t.appointments.service} className="lg:w-56" value={serviceId} onValueChange={setServiceId}
              options={[{ value: ALL, label: `${t.appointments.service}: ${t.common.all}` }, ...catalog.services.map((s) => ({ value: s.id, label: tx(s.name) }))]} />
            {filtersActive ? (
              <Button variant="ghost" size="sm" onClick={clear}>
                <X /> {t.appointments.clearFilters}
              </Button>
            ) : null}
            <span className="text-xs text-muted-foreground lg:ms-auto" aria-live="polite">
              {data ? t.appointments.count(rows.length) : ""}
            </span>
          </div>
        </div>

        {!data || !catalog.ready ? (
          <div className="grid gap-2 p-4">{Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title={t.appointments.empty}
            hint={t.appointments.emptyHint}
            action={filtersActive ? <Button variant="secondary" size="sm" onClick={clear}>{t.appointments.clearFilters}</Button> : undefined}
          />
        ) : (
          <div className={loading ? "opacity-70 transition-opacity" : "transition-opacity"}>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-start text-xs text-muted-foreground">
                    {(["when", "customer", "service", "staff", "status", "price"] as const).map((c) => (
                      <th key={c} scope="col" className={`px-4 py-2.5 font-medium ${c === "price" ? "text-end" : "text-start"}`}>
                        {t.appointments.columns[c]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, limit).map((b) => {
                    const c = catalog.customer(b.customerId);
                    const s = catalog.service(b.serviceId);
                    const st = catalog.resource(b.staffId);
                    return (
                      <tr
                        key={b.id}
                        tabIndex={0}
                        onClick={() => openBooking(b.id)}
                        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), openBooking(b.id))}
                        className="cursor-pointer border-b transition-colors last:border-0 hover:bg-muted/60 focus-visible:bg-muted/60"
                      >
                        <td className="whitespace-nowrap px-4 py-3">
                          <p className="font-medium">{fmt.dateShort(b.start)}</p>
                          <p className="text-xs text-muted-foreground" dir="ltr">{fmt.time(b.start)}–{fmt.time(b.end)}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={c?.name ?? "?"} hue={210} size="sm" />
                            <div className="min-w-0">
                              <p className="truncate font-medium">{c?.name}</p>
                              <p className="font-mono text-[11px] text-muted-foreground" dir="ltr">{b.reference}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="truncate">{s ? tx(s.name) : ""}</p>
                          <p className="text-xs text-muted-foreground">{t.source[b.source]}{b.seats > 1 ? ` · ${t.common.seats(b.seats)}` : ""}</p>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{st ? tx(st.name) : ""}</td>
                        <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                        <td className="px-4 py-3 text-end font-medium tabular">{fmt.money(b.price)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Mobile cards */}
            <ul className="divide-y md:hidden">
              {rows.slice(0, limit).map((b) => {
                const c = catalog.customer(b.customerId);
                const s = catalog.service(b.serviceId);
                const st = catalog.resource(b.staffId);
                return (
                  <li key={b.id}>
                    <button type="button" onClick={() => openBooking(b.id)} className="grid w-full gap-1.5 px-4 py-3.5 text-start hover:bg-muted/60">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate font-medium">{c?.name}</span>
                        <StatusBadge status={b.status} />
                      </span>
                      <span className="truncate text-sm text-muted-foreground">{s ? tx(s.name) : ""} · {st ? tx(st.name) : ""}</span>
                      <span className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{fmt.dateShort(b.start)} · <span dir="ltr">{fmt.time(b.start)}</span></span>
                        <span className="font-medium text-foreground tabular">{fmt.money(b.price)}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {rows.length > limit ? (
              <div className="border-t p-3 text-center">
                <Button variant="ghost" size="sm" onClick={() => setLimit((l) => l + PAGE)}>
                  {t.common.showMore} ({rows.length - limit})
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </Card>
    </div>
  );
}
