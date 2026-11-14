import { cn, hueStyle } from "@/lib/utils";

/** Auto Synex product mark. */
export function AutoSynexMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-8", className)}>
      <defs>
        <linearGradient id="as-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="oklch(0.62 0.19 255)" />
          <stop offset="1" stopColor="oklch(0.47 0.22 266)" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#as-g)" />
      <path d="M8.5 23 14.2 9h3.6l5.7 14h-3.7l-1.2-3.1h-5.2L12.2 23H8.5Zm5.9-6h3.2L16 12.8 14.4 17Z" fill="white" />
      <path d="M20.2 9h3.3v3.2h-3.3z" fill="white" opacity=".55" />
    </svg>
  );
}

export function AutoSynexLogo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)} dir="ltr">
      <AutoSynexMark />
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
