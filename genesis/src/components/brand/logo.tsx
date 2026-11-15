import Image from "next/image";
import { cn, hueStyle } from "@/lib/utils";

/** The Auto Synex logo exactly as supplied (silver A, blue S) on its navy tile. */
export function AutoSynexMark({ className }: { className?: string }) {
  return <Image src="/brand/logo-tile.png" alt="" aria-hidden width={384} height={384} className={cn("size-9 shrink-0 rounded-[22%]", className)} />;
}

export function AutoSynexLogo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)} dir="ltr">
      <AutoSynexMark />
      {!compact && (
        <span className="grid leading-none">
          <span className="text-[15px] font-bold italic tracking-tight">
            AUTO <span className="text-primary">SYNEX</span>
          </span>
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
