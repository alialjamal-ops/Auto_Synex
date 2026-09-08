'use client';

import { SearchX, UserPlus, Users, Wallet } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  DataTable,
  EmptyState,
  FilterTabs,
  PageHeader,
  Panel,
  SearchInput,
  SkeletonRows,
  StatCard,
} from '@/components/dashboard/ui';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/hooks/use-locale';
import { useAppointmentBook } from '@/hooks/use-appointment-book';
import { cn } from '@/lib/cn';
import { formatDayShort } from '@/lib/date';
import { formatCompactMoney, formatMoney, initials } from '@/lib/format';
import type { CustomerRecord } from '@/lib/dashboard';
import type { DemoConfig } from '@/types/demo';

type Segment = 'all' | CustomerRecord['status'];

const SEGMENT_IDS: readonly Segment[] = ['all', 'active', 'new', 'lapsed'];

const statusStyle: Record<CustomerRecord['status'], string> = {
  active: 'bg-emerald-500/12 text-emerald-500',
  new: 'bg-[color:var(--brand-soft)] text-brand',
  lapsed: 'bg-amber-500/14 text-amber-500',
};

const PAGE_SIZE = 12;

export function CustomersView({ config, todayIso }: { config: DemoConfig; todayIso: string }) {
  const { ui, locale } = useLocale();
  const { customers, ready } = useAppointmentBook(config, todayIso);
  const [segment, setSegment] = useState<Segment>('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const symbol = config.booking.currencySymbol;

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return customers
      .filter((customer) => (segment === 'all' ? true : customer.status === segment))
      .filter((customer) =>
        term
          ? customer.name.toLowerCase().includes(term) || customer.email.toLowerCase().includes(term)
          : true,
      );
  }, [customers, segment, query]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const rows = filtered.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);

  const totalSpend = customers.reduce((total, customer) => total + customer.totalSpend, 0);
  const newCount = customers.filter((customer) => customer.status === 'new').length;

  return (
    <>
      <PageHeader
        title={config.dashboard.customerLabelPlural}
        subtitle={`${customers.length} ${ui.dashboard.customers.builtFrom}`}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          index={0}
          label={`${ui.dashboard.customers.total} ${config.dashboard.customerLabelPlural}`}
          value={String(customers.length)}
          icon={Users}
        />
        <StatCard
          index={1}
          label={ui.dashboard.customers.new}
          value={String(newCount)}
          hint={ui.dashboard.customers.firstVisit}
          icon={UserPlus}
        />
        <StatCard
          index={2}
          label={ui.dashboard.customers.lifetimeValue}
          value={formatCompactMoney(totalSpend, symbol)}
          icon={Wallet}
        />
      </div>

      <div className="mb-4 mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <FilterTabs
          options={SEGMENT_IDS.map((id) => ({
            id,
            label: id === 'all' ? ui.dashboard.filters.all : ui.dashboard.status[id],
          }))}
          value={segment}
          onChange={(value) => {
            setSegment(value);
            setPage(0);
          }}
          counts={{
            all: customers.length,
            active: customers.filter((customer) => customer.status === 'active').length,
            new: newCount,
            lapsed: customers.filter((customer) => customer.status === 'lapsed').length,
          }}
        />
        <SearchInput
          value={query}
          onChange={(value) => {
            setQuery(value);
            setPage(0);
          }}
          placeholder={ui.dashboard.filters.searchCustomers}
          className="lg:w-72"
        />
      </div>

      <Panel padded={false}>
        {ready && filtered.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title={ui.dashboard.filters.noCustomerMatches}
            text={ui.dashboard.filters.noCustomerMatchesText}
            action={
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setQuery('');
                  setSegment('all');
                }}
              >
                {ui.dashboard.filters.clearFilters}
              </Button>
            }
          />
        ) : (
          <>
            <DataTable
              head={[
                config.dashboard.customerLabel,
                ui.dashboard.table.contact,
                ui.dashboard.table.visits,
                ui.dashboard.table.lastVisit,
                ui.dashboard.table.nextVisit,
                ui.dashboard.table.favourite,
                ui.dashboard.table.spend,
                ui.dashboard.table.status,
              ]}
            >
              {!ready ? (
                <SkeletonRows rows={8} cols={8} />
              ) : (
                rows.map((customer) => (
                  <tr
                    key={customer.id}
                    className="transition-colors hover:bg-[color:var(--surface-alt)]"
                  >
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[color:var(--brand-soft)] text-[12px] font-medium text-brand">
                          {initials(customer.name)}
                        </span>
                        <span className="truncate text-[13.5px]">{customer.name}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[12.5px] text-muted">
                      <span className="block truncate">{customer.email}</span>
                      <span className="block">{customer.phone}</span>
                    </td>
                    <td className="px-5 py-3.5 text-[13px] tabular-nums">{customer.visits}</td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-[13px] text-muted">
                      {customer.lastVisit ? formatDayShort(customer.lastVisit, locale) : '—'}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-[13px]">
                      {customer.nextVisit ? (
                        <span className="text-brand">{formatDayShort(customer.nextVisit, locale)}</span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-muted">
                      <span className="block max-w-[12rem] truncate">{customer.favouriteService}</span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-[13px] tabular-nums">
                      {formatMoney(customer.totalSpend, symbol)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium capitalize',
                          statusStyle[customer.status],
                        )}
                      >
                        <span className="size-1.5 rounded-full bg-current" />
                        {ui.dashboard.status[customer.status]}
                      </span>
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
