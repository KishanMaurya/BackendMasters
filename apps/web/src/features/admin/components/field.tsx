import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export const INPUT_CLASS =
  'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors duration-(--motion-fast) placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive';

export function Field({
  id,
  label,
  hint,
  error,
  className,
  children,
}: {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

export function Notice({
  tone,
  children,
}: {
  tone: 'error' | 'warning' | 'success';
  children: ReactNode;
}) {
  return (
    <p
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'rounded-lg border px-3 py-2 text-sm',
        tone === 'error' && 'border-destructive/40 bg-destructive/10 text-destructive',
        tone === 'warning' && 'border-border bg-muted',
        tone === 'success' && 'border-primary/40 bg-accent text-accent-foreground',
      )}
    >
      {children}
    </p>
  );
}
