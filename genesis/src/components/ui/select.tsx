"use client";

import { Check, ChevronDown } from "lucide-react";
import { Select as S } from "radix-ui";
import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

/** Accessible select built on Radix; options passed as data for brevity. */
export function Select({
  value,
  onValueChange,
  options,
  placeholder,
  id,
  className,
  ariaLabel,
  disabled,
  invalid,
}: {
  value: string | undefined;
  onValueChange: (v: string) => void;
  options: SelectOption[];
  placeholder?: string;
  id?: string;
  className?: string;
  ariaLabel?: string;
  disabled?: boolean;
  invalid?: boolean;
}) {
  return (
    <S.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <S.Trigger
        id={id}
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        className={cn(
          "flex h-10 w-full min-w-0 items-center justify-between gap-2 rounded-lg border border-input bg-card px-3 text-start text-sm shadow-xs transition-[border-color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20 focus-visible:ring-offset-0 disabled:opacity-50 aria-[invalid=true]:border-danger data-[placeholder]:text-muted-foreground",
          className,
        )}
      >
        <span className="truncate">
          <S.Value placeholder={placeholder} />
        </span>
        <S.Icon>
          <ChevronDown className="size-4 opacity-60" />
        </S.Icon>
      </S.Trigger>
      <S.Portal>
        <S.Content
          position="popper"
          sideOffset={6}
          className="z-50 max-h-[min(22rem,var(--radix-select-content-available-height))] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <S.Viewport className="p-1">
            {options.map((o) => (
              <S.Item
                key={o.value}
                value={o.value}
                disabled={o.disabled}
                className="relative flex cursor-pointer select-none items-center gap-2 rounded-md py-2 pe-8 ps-2.5 text-sm outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-muted data-[disabled]:opacity-50"
              >
                <S.ItemText>{o.label}</S.ItemText>
                <S.ItemIndicator className="absolute end-2.5">
                  <Check className="size-4 text-primary" />
                </S.ItemIndicator>
              </S.Item>
            ))}
          </S.Viewport>
        </S.Content>
      </S.Portal>
    </S.Root>
  );
}
