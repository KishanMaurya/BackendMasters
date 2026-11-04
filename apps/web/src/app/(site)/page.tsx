import { Suspense } from 'react';
import { ArticleGridSkeleton } from '@/features/articles/components/article-card';
import { ArticlesSection } from '@/features/home/articles-section';
import { CategoriesSection } from '@/features/home/categories-section';
import { Hero } from '@/features/home/hero';
import { InterviewSection } from '@/features/home/interview-section';

export default function HomePage() {
  return (
    <>
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
