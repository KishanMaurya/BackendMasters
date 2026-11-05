import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageHeader } from '@/components/catalog/page-header';
import { ArticleGridSkeleton } from '@/features/articles/components/article-card';
import { ArticleListing } from '@/features/articles/components/article-listing';

export const metadata: Metadata = {
  title: 'All Articles',
  description:
    'Every BackendMasters article on DSA, system design, cloud architecture and observability.',
};

export default function ArticlesPage({ searchParams }: PageProps<'/articles'>) {
  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Articles' }]}
        title="All articles"
        lede="Everything published so far, newest first. Filter by track or difficulty."
      />
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
        <Suspense fallback={<ArticleGridSkeleton count={6} />}>
          <ArticleListing searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}
