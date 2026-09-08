import Image from 'next/image';
import { cn } from '@/lib/cn';

/**
 * The Auto Synex logo, used exactly as supplied.
 *
 * `public/brand/logo.png` is the master lockup from the main site
 * (`public/assets/logo_transparent.png`) — transparent background, so it sits
 * on any surface. Replace that one file to update the brand everywhere.
 */

const LOGO = '/brand/logo.png';
const RATIO = { width: 1296, height: 864 };

/** Full lockup — monogram above the wordmark. */
export function AutoSynexLockup({ className }: { className?: string }) {
  return (
    <Image
      src={LOGO}
      alt="Auto Synex"
      width={RATIO.width}
      height={RATIO.height}
      priority
      className={cn('h-24 w-auto', className)}
    />
  );
}

/**
 * Header lockup. The supplied artwork is a stacked lockup, so it is used whole
 * rather than being cropped or recoloured.
 */
export function AutoSynexLogo({
  className,
  size = 'md',
}: {
  className?: string;
  size?: 'sm' | 'md';
}) {
  return (
    <Image
      src={LOGO}
      alt="Auto Synex"
      width={RATIO.width}
      height={RATIO.height}
      priority
      className={cn('w-auto', size === 'sm' ? 'h-11' : 'h-14', className)}
    />
  );
}

/** Compact monogram slot — same artwork, smaller. */
export function AutoSynexMark({ className }: { className?: string }) {
  return (
    <Image
      src={LOGO}
      alt=""
      width={RATIO.width}
      height={RATIO.height}
      className={cn('h-9 w-auto', className)}
    />
  );
}
