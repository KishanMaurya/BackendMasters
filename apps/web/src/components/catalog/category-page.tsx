import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import type { CategorySlug } from '@backendmasters/shared';
import { CATEGORY_ILLUSTRATIONS } from '@/components/illustrations';
import { ArticleGridSkeleton } from '@/features/articles/components/article-card';
import { ArticleGrid } from '@/features/articles/components/article-grid';
import { ArticlesUnavailable } from '@/features/articles/components/articles-unavailable';
import { getArticlesByCategory } from '@/features/articles/queries';
import { getCategory, topicAnchor } from '@/features/catalog/categories';
import { PageHeader } from './page-header';
import { Eyebrow } from './section-heading';

export function categoryMetadata(slug: CategorySlug): Metadata {
  const category = getCategory(slug);
  return { title: category.title, description: category.lede };
}

export function CategoryPage({ slug }: { slug: CategorySlug }) {
  const category = getCategory(slug);
  const Illustration = CATEGORY_ILLUSTRATIONS[slug];

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Learn', href: '/learn' }, { label: category.name }]}
        title={category.title}
        lede={category.lede}
        illustration={<Illustration live title={`${category.name} illustration`} />}
      />

      <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
        <section aria-labelledby="topics">
          <Eyebrow>{`${category.topics.length} planned`}</Eyebrow>
          <h2 id="topics" className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
            {category.topicsTitle}
          </h2>
          <ol className="mt-6 grid gap-x-6 border-t sm:grid-cols-2">
            {category.topics.map((topic, index) => (
              <li
                key={topic}
                id={topicAnchor(topic)}
                className="flex items-baseline gap-4 border-b py-3 target:text-primary"
              >
                <span aria-hidden className="font-mono text-xs text-muted-foreground">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {topic}
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="anatomy">
          <Eyebrow>The format</Eyebrow>
          <h2 id="anatomy" className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
            {category.anatomyTitle}
          </h2>
          {/* Numbered nodes on one wire, echoing the request paths used across the site. */}
          <ol className="mt-6">
            {category.anatomy.map((step, index) => (
              <li key={step} className="relative flex gap-4 pb-4 last:pb-0">
                {index < category.anatomy.length - 1 && (
                  <span aria-hidden className="absolute top-6 bottom-0 left-3 w-px bg-border" />
                )}
                <span
                  aria-hidden
                  className="grid size-6 shrink-0 place-items-center rounded-full border bg-card font-mono text-[0.625rem] text-muted-foreground"
                >
                  {index + 1}
                </span>
                <span className="pt-0.5 text-sm">{step}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <Suspense
        fallback={
          <div className="mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6">
            <ArticleGridSkeleton />
          </div>
        }
      >
        <CategoryArticles slug={slug} />
      </Suspense>

      <section aria-label="Related tracks" className="border-t bg-card/50">
        <div className="mx-auto grid max-w-7xl gap-px px-4 py-10 sm:grid-cols-2 sm:gap-4 sm:px-6">
          {category.related.map((relatedSlug) => {
            const related = getCategory(relatedSlug);
            return (
              <Link
                key={relatedSlug}
                href={related.href}
                className="group/next flex items-center justify-between gap-4 rounded-xl py-3 sm:border sm:bg-card sm:p-5"
              >
                <span>
                  <span className="block font-mono text-xs text-muted-foreground">Continue to</span>
                  <span className="font-heading text-lg font-medium transition-colors duration-(--motion-fast) group-hover/next:text-primary">
                    {related.name}
                  </span>
                </span>
                <ArrowRight
                  aria-hidden
                  className="size-4 shrink-0 text-muted-foreground transition-transform duration-(--motion-base) ease-(--ease-out) group-hover/next:translate-x-1"
                />
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}

async function CategoryArticles({ slug }: { slug: CategorySlug }) {
  const articles = await getArticlesByCategory(slug);

  if (articles === null) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6">
        <ArticlesUnavailable />
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <p className="mx-auto w-full max-w-7xl px-4 pb-14 text-sm text-muted-foreground sm:px-6">
        No articles are published in this track yet. They&apos;ll appear here as they&apos;re ready.
      </p>
    );
  }

  return (
    <section aria-labelledby="articles" className="mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6">
      <h2 id="articles" className="mb-6 text-2xl font-semibold tracking-tight">
        Articles
      </h2>
      <ArticleGrid articles={articles} />
    </section>
  );
}
