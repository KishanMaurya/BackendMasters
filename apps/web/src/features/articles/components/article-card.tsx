import Image from 'next/image';
import Link from 'next/link';
import type { ArticleSummary } from '@backendmasters/shared';
import { CATEGORY_ILLUSTRATIONS } from '@/components/illustrations';

const dateFormat = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

export function formatDate(iso: string): string {
  return dateFormat.format(new Date(iso));
}

export function ArticleCard({ article }: { article: ArticleSummary }) {
  const Illustration = CATEGORY_ILLUSTRATIONS[article.categorySlug];

  return (
    <article className="group bm-reveal relative flex h-full flex-col overflow-hidden rounded-xl border bg-card transition-[transform,box-shadow] duration-(--motion-base) ease-(--ease-out) hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10">
      <div className="relative flex aspect-video items-center justify-center overflow-hidden border-b bg-background/40">
        {article.coverImageUrl ? (
          <Image
            src={article.coverImageUrl}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <Illustration className="h-3/4 w-auto" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="font-mono text-xs tracking-widest text-primary uppercase">
          {article.categoryName}
        </p>
        <h3 className="text-lg leading-snug font-medium tracking-tight">
          {/* The stretched link makes the whole card clickable with one tab stop. */}
          <Link
            href={`/articles/${article.slug}`}
            className="after:absolute after:inset-0 group-hover:text-primary"
          >
            {article.title}
          </Link>
        </h3>
        <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
          {article.description}
        </p>
        <p className="pt-2 font-mono text-xs text-muted-foreground">
          <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
          {' · '}
          {article.readingTimeMinutes} min read
        </p>
      </div>
    </article>
  );
}

export function ArticleCardSkeleton() {
  return (
    <div aria-hidden className="flex h-full flex-col overflow-hidden rounded-xl border bg-card">
      <div className="aspect-video animate-pulse border-b bg-muted motion-reduce:animate-none" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-1/3 animate-pulse rounded bg-muted motion-reduce:animate-none" />
        <div className="h-5 w-4/5 animate-pulse rounded bg-muted motion-reduce:animate-none" />
        <div className="h-3 w-full animate-pulse rounded bg-muted motion-reduce:animate-none" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-muted motion-reduce:animate-none" />
      </div>
    </div>
  );
}

export function ArticleGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="status">
      <span className="sr-only">Loading articles</span>
      {Array.from({ length: count }, (_, index) => (
        <ArticleCardSkeleton key={index} />
      ))}
    </div>
  );
}
