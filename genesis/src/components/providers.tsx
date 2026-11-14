"use client";

import { ThemeProvider, useTheme } from "next-themes";
import { Direction, Tooltip } from "radix-ui";
import { Toaster } from "sonner";
import type { ReactNode } from "react";
import type { Locale } from "@/domain/types";
import { I18nProvider, useI18n } from "@/i18n/provider";

function DirectionAndToasts({ children }: { children: ReactNode }) {
  const { dir } = useI18n();
  const { resolvedTheme } = useTheme();
  return (
    <Direction.Provider dir={dir}>
      <Tooltip.Provider delayDuration={300}>
        {children}
        <Toaster
          dir={dir}
          position={dir === "rtl" ? "bottom-left" : "bottom-right"}
          theme={resolvedTheme === "dark" ? "dark" : "light"}
          toastOptions={{ className: "!rounded-xl !border !shadow-lg !font-sans" }}
          richColors
          closeButton
        />
      </Tooltip.Provider>
    </Direction.Provider>
  );
}

export function Providers({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <I18nProvider initialLocale={locale}>
        <DirectionAndToasts>{children}</DirectionAndToasts>
      </I18nProvider>
    </ThemeProvider>
  );
}
