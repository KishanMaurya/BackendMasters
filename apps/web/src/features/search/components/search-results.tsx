import Form from 'next/form';
import Link from 'next/link';
import { contentPath, type ContentKind } from '@backendmasters/shared';
import { DifficultyBadge } from '@/components/catalog/difficulty-badge';
import { PageLinks } from '@/components/catalog/page-links';
import { CategoryCard } from '@/components/catalog/category-card';
import { buttonVariants } from '@/components/ui/button-variants';
import { CATEGORIES } from '@/features/catalog/categories';
import { getAllTags, searchContent } from '../queries';
import { parseSearchFilters, RESULTS_PER_PAGE, searchHref } from '../search-params';

const KIND_LABELS: Record<ContentKind, string> = {
  article: 'Article',
  problem: 'DSA problem',
  question: 'Interview question',
};

const FIELD =
  'w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50';

export async function SearchResults({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseSearchFilters(await searchParams);
  const [page, tags] = await Promise.all([filters.q ? searchContent(filters) : null, getAllTags()]);

  return (
    <div className="space-y-8">
      <Form action="/search" role="search" className="space-y-3 rounded-xl border bg-card p-4">
        <label className="block space-y-1 text-xs text-muted-foreground">
          Search everything
          <input
            type="search"
            name="q"
            defaultValue={filters.q}
            maxLength={100}
            placeholder="load balancer, sliding window, event loop…"
            className={FIELD}
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1 text-xs text-muted-foreground">
            Track
            <select name="category" defaultValue={filters.category ?? ''} className={FIELD}>
              <option value="">All tracks</option>
              {CATEGORIES.map(({ slug, name }) => (
                <option key={slug} value={slug}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1 text-xs text-muted-foreground">
            Tag (articles only)
            <select name="tag" defaultValue={filters.tag ?? ''} className={FIELD}>
              <option value="">Any tag</option>
              {tags.map(({ slug, name }) => (
                <option key={slug} value={slug}>
                  {name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button type="submit" className={buttonVariants({ size: 'lg' })}>
          Search
        </button>
      </Form>

      {!filters.q ? (
        <section aria-labelledby="browse" className="space-y-4">
          <h2 id="browse" className="text-xl font-semibold tracking-tight">
            Or browse a track
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((category) => (
              <CategoryCard key={category.slug} category={category} />
            ))}
          </div>
        </section>
      ) : page === null ? (
        <p role="status" className="text-sm text-muted-foreground">
          Search isn&apos;t available right now. Please try again in a moment.
        </p>
      ) : page.items.length === 0 ? (
        <p role="status" className="text-muted-foreground">
          {filters.page > 1 ? (
            <>
              No more results.{' '}
              <Link
                href={searchHref({ ...filters, page: 1 })}
                className="text-primary underline underline-offset-3"
              >
                Back to the first page
              </Link>
            </>
          ) : filters.category || filters.tag ? (
            <>
              Nothing matches with these filters.{' '}
              <Link
                href={searchHref({ q: filters.q })}
                className="text-primary underline underline-offset-3"
              >
                Search everything
              </Link>
            </>
          ) : (
            'Nothing matches. Try fewer or more general words.'
          )}
        </p>
      ) : (
        <section aria-label="Search results">
          <p role="status" className="mb-4 font-mono text-xs text-muted-foreground">
            {page.pagination.total} {page.pagination.total === 1 ? 'result' : 'results'} for “
            {filters.q}”
          </p>
          <ul className="divide-y rounded-xl border bg-card">
            {page.items.map((result) => (
              <li key={`${result.kind}:${result.slug}`}>
                <Link
                  href={contentPath(result.kind, result.slug)}
                  className="block space-y-1.5 p-4 transition-colors duration-(--motion-fast) hover:bg-muted/50"
                >
                  <span className="flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground">
                    {KIND_LABELS[result.kind]}
                    <span aria-hidden>·</span>
                    {result.categoryName}
                    {result.difficulty && <DifficultyBadge difficulty={result.difficulty} />}
                  </span>
                  <span className="block font-medium">{result.title}</span>
                  <span className="line-clamp-2 block text-sm text-muted-foreground">
                    {result.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <PageLinks
            page={filters.page}
            pages={Math.ceil(page.pagination.total / RESULTS_PER_PAGE)}
            href={(target) => searchHref({ ...filters, page: target })}
          />
        </section>
      )}
    </div>
  );
}

export function SearchResultsSkeleton() {
  return (
    <div aria-hidden className="space-y-4">
      <div className="h-52 animate-pulse rounded-xl border bg-card" />
      <div className="h-64 animate-pulse rounded-xl border bg-card" />
    </div>
  );
}
