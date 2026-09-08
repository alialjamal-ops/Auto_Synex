import { cn } from '@/lib/cn';

/**
 * Auto Synex brand marks.
 *
 * Rebuilt as clean vector geometry from the master logo artwork, using the
 * brand's own gradient stops. (The SVG currently served by the main site
 * renders the S as a solid blob and all but hides the A — this replaces it.)
 *
 * Inlined rather than <img> so the metal gradient can lift on dark surfaces,
 * where the original charcoal A would disappear.
 */

type Surface = 'dark' | 'light';

const BLUE = ['#5CB3FF', '#1E90FF', '#0A3D62'] as const;
const METAL_ON_LIGHT = ['#5A5A5A', '#2E2E2E', '#4A4A4A'] as const;
const METAL_ON_DARK = ['#D3DAE2', '#98A3AE', '#B3BCC6'] as const;

const A_PATH = 'M50 4 L99 96 L75 96 L65 78 L35 78 L25 96 L1 96 Z M50 33 L63 69 L37 69 Z';
const S_PATH =
  'M54 24 L92 24 L92 38 L58 38 L58 50 L92 50 L92 78 L82 88 L44 88 L44 74 L78 74 L78 64 L44 64 L44 34 Z';
const A_TIP_PATH = 'M99 96 L75 96 L88 73 Z';

export function AutoSynexMark({
  className,
  surface = 'dark',
  id = 'as',
}: {
  className?: string;
  surface?: Surface;
  /** Gradient ids must stay unique when several marks share a page. */
  id?: string;
}) {
  const metal = surface === 'dark' ? METAL_ON_DARK : METAL_ON_LIGHT;

  return (
    <svg viewBox="0 0 100 100" className={cn('block', className)} role="img" aria-label="Auto Synex">
      <defs>
        <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={metal[0]} />
          <stop offset="0.55" stopColor={metal[1]} />
          <stop offset="1" stopColor={metal[2]} />
        </linearGradient>
        <linearGradient id={`${id}-blue`} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor={BLUE[0]} />
          <stop offset="0.45" stopColor={BLUE[1]} />
          <stop offset="1" stopColor={BLUE[2]} />
        </linearGradient>
      </defs>

      <path fill={`url(#${id}-metal)`} fillRule="evenodd" d={A_PATH} />
      <path fill={`url(#${id}-blue)`} d={S_PATH} />
      <path fill={`url(#${id}-metal)`} d={A_TIP_PATH} />
    </svg>
  );
}

/** Wordmark as live text — crisp at every size, selectable, translatable. */
function Wordmark({
  surface,
  className,
}: {
  surface: Surface;
  className?: string;
}) {
  return (
    <span className={cn('font-display font-extrabold uppercase tracking-[0.02em]', className)}>
      <span className={surface === 'dark' ? 'text-ink' : 'text-[#1A2A3C]'}>Auto</span>
      <span className="text-brand"> Synex</span>
    </span>
  );
}

/** Horizontal lockup for headers. */
export function AutoSynexLogo({
  className,
  surface = 'dark',
  size = 'md',
}: {
  className?: string;
  surface?: Surface;
  size?: 'sm' | 'md';
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <AutoSynexMark
        surface={surface}
        id={size === 'sm' ? 'as-sm' : 'as-md'}
        className={size === 'sm' ? 'h-8 w-8' : 'h-10 w-10'}
      />
      <Wordmark surface={surface} className={size === 'sm' ? 'text-[15px]' : 'text-[17px]'} />
    </span>
  );
}

/** Stacked lockup — mark above the wordmark, as on the master artwork. */
export function AutoSynexLockup({
  className,
  surface = 'dark',
}: {
  className?: string;
  surface?: Surface;
}) {
  return (
    <span className={cn('inline-flex flex-col items-center gap-3', className)}>
      <AutoSynexMark surface={surface} id="as-stack" className="h-16 w-16" />
      <Wordmark surface={surface} className="text-[22px]" />
    </span>
  );
}
