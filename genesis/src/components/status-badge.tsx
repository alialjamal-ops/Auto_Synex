"use client";

import type { BookingStatus } from "@/domain/types";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n/provider";

export const statusTone: Record<BookingStatus, "warning" | "primary" | "success" | "danger" | "neutral"> = {
  pending: "warning",
  confirmed: "primary",
  completed: "success",
  cancelled: "danger",
  no_show: "neutral",
};

export const statusDot: Record<BookingStatus, string> = {
  pending: "bg-warning",
  confirmed: "bg-primary",
  completed: "bg-success",
  cancelled: "bg-danger",
  no_show: "bg-muted-foreground",
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  const { t } = useI18n();
  return (
    <Badge tone={statusTone[status]}>
      <span className={`size-1.5 rounded-full ${statusDot[status]}`} aria-hidden />
      {t.status[status]}
    </Badge>
  );
}
