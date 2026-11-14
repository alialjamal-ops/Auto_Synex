import { cn, hueStyle, initials } from "@/lib/utils";

export function Avatar({ name, hue, size = "md", className }: { name: string; hue: number; size?: "sm" | "md" | "lg"; className?: string }) {
  return (
    <span
      aria-hidden
      style={hueStyle(hue)}
      className={cn(
        "lane inline-flex shrink-0 items-center justify-center rounded-full bg-[var(--lane-bg)] font-semibold text-[var(--lane-fg)] ring-1 ring-[var(--lane-border)]/25",
        { sm: "size-7 text-[11px]", md: "size-9 text-xs", lg: "size-12 text-sm" }[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
