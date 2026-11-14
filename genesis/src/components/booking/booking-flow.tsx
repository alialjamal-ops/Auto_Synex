"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarPlus,
  Check,
  CheckCircle2,
  Clock,
  Hourglass,
  LayoutDashboard,
  MapPin,
  RotateCcw,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { Alternative, BookingErrorCode } from "@/domain/availability";
import { toDateKey } from "@/domain/time";
import type { Booking, Resource, Service } from "@/domain/types";
import { useBusiness, useRepoQuery, useRepository } from "@/data/repository-context";
import { useI18n } from "@/i18n/provider";
import { downloadIcs } from "@/lib/ics";
import { cn } from "@/lib/utils";
import { detailsSchema, type DetailsValues } from "./booking-form-schema";
import { AlternativeList, SlotPicker, type SlotSelection } from "./slot-picker";

type StepId = "service" | "staff" | "datetime" | "details" | "review" | "done";

interface FlowState {
  serviceId?: string;
  branchId?: string;
  /** undefined = any available */
  staffId?: string;
  slot?: SlotSelection;
  details?: DetailsValues;
}

export function BookingFlow() {
  const { t, dir } = useI18n();
  const { business } = useBusiness();
  const repo = useRepository();
  const reduce = useReducedMotion();

  const services = useRepoQuery((r) => r.listServices(), []);
  const staff = useRepoQuery((r) => r.listResources({ kind: "staff" }), []);

  const [state, setState] = useState<FlowState>({});
  const [step, setStep] = useState<StepId>("service");
  const [direction, setDirection] = useState(1);
  const [booking, setBooking] = useState<Booking | null>(null);

  const showStaffStep = business.rules.allowStaffSelection || business.branches.length > 1;
  const steps: StepId[] = ["service", ...(showStaffStep ? (["staff"] as const) : []), "datetime", "details", "review"];
  const index = step === "done" ? steps.length : steps.indexOf(step);

  const service = services.data?.find((s) => s.id === state.serviceId);
  const go = (next: StepId) => {
    const target = next === "done" ? steps.length : steps.indexOf(next);
    setDirection(target >= index ? 1 : -1);
    setStep(next);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };
  const nextOf = (s: StepId) => steps[steps.indexOf(s) + 1] ?? "done";
  const prevOf = (s: StepId) => steps[steps.indexOf(s) - 1];

  const restart = () => {
    setState({});
    setBooking(null);
    go("service");
  };

  const slide = reduce
    ? {}
    : {
        initial: { opacity: 0, x: (dir === "rtl" ? -1 : 1) * direction * 24 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: (dir === "rtl" ? 1 : -1) * direction * 24 },
        transition: { duration: 0.22, ease: [0.2, 0.7, 0.2, 1] as const },
      };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <div className="min-w-0">
        {step !== "done" ? <Stepper steps={steps} index={index} /> : null}
        <Card className="mt-4 overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.section key={step} {...slide} className="p-5 sm:p-7" aria-live="polite">
              {step === "service" && (
                <ServiceStep
                  services={services.data}
                  selectedId={state.serviceId}
                  onSelect={(s) => {
                    const changed = s.id !== state.serviceId;
                    setState((prev) => ({ ...prev, serviceId: s.id, ...(changed ? { staffId: undefined, slot: undefined } : {}) }));
                    go(nextOf("service"));
                  }}
                />
              )}
              {step === "staff" && service && (
                <StaffStep
                  service={service}
                  staff={staff.data}
                  branchId={state.branchId}
                  staffId={state.staffId}
                  onBranch={(branchId) => setState((p) => ({ ...p, branchId, staffId: undefined, slot: undefined }))}
                  onSelect={(staffId) => {
                    setState((p) => ({ ...p, staffId, slot: staffId !== p.staffId ? undefined : p.slot }));
                    go(nextOf("staff"));
                  }}
                  onBack={() => go("service")}
                  onNext={() => go(nextOf("staff"))}
                />
              )}
              {step === "datetime" && service && (
                <DateTimeStep
                  service={service}
                  state={state}
                  onChange={(slot) => setState((p) => ({ ...p, slot }))}
                  onBack={() => go(prevOf("datetime"))}
                  onNext={() => go(nextOf("datetime"))}
                />
              )}
              {step === "details" && service && state.slot?.start && (
                <DetailsStep
                  service={service}
                  state={state}
                  onBack={() => go(prevOf("details"))}
                  onSubmit={(details) => {
                    setState((p) => ({ ...p, details }));
                    go("review");
                  }}
                />
              )}
              {step === "review" && service && state.slot?.start && state.details && (
                <ReviewStep
                  service={service}
                  staff={staff.data ?? []}
                  state={state}
                  onEdit={go}
                  onBack={() => go("details")}
                  onAlternative={(a) =>
                    setState((p) => ({ ...p, slot: { dateKey: a.dateKey, start: a.start, staffId: a.staffId } }))
                  }
                  onConfirm={async () => {
                    const res = await repo.createBooking({
                      serviceId: service.id,
                      start: state.slot!.start!,
                      staffId: state.staffId,
                      branchId: state.branchId,
                      seats: state.details!.seats,
                      customer: { name: state.details!.name, phone: state.details!.phone, email: state.details!.email },
                      notes: state.details!.notes,
                      source: "online",
                    });
                    if (res.ok) {
                      setBooking(res.booking);
                      go("done");
                    }
                    return res;
                  }}
                />
              )}
              {step === "done" && booking && service && (
                <DoneStep booking={booking} service={service} staff={staff.data ?? []} onRestart={restart} />
              )}
              {/* Guard: if a deep step lost its prerequisites, send the user back. */}
              {step !== "service" && step !== "done" && !service && services.data ? (
                <MissingState onRestart={restart} />
              ) : null}
            </motion.section>
          </AnimatePresence>
        </Card>
        <p className="mt-4 text-center text-xs text-muted-foreground">{t.booking.demoDisclaimer}</p>
      </div>
      <aside className="lg:sticky lg:top-20">
        <Summary service={service} staff={staff.data} state={state} booking={booking} />
      </aside>
    </div>
  );
}

