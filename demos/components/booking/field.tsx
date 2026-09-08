'use client';

import { AlertCircle } from 'lucide-react';
import { useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface BaseProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

const controlClass =
  'w-full rounded-brand border bg-[color:var(--surface)] px-4 py-3 text-[15px] text-ink ' +
  'placeholder:text-muted/60 transition-colors duration-200 outline-none ' +
  'focus:border-[color:var(--brand)] focus:ring-2 focus:ring-[color:var(--brand)]/25';

export function Field({
  label,
  error,
  hint,
  required,
  className,
  ...props
}: BaseProps & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={id} className="text-[13px] font-medium">
        {label}
        {required ? <span className="ml-1 text-brand">*</span> : null}
      </label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={cn(controlClass, error ? 'border-red-500/70' : 'border-line')}
        {...props}
      />
      {error ? (
        <p id={errorId} role="alert" className="flex items-center gap-1.5 text-[12px] text-red-500">
          <AlertCircle className="size-3.5 shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p className="text-[12px] text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function TextField({
  label,
  hint,
  className,
  ...props
}: BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={id} className="text-[13px] font-medium">
        {label}
      </label>
      <textarea id={id} rows={3} className={cn(controlClass, 'border-line resize-none')} {...props} />
      {hint ? <p className="text-[12px] text-muted">{hint}</p> : null}
    </div>
  );
}
