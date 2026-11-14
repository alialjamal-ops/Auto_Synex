"use client";

import {
  CalendarClock,
  CheckCheck,
  CircleCheck,
  CircleSlash,
  Clock,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  UserRound,
  UserX,
  XCircle,
} from "lucide-react";
import { Dialog as RadixDialog } from "radix-ui";
import { createContext, useContext, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { AlternativeList, SlotPicker, type SlotSelection } from "@/components/booking/slot-picker";
import { StatusBadge } from "@/components/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogContent, DialogFooter, SheetContent } from "@/components/ui/dialog";
import { Field, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { Alternative, BookingErrorCode } from "@/domain/availability";
import { toDateKey } from "@/domain/time";
import type { Booking } from "@/domain/types";
import { RepositoryError } from "@/data/repository";
import { useBusiness, useRepoQuery, useRepository } from "@/data/repository-context";
import { useCatalog } from "@/hooks/use-catalog";
import { useI18n } from "@/i18n/provider";

const OpenBookingContext = createContext<(id: string) => void>(() => {});
export const useOpenBooking = () => useContext(OpenBookingContext);

export function BookingDetailsProvider({ children }: { children: ReactNode }) {
  const [id, setId] = useState<string | null>(null);
  return (
    <OpenBookingContext.Provider value={setId}>
      {children}
      <RadixDialog.Root open={!!id} onOpenChange={(o) => !o && setId(null)}>
        {id ? <BookingDetailsSheet id={id} /> : null}
      </RadixDialog.Root>
    </OpenBookingContext.Provider>
  );
}

function BookingDetailsSheet({ id }: { id: string }) {
  const { t, tx } = useI18n();
  const { business, fmt } = useBusiness();
  const repo = useRepository();
  const catalog = useCatalog();
  const { data: booking, loading } = useRepoQuery((r) => r.getBooking(id), [id]);
  const [busy, setBusy] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);

  if (loading && !booking) {
    return (
      <SheetContent title={t.details.title}>
        <div className="grid gap-4 p-5">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-24" />
          <Skeleton className="h-40" />
        </div>
      </SheetContent>
    );
  }
  if (!booking) {
    return (
      <SheetContent title={t.details.title}>
        <p className="p-5 text-sm text-muted-foreground">{t.details.notFound}</p>
      </SheetContent>
    );
  }

  const service = catalog.service(booking.serviceId);
  const staff = catalog.resource(booking.staffId);
  const customer = catalog.customer(booking.customerId);
  const branch = business.branches.find((b) => b.id === booking.branchId);
  const open = booking.status === "pending" || booking.status === "confirmed";
  const started = Date.parse(booking.start) <= repo.now().getTime();

  async function act(fn: () => Promise<unknown>, message: string) {
    setBusy(true);
    try {
      await fn();
      toast.success(message);
    } catch (e) {
      toast.error(e instanceof RepositoryError ? e.message : t.common.errorGeneric);
    } finally {
      setBusy(false);
    }
  }

  return (
    <SheetContent title={<span dir="ltr" className="font-mono">{booking.reference}</span>} description={t.details.title}>
      <div className="grid gap-6 p-5">
        <div className="flex items-center justify-between gap-3">
          <StatusBadge status={booking.status} />
          <span className="text-lg font-semibold tabular">{fmt.money(booking.price)}</span>
        </div>

        <section className="grid gap-3 rounded-xl border p-4 text-sm">
          <Row icon={Sparkles}>
            <span className="font-medium">{service ? tx(service.name) : "—"}</span>
            {booking.seats > 1 ? <span className="text-muted-foreground"> · {t.common.seats(booking.seats)}</span> : null}
          </Row>
          <Row icon={Clock}>
            {fmt.dateLong(booking.start)} · <span dir="ltr">{fmt.time(booking.start)}–{fmt.time(booking.end)}</span>
          </Row>
          {staff ? (
            <Row icon={UserRound}>
              {tx(staff.name)} <span className="text-muted-foreground">· {tx(staff.title)}</span>
            </Row>
          ) : null}
          {branch ? <Row icon={MapPin}>{tx(branch.name)}</Row> : null}
          {booking.resourceIds.length ? (
            <Row icon={CheckCheck}>
              <span className="text-muted-foreground">{t.details.resources}: </span>
              {booking.resourceIds.map((rid) => (catalog.resource(rid) ? tx(catalog.resource(rid)!.name) : rid)).join(" · ")}
            </Row>
          ) : null}
        </section>

        {customer ? (
          <section className="grid gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.booking.customer}</h3>
            <div className="flex items-center gap-3">
              <Avatar name={customer.name} hue={210} />
              <div className="min-w-0">
                <p className="truncate font-medium">{customer.name}</p>
                <p className="text-xs text-muted-foreground">
                  {t.customers.stats.total}: {customer.totalBookings} · {t.customers.stats.value}: {fmt.money(customer.lifetimeValue)}
                </p>
              </div>
            </div>
            <div className="grid gap-1.5 text-sm">
              <a href={`tel:${customer.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground" dir="ltr">
                <Phone className="size-3.5" /> {customer.phone}
              </a>
              <a href={`mailto:${customer.email}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground" dir="ltr">
                <Mail className="size-3.5" /> {customer.email}
              </a>
            </div>
          </section>
        ) : null}

        {booking.notes ? (
          <section className="grid gap-1.5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.details.notes}</h3>
            <p className="rounded-lg bg-subtle p-3 text-sm">{booking.notes}</p>
          </section>
        ) : null}
        {booking.cancelReason ? (
          <section className="grid gap-1.5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.details.cancelReason}</h3>
            <p className="rounded-lg bg-danger-soft/50 p-3 text-sm">{booking.cancelReason}</p>
          </section>
        ) : null}

        {open ? (
          <section className="grid gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.details.actions}</h3>
            <div className="grid grid-cols-2 gap-2">
              {booking.status === "pending" ? (
                <Button className="col-span-2" disabled={busy} onClick={() => act(() => repo.updateBookingStatus(booking.id, "confirmed"), t.details.updated)}>
                  <CircleCheck /> {t.details.confirm}
                </Button>
              ) : null}
              <Button variant="secondary" disabled={busy} onClick={() => setRescheduleOpen(true)}>
                <CalendarClock /> {t.details.reschedule}
              </Button>
              <Button variant="destructive-soft" disabled={busy} onClick={() => setCancelOpen(true)}>
                <XCircle /> {t.details.cancel}
              </Button>
              <Button
                variant="secondary"
                disabled={busy || !started}
                title={!started ? t.details.notStartedYet : undefined}
                onClick={() => act(() => repo.updateBookingStatus(booking.id, "completed"), t.details.updated)}
              >
                <CheckCheck /> {t.details.complete}
              </Button>
              <Button
                variant="secondary"
                disabled={busy || !started}
                title={!started ? t.details.notStartedYet : undefined}
                onClick={() => act(() => repo.updateBookingStatus(booking.id, "no_show"), t.details.updated)}
              >
                <UserX /> {t.details.noShow}
              </Button>
            </div>
            {!started ? <p className="text-xs text-muted-foreground">{t.details.notStartedYet}: {t.details.complete} / {t.details.noShow}</p> : null}
          </section>
        ) : null}

        <section className="grid gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.details.history}</h3>
          <ol className="relative grid gap-4 border-s ps-5">
            {[...booking.history].reverse().map((h, i) => (
              <li key={i} className="relative text-sm">
                <span className="absolute -start-[25px] top-1 size-2.5 rounded-full border-2 border-card bg-primary" aria-hidden />
                <p className="font-medium">{t.details.event[h.type]}</p>
                <p className="text-xs text-muted-foreground">{fmt.dateTime(h.at)}</p>
                {h.type === "rescheduled" && h.note ? (
                  <p className="text-xs text-muted-foreground">{t.details.previously(fmt.dateTime(h.note))}</p>
                ) : h.note ? (
                  <p className="text-xs text-muted-foreground">{h.note}</p>
                ) : null}
              </li>
            ))}
          </ol>
          <p className="text-xs text-muted-foreground">
            {t.details.source}: {t.source[booking.source]} · {t.details.created}: {fmt.dateTime(booking.createdAt)}
          </p>
        </section>
      </div>

      <CancelDialog open={cancelOpen} onOpenChange={setCancelOpen} booking={booking} />
      <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
        {rescheduleOpen ? <RescheduleDialog booking={booking} onDone={() => setRescheduleOpen(false)} /> : null}
      </Dialog>
    </SheetContent>
  );
}

function Row({ icon: Icon, children }: { icon: typeof Clock; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function CancelDialog({ open, onOpenChange, booking }: { open: boolean; onOpenChange: (o: boolean) => void; booking: Booking }) {
  const { t } = useI18n();
  const repo = useRepository();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={t.details.cancelTitle} description={t.details.cancelBody} size="sm">
        <DialogBody>
          <Field label={t.details.reasonLabel} htmlFor="cancel-reason">
            <Textarea id="cancel-reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t.details.reasonPlaceholder} maxLength={200} />
          </Field>
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={busy}>
            {t.details.keep}
          </Button>
          <Button
            variant="destructive"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await repo.cancelBooking(booking.id, reason);
                toast.success(t.details.cancelled);
                onOpenChange(false);
              } catch (e) {
                toast.error(e instanceof RepositoryError ? e.message : t.common.errorGeneric);
              } finally {
                setBusy(false);
              }
            }}
          >
            <CircleSlash /> {t.details.cancel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RescheduleDialog({ booking, onDone }: { booking: Booking; onDone: () => void }) {
  const { t, tx } = useI18n();
  const { business } = useBusiness();
  const repo = useRepository();
  const catalog = useCatalog();
  const [staffId, setStaffId] = useState<string>(booking.staffId);
  const [slot, setSlot] = useState<SlotSelection>({ dateKey: toDateKey(booking.start, business.timezone) });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ code: BookingErrorCode; alternatives: Alternative[] } | null>(null);
  const eligible = catalog.staff.filter((s) => s.active && s.serviceIds.includes(booking.serviceId));

  async function submit() {
    if (!slot.start) return;
    setBusy(true);
    setError(null);
    try {
      const res = await repo.rescheduleBooking(booking.id, { start: slot.start, staffId });
      if (res.ok) {
        toast.success(t.details.rescheduled);
        onDone();
      } else setError({ code: res.code, alternatives: res.alternatives });
    } catch (e) {
      toast.error(e instanceof RepositoryError ? e.message : t.common.errorGeneric);
    } finally {
      setBusy(false);
    }
  }

  return (
    <DialogContent title={t.details.rescheduleTitle} description={t.details.rescheduleHint} size="xl">
      <DialogBody>
        <Field label={t.appointments.staff} htmlFor="rs-staff" className="max-w-xs">
          <Select
            id="rs-staff"
            value={staffId}
            onValueChange={(v) => {
              setStaffId(v);
              setSlot((s) => ({ dateKey: s.dateKey }));
            }}
            options={eligible.map((s) => ({ value: s.id, label: tx(s.name) }))}
          />
        </Field>
        <SlotPicker
          serviceId={booking.serviceId}
          staffId={staffId}
          seats={booking.seats}
          excludeBookingId={booking.id}
          value={slot}
          onChange={(v) => {
            setError(null);
            setSlot(v);
          }}
        />
        {error ? (
          <div role="alert" className="rounded-xl border border-danger/30 bg-danger-soft/50 p-4">
            <p className="text-sm font-medium text-danger-foreground">{t.booking.errors[error.code]}</p>
            <AlternativeList items={error.alternatives} onPick={(a) => setSlot({ dateKey: a.dateKey, start: a.start, staffId: a.staffId })} />
          </div>
        ) : null}
      </DialogBody>
      <DialogFooter>
        <Button variant="secondary" onClick={onDone} disabled={busy}>
          {t.common.cancel}
        </Button>
        <Button onClick={submit} disabled={!slot.start || busy}>
          <CalendarClock /> {busy ? t.common.saving : t.details.confirmReschedule}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
