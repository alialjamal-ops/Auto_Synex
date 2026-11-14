"use client";

import { Mail, Phone, Search, Users } from "lucide-react";
import { Dialog as RadixDialog } from "radix-ui";
import { useState } from "react";
import { StatusBadge } from "@/components/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { SheetContent } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { CustomerSummary } from "@/data/repository";
import { useBusiness, useRepoQuery } from "@/data/repository-context";
import { useCatalog } from "@/hooks/use-catalog";
import { useI18n } from "@/i18n/provider";
import { useOpenBooking } from "./booking-details";
import { PageHeader } from "./shell";

export function Customers() {
  const { t, tx } = useI18n();
  const { business, fmt } = useBusiness();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CustomerSummary | null>(null);
  const { data, loading } = useRepoQuery((r) => r.listCustomers(search), [search]);

  return (
    <div>
      <PageHeader title={tx(business.customerNoun.plural)} subtitle={t.customers.subtitle} />
      <Card>
        <div className="border-b p-4">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.customers.searchPlaceholder} aria-label={t.customers.searchPlaceholder} className="ps-9" />
          </div>
        </div>
        {!data ? (
          <div className="grid gap-2 p-4">{Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : data.length === 0 ? (
          <EmptyState icon={Users} title={t.customers.empty} />
        ) : (
          <div className={loading ? "opacity-70" : undefined}>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    {(["name", "contact", "visits", "upcoming", "value", "last"] as const).map((c) => (
                      <th key={c} scope="col" className={`px-4 py-2.5 font-medium ${c === "value" || c === "visits" || c === "upcoming" ? "text-end" : "text-start"}`}>
                        {t.customers.columns[c]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((c) => (
                    <tr
                      key={c.id}
                      tabIndex={0}
                      onClick={() => setSelected(c)}
                      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setSelected(c))}
                      className="cursor-pointer border-b transition-colors last:border-0 hover:bg-muted/60 focus-visible:bg-muted/60"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={c.name} hue={210} size="sm" />
                          <span className="font-medium">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <p dir="ltr" className="text-start rtl:text-end">{c.phone}</p>
                        <p dir="ltr" className="text-xs text-start rtl:text-end">{c.email}</p>
                      </td>
                      <td className="px-4 py-3 text-end tabular">{c.completed}</td>
                      <td className="px-4 py-3 text-end tabular">{c.upcoming}</td>
                      <td className="px-4 py-3 text-end font-medium tabular">{fmt.money(c.lifetimeValue)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{c.lastVisit ? fmt.date(c.lastVisit) : t.customers.never}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="divide-y md:hidden">
              {data.map((c) => (
                <li key={c.id}>
                  <button type="button" onClick={() => setSelected(c)} className="flex w-full items-center gap-3 px-4 py-3 text-start hover:bg-muted/60">
                    <Avatar name={c.name} hue={210} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{c.name}</span>
                      <span className="block truncate text-xs text-muted-foreground" dir="ltr">{c.phone}</span>
                    </span>
                    <span className="text-end text-sm">
                      <span className="block font-medium tabular">{fmt.money(c.lifetimeValue)}</span>
                      <span className="block text-xs text-muted-foreground">{t.customers.columns.visits}: {c.completed}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>
      <RadixDialog.Root open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        {selected ? <CustomerSheet customer={selected} /> : null}
      </RadixDialog.Root>
    </div>
  );
}

function CustomerSheet({ customer }: { customer: CustomerSummary }) {
  const { t, tx } = useI18n();
  const { fmt } = useBusiness();
  const catalog = useCatalog();
  const openBooking = useOpenBooking();
  const { data } = useRepoQuery((r) => r.listBookings({ customerId: customer.id }), [customer.id]);
  const live = catalog.customer(customer.id) ?? customer;
  return (
    <SheetContent title={customer.name} description={t.customers.since(fmt.date(customer.createdAt))}>
      <div className="grid gap-6 p-5">
        <div className="grid gap-1.5 text-sm">
          <a href={`tel:${customer.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground" dir="ltr">
            <Phone className="size-3.5" /> {customer.phone}
          </a>
          <a href={`mailto:${customer.email}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground" dir="ltr">
            <Mail className="size-3.5" /> {customer.email}
          </a>
        </div>
        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            [t.customers.stats.total, String(live.totalBookings)],
            [t.customers.stats.completed, String(live.completed)],
            [t.customers.stats.cancelled, String(live.cancelled)],
            [t.customers.stats.value, fmt.money(live.lifetimeValue)],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg border p-3">
              <dt className="text-[11px] text-muted-foreground">{k}</dt>
              <dd className="mt-0.5 truncate font-semibold tabular">{v}</dd>
            </div>
          ))}
        </dl>
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.customers.bookings}</h3>
          {!data ? (
            <Skeleton className="h-32" />
          ) : data.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.customers.noBookings}</p>
          ) : (
            <ul className="divide-y rounded-xl border">
              {[...data].reverse().map((b) => {
                const s = catalog.service(b.serviceId);
                return (
                  <li key={b.id}>
                    <button type="button" onClick={() => openBooking(b.id)} className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-start hover:bg-muted/60">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{s ? tx(s.name) : ""}</span>
                        <span className="block text-xs text-muted-foreground">{fmt.dateShort(b.start)} · <span dir="ltr">{fmt.time(b.start)}</span></span>
                      </span>
                      <StatusBadge status={b.status} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </SheetContent>
  );
}
