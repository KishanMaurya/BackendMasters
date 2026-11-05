import type { Difficulty } from '@backendmasters/shared';

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span className="inline-flex rounded-full border px-2 py-0.5 font-mono text-[0.6875rem] text-muted-foreground capitalize">
      {difficulty}
    </span>
  );
}
