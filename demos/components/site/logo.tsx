import Link from 'next/link';
import { cn } from '@/lib/cn';
import type { DemoConfig } from '@/types/demo';

/** Logo lockup: monogram tile + wordmark. Derived entirely from the config. */
export function DemoLogo({
  config,
  className,
  href,
  compact = false,
}: {
  config: DemoConfig;
  className?: string;
  href?: string;
  compact?: boolean;
}) {
  const content = (
    <span className={cn('group/logo inline-flex items-center gap-2.5', className)}>
      <span
        aria-hidden
        className="grid size-9 shrink-0 place-items-center rounded-brand bg-brand text-[color:var(--brand-contrast)] font-display text-[15px] font-semibold transition-transform duration-500 group-hover/logo:rotate-[-6deg]"
      >
        {config.logoMark}
      </span>
      {!compact ? (
        <span className="flex flex-col leading-none">
          <span className="font-display text-[17px] font-semibold tracking-tight">
            {config.businessName}
          </span>
          <span className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted">
            {config.industry}
          </span>
        </span>
      ) : null}
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} className="rounded-brand" aria-label={`${config.businessName} — home`}>
      {content}
    </Link>
  );
}
