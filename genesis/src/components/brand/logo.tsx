import Image from "next/image";
import { cn, hueStyle } from "@/lib/utils";

/** Auto Synex brand mark (graphite "A" on light surfaces, silver on dark). */
export function AutoSynexMark({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("inline-flex h-8 shrink-0 items-center", className)}>
      <Image src="/brand/mark.png" alt="" width={550} height={382} className="h-full w-auto dark:hidden" />
      <Image src="/brand/mark-dark.png" alt="" width={550} height={382} className="hidden h-full w-auto dark:block" />
    </span>
  );
}

export function AutoSynexLogo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)} dir="ltr">
      <AutoSynexMark className="h-9" />
      {!compact && (
        <span className="grid leading-none">
          <span className="text-[15px] font-semibold tracking-tight">Auto Synex</span>
          <span className="mt-0.5 text-[11px] font-medium text-muted-foreground">Booking OS</span>
        </span>
      )}
    </span>
  );
}

/** Tenant logo placeholder: monogram on the business's brand hue. */
export function BusinessLogo({ monogram, hue, size = "md", className }: { monogram: string; hue: number; size?: "sm" | "md" | "lg"; className?: string }) {
  return (
    <span
      style={hueStyle(hue)}
      dir="ltr"
      className={cn(
        "lane inline-flex shrink-0 items-center justify-center rounded-xl border border-[var(--lane-border)]/30 bg-[var(--lane-bg)] font-semibold tracking-tight text-[var(--lane-fg)]",
        { sm: "size-8 text-[11px]", md: "size-10 text-sm", lg: "size-14 text-lg" }[size],
        className,
      )}
    >
      {monogram}
    </span>
  );
}
