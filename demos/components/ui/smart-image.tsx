'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { MediaAsset } from '@/config/media';
import { cn } from '@/lib/cn';

export type AspectRatio =
  | '21/9'
  | '16/9'
  | '16/10'
  | '3/2'
  | '4/3'
  | '1/1'
  | '4/5'
  | '3/4'
  | '2/3'
  | '9/16';

interface SmartImageProps {
  asset: MediaAsset;
  alt: string;
  /** Locked aspect ratio — guarantees no layout shift and no cropping surprises. */
  ratio?: AspectRatio;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  priority?: boolean;
  /** Scales the photo slightly on hover of the nearest `.group` ancestor. */
  zoomOnHover?: boolean;
  /** Dark scrim for text laid over the photo. */
  overlay?: 'none' | 'soft' | 'strong' | 'bottom';
  quality?: number;
}

const overlayClass: Record<NonNullable<SmartImageProps['overlay']>, string> = {
  none: '',
  soft: 'after:absolute after:inset-0 after:bg-black/25',
  strong: 'after:absolute after:inset-0 after:bg-black/50',
  bottom:
    'after:absolute after:inset-0 after:bg-gradient-to-t after:from-black/80 after:via-black/25 after:to-transparent',
};

/**
 * The only image component in the project.
 *
 * Fixed ratio + object-cover + a skeleton while the remote photo decodes, so a
 * swapped-in image can never break a layout.
 */
export function SmartImage({
  asset,
  alt,
  ratio = '4/3',
  className,
  imageClassName,
  sizes = '(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 640px',
  priority = false,
  zoomOnHover = false,
  overlay = 'none',
  quality = 82,
}: SmartImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={cn(
        'relative isolate overflow-hidden',
        !loaded && 'media-skeleton animate-shimmer',
        overlayClass[overlay],
        className,
      )}
      style={{ aspectRatio: ratio.replace('/', ' / ') }}
    >
      <Image
        src={asset.src}
        alt={alt}
        fill
        sizes={sizes}
        quality={quality}
        priority={priority}
        loading={priority ? undefined : 'lazy'}
        onLoad={() => setLoaded(true)}
        className={cn(
          'object-cover transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
          loaded ? 'opacity-100' : 'opacity-0',
          zoomOnHover && 'group-hover:scale-[1.045]',
          imageClassName,
        )}
      />
    </div>
  );
}
