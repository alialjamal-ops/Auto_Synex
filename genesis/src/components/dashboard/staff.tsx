"use client";

import { CalendarClock, DoorOpen, Wrench } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useWeekStart } from "@/components/booking/month-calendar";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogBody, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { parseHM, toDateKey } from "@/domain/time";
import { BLOCKING_STATUSES, type Resource, type Weekday, type WeeklyHours } from "@/domain/types";
import { useBusiness, useRepoQuery, useRepository } from "@/data/repository-context";
import { useCatalog } from "@/hooks/use-catalog";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";
import { PageHeader } from "./shell";
import { validateWeek, WeeklyHoursEditor } from "./weekly-hours-editor";

function weeklyHoursTotal(h: WeeklyHours) {
  return Math.round(Object.values(h).flat().reduce((n, r) => n + parseHM(r.end) - parseHM(r.start), 0) / 60);
}

export function Staff() {
  const { t, tx } = useI18n();
  const { business } = useBusiness();
  const repo = useRepository();
  const catalog = useCatalog();
  const [todayKey] = useState(() => toDateKey(repo.now(), business.timezone));
  const { data } = useRepoQuery((r) => r.listResources({ includeInactive: true }), []);
  const upcoming = useRepoQuery((r) => r.listBookings({ fromKey: todayKey, statuses: BLOCKING_STATUSES }), [todayKey]);
  const [editing, setEditing] = useState<Resource | null>(null);
  const people = (data ?? []).filter((r) => r.kind === "staff");
  const things = (data ?? []).filter((r) => r.kind !== "staff");

  return (
    <div>
      <PageHeader title={tx(business.staffNoun.plural)} subtitle={t.staff.subtitle} />
      {!data ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-56 rounded-xl" />)}</div>
      ) : (
        <div className="grid gap-8">
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.staff.people}</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {people.map((p) => (
                <Card key={p.id} className={cn("flex flex-col gap-4 p-5", !p.active && "opacity-60")}>
                  <div className="flex items-center gap-3">
                    <Avatar name={p.name.en} hue={p.hue} size="lg" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{tx(p.name)}</p>
                      <p className="truncate text-sm text-muted-foreground">{tx(p.title)}</p>
                    </div>
                    {!p.active ? <Badge tone="warning">{t.common.inactive}</Badge> : null}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {p.serviceIds.map((id) => catalog.service(id)).filter(Boolean).map((s) => (
                      <Badge key={s!.id} tone="outline">{tx(s!.name)}</Badge>
                    ))}
                  </div>
                  <WeekStrip hours={p.weeklyHours} />
                  <div className="mt-auto flex items-center justify-between gap-2 border-t pt-3 text-xs text-muted-foreground">
                    <span>
                      {t.staff.hoursPerWeek(weeklyHoursTotal(p.weeklyHours))} ·{" "}
                      {t.staff.upcomingCount((upcoming.data ?? []).filter((b) => b.staffId === p.id).length)}
                    </span>
                    <Button variant="secondary" size="sm" onClick={() => setEditing(p)}>
                      <CalendarClock /> {t.staff.editAvailability}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
          {things.length ? (
            <section>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.staff.resources}</h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {things.map((r) => (
                  <Card key={r.id} className={cn("flex items-center gap-3 p-4", !r.active && "opacity-60")}>
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                      {r.kind === "room" ? <DoorOpen className="size-5" /> : <Wrench className="size-5" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{tx(r.name)}</p>
                      <p className="truncate text-xs text-muted-foreground">{tx(r.title)}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setEditing(r)}>{t.common.edit}</Button>
                  </Card>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        {editing ? <AvailabilityDialog resource={editing} onDone={() => setEditing(null)} /> : null}
      </Dialog>
    </div>
  );
}

function WeekStrip({ hours }: { hours: WeeklyHours }) {
  const { t } = useI18n();
  const weekStart = useWeekStart();
  const days = Array.from({ length: 7 }, (_, i) => ((weekStart + i) % 7) as Weekday);
  return (
    <div className="grid grid-cols-7 gap-1" aria-label={t.staff.weekly}>
      {days.map((d) => {
        const r = hours[d];
        return (
          <div key={d} className="grid gap-1 text-center" title={r.length ? r.map((x) => `${x.start}–${x.end}`).join(", ") : t.common.off}>
            <span className="text-[10px] text-muted-foreground">{t.weekdays.short[d]}</span>
            <span className={cn("h-1.5 rounded-full", r.length ? "bg-primary/70" : "bg-muted")} />
          </div>
        );
      })}
    </div>
  );
}

function AvailabilityDialog({ resource, onDone }: { resource: Resource; onDone: () => void }) {
  const { t, tx } = useI18n();
  const repo = useRepository();
  const [hours, setHours] = useState<WeeklyHours>(resource.weeklyHours);
  const [active, setActive] = useState(resource.active);
  const [busy, setBusy] = useState(false);
  const invalid = Object.keys(validateWeek(hours)).length > 0;
  return (
    <DialogContent title={t.staff.availabilityTitle(tx(resource.name))} description={t.staff.availabilityHint} size="lg">
      <DialogBody>
        <label className="flex items-center justify-between gap-3 rounded-lg border p-3">
          <span className="text-sm font-medium">{t.staff.activeLabel}</span>
          <Switch checked={active} onCheckedChange={setActive} />
        </label>
        <WeeklyHoursEditor value={hours} onChange={setHours} idPrefix={`av-${resource.id}`} />
      </DialogBody>
      <DialogFooter>
        <Button variant="secondary" onClick={onDone} disabled={busy}>{t.common.cancel}</Button>
        <Button
          disabled={busy || invalid}
          onClick={async () => {
            setBusy(true);
            try {
              await repo.updateResourceAvailability(resource.id, hours, active);
              toast.success(t.staff.saved);
              onDone();
            } catch {
              toast.error(t.common.errorGeneric);
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? t.common.saving : t.common.save}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
