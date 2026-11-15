"use client";

import { CalendarPlus, CornerDownLeft, ExternalLink, Languages, Search, SunMoon, UserRound, type LucideIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { Dialog as D } from "radix-ui";
import { useEffect, useMemo, useRef, useState } from "react";
import { statusDot } from "@/components/status-badge";
import { useBusiness, useRepoQuery } from "@/data/repository-context";
import { useCatalog } from "@/hooks/use-catalog";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";
import { useOpenBooking } from "./booking-details";

interface Item {
  id: string;
  group: string;
  label: string;
  sub?: string;
  icon?: LucideIcon;
  dot?: string;
  run: () => void;
}

export interface PaletteNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/** ⌘K / Ctrl+K launcher: pages, quick actions, bookings and customers. */
export function CommandPalette({
  open,
  onOpenChange,
  nav,
  onNewBooking,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  nav: PaletteNavItem[];
  onNewBooking: () => void;
}) {
  const { t, tx, locale, setLocale } = useI18n();
  const { business, fmt } = useBusiness();
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();
  const catalog = useCatalog();
  const openBooking = useOpenBooking();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const q = query.trim();
  const bookings = useRepoQuery((r) => (open && q.length >= 2 ? r.listBookings({ search: q }) : Promise.resolve([])), [open, q]);
  const customers = useRepoQuery((r) => (open && q.length >= 2 ? r.listCustomers(q) : Promise.resolve([])), [open, q]);

  const items = useMemo<Item[]>(() => {
    const close = () => onOpenChange(false);
    const match = (s: string) => !q || s.toLowerCase().includes(q.toLowerCase());
    const pages: Item[] = nav
      .filter((n) => match(n.label))
      .map((n) => ({ id: n.href, group: t.palette.pages, label: n.label, icon: n.icon, run: () => (close(), router.push(n.href)) }));
    const actions: Item[] = [
      { id: "new", group: t.palette.actions, label: t.nav.newBooking, icon: CalendarPlus, run: () => (close(), onNewBooking()) },
      { id: "portal", group: t.palette.actions, label: t.nav.viewPortal, icon: ExternalLink, run: () => (close(), window.open(`/${business.id}/book`, "_blank")) },
      { id: "lang", group: t.palette.actions, label: `${t.common.language}: ${t.common.switchLanguage}`, icon: Languages, run: () => (close(), setLocale(locale === "en" ? "ar" : "en")) },
      { id: "theme", group: t.palette.actions, label: t.palette.switchTheme, icon: SunMoon, run: () => (close(), setTheme(resolvedTheme === "dark" ? "light" : "dark")) },
    ].filter((a) => match(a.label));
    const bookingItems: Item[] = (bookings.data ?? []).slice(0, 6).map((b) => {
      const c = catalog.customer(b.customerId);
      const s = catalog.service(b.serviceId);
      return {
        id: b.id,
        group: t.palette.bookings,
        label: `${c?.name ?? ""} · ${b.reference}`,
        sub: `${s ? tx(s.name) : ""} · ${fmt.dateTime(b.start)}`,
        dot: statusDot[b.status],
        run: () => (close(), openBooking(b.id)),
      };
    });
    const customerItems: Item[] = (customers.data ?? []).slice(0, 4).map((c) => ({
      id: c.id,
      group: t.palette.customers,
      label: c.name,
      sub: c.phone,
      icon: UserRound,
      run: () => (close(), router.push(`/${business.id}/dashboard/appointments?q=${encodeURIComponent(c.name)}`)),
    }));
    return [...bookingItems, ...customerItems, ...pages, ...actions];
  }, [q, nav, t, tx, fmt, bookings.data, customers.data, catalog, business.id, locale, resolvedTheme, router, setLocale, setTheme, onOpenChange, onNewBooking, openBooking]);

  const current = Math.min(active, Math.max(0, items.length - 1));

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const next = (current + (e.key === "ArrowDown" ? 1 : -1) + items.length) % Math.max(1, items.length);
      setActive(next);
      listRef.current?.querySelector(`[data-index="${next}"]`)?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter" && items[current]) {
      e.preventDefault();
      items[current].run();
    }
  };

  let lastGroup = "";
  return (
    <D.Root
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) {
          setQuery("");
          setActive(0);
        }
      }}
    >
      <D.Portal>
        <D.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <D.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-[12vh] z-50 flex max-h-[70vh] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 flex-col overflow-hidden rounded-2xl border bg-popover shadow-lg outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <D.Title className="sr-only">{t.palette.trigger}</D.Title>
          <div className="flex items-center gap-3 border-b px-4">
            <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <input
              autoFocus
              role="combobox"
              aria-expanded
              aria-controls="palette-list"
              aria-activedescendant={items[current] ? `palette-${current}` : undefined}
              aria-label={t.palette.placeholder}
              placeholder={t.palette.placeholder}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={onKeyDown}
              className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <div ref={listRef} id="palette-list" role="listbox" aria-label={t.palette.trigger} className="min-h-0 flex-1 overflow-y-auto p-2">
            {items.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">{bookings.loading || customers.loading ? t.common.loading : t.palette.empty}</p>
            ) : (
              items.map((item, i) => {
                const header = item.group !== lastGroup ? item.group : null;
                lastGroup = item.group;
                const Icon = item.icon;
                return (
                  <div key={item.id}>
                    {header ? <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground first:pt-1">{header}</p> : null}
                    <button
                      type="button"
                      role="option"
                      id={`palette-${i}`}
                      data-index={i}
                      aria-selected={i === current}
                      onMouseMove={() => setActive(i)}
                      onClick={item.run}
                      className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2 text-start text-sm", i === current && "bg-muted")}
                    >
                      {Icon ? <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden /> : <span className={cn("mx-1 size-2 shrink-0 rounded-full", item.dot)} aria-hidden />}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{item.label}</span>
                        {item.sub ? <span className="block truncate text-xs text-muted-foreground">{item.sub}</span> : null}
                      </span>
                      {i === current ? <CornerDownLeft className="size-3.5 shrink-0 text-muted-foreground rtl:-scale-x-100" aria-hidden /> : null}
                    </button>
                  </div>
                );
              })
            )}
          </div>
          <p className="hidden border-t px-4 py-2 text-[11px] text-muted-foreground sm:block">{t.palette.hint}</p>
        </D.Content>
      </D.Portal>
    </D.Root>
  );
}
