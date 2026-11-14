"use client";

import { Database, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ResetDemoButton } from "@/components/controls";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { BookingRules } from "@/domain/types";
import { useBusiness, useRepository } from "@/data/repository-context";
import { useI18n } from "@/i18n/provider";
import { PageHeader } from "./shell";

export function Settings() {
  const { business } = useBusiness();
  // Re-mount the form when the stored settings change (e.g. after "Reset demo").
  return <SettingsForm key={JSON.stringify([business.openingHours, business.rules])} />;
}

function SettingsForm() {
  const { t } = useI18n();
  const { business } = useBusiness();
  const repo = useRepository();
  const [rules, setRules] = useState<BookingRules>(business.rules);
  const [busy, setBusy] = useState(false);
  const dirty = JSON.stringify(rules) !== JSON.stringify(business.rules);
  const set = <K extends keyof BookingRules>(k: K, v: BookingRules[K]) => setRules((r) => ({ ...r, [k]: v }));
  const minutes = (list: number[]) => list.map((n) => ({ value: String(n), label: n === 0 ? t.common.none : n >= 60 && n % 60 === 0 ? t.common.hoursShort(n / 60) : t.common.minutes(n) }));

  const rows: Array<{ id: string; label: string; hint: string; control: React.ReactNode }> = [
    { id: "slot", label: t.settings.slotInterval, hint: t.settings.slotIntervalHint, control: <Select id="slot" value={String(rules.slotIntervalMin)} onValueChange={(v) => set("slotIntervalMin", Number(v))} options={minutes([10, 15, 20, 30, 60])} /> },
    { id: "buffer", label: t.settings.buffer, hint: t.settings.bufferHint, control: <Select id="buffer" value={String(rules.bufferMin)} onValueChange={(v) => set("bufferMin", Number(v))} options={minutes([0, 5, 10, 15, 20, 30])} /> },
    { id: "notice", label: t.settings.minNotice, hint: t.settings.minNoticeHint, control: <Select id="notice" value={String(rules.minNoticeMin)} onValueChange={(v) => set("minNoticeMin", Number(v))} options={minutes([0, 30, 60, 120, 180, 240, 720, 1440])} /> },
    { id: "advance", label: t.settings.maxAdvance, hint: t.settings.maxAdvanceHint, control: <Select id="advance" value={String(rules.maxAdvanceDays)} onValueChange={(v) => set("maxAdvanceDays", Number(v))} options={[7, 14, 30, 45, 60, 90].map((n) => ({ value: String(n), label: t.settings.days(n) }))} /> },
  ];
  const toggles: Array<{ k: "allowStaffSelection" | "autoConfirm"; label: string; hint: string }> = [
    { k: "allowStaffSelection", label: t.settings.allowStaff, hint: t.settings.allowStaffHint },
    { k: "autoConfirm", label: t.settings.autoConfirm, hint: t.settings.autoConfirmHint },
  ];

  return (
    <div>
      <PageHeader
        title={t.settings.title}
        subtitle={t.settings.subtitle}
        actions={
          <>
            {dirty ? <Button variant="ghost" onClick={() => setRules(business.rules)} disabled={busy}>{t.common.cancel}</Button> : null}
            <Button
              disabled={!dirty || busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await repo.updateBusinessSettings({ rules });
                  toast.success(t.settings.saved);
                } catch {
                  toast.error(t.common.errorGeneric);
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? t.common.saving : t.common.save}
            </Button>
          </>
        }
      />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="grid content-start gap-4">
          <Card>
            <CardHeader><CardTitle>{t.settings.scheduling}</CardTitle></CardHeader>
            <CardContent className="grid gap-0 divide-y py-2">
              {rows.map((r) => (
                <div key={r.id} className="grid gap-2 py-4 sm:grid-cols-[1fr_220px] sm:items-center sm:gap-6">
                  <div>
                    <label htmlFor={r.id} className="text-sm font-medium">{r.label}</label>
                    <p className="text-xs text-muted-foreground">{r.hint}</p>
                  </div>
                  {r.control}
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>{t.settings.policies}</CardTitle></CardHeader>
            <CardContent className="grid gap-0 divide-y py-2">
              {toggles.map((x) => (
                <label key={x.k} className="flex items-center justify-between gap-6 py-4">
                  <span>
                    <span className="block text-sm font-medium">{x.label}</span>
                    <span className="block text-xs text-muted-foreground">{x.hint}</span>
                  </span>
                  <Switch checked={rules[x.k]} onCheckedChange={(v) => set(x.k, v)} />
                </label>
              ))}
              <div className="grid gap-2 py-4 sm:grid-cols-[1fr_220px] sm:items-center sm:gap-6">
                <div>
                  <label htmlFor="cancel-window" className="text-sm font-medium">{t.settings.cancellation}</label>
                  <p className="text-xs text-muted-foreground">{t.settings.cancellationHint}</p>
                </div>
                <Select id="cancel-window" value={String(rules.cancellationWindowHours)} onValueChange={(v) => set("cancellationWindowHours", Number(v))}
                  options={[2, 6, 12, 24, 48, 72].map((h) => ({ value: String(h), label: t.common.hoursShort(h) }))} />
              </div>
            </CardContent>
          </Card>
        </div>
        <Card className="self-start">
          <CardHeader><CardTitle className="flex items-center gap-2"><Database className="size-4" /> {t.settings.demoTitle}</CardTitle></CardHeader>
          <CardContent className="grid gap-4">
            <p className="flex gap-2.5 rounded-lg bg-warning-soft/60 p-3 text-sm leading-relaxed">
              <ShieldAlert className="mt-0.5 size-4 shrink-0 text-warning-foreground" />
              {t.settings.demoBody}
            </p>
            <dl className="flex justify-between text-sm">
              <dt className="text-muted-foreground">{t.settings.storage}</dt>
              <dd className="font-medium">{t.settings.storageValue}</dd>
            </dl>
            <ResetDemoButton variant="secondary" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
