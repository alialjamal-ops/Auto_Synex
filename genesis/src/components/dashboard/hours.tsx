"use client";

import { CalendarOff, Globe, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toDateKey } from "@/domain/time";
import { BLOCKING_STATUSES, type WeeklyHours } from "@/domain/types";
import { useBusiness, useRepository } from "@/data/repository-context";
import { useI18n } from "@/i18n/provider";
import { PageHeader } from "./shell";
import { validateWeek, WeeklyHoursEditor } from "./weekly-hours-editor";

export function Hours() {
  const { business } = useBusiness();
  // Re-mount the form when the stored settings change (e.g. after "Reset demo").
  return <HoursForm key={JSON.stringify([business.openingHours, business.rules])} />;
}

function HoursForm() {
  const { t } = useI18n();
  const { business, fmt } = useBusiness();
  const repo = useRepository();
  const [hours, setHours] = useState<WeeklyHours>(business.openingHours);
  const [busy, setBusy] = useState(false);
  const [newDate, setNewDate] = useState("");
  const todayKey = toDateKey(repo.now(), business.timezone);
  const dirty = JSON.stringify(hours) !== JSON.stringify(business.openingHours);
  const invalid = Object.keys(validateWeek(hours)).length > 0;

  async function saveHours() {
    setBusy(true);
    try {
      await repo.updateBusinessSettings({ openingHours: hours });
      toast.success(t.hours.saved);
    } catch {
      toast.error(t.common.errorGeneric);
    } finally {
      setBusy(false);
    }
  }

  async function addClosure() {
    if (!newDate || business.rules.closedDates.includes(newDate)) return;
    const existing = await repo.listBookings({ fromKey: newDate, toKey: newDate, statuses: BLOCKING_STATUSES });
    await repo.updateBusinessSettings({ rules: { closedDates: [...business.rules.closedDates, newDate].sort() } });
    toast.success(t.hours.closureAdded, existing.length ? { description: t.hours.existingWarning(existing.length) } : undefined);
    setNewDate("");
  }

  async function removeClosure(key: string) {
    await repo.updateBusinessSettings({ rules: { closedDates: business.rules.closedDates.filter((d) => d !== key) } });
    toast.success(t.hours.closureRemoved);
  }

  return (
    <div>
      <PageHeader title={t.hours.title} subtitle={t.hours.subtitle} />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>{t.hours.opening}</CardTitle>
              <CardDescription className="mt-1">{t.hours.openingHint}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            <WeeklyHoursEditor value={hours} onChange={setHours} idPrefix="biz" />
            <div className="flex items-center justify-between gap-3">
              <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Globe className="size-3.5" /> {t.hours.timezone}: <span dir="ltr">{fmt.tzName()}</span>
              </p>
              <div className="flex gap-2">
                {dirty ? <Button variant="ghost" onClick={() => setHours(business.openingHours)} disabled={busy}>{t.common.cancel}</Button> : null}
                <Button onClick={saveHours} disabled={!dirty || invalid || busy}>{busy ? t.common.saving : t.common.save}</Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="self-start">
          <CardHeader>
            <div>
              <CardTitle>{t.hours.closures}</CardTitle>
              <CardDescription className="mt-1">{t.hours.closuresHint}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void addClosure();
              }}
            >
              <Input type="date" min={todayKey} value={newDate} onChange={(e) => setNewDate(e.target.value)} aria-label={t.hours.addClosure} dir="ltr" />
              <Button type="submit" variant="secondary" disabled={!newDate}>
                <Plus /> {t.common.add}
              </Button>
            </form>
            {business.rules.closedDates.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-8 text-center text-sm text-muted-foreground">
                <CalendarOff className="size-5" />
                {t.hours.noClosures}
              </div>
            ) : (
              <ul className="divide-y rounded-xl border">
                {business.rules.closedDates.map((d) => (
                  <li key={d} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm">
                    <span>{fmt.keyLong(d)}</span>
                    <Button variant="ghost" size="icon-sm" onClick={() => removeClosure(d)} aria-label={`${t.common.remove}: ${fmt.keyLong(d)}`}>
                      <Trash2 />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
