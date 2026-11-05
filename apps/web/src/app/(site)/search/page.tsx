import { Suspense } from 'react';
import { PageHeader } from '@/components/catalog/page-header';
import { SearchResults, SearchResultsSkeleton } from '@/features/search/components/search-results';
import { pageMetadata } from '@/features/seo/metadata';

// Result pages are thin and endless, so they stay out of search engines.
export const metadata = pageMetadata({
  title: 'Search',
  description: 'Search BackendMasters articles, interview questions and DSA problems.',
  path: '/search',
  noindex: true,
});

export default function SearchPage({ searchParams }: PageProps<'/search'>) {
  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Search' }]}
        title="Search"
        lede="Find articles, DSA problems and interview questions across every track."
      />
      <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
        <Suspense fallback={<SearchResultsSkeleton />}>
          <SearchResults searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}
