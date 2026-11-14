"use client";

import { Compass } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/provider";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Compass className="size-6" />
      </span>
      <h1 className="text-xl font-semibold tracking-tight">{t.common.notFoundTitle}</h1>
      <p className="max-w-sm text-sm text-muted-foreground">{t.common.notFoundBody}</p>
      <Button asChild>
        <Link href="/">{t.common.goHome}</Link>
      </Button>
    </main>
  );
}
