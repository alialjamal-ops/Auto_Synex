"use client";

import { X } from "lucide-react";
import { Dialog as D } from "radix-ui";
import * as React from "react";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";

export const Dialog = D.Root;
export const DialogTrigger = D.Trigger;
export const DialogClose = D.Close;

const overlay =
  "fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0";

export function DialogContent({
  className,
  children,
  title,
  description,
  size = "md",
  ...props
}: Omit<React.ComponentProps<typeof D.Content>, "title"> & {
  title: React.ReactNode;
  description?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const { t } = useI18n();
  return (
    <D.Portal>
      <D.Overlay className={overlay} />
      <D.Content
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col rounded-t-2xl border bg-card shadow-lg outline-none data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-8 data-[state=open]:fade-in-0 sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[calc(100%-2rem)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:data-[state=open]:slide-in-from-bottom-2 sm:data-[state=open]:zoom-in-[0.98]",
          { sm: "sm:max-w-md", md: "sm:max-w-lg", lg: "sm:max-w-2xl", xl: "sm:max-w-3xl" }[size],
          className,
        )}
        {...(description ? {} : { "aria-describedby": undefined })}
        {...props}
      >
        <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
          <div className="grid gap-1">
            <D.Title className="text-base font-semibold tracking-tight">{title}</D.Title>
            {description ? <D.Description className="text-sm text-muted-foreground">{description}</D.Description> : null}
          </div>
          <D.Close className="-m-1 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label={t.common.close}>
            <X className="size-4" />
          </D.Close>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </D.Content>
    </D.Portal>
  );
}

export function DialogBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("grid gap-4 px-5 py-5", className)} {...props} />;
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("sticky bottom-0 flex flex-col-reverse gap-2 border-t bg-card px-5 py-3.5 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  );
}

/** Side panel variant (details drawers). Slides from the inline-end edge. */
export function SheetContent({
  className,
  children,
  title,
  description,
  ...props
}: Omit<React.ComponentProps<typeof D.Content>, "title"> & { title: React.ReactNode; description?: React.ReactNode }) {
  const { t, dir } = useI18n();
  return (
    <D.Portal>
      <D.Overlay className={overlay} />
      <D.Content
        className={cn(
          "fixed inset-y-0 z-50 flex w-full max-w-md flex-col border-s bg-card shadow-lg outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
          dir === "rtl" ? "left-0 data-[state=open]:slide-in-from-left-8" : "right-0 data-[state=open]:slide-in-from-right-8",
          className,
        )}
        {...(description ? {} : { "aria-describedby": undefined })}
        {...props}
      >
        <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
          <div className="grid min-w-0 gap-1">
            <D.Title className="truncate text-base font-semibold tracking-tight">{title}</D.Title>
            {description ? <D.Description className="text-sm text-muted-foreground">{description}</D.Description> : null}
          </div>
          <D.Close className="-m-1 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label={t.common.close}>
            <X className="size-4" />
          </D.Close>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </D.Content>
    </D.Portal>
  );
}
