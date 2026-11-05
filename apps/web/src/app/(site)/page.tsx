import { Suspense } from 'react';
import { ArticleGridSkeleton } from '@/features/articles/components/article-card';
import { ArticlesSection } from '@/features/home/articles-section';
import { CategoriesSection } from '@/features/home/categories-section';
import { Hero } from '@/features/home/hero';
import { InterviewSection } from '@/features/home/interview-section';
import { JsonLd } from '@/features/seo/json-ld';
import { pageMetadata } from '@/features/seo/metadata';
import { websiteData } from '@/features/seo/structured-data';
import { env } from '@/lib/env';

export const metadata = pageMetadata({
  title: 'Learn. Build. Design. Scale.',
  description:
    'Learn how to build, design, and scale real-world systems. Explore DSA, system design, cloud architecture, observability, and engineering interview preparation.',
  path: '/',
});

export default function HomePage() {
  return (
    <>
      <JsonLd data={websiteData(env.NEXT_PUBLIC_SITE_URL)} />
      <Hero />
      <CategoriesSection />
      <Suspense
        fallback={
          <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
            <ArticleGridSkeleton />
          </div>
        }
      >
        <ArticlesSection />
      </Suspense>
      <InterviewSection />
    </>
  );
}
