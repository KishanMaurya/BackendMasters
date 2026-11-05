import Link from 'next/link';
import { cn } from '@/lib/utils';

export function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'true' : undefined}
      className={cn(
        'rounded-full border px-3 py-1.5 text-sm whitespace-nowrap transition-colors duration-(--motion-fast)',
        active
          ? 'border-primary bg-accent text-accent-foreground'
          : 'text-muted-foreground hover:border-foreground/30 hover:text-foreground',
      )}
    >
      {children}
    </Link>
  );
}
