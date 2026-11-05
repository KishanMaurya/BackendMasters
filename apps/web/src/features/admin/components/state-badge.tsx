import type { ArticleState } from '@backendmasters/shared';
import { cn } from '@/lib/utils';

const LABELS: Record<ArticleState, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  published: 'Published',
};

/** Text carries the meaning. The colour only reinforces it. */
export function StateBadge({ state }: { state: ArticleState }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-2 py-0.5 font-mono text-[0.6875rem]',
        state === 'published' && 'border-primary/40 bg-accent text-accent-foreground',
        state === 'scheduled' && 'border-foreground/30',
        state === 'draft' && 'border-dashed text-muted-foreground',
      )}
    >
      {LABELS[state]}
    </span>
  );
}
