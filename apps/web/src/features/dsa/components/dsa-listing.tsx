import Link from 'next/link';
import { DSA_TOPICS, type Difficulty } from '@backendmasters/shared';
import { DifficultyBadge } from '@/components/catalog/difficulty-badge';
import { FilterChip } from '@/components/catalog/filter-chip';
import { PageLinks } from '@/components/catalog/page-links';
import { dsaHref, parseDsaFilters, PROBLEMS_PER_PAGE } from '../listing-params';
import { getDsaPage, getDsaTopicCounts } from '../queries';

const DIFFICULTIES: readonly Difficulty[] = ['easy', 'medium', 'hard'];

export function topicName(slug: string): string {
  return DSA_TOPICS.find((topic) => topic.slug === slug)?.name ?? slug;
}

export async function DsaListing({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseDsaFilters(await searchParams);
  const { topic, difficulty } = filters;
  const [page, counts] = await Promise.all([getDsaPage(filters), getDsaTopicCounts()]);
  const countFor = (slug: string) => counts.find((item) => item.topic === slug)?.count;
  const filtered = Boolean(topic || difficulty);

  return (
    <div className="space-y-6">
      <h2 id="problems" className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Problems
      </h2>

      <nav aria-label="Filter by difficulty" className="flex flex-wrap gap-2">
        <FilterChip href={dsaHref({ topic })} active={!difficulty}>
          Any level
        </FilterChip>
        {DIFFICULTIES.map((level) => (
          <FilterChip
            key={level}
            href={dsaHref({ topic, difficulty: level })}
            active={difficulty === level}
          >
            <span className="capitalize">{level}</span>
          </FilterChip>
        ))}
      </nav>

      <nav aria-label="Filter by topic" className="flex flex-wrap gap-2">
        <FilterChip href={dsaHref({ difficulty })} active={!topic}>
          All topics
        </FilterChip>
        {DSA_TOPICS.map((item) => {
          const count = countFor(item.slug);
          return (
            <FilterChip
              key={item.slug}
              href={dsaHref({ topic: item.slug, difficulty })}
              active={topic === item.slug}
            >
              {item.name}
              {count ? <span className="ml-1.5 font-mono text-xs">{count}</span> : null}
            </FilterChip>
          );
        })}
      </nav>

      {page === null ? (
        <p role="status" className="text-sm text-muted-foreground">
          Problems can&apos;t be loaded right now. Please try again in a moment.
        </p>
      ) : page.items.length === 0 ? (
        <p className="text-muted-foreground">
          {filtered ? (
            <>
              No problems match these filters.{' '}
              <Link href="/dsa" className="text-primary underline underline-offset-3">
                Clear filters
              </Link>
            </>
          ) : (
            'No problems are published yet. They’ll appear here as they’re ready.'
          )}
        </p>
      ) : (
        <>
          <ul className="divide-y rounded-xl border bg-card">
            {page.items.map((problem) => (
              <li key={problem.id}>
                <Link
                  href={`/dsa/${problem.slug}`}
                  className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 p-4 transition-colors duration-(--motion-fast) hover:bg-muted/50"
                >
                  <span className="min-w-0">
                    <span className="block font-medium">{problem.title}</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {topicName(problem.topic)}
                    </span>
                  </span>
                  <DifficultyBadge difficulty={problem.difficulty} />
                </Link>
              </li>
            ))}
          </ul>
          <PageLinks
            page={filters.page}
            pages={Math.ceil(page.pagination.total / PROBLEMS_PER_PAGE)}
            href={(target) => dsaHref({ ...filters, page: target })}
          />
        </>
      )}
    </div>
  );
}

export function DsaListingSkeleton() {
  return (
    <div aria-hidden className="space-y-3">
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="h-16 animate-pulse rounded-xl border bg-card" />
      ))}
    </div>
  );
}
