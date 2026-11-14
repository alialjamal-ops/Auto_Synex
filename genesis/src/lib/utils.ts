import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function initials(name: string) {
  const parts = name.replace(/^(Dr\.|Eng\.|د\.|م\.)\s*/u, "").split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

/** Soft, theme-friendly colour from a hue (used for avatars and calendar lanes). */
export function hueStyle(hue: number) {
  return { "--lane-hue": String(hue) } as React.CSSProperties;
}
