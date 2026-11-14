"use client";

import { Check } from "lucide-react";
import { Checkbox as C } from "radix-ui";
import * as React from "react";
import { cn } from "@/lib/utils";

export function Checkbox({ className, ...props }: React.ComponentProps<typeof C.Root>) {
  return (
    <C.Root
      className={cn(
        "peer flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border border-input bg-card shadow-xs transition-colors data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground aria-[invalid=true]:border-danger",
        className,
      )}
      {...props}
    >
      <C.Indicator>
        <Check className="size-3.5" strokeWidth={3} />
      </C.Indicator>
    </C.Root>
  );
}
