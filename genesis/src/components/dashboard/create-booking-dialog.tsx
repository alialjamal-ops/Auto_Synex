"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarPlus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { customerSchema } from "@/components/booking/booking-form-schema";
import { AlternativeList, SlotPicker, type SlotSelection } from "@/components/booking/slot-picker";
import { Button } from "@/components/ui/button";
import { DialogBody, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Segmented } from "@/components/ui/segmented";
import { Select } from "@/components/ui/select";
import type { Alternative, BookingErrorCode } from "@/domain/availability";
import { toDateKey } from "@/domain/time";
import type { BookingSource } from "@/domain/types";
import { useBusiness, useRepository } from "@/data/repository-context";
import { useCatalog } from "@/hooks/use-catalog";
import { useI18n } from "@/i18n/provider";

const ANY = "__any";

export function CreateBookingDialog({ prefill, onDone }: { prefill?: { dateKey?: string; staffId?: string }; onDone: () => void }) {
  const { t, tx } = useI18n();
  const { business, fmt } = useBusiness();
  const repo = useRepository();
  const catalog = useCatalog();
  const activeServices = catalog.services.filter((s) => s.active);

  const [serviceId, setServiceId] = useState<string>("");
  const [staffId, setStaffId] = useState<string>(prefill?.staffId ?? ANY);
  const [slot, setSlot] = useState<SlotSelection>(() => ({ dateKey: prefill?.dateKey ?? toDateKey(repo.now(), business.timezone) }));
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [customerId, setCustomerId] = useState<string>("");
  const [customerQuery, setCustomerQuery] = useState("");
  const [source, setSource] = useState<BookingSource>("phone");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ code: BookingErrorCode; alternatives: Alternative[] } | null>(null);
  const [touched, setTouched] = useState(false);

  // Default the service once the catalogue loads (and respect a prefilled staff member).
  const effectiveServiceId =
    serviceId ||
    activeServices.find((s) => staffId === ANY || catalog.resource(staffId)?.serviceIds.includes(s.id))?.id ||
    "";
  const service = catalog.service(effectiveServiceId);
  const eligibleStaff = catalog.staff.filter((s) => s.active && s.serviceIds.includes(effectiveServiceId));
  const effectiveStaff = staffId !== ANY && !eligibleStaff.some((s) => s.id === staffId) ? ANY : staffId;

  const schema = useMemo(() => customerSchema(t).omit({ notes: true }), [t]);
  type NewCustomer = z.infer<typeof schema>;
  const form = useForm<NewCustomer>({ resolver: zodResolver(schema), defaultValues: { name: "", phone: "", email: "" }, mode: "onTouched" });

  const filteredCustomers = catalog.customers.filter((c) =>
    `${c.name} ${c.phone} ${c.email}`.toLowerCase().includes(customerQuery.trim().toLowerCase()),
  );

  async function submit() {
    setTouched(true);
    if (!service || !slot.start) return;
    let customer: { name: string; phone: string; email: string } | undefined;
    if (mode === "existing") {
      const c = catalog.customer(customerId);
      if (!c) return;
      customer = { name: c.name, phone: c.phone, email: c.email };
    } else {
      const ok = await form.trigger();
      if (!ok) return;
      customer = form.getValues();
    }
    setBusy(true);
    setError(null);
    try {
      const res = await repo.createBooking({
        serviceId: service.id,
        staffId: effectiveStaff === ANY ? undefined : effectiveStaff,
        start: slot.start,
        customer,
        notes,
        source,
      });
      if (res.ok) {
        toast.success(t.create.created(res.booking.reference));
        onDone();
      } else {
        setError({ code: res.code, alternatives: res.alternatives });
      }
    } catch {
      toast.error(t.common.errorGeneric);
    } finally {
      setBusy(false);
    }
  }

  return (
    <DialogContent title={t.create.title} description={t.create.hint} size="xl">
      <DialogBody className="gap-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t.booking.service} htmlFor="nb-service">
            <Select
              id="nb-service"
              value={effectiveServiceId || undefined}
              onValueChange={(v) => {
                setServiceId(v);
                setSlot((s) => ({ dateKey: s.dateKey }));
              }}
              options={activeServices.map((s) => ({ value: s.id, label: `${tx(s.name)} · ${t.common.minutes(s.durationMin)} · ${fmt.money(s.price)}` }))}
            />
          </Field>
          <Field label={t.appointments.staff} htmlFor="nb-staff">
            <Select
              id="nb-staff"
              value={effectiveStaff}
              onValueChange={(v) => {
                setStaffId(v);
                setSlot((s) => ({ dateKey: s.dateKey }));
              }}
              options={[{ value: ANY, label: t.booking.anyStaff }, ...eligibleStaff.map((s) => ({ value: s.id, label: tx(s.name) }))]}
            />
          </Field>
        </div>

        {service ? (
          <SlotPicker
            compact={false}
            serviceId={service.id}
            staffId={effectiveStaff === ANY ? undefined : effectiveStaff}
            value={slot}
            onChange={(v) => {
              setError(null);
              setSlot(v);
            }}
          />
        ) : null}
        {touched && !slot.start ? <p className="text-xs font-medium text-danger-foreground">{t.create.pickTime}</p> : null}

        <div className="grid gap-3 rounded-xl border p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium">{t.create.customer}</p>
            <Segmented
              ariaLabel={t.create.customer}
              value={mode}
              onValueChange={setMode}
              options={[
                { value: "existing", label: t.create.existing },
                { value: "new", label: t.create.newCustomer },
              ]}
            />
          </div>
          {mode === "existing" ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="relative">
                <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input
                  aria-label={t.create.searchCustomer}
                  placeholder={t.create.searchCustomer}
                  value={customerQuery}
                  onChange={(e) => setCustomerQuery(e.target.value)}
                  className="ps-9"
                />
              </div>
              <Select
                ariaLabel={t.create.pickCustomer}
                placeholder={t.create.pickCustomer}
                value={customerId || undefined}
                onValueChange={setCustomerId}
                invalid={touched && !customerId}
                options={filteredCustomers.slice(0, 50).map((c) => ({ value: c.id, label: `${c.name} · ${c.phone}` }))}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label={t.booking.fullName} htmlFor="nb-name" error={form.formState.errors.name?.message}>
                <Input id="nb-name" aria-invalid={!!form.formState.errors.name} {...form.register("name")} />
              </Field>
              <Field label={t.booking.phone} htmlFor="nb-phone" error={form.formState.errors.phone?.message}>
                <Input id="nb-phone" type="tel" dir="ltr" aria-invalid={!!form.formState.errors.phone} {...form.register("phone")} />
              </Field>
              <Field label={t.booking.email} htmlFor="nb-email" error={form.formState.errors.email?.message}>
                <Input id="nb-email" type="email" dir="ltr" aria-invalid={!!form.formState.errors.email} {...form.register("email")} />
              </Field>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[200px_1fr]">
          <Field label={t.create.source} htmlFor="nb-source">
            <Select
              id="nb-source"
              value={source}
              onValueChange={(v) => setSource(v as BookingSource)}
              options={(["phone", "walk_in", "dashboard"] as const).map((s) => ({ value: s, label: t.source[s] }))}
            />
          </Field>
          <Field label={t.booking.notes} htmlFor="nb-notes">
            <Textarea id="nb-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} />
          </Field>
        </div>

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
        <Button onClick={submit} disabled={busy || !service}>
          <CalendarPlus /> {busy ? t.common.saving : t.create.submit}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
