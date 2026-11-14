import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  hint,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  hint?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 px-6 py-12 text-center", className)}>
      <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </span>
      <div className="grid gap-1">
        <p className="text-sm font-medium">{title}</p>
        {hint ? <p className="max-w-xs text-sm text-muted-foreground">{hint}</p> : null}
      </div>
      {action}
    </div>
  );
}
