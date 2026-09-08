import { cn } from '@/lib/cn';

/**
 * CSS-only infinite ticker (no JS, no layout thrash). The track is duplicated
 * once and translated -50%, so the loop is seamless at any width.
 */
export function Marquee({
  items,
  className,
  itemClassName,
  separator = '—',
  reverse = false,
  speed = 38,
}: {
  items: readonly string[];
  className?: string;
  itemClassName?: string;
  separator?: string;
  reverse?: boolean;
  speed?: number;
}) {
  const track = [...items, ...items];

  return (
    <div
      className={cn(
        'group relative flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]',
        className,
      )}
    >
      <div
        className="flex w-max shrink-0 animate-[marquee_var(--speed)_linear_infinite] items-center group-hover:[animation-play-state:paused] motion-reduce:animate-none"
        style={
          {
            '--speed': `${speed}s`,
            animationDirection: reverse ? 'reverse' : 'normal',
          } as React.CSSProperties
        }
      >
        {track.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className={cn('flex shrink-0 items-center whitespace-nowrap', itemClassName)}
          >
            {item}
            <span aria-hidden className="mx-6 opacity-40 sm:mx-10">
              {separator}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
