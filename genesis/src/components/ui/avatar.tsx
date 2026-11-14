import Image from "next/image";
import { cn, hueStyle, initials } from "@/lib/utils";

const sizes = { sm: { cls: "size-7 text-[11px]", px: 28 }, md: { cls: "size-9 text-xs", px: 36 }, lg: { cls: "size-12 text-sm", px: 48 }, xl: { cls: "size-16 text-base", px: 64 } };

/** Profile photo when available, otherwise initials on the person's lane colour. */
export function Avatar({ name, hue, photo, size = "md", className }: { name: string; hue: number; photo?: string; size?: keyof typeof sizes; className?: string }) {
  const s = sizes[size];
  if (photo) {
    return (
      <Image
        src={photo}
        alt=""
        width={s.px * 2}
        height={s.px * 2}
        className={cn("shrink-0 rounded-full object-cover ring-2 ring-card", s.cls, className)}
        style={{ width: s.px, height: s.px }}
      />
    );
  }
  return (
    <span
      aria-hidden
      style={hueStyle(hue)}
      className={cn(
        "lane inline-flex shrink-0 items-center justify-center rounded-full bg-[var(--lane-bg)] font-semibold text-[var(--lane-fg)] ring-1 ring-[var(--lane-border)]/25",
        s.cls,
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
