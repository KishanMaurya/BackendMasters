import Link from 'next/link';
import { BRAND } from '@backendmasters/shared';
import { cn } from '@/lib/utils';

/** The mark: one request fanning out to two nodes. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" fill="none" aria-hidden className={cn('size-7', className)}>
      <path
        d="M6 14C13 14 12 6 21 6M6 14C13 14 12 22 21 22"
        strokeWidth={1.75}
        className="stroke-muted-foreground transition-colors duration-(--motion-base) group-hover/logo:stroke-primary"
      />
      <circle cx={6} cy={14} r={4} className="fill-primary" />
      <circle cx={22} cy={6} r={2.75} className="fill-foreground" />
      <circle cx={22} cy={22} r={2.75} className="fill-foreground" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn('group/logo flex items-center gap-2.5 rounded-md', className)}
      aria-label={`${BRAND.name} home`}
    >
      <LogoMark />
      <span className="font-heading text-[1.0625rem] font-semibold tracking-tight">
        Backend<span className="text-muted-foreground">Masters</span>
      </span>
    </Link>
  );
}
