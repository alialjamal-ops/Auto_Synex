"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, Pencil, Plus, Sparkles, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogBody, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import type { Service } from "@/domain/types";
import { useBusiness, useRepoQuery, useRepository } from "@/data/repository-context";
import { useCatalog } from "@/hooks/use-catalog";
import type { Dictionary } from "@/i18n/en";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";
import { PageHeader } from "./shell";

export function Services() {
  const { t, tx } = useI18n();
  const { fmt } = useBusiness();
  const catalog = useCatalog();
  const { data } = useRepoQuery((r) => r.listServices({ includeInactive: true }), []);
  const [editing, setEditing] = useState<Service | "new" | null>(null);

  const groups = useMemo(() => {
    const map = new Map<string, Service[]>();
    for (const s of data ?? []) map.set(tx(s.category), [...(map.get(tx(s.category)) ?? []), s]);
    return [...map.entries()];
  }, [data, tx]);

  return (
    <div>
      <PageHeader
        title={t.services.title}
        subtitle={t.services.subtitle}
        actions={
          <Button onClick={() => setEditing("new")}>
            <Plus /> {t.services.add}
          </Button>
        }
      />
      {!data ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)}</div>
      ) : data.length === 0 ? (
        <Card><EmptyState icon={Sparkles} title={t.services.title} /></Card>
      ) : (
        <div className="grid gap-8">
          {groups.map(([category, list]) => (
            <section key={category}>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{category}</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {list.map((s) => {
                  const staff = catalog.staff.filter((st) => st.serviceIds.includes(s.id));
                  return (
                    <Card key={s.id} className={cn("flex flex-col gap-3 p-5 transition-shadow hover:shadow-md", !s.active && "opacity-60")}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-semibold leading-snug">{tx(s.name)}</h3>
                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{tx(s.description)}</p>
                        </div>
                        <Button variant="ghost" size="icon-sm" onClick={() => setEditing(s)} aria-label={`${t.common.edit}: ${tx(s.name)}`}>
                          <Pencil />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge><Clock /> {t.common.minutes(s.durationMin)}</Badge>
                        {s.capacity > 1 ? <Badge tone="primary"><Users /> {t.services.group} · {s.capacity}</Badge> : <Badge>{t.services.private}</Badge>}
                        {(s.bufferMin ?? 0) > 0 ? <Badge tone="outline">{t.services.buffer} {t.common.minutes(s.bufferMin!)}</Badge> : null}
                        {!s.active ? <Badge tone="warning">{t.common.inactive}</Badge> : null}
                      </div>
                      {s.fixedStartTimes?.length ? (
                        <p className="text-xs text-muted-foreground" dir="ltr">{s.fixedStartTimes.join(" · ")}</p>
                      ) : null}
                      {s.requirements?.length ? (
                        <p className="text-xs text-muted-foreground">{t.services.requires}: {s.requirements.map((r) => tx(r.label)).join(" + ")}</p>
                      ) : null}
                      <div className="mt-auto flex items-end justify-between gap-3 border-t pt-3">
                        <p className="truncate text-xs text-muted-foreground">{staff.map((st) => tx(st.name)).join(", ")}</p>
                        <p className="shrink-0 text-lg font-semibold tabular">{fmt.money(s.price)}</p>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>
          ))}
          <p className="text-xs text-muted-foreground">{t.services.hiddenNote}</p>
        </div>
      )}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        {editing ? <ServiceForm service={editing === "new" ? null : editing} onDone={() => setEditing(null)} /> : null}
      </Dialog>
    </div>
  );
}

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function serviceSchema(t: Dictionary) {
  return z
    .object({
      nameEn: z.string().trim().min(2, t.services.errors.name),
      nameAr: z.string().trim().min(2, t.services.errors.name),
      descriptionEn: z.string().max(240),
      descriptionAr: z.string().max(240),
      categoryEn: z.string().trim().min(1, t.common.required),
      categoryAr: z.string().trim().min(1, t.common.required),
      durationMin: z.number({ error: t.services.errors.duration }).int().min(5, t.services.errors.duration).max(600, t.services.errors.duration),
      price: z.number({ error: t.services.errors.price }).min(0, t.services.errors.price),
      bufferMin: z.number({ error: t.common.required }).int().min(0).max(120),
      capacity: z.number({ error: t.services.errors.capacity }).int().min(1, t.services.errors.capacity).max(200),
      fixedTimes: z.string(),
      active: z.boolean(),
    })
    .superRefine((v, ctx) => {
      const times = v.fixedTimes.split(",").map((x) => x.trim()).filter(Boolean);
      if (times.some((x) => !TIME_RE.test(x))) ctx.addIssue({ code: "custom", path: ["fixedTimes"], message: t.services.errors.times });
      else if (v.capacity > 1 && times.length === 0) ctx.addIssue({ code: "custom", path: ["fixedTimes"], message: t.services.errors.timesRequired });
    });
}

type ServiceValues = z.infer<ReturnType<typeof serviceSchema>>;

function ServiceForm({ service, onDone }: { service: Service | null; onDone: () => void }) {
  const { t } = useI18n();
  const { business } = useBusiness();
  const repo = useRepository();
  const schema = useMemo(() => serviceSchema(t), [t]);
  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<ServiceValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nameEn: service?.name.en ?? "",
      nameAr: service?.name.ar ?? "",
      descriptionEn: service?.description.en ?? "",
      descriptionAr: service?.description.ar ?? "",
      categoryEn: service?.category.en ?? "",
      categoryAr: service?.category.ar ?? "",
      durationMin: service?.durationMin ?? 30,
      price: service?.price ?? 100,
      bufferMin: service?.bufferMin ?? business.rules.bufferMin,
      capacity: service?.capacity ?? 1,
      fixedTimes: service?.fixedStartTimes?.join(", ") ?? "",
      active: service?.active ?? true,
    },
  });
  const capacity = useWatch({ control, name: "capacity" });

  async function onSubmit(v: ServiceValues) {
    const times = v.fixedTimes.split(",").map((x) => x.trim()).filter(Boolean);
    try {
      await repo.saveService({
        ...(service ?? {}),
        id: service?.id,
        name: { en: v.nameEn.trim(), ar: v.nameAr.trim() },
        description: { en: v.descriptionEn.trim(), ar: v.descriptionAr.trim() },
        category: { en: v.categoryEn.trim(), ar: v.categoryAr.trim() },
        durationMin: v.durationMin,
        price: v.price,
        bufferMin: v.bufferMin,
        capacity: v.capacity,
        fixedStartTimes: times.length ? times : undefined,
        active: v.active,
      });
      toast.success(t.services.saved);
      onDone();
    } catch {
      toast.error(t.common.errorGeneric);
    }
  }

  const num = { valueAsNumber: true } as const;
  return (
    <DialogContent title={service ? t.services.editTitle : t.services.addTitle} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogBody className="sm:grid-cols-2">
          <Field label={t.services.fields.nameEn} htmlFor="sv-name-en" error={errors.nameEn?.message}>
            <Input id="sv-name-en" dir="ltr" aria-invalid={!!errors.nameEn} {...register("nameEn")} />
          </Field>
          <Field label={t.services.fields.nameAr} htmlFor="sv-name-ar" error={errors.nameAr?.message}>
            <Input id="sv-name-ar" dir="rtl" lang="ar" aria-invalid={!!errors.nameAr} {...register("nameAr")} />
          </Field>
          <Field label={t.services.fields.categoryEn} htmlFor="sv-cat-en" error={errors.categoryEn?.message}>
            <Input id="sv-cat-en" dir="ltr" aria-invalid={!!errors.categoryEn} {...register("categoryEn")} />
          </Field>
          <Field label={t.services.fields.categoryAr} htmlFor="sv-cat-ar" error={errors.categoryAr?.message}>
            <Input id="sv-cat-ar" dir="rtl" lang="ar" aria-invalid={!!errors.categoryAr} {...register("categoryAr")} />
          </Field>
          <Field label={t.services.fields.descriptionEn} htmlFor="sv-desc-en">
            <Textarea id="sv-desc-en" dir="ltr" rows={2} {...register("descriptionEn")} />
          </Field>
          <Field label={t.services.fields.descriptionAr} htmlFor="sv-desc-ar">
            <Textarea id="sv-desc-ar" dir="rtl" lang="ar" rows={2} {...register("descriptionAr")} />
          </Field>
          <div className="grid grid-cols-2 gap-4 sm:col-span-2 sm:grid-cols-4">
            <Field label={t.services.fields.duration} htmlFor="sv-duration" error={errors.durationMin?.message}>
              <Input id="sv-duration" type="number" min={5} step={5} aria-invalid={!!errors.durationMin} {...register("durationMin", num)} />
            </Field>
            <Field label={`${t.services.fields.price} (${business.currency})`} htmlFor="sv-price" error={errors.price?.message}>
              <Input id="sv-price" type="number" min={0} aria-invalid={!!errors.price} {...register("price", num)} />
            </Field>
            <Field label={t.services.fields.buffer} htmlFor="sv-buffer" error={errors.bufferMin?.message}>
              <Input id="sv-buffer" type="number" min={0} step={5} aria-invalid={!!errors.bufferMin} {...register("bufferMin", num)} />
            </Field>
            <Field label={t.services.fields.capacity} htmlFor="sv-capacity" error={errors.capacity?.message}>
              <Input id="sv-capacity" type="number" min={1} aria-invalid={!!errors.capacity} {...register("capacity", num)} />
            </Field>
          </div>
          <p className="-mt-2 text-xs text-muted-foreground sm:col-span-2">{t.services.fields.capacityHint}</p>
          {capacity > 1 || service?.fixedStartTimes?.length ? (
            <Field label={t.services.fields.fixedTimes} htmlFor="sv-times" hint={t.services.fields.fixedTimesHint} error={errors.fixedTimes?.message} className="sm:col-span-2">
              <Input id="sv-times" dir="ltr" placeholder="10:00, 17:00" aria-invalid={!!errors.fixedTimes} {...register("fixedTimes")} />
            </Field>
          ) : null}
          <label className="flex items-center justify-between gap-3 rounded-lg border p-3 sm:col-span-2">
            <span className="text-sm font-medium">{t.services.fields.active}</span>
            <Controller control={control} name="active" render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />
          </label>
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={onDone} disabled={isSubmitting}>{t.common.cancel}</Button>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? t.common.saving : t.common.save}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
