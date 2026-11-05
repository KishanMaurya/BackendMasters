import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import Link from 'next/link';
import { getArticlePage } from '@/features/articles/queries';
import { CATEGORIES } from '@/features/catalog/categories';
import { cn } from '@/lib/utils';
import {
  ARTICLES_PER_PAGE,
  DIFFICULTIES,
  listingHref,
  parseFilters,
  type ArticleFilters,
} from '../listing-params';
import { ArticleGrid } from './article-grid';
import { ArticlesUnavailable } from './articles-unavailable';

function Chip({
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

function Filters({ filters }: { filters: ArticleFilters }) {
  const { category, difficulty, tag } = filters;
  return (
    <div className="space-y-3">
      <nav aria-label="Filter by track" className="flex flex-wrap gap-2">
        <Chip href={listingHref({ difficulty, tag })} active={!category}>
          All tracks
        </Chip>
        {CATEGORIES.map((item) => (
          <Chip
            key={item.slug}
            href={listingHref({ category: item.slug, difficulty, tag })}
            active={category === item.slug}
          >
            {item.name}
          </Chip>
        ))}
      </nav>
      <nav aria-label="Filter by difficulty" className="flex flex-wrap items-center gap-2">
        <Chip href={listingHref({ category, tag })} active={!difficulty}>
          Any level
        </Chip>
        {DIFFICULTIES.map((level) => (
          <Chip
            key={level}
            href={listingHref({ category, tag, difficulty: level })}
            active={difficulty === level}
          >
            <span className="capitalize">{level}</span>
          </Chip>
        ))}
        {tag && (
          <Link
            href={listingHref({ category, difficulty })}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary bg-accent px-3 py-1.5 text-sm text-accent-foreground"
          >
            #{tag}
            <span className="sr-only">Remove tag filter</span>
            <X aria-hidden className="size-3.5" />
          </Link>
        )}
      </nav>
    </div>
  );
}

function Pagination({ filters, total }: { filters: ArticleFilters; total: number }) {
  const pages = Math.ceil(total / ARTICLES_PER_PAGE);
  if (pages <= 1) return null;

  const link = 'inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm hover:bg-muted';

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-between gap-4">
      {filters.page > 1 ? (
        <Link
          rel="prev"
          href={listingHref({ ...filters, page: filters.page - 1 })}
          className={link}
        >
          <ChevronLeft aria-hidden className="size-4" />
          Newer
        </Link>
      ) : (
        <span />
      )}
      <span className="font-mono text-xs text-muted-foreground">
        Page {filters.page} of {pages}
      </span>
      {filters.page < pages ? (
        <Link
          rel="next"
          href={listingHref({ ...filters, page: filters.page + 1 })}
          className={link}
        >
          Older
          <ChevronRight aria-hidden className="size-4" />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}

export async function ArticleListing({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseFilters(await searchParams);
  const result = await getArticlePage(filters);

  return (
    <>
      <Filters filters={filters} />
      <div className="mt-8">
        {result === null ? (
          <ArticlesUnavailable />
        ) : result.items.length === 0 ? (
          <p className="text-muted-foreground">
            No articles match these filters.{' '}
            <Link href="/articles" className="text-primary underline underline-offset-3">
              Clear filters
            </Link>
          </p>
        ) : (
          <>
            <p className="mb-5 font-mono text-xs text-muted-foreground">
              {result.pagination.total} {result.pagination.total === 1 ? 'article' : 'articles'}
            </p>
            <ArticleGrid articles={result.items} />
            <Pagination filters={filters} total={result.pagination.total} />
          </>
        )}
      </div>
    </>
  );
}