function MissingState({ onRestart }: { onRestart: () => void }) {
  const { t } = useI18n();
  return (
    <div className="grid place-items-center gap-3 py-8 text-center">
      <p className="text-sm text-muted-foreground">{t.common.errorGeneric}</p>
      <Button onClick={onRestart} variant="secondary">
        <RotateCcw /> {t.booking.bookAnother}
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ stepper */

function Stepper({ steps, index }: { steps: StepId[]; index: number }) {
  const { t } = useI18n();
  return (
    <nav aria-label={t.booking.step(index + 1, steps.length)}>
      <p className="mb-2 text-xs font-medium text-muted-foreground sm:hidden">
        {t.booking.step(index + 1, steps.length)} · <span className="text-foreground">{t.booking.steps[steps[index]]}</span>
      </p>
      <div className="h-1 overflow-hidden rounded-full bg-muted sm:hidden">
        <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${((index + 1) / steps.length) * 100}%` }} />
      </div>
      <ol className="hidden items-center sm:flex">
        {steps.map((s, i) => {
          const done = i < index;
          const current = i === index;
          return (
            <li key={s} className="flex flex-1 items-center last:flex-none" aria-current={current ? "step" : undefined}>
              <span className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                    done && "border-primary bg-primary text-primary-foreground",
                    current && "border-primary bg-primary-soft text-primary-soft-foreground ring-4 ring-primary/10",
                    !done && !current && "bg-card text-muted-foreground",
                  )}
                >
                  {done ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
                </span>
                <span className={cn("whitespace-nowrap text-[13px] font-medium", current ? "text-foreground" : "text-muted-foreground")}>
                  {t.booking.steps[s]}
                </span>
              </span>
              {i < steps.length - 1 ? (
                <span aria-hidden className={cn("mx-3 h-px flex-1 transition-colors", done ? "bg-primary" : "bg-border")} />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function StepHeader({ title, hint }: { title: string; hint?: string }) {
  return (
    <header className="mb-6">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      {hint ? <p className="mt-1 text-sm text-muted-foreground">{hint}</p> : null}
    </header>
  );
}

function StepNav({ onBack, onNext, nextDisabled, nextLabel, nextType = "button", busy }: {
  onBack?: () => void;
  onNext?: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
  nextType?: "button" | "submit";
  busy?: boolean;
}) {
  const { t } = useI18n();
  return (
    <div className="mt-8 flex items-center justify-between gap-3 border-t pt-5">
      {onBack ? (
        <Button variant="ghost" onClick={onBack} disabled={busy}>
          <ArrowLeft className="rtl:-scale-x-100" /> {t.common.back}
        </Button>
      ) : (
        <span />
      )}
      {onNext || nextType === "submit" ? (
        <Button type={nextType} onClick={onNext} disabled={nextDisabled || busy} size="lg" className="min-w-36">
          {nextLabel ?? t.common.next}
          {!busy ? <ArrowRight className="rtl:-scale-x-100" /> : null}
        </Button>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ step 1 */

function ServiceStep({ services, selectedId, onSelect }: { services?: Service[]; selectedId?: string; onSelect: (s: Service) => void }) {
  const { t, tx } = useI18n();
  const { fmt } = useBusiness();
  const groups = useMemo(() => {
    const map = new Map<string, Service[]>();
    for (const s of services ?? []) {
      const key = tx(s.category);
      map.set(key, [...(map.get(key) ?? []), s]);
    }
    return [...map.entries()];
  }, [services, tx]);

  return (
    <div>
      <StepHeader title={t.booking.chooseService} hint={t.booking.chooseServiceHint} />
      {!services ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-7">
          {groups.map(([category, list]) => (
            <section key={category}>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{category}</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {list.map((s) => {
                  const selected = s.id === selectedId;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => onSelect(s)}
                      className={cn(
                        "group flex flex-col gap-3 rounded-xl border bg-card p-4 text-start transition-all hover:-translate-y-px hover:border-primary/50 hover:shadow-md",
                        selected && "border-primary ring-2 ring-primary/15",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-medium leading-snug">{tx(s.name)}</span>
                        <span className="shrink-0 text-sm font-semibold tabular">{fmt.money(s.price)}</span>
                      </div>
                      <span className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{tx(s.description)}</span>
                      <span className="mt-auto flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3.5" aria-hidden />
                          {t.common.minutes(s.durationMin)}
                        </span>
                        {s.capacity > 1 ? (
                          <Badge tone="primary">
                            <Users /> {t.booking.groupSession} · {t.booking.capacity(s.capacity)}
                          </Badge>
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ step 2 */

function StaffStep({
  service,
  staff,
  branchId,
  staffId,
  onBranch,
  onSelect,
  onBack,
  onNext,
}: {
  service: Service;
  staff?: Resource[];
  branchId?: string;
  staffId?: string;
  onBranch: (id?: string) => void;
  onSelect: (id?: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const { t, tx } = useI18n();
  const { business } = useBusiness();
  const eligible = (staff ?? []).filter((s) => s.serviceIds.includes(service.id) && (!branchId || s.branchId === branchId));
  const branchesWithService = business.branches.filter((b) => (staff ?? []).some((s) => s.branchId === b.id && s.serviceIds.includes(service.id)));
  const allow = business.rules.allowStaffSelection;

  return (
    <div>
      <StepHeader title={t.booking.chooseStaff(tx(business.staffNoun.singular))} hint={allow ? t.booking.chooseStaffHint : t.booking.autoAssignNote} />
      {business.branches.length > 1 ? (
        <div className="mb-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.booking.branch}</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label={t.booking.branch}>
            <BranchChip active={!branchId} onClick={() => onBranch(undefined)} label={t.booking.allBranches} />
            {branchesWithService.map((b) => (
              <BranchChip key={b.id} active={branchId === b.id} onClick={() => onBranch(b.id)} label={tx(b.name)} sub={tx(b.address)} />
            ))}
          </div>
        </div>
      ) : null}
      {!staff ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <StaffCard selected={!staffId} onClick={() => onSelect(undefined)} title={t.booking.anyStaff} subtitle={t.booking.anyStaffHint} icon={<Sparkles className="size-4" />} />
          {allow
            ? eligible.map((s) => (
                <StaffCard
                  key={s.id}
                  selected={staffId === s.id}
                  onClick={() => onSelect(s.id)}
                  title={tx(s.name)}
                  subtitle={`${tx(s.title)}${business.branches.length > 1 ? ` · ${tx(business.branches.find((b) => b.id === s.branchId)!.name)}` : ""}`}
                  avatar={<Avatar name={s.name.en} hue={s.hue} photo={s.photo} />}
                />
              ))
            : null}
        </div>
      )}
      <StepNav onBack={onBack} onNext={onNext} />
    </div>
  );
}

function BranchChip({ active, onClick, label, sub }: { active: boolean; onClick: () => void; label: string; sub?: string }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      title={sub}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors hover:bg-muted",
        active && "border-primary bg-primary-soft text-primary-soft-foreground hover:bg-primary-soft",
      )}
    >
      {sub ? <MapPin className="size-3.5" aria-hidden /> : null}
      {label}
    </button>
  );
}

function StaffCard({ selected, onClick, title, subtitle, avatar, icon }: {
  selected: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
  avatar?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-xl border bg-card p-3.5 text-start transition-all hover:-translate-y-px hover:border-primary/50 hover:shadow-md",
        selected && "border-primary ring-2 ring-primary/15",
      )}
    >
      {avatar ?? <span className="flex size-9 items-center justify-center rounded-full bg-primary-soft text-primary-soft-foreground">{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{title}</span>
        <span className="block truncate text-sm text-muted-foreground">{subtitle}</span>
      </span>
      <span
        aria-hidden
        className={cn("flex size-5 items-center justify-center rounded-full border transition-colors", selected && "border-primary bg-primary text-primary-foreground")}
      >
        {selected ? <Check className="size-3" strokeWidth={3} /> : null}
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ step 3 */

function DateTimeStep({ service, state, onChange, onBack, onNext }: {
  service: Service;
  state: FlowState;
  onChange: (slot: SlotSelection) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const { t } = useI18n();
  const { business, fmt } = useBusiness();
  const repo = useRepository();
  const [initialKey] = useState(() => toDateKey(repo.now(), business.timezone));
  const value = state.slot ?? { dateKey: initialKey };
  return (
    <div>
      <StepHeader title={t.booking.steps.datetime} hint={t.booking.timezoneNote(fmt.tzName())} />
      <SlotPicker serviceId={service.id} staffId={state.staffId} branchId={state.branchId} value={value} onChange={onChange} />
      <StepNav onBack={onBack} onNext={onNext} nextDisabled={!state.slot?.start} />
    </div>
  );
}

/* ------------------------------------------------------------------ step 4 */

function DetailsStep({ service, state, onBack, onSubmit }: {
  service: Service;
  state: FlowState;
  onBack: () => void;
  onSubmit: (v: DetailsValues) => void;
}) {
  const { t, locale } = useI18n();
  const isGroup = service.capacity > 1;
  const day = useRepoQuery(
    (r) => r.getAvailability({ serviceId: service.id, staffId: state.staffId, branchId: state.branchId, dateKey: state.slot!.dateKey }),
    [service.id, state.staffId, state.branchId, state.slot?.dateKey],
  );
  const seatsLeft = day.data?.slots.find((s) => s.start === state.slot?.start)?.seatsLeft ?? 1;
  const maxSeats = isGroup ? Math.min(4, seatsLeft) : 1;
  const schema = useMemo(() => detailsSchema(t, maxSeats), [t, maxSeats]);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<DetailsValues>({
    resolver: zodResolver(schema),
    defaultValues: state.details ?? { name: "", phone: "", email: "", notes: "", seats: 1, consent: undefined as unknown as true },
    mode: "onTouched",
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate key={locale}>
      <StepHeader title={t.booking.yourDetails} hint={t.booking.detailsHint} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={t.booking.fullName} htmlFor="bk-name" error={errors.name?.message} className="sm:col-span-2">
          <Input id="bk-name" autoComplete="name" aria-invalid={!!errors.name} aria-describedby="bk-name-error" {...register("name")} />
        </Field>
        <Field label={t.booking.phone} htmlFor="bk-phone" error={errors.phone?.message}>
          <Input id="bk-phone" type="tel" dir="ltr" autoComplete="tel" inputMode="tel" placeholder="+971 50 123 4567" aria-invalid={!!errors.phone} aria-describedby="bk-phone-error" {...register("phone")} />
        </Field>
        <Field label={t.booking.email} htmlFor="bk-email" error={errors.email?.message}>
          <Input id="bk-email" type="email" dir="ltr" autoComplete="email" placeholder="name@example.com" aria-invalid={!!errors.email} aria-describedby="bk-email-error" {...register("email")} />
        </Field>
        {isGroup ? (
          <Field label={t.booking.seatsLabel} htmlFor="bk-seats" error={errors.seats?.message} hint={t.common.seatsLeft(seatsLeft)}>
            <Controller
              control={control}
              name="seats"
              render={({ field }) => (
                <Select
                  id="bk-seats"
                  value={String(field.value)}
                  onValueChange={(v) => field.onChange(Number(v))}
                  options={Array.from({ length: maxSeats }, (_, i) => ({ value: String(i + 1), label: t.common.seats(i + 1) }))}
                />
              )}
            />
          </Field>
        ) : null}
        <Field
          label={
            <>
              {t.booking.notes} <span className="font-normal text-muted-foreground">({t.common.optional})</span>
            </>
          }
          htmlFor="bk-notes"
          className="sm:col-span-2"
        >
          <Textarea id="bk-notes" rows={3} placeholder={t.booking.notesPlaceholder} maxLength={500} {...register("notes")} />
        </Field>
        <div className="grid gap-1.5 sm:col-span-2">
          <div className="flex items-start gap-2.5">
            <Controller
              control={control}
              name="consent"
              render={({ field }) => (
                <Checkbox
                  id="bk-consent"
                  checked={field.value === true}
                  onCheckedChange={(v) => field.onChange(v === true ? true : undefined)}
                  onBlur={field.onBlur}
                  aria-invalid={!!errors.consent}
                  className="mt-0.5"
                />
              )}
            />
            <label htmlFor="bk-consent" className="text-sm leading-snug text-muted-foreground">
              {t.booking.consent}
            </label>
          </div>
          {errors.consent ? <p role="alert" className="text-xs font-medium text-danger-foreground">{errors.consent.message}</p> : null}
        </div>
      </div>
      <StepNav onBack={onBack} nextType="submit" />
    </form>
  );
}

/* ------------------------------------------------------------------ step 5 */

function ReviewStep({ service, staff, state, onEdit, onBack, onConfirm, onAlternative }: {
  service: Service;
  staff: Resource[];
  state: FlowState;
  onEdit: (s: StepId) => void;
  onBack: () => void;
  onConfirm: () => Promise<{ ok: true } | { ok: false; code: BookingErrorCode; alternatives: Alternative[] }>;
  onAlternative: (a: Alternative) => void;
}) {
  const { t, tx } = useI18n();
  const { business, fmt } = useBusiness();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ code: BookingErrorCode; alternatives: Alternative[] } | null>(null);
  const inFlight = useRef(false);
  const d = state.details!;
  const member = staff.find((s) => s.id === (state.staffId ?? state.slot?.staffId));
  const branch = business.branches.find((b) => b.id === (member?.branchId ?? state.branchId)) ?? business.branches[0];

  async function confirm() {
    if (inFlight.current) return; // guards against double submission
    inFlight.current = true;
    setBusy(true);
    setError(null);
    try {
      const res = await onConfirm();
      if (!res.ok) setError({ code: res.code, alternatives: res.alternatives });
    } catch {
      setError({ code: "INVALID_STATUS", alternatives: [] });
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  const rows: Array<{ label: string; value: React.ReactNode; step: StepId }> = [
    { label: t.booking.service, value: `${tx(service.name)} · ${t.common.minutes(service.durationMin)}`, step: "service" },
    {
      label: t.booking.with,
      value: state.staffId && member ? tx(member.name) : t.booking.anyStaff,
      step: business.rules.allowStaffSelection || business.branches.length > 1 ? "staff" : "datetime",
    },
    { label: t.booking.when, value: <span>{fmt.dateLong(state.slot!.start!)} · <span dir="ltr">{fmt.time(state.slot!.start!)}</span></span>, step: "datetime" },
    { label: t.booking.where, value: `${tx(business.name)}, ${tx(branch.name)}`, step: business.branches.length > 1 ? "staff" : "datetime" },
    { label: t.booking.customer, value: <span className="grid"><span>{d.name}</span><span className="text-muted-foreground" dir="ltr">{d.phone} · {d.email}</span></span>, step: "details" },
  ];
  if (d.seats > 1) rows.push({ label: t.booking.seatsLabel, value: t.common.seats(d.seats), step: "details" });
  if (d.notes) rows.push({ label: t.booking.notes, value: d.notes, step: "details" });

  return (
    <div>
      <StepHeader title={t.booking.reviewTitle} hint={t.booking.reviewHint} />
      <dl className="divide-y rounded-xl border">
        {rows.map((r) => (
          <div key={r.label} className="flex items-start gap-4 px-4 py-3.5">
            <dt className="w-24 shrink-0 text-sm text-muted-foreground sm:w-32">{r.label}</dt>
            <dd className="min-w-0 flex-1 break-words text-sm font-medium">{r.value}</dd>
            <Button variant="link" size="sm" className="h-auto shrink-0 text-[13px]" onClick={() => onEdit(r.step)} disabled={busy}>
              {t.booking.editStep}
            </Button>
          </div>
        ))}
        <div className="flex items-center justify-between bg-subtle px-4 py-3.5">
          <dt className="text-sm font-medium">{t.booking.total}</dt>
          <dd className="text-lg font-semibold tabular">{fmt.money(service.price * d.seats)}</dd>
        </div>
      </dl>
      <p className="mt-3 text-xs text-muted-foreground">{t.booking.cancellationPolicy(business.rules.cancellationWindowHours)}</p>

      {error ? (
        <div role="alert" className="mt-5 rounded-xl border border-danger/30 bg-danger-soft/50 p-4">
          <p className="flex items-center gap-2 text-sm font-medium text-danger-foreground">
            <AlertTriangle className="size-4" /> {t.booking.errors[error.code]}
          </p>
          {error.alternatives.length ? (
            <>
              <p className="mt-1 text-sm text-muted-foreground">{t.booking.pickAlternative}</p>
              <AlternativeList
                items={error.alternatives}
                onPick={(a) => {
                  onAlternative(a);
                  setError(null);
                }}
              />
            </>
          ) : null}
        </div>
      ) : null}

      <StepNav onBack={onBack} onNext={confirm} busy={busy} nextLabel={busy ? t.booking.confirming : t.booking.confirm} />
    </div>
  );
}

/* ------------------------------------------------------------------ step 6 */

function DoneStep({ booking, service, staff, onRestart }: { booking: Booking; service: Service; staff: Resource[]; onRestart: () => void }) {
  const { t, tx } = useI18n();
  const { business, fmt } = useBusiness();
  const reduce = useReducedMotion();
  const member = staff.find((s) => s.id === booking.staffId);
  const branch = business.branches.find((b) => b.id === booking.branchId) ?? business.branches[0];
  const pending = booking.status === "pending";
  const Icon = pending ? Hourglass : CheckCircle2;

  return (
    <div className="mx-auto max-w-lg py-4 text-center">
      <motion.span
        initial={reduce ? false : { scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className={cn(
          "mx-auto flex size-16 items-center justify-center rounded-full",
          pending ? "bg-warning-soft text-warning-foreground" : "bg-success-soft text-success-foreground",
        )}
      >
        <Icon className="size-8" strokeWidth={1.75} />
      </motion.span>
      <h2 className="mt-5 text-2xl font-semibold tracking-tight">{pending ? t.booking.pendingTitle : t.booking.confirmedTitle}</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">{pending ? t.booking.pendingBody : t.booking.confirmedBody}</p>

      <div className="mt-6 rounded-xl border bg-subtle p-4">
        <p className="text-xs font-medium text-muted-foreground">{t.booking.reference}</p>
        <p className="mt-1 font-mono text-xl font-semibold tracking-wider" dir="ltr">
          {booking.reference}
        </p>
      </div>

      <dl className="mt-4 grid gap-3 rounded-xl border p-4 text-start text-sm">
        <div className="flex gap-3">
          <dt className="sr-only">{t.booking.service}</dt>
          <Sparkles className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
          <dd className="font-medium">{tx(service.name)}{booking.seats > 1 ? ` · ${t.common.seats(booking.seats)}` : ""}</dd>
        </div>
        <div className="flex gap-3">
          <dt className="sr-only">{t.booking.when}</dt>
          <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
          <dd>
            {fmt.dateLong(booking.start)} · <span dir="ltr">{fmt.time(booking.start)}–{fmt.time(booking.end)}</span>
          </dd>
        </div>
        {member ? (
          <div className="flex gap-3">
            <dt className="sr-only">{t.booking.with}</dt>
            <UserRound className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
            <dd>{tx(member.name)}</dd>
          </div>
        ) : null}
        <div className="flex gap-3">
          <dt className="sr-only">{t.booking.where}</dt>
          <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
          <dd>{tx(business.name)}, {tx(branch.address)}</dd>
        </div>
      </dl>
      <p className="mt-3 text-xs text-muted-foreground">{t.booking.cancellationPolicy(business.rules.cancellationWindowHours)}</p>

      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        <Button
          variant="secondary"
          onClick={() =>
            downloadIcs({
              uid: booking.reference,
              title: `${tx(service.name)}, ${tx(business.name)}`,
              description: `${t.booking.reference}: ${booking.reference}`,
              location: tx(branch.address),
              start: booking.start,
              end: booking.end,
            })
          }
        >
          <CalendarPlus /> {t.booking.addToCalendar}
        </Button>
        <Button variant="secondary" onClick={onRestart}>
          <RotateCcw /> {t.booking.bookAnother}
        </Button>
        <Button asChild variant="soft" className="sm:col-span-2">
          <Link href={`/${business.id}/dashboard/appointments?booking=${booking.id}`}>
            <LayoutDashboard /> {t.booking.viewInDashboard}
          </Link>
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ summary */

function Summary({ service, staff, state, booking }: { service?: Service; staff?: Resource[]; state: FlowState; booking: Booking | null }) {
  const { t, tx } = useI18n();
  const { fmt } = useBusiness();
  const staffId = booking?.staffId ?? state.staffId;
  const member = staff?.find((s) => s.id === staffId);
  const start = booking?.start ?? state.slot?.start;
  const seats = booking?.seats ?? state.details?.seats ?? 1;
  return (
    <Card className="p-5">
      <h2 className="text-sm font-semibold">{t.booking.summary}</h2>
      <dl className="mt-4 grid gap-3.5 text-sm">
        <SummaryRow label={t.booking.service} value={service ? tx(service.name) : null} />
        <SummaryRow label={t.booking.duration} value={service ? t.common.minutes(service.durationMin) : null} />
        <SummaryRow label={t.booking.with} value={member ? tx(member.name) : service && state.serviceId ? t.booking.anyStaff : null} />
        <SummaryRow label={t.booking.when} value={start ? <span>{fmt.dateShort(start)} · <span dir="ltr">{fmt.time(start)}</span></span> : null} />
      </dl>
      <div className="mt-4 flex items-center justify-between border-t pt-4">
        <span className="text-sm text-muted-foreground">{t.booking.total}</span>
        <span className={cn("text-lg font-semibold tabular", !service && "text-muted-foreground/60")}>{service ? fmt.money(service.price * seats) : "-"}</span>
      </div>
      <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
        <Clock className="mt-px size-3.5 shrink-0" aria-hidden />
        {t.booking.timezoneNote(fmt.tzName())}
      </p>
    </Card>
  );
}

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className={cn("min-w-0 text-end font-medium", !value && "text-muted-foreground/60")}>{value ?? "-"}</dd>
    </div>
  );
}
