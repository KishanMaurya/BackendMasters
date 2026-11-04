import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { SectionHeading } from '@/components/catalog/section-heading';
import { ArticleGrid } from '@/features/articles/components/article-grid';
import { getFeaturedArticles, getLatestArticles } from '@/features/articles/queries';
import { getCategory } from '@/features/catalog/categories';

const COMING_UP = [
  { topic: 'Load balancing', category: 'hld' },
  { topic: 'URL shortener', category: 'system-design' },
  { topic: 'Sliding Window', category: 'dsa' },
  { topic: 'SOLID principles', category: 'lld' },
  { topic: 'Lambda', category: 'aws' },
  { topic: 'Distributed tracing', category: 'observability' },
] as const;

export async function ArticlesSection() {
  const [featured, latest] = await Promise.all([getFeaturedArticles(), getLatestArticles()]);

  if (featured.length === 0 && latest.length === 0) return <NoArticlesYet />;

  return (
    <>
      {featured.length > 0 && (
        <section
          aria-labelledby="featured"
          className="mx-auto w-full max-w-7xl border-t px-4 py-16 sm:px-6 sm:py-24"
        >
          <SectionHeading id="featured" eyebrow="Featured" title="Start with these." />
          <div className="mt-10">
            <ArticleGrid articles={featured} />
          </div>
        </section>
      )}
      {latest.length > 0 && (
        <section
          aria-labelledby="latest"
          className="mx-auto w-full max-w-7xl border-t px-4 py-16 sm:px-6 sm:py-24"
        >
          <SectionHeading id="latest" eyebrow="Latest" title="Recently published." />
          <div className="mt-10">
            <ArticleGrid articles={latest} />
          </div>
        </section>
      )}
    </>
  );
}

/** Shown until the first article is published. */
function NoArticlesYet() {
  return (
    <section aria-labelledby="writing" className="border-y bg-card/50">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
        <SectionHeading
          id="writing"
          eyebrow="Articles"
          title="The first articles are being written."
          description="Nothing is published yet. These topics are on the list, and each track shows everything that's planned."
        />
        <ul className="divide-y border-y">
          {COMING_UP.map(({ topic, category: slug }) => {
            const category = getCategory(slug);
            return (
              <li key={topic}>
                <Link
                  href={category.href}
                  className="group/row flex items-center justify-between gap-4 py-3.5"
                >
                  <span className="transition-colors duration-(--motion-fast) group-hover/row:text-primary">
                    {topic}
                  </span>
                  <span className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
                    {category.name}
                    <ArrowRight
                      aria-hidden
                      className="size-3.5 transition-transform duration-(--motion-base) ease-(--ease-out) group-hover/row:translate-x-1"
                    />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
