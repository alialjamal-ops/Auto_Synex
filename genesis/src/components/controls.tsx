"use client";

import { Languages, Monitor, Moon, RotateCcw, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogBody } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRepository } from "@/data/repository-context";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";

const subscribeNoop = () => () => {};
function useMounted() {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

export function LanguageToggle({ className }: { className?: string }) {
  const { t, locale, setLocale } = useI18n();
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("gap-1.5 px-2.5", className)}
      onClick={() => setLocale(locale === "en" ? "ar" : "en")}
      aria-label={`${t.common.language}: ${t.common.switchLanguage}`}
    >
      <Languages />
      <span lang={locale === "en" ? "ar" : "en"}>{t.common.switchLanguage}</span>
    </Button>
  );
}

export function ThemeToggle() {
  const { t } = useI18n();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useMounted();
  const Icon = !mounted ? Sun : resolvedTheme === "dark" ? Moon : Sun;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={t.common.theme}>
          <Icon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={mounted ? theme : undefined} onValueChange={setTheme}>
          <DropdownMenuRadioItem value="light">
            <Sun /> {t.common.light}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">
            <Moon /> {t.common.dark}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">
            <Monitor /> {t.common.system}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Restores the current industry's seeded data (requires RepositoryProvider). */
export function ResetDemoButton({ variant = "ghost", showLabel = true }: { variant?: "ghost" | "secondary"; showLabel?: boolean }) {
  const { t } = useI18n();
  const repo = useRepository();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function reset() {
    setBusy(true);
    try {
      await repo.reset();
      toast.success(t.common.resetDone);
      setOpen(false);
    } catch {
      toast.error(t.common.errorGeneric);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant={variant} size="sm" onClick={() => setOpen(true)} aria-label={t.common.resetDemo} className={cn(!showLabel && "px-2")}>
        <RotateCcw />
        {showLabel ? <span>{t.common.resetDemo}</span> : null}
      </Button>
      <DialogContent title={t.common.resetTitle} size="sm">
        <DialogBody>
          <p className="text-sm leading-relaxed text-muted-foreground">{t.common.resetBody}</p>
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)} disabled={busy}>
            {t.common.cancel}
          </Button>
          <Button variant="destructive" onClick={reset} disabled={busy}>
            <RotateCcw /> {busy ? t.common.loading : t.common.resetConfirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DemoBadge({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <span
      title={t.common.demoDataHint}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-warning/40 bg-warning-soft px-2 py-0.5 text-[11px] font-semibold text-warning-foreground",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-warning" aria-hidden />
      {t.common.demoData}
    </span>
  );
}
