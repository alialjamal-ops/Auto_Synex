"use client";

import { ToggleGroup } from "radix-ui";
import * as React from "react";
import { cn } from "@/lib/utils";

/** Compact single-choice control (view switchers, ranges). */
export function Segmented<T extends string>({
  value,
  onValueChange,
  options,
  ariaLabel,
  className,
}: {
  value: T;
  onValueChange: (v: T) => void;
  options: Array<{ value: T; label: React.ReactNode }>;
  ariaLabel: string;
  className?: string;
}) {
  return (
    <ToggleGroup.Root
      type="single"
      value={value}
      onValueChange={(v) => v && onValueChange(v as T)}
      aria-label={ariaLabel}
      className={cn("inline-flex rounded-lg border bg-muted/60 p-0.5", className)}
    >
      {options.map((o) => (
        <ToggleGroup.Item
          key={o.value}
          value={o.value}
          className="flex-1 whitespace-nowrap rounded-md px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-all hover:text-foreground data-[state=on]:bg-card data-[state=on]:text-foreground data-[state=on]:shadow-sm"
        >
          {o.label}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}
