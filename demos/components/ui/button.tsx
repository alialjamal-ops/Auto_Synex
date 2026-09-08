import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'subtle' | 'inverse';
export type ButtonSize = 'sm' | 'md' | 'lg';

const base =
  'group/btn relative inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap ' +
  'transition-[transform,background-color,color,border-color,box-shadow] duration-300 ease-out ' +
  'active:translate-y-px disabled:pointer-events-none disabled:opacity-50 rounded-brand';

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-brand text-[color:var(--brand-contrast)] hover:brightness-110 hover:-translate-y-0.5 ' +
    'shadow-[0_1px_0_rgba(255,255,255,0.14)_inset,0_10px_28px_-12px_var(--brand)]',
  outline:
    'border border-line text-ink hover:border-[color:var(--brand)] hover:text-brand hover:-translate-y-0.5',
  ghost: 'text-ink/80 hover:text-ink hover:bg-[color:var(--brand-soft)]',
  subtle:
    'bg-[color:var(--brand-soft)] text-brand hover:brightness-105 hover:-translate-y-0.5 border border-transparent',
  inverse:
    'bg-ink text-[color:var(--bg)] hover:-translate-y-0.5 hover:opacity-90',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-[13px]',
  md: 'h-11 px-5 text-sm',
  lg: 'h-13 px-7 text-[15px]',
};

interface CommonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  fullWidth?: boolean;
}

type ButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> & {
    href?: undefined;
  };

type AnchorProps = CommonProps & {
  href: string;
  /** Renders a plain <a> instead of next/link — used for in-page anchors. */
  native?: boolean;
  target?: string;
  rel?: string;
  onClick?: () => void;
  'aria-label'?: string;
};

export function Button(props: ButtonProps | AnchorProps) {
  const {
    children,
    variant = 'primary',
    size = 'md',
    className,
    fullWidth,
    ...rest
  } = props as CommonProps & Record<string, unknown>;
  const classes = cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className);

  if ('href' in props && props.href !== undefined) {
    const { href, native, target, rel, onClick, 'aria-label': ariaLabel } = props;
    if (native || href.startsWith('#')) {
      return (
        <a href={href} className={classes} target={target} rel={rel} onClick={onClick} aria-label={ariaLabel}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} target={target} rel={rel} onClick={onClick} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}

/** Arrow that slides on hover — pair with any Button. */
export function ButtonArrow({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className={cn(
        'h-4 w-4 transition-transform duration-300 ease-out group-hover/btn:translate-x-1',
        className,
      )}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" />
    </svg>
  );
}
