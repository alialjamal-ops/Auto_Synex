"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarClock, CalendarPlus, Clock, MapPin, Search, SearchX, ShieldCheck, Sparkles, UserRound, XCircle } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { StatusBadge } from "@/components/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogBody, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toDateKey } from "@/domain/time";
import { RepositoryError } from "@/data/repository";
import { useBusiness, useRepoQuery, useRepository } from "@/data/repository-context";
import { useCatalog } from "@/hooks/use-catalog";
import { useI18n } from "@/i18n/provider";
import { SlotPicker, type SlotSelection } from "./slot-picker";

const REF_RE = /^GN-[A-Z0-9]{6}$/i;

export function ManageBooking() {
  const { t } = useI18n();
  const { business } = useBusiness();
  const repo = useRepository();
  const reduce = useReducedMotion();
  const params = useSearchParams();
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);

  const schema = useMemo(
    () =>
      z.object({
        reference: z.string().trim().regex(REF_RE, t.manage.refInvalid),
        contact: z.string().trim().min(5, t.manage.contactInvalid),
      }),
    [t],
  );
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { reference: params.get("ref") ?? "", contact: "" },
  });

  async function lookup(v: z.infer<typeof schema>) {
    setMissing(false);
    const found = await repo.findBookingByReference(v.reference, v.contact);
    if (found) setBookingId(found.id);
    else setMissing(true);
  }

  const fade = reduce ? {} : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.3 } };

  return (
    <div className="mx-auto max-w-2xl">
      <AnimatePresence mode="wait" initial={false}>
        {bookingId ? (
          <motion.div key="result" {...fade}>
            <BookingCard id={bookingId} onReset={() => setBookingId(null)} />
          </motion.div>
        ) : (
          <motion.div key="form" {...fade}>
            <Card className="p-5 sm:p-7">
              <h2 className="text-xl font-semibold tracking-tight">{t.manage.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t.manage.subtitle}</p>
              <form onSubmit={handleSubmit(lookup)} noValidate className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field label={t.manage.reference} htmlFor="mg-ref" error={errors.reference?.message}>
                  <Input id="mg-ref" dir="ltr" placeholder="GN-7KQ2PX" autoCapitalize="characters" className="font-mono uppercase tracking-wider" aria-invalid={!!errors.reference} aria-describedby="mg-ref-error" {...register("reference")} />
                </Field>
                <Field label={t.manage.contact} htmlFor="mg-contact" error={errors.contact?.message}>
                  <Input id="mg-contact" dir="ltr" autoComplete="email" aria-invalid={!!errors.contact} aria-describedby="mg-contact-error" {...register("contact")} />
                </Field>
                {missing ? (
                  <div role="alert" className="flex items-start gap-3 rounded-xl border border-danger/30 bg-danger-soft/50 p-4 sm:col-span-2">
                    <SearchX className="mt-0.5 size-4 shrink-0 text-danger-foreground" />
                    <div>
                      <p className="text-sm font-medium">{t.manage.notFound}</p>
                      <p className="text-sm text-muted-foreground">{t.manage.notFoundHint}</p>
                    </div>
                  </div>
                ) : null}
                <div className="flex flex-col-reverse gap-2 sm:col-span-2 sm:flex-row sm:justify-between">
                  <Button asChild variant="ghost">
                    <Link href={`/${business.id}/book`}>
                      <CalendarPlus /> {t.manage.bookNew}
                    </Link>
                  </Button>
                  <Button type="submit" size="lg" disabled={isSubmitting}>
                    <Search /> {isSubmitting ? t.manage.finding : t.manage.find}
                  </Button>
                </div>
              </form>
            </Card>
            <p className="mt-4 text-center text-xs text-muted-foreground">{t.booking.demoDisclaimer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BookingCard({ id, onReset }: { id: string; onReset: () => void }) {
  const { t, tx } = useI18n();
  const { business, fmt } = useBusiness();
  const repo = useRepository();
  const catalog = useCatalog();
  const { data: booking } = useRepoQuery((r) => r.getBooking(id), [id]);
  const [mode, setMode] = useState<"view" | "reschedule">("view");
  const [slot, setSlot] = useState<SlotSelection | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!booking || !catalog.ready) return <Skeleton className="h-80 rounded-xl" />;

  const service = catalog.service(booking.serviceId);
  const staff = catalog.resource(booking.staffId);
  const branch = business.branches.find((b) => b.id === booking.branchId) ?? business.branches[0];
  const open = booking.status === "pending" || booking.status === "confirmed";
  const windowMs = business.rules.cancellationWindowHours * 3_600_000;
  const deadline = new Date(Date.parse(booking.start) - windowMs);
  const canChange = open && deadline.getTime() > repo.now().getTime();
  const closedMessage = t.manage.windowClosed(business.rules.cancellationWindowHours, business.phone);

  const fail = (e: unknown) =>
    toast.error(e instanceof RepositoryError && e.code === "POLICY_WINDOW" ? closedMessage : t.common.errorGeneric);

  async function reschedule() {
    if (!slot?.start || !booking) return;
    setBusy(true);
    try {
      const res = await repo.rescheduleBooking(booking.id, { start: slot.start, staffId: booking.staffId }, "customer");
      if (res.ok) {
        toast.success(t.manage.rescheduled);
        setMode("view");
        setSlot(null);
      } else toast.error(t.booking.errors[res.code]);
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }

  async function cancel() {
    if (!booking) return;
    setBusy(true);
    try {
      await repo.cancelBooking(booking.id, undefined, "customer");
      toast.success(t.manage.cancelled);
      setCancelOpen(false);
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b bg-subtle px-5 py-4 sm:px-7">
        <div>
          <p className="text-xs text-muted-foreground">{t.booking.reference}</p>
          <p className="font-mono text-lg font-semibold tracking-wider" dir="ltr">{booking.reference}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>
      <div className="grid gap-5 p-5 sm:p-7">
        <dl className="grid gap-3.5 text-sm">
          <Row icon={Sparkles} label={t.booking.service}>
            <span className="font-medium">{service ? tx(service.name) : "-"}</span>
            {service ? <span className="text-muted-foreground"> · {t.common.minutes(service.durationMin)}</span> : null}
          </Row>
          <Row icon={Clock} label={t.booking.when}>
            {fmt.dateLong(booking.start)} · <span dir="ltr">{fmt.time(booking.start)}–{fmt.time(booking.end)}</span>
          </Row>
          {staff ? (
            <Row icon={UserRound} label={t.booking.with}>
              <span className="inline-flex items-center gap-2">
                <Avatar name={staff.name.en} hue={staff.hue} photo={staff.photo} size="sm" />
                {tx(staff.name)}
              </span>
            </Row>
          ) : null}
          <Row icon={MapPin} label={t.booking.where}>{tx(branch.address)}</Row>
        </dl>

        {open ? (
          <p className={`flex items-start gap-2 rounded-lg p-3 text-sm ${canChange ? "bg-success-soft/60" : "bg-warning-soft/60"}`}>
            <ShieldCheck className="mt-0.5 size-4 shrink-0" />
            {canChange ? t.manage.changesUntil(fmt.dateTime(deadline)) : closedMessage}
          </p>
        ) : (
          <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">{t.manage.finalState}</p>
        )}

        {mode === "reschedule" && service ? (
          <div className="grid gap-4 border-t pt-5">
            <SlotPicker
              compact
              serviceId={booking.serviceId}
              staffId={booking.staffId}
              seats={booking.seats}
              excludeBookingId={booking.id}
              value={slot ?? { dateKey: toDateKey(booking.start, business.timezone) }}
              onChange={setSlot}
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setMode("view")} disabled={busy}>{t.common.back}</Button>
              <Button onClick={reschedule} disabled={!slot?.start || busy}>
                <CalendarClock /> {busy ? t.common.saving : t.details.confirmReschedule}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="ghost" onClick={onReset}>{t.manage.lookupAnother}</Button>
            {open ? (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button variant="destructive-soft" disabled={!canChange} onClick={() => setCancelOpen(true)}>
                  <XCircle /> {t.manage.cancel}
                </Button>
                <Button disabled={!canChange} onClick={() => setMode("reschedule")}>
                  <CalendarClock /> {t.manage.reschedule}
                </Button>
              </div>
            ) : (
              <Button asChild>
                <Link href={`/${business.id}/book`}>
                  <CalendarPlus /> {t.manage.bookNew}
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent title={t.details.cancelTitle} description={t.details.cancelBody} size="sm">
          <DialogBody className="hidden" />
          <DialogFooter>
            <Button variant="secondary" onClick={() => setCancelOpen(false)} disabled={busy}>{t.details.keep}</Button>
            <Button variant="destructive" onClick={cancel} disabled={busy}>
              <XCircle /> {t.manage.cancel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function Row({ icon: Icon, label, children }: { icon: typeof Clock; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
      <dt className="sr-only">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}
