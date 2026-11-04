import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('font-mono text-xs tracking-widest text-primary uppercase', className)}>
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  id,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  id?: string;
}) {
  return (
    <div className="max-w-2xl space-y-3">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 id={id} className="text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {description && <p className="text-muted-foreground sm:text-lg">{description}</p>}
    </div>
  );
}
