import { Suspense } from 'react';
import { CategoryPage, categoryMetadata } from '@/components/catalog/category-page';
import { DsaListing, DsaListingSkeleton } from '@/features/dsa/components/dsa-listing';
import { LazyExplainer } from '@/features/explainers/lazy-explainer';

export const metadata = categoryMetadata('dsa');

export default function Page({ searchParams }: PageProps<'/dsa'>) {
  return (
    <CategoryPage slug="dsa" interactive={<LazyExplainer name="sliding-window" />}>
      <section aria-labelledby="problems">
        <Suspense fallback={<DsaListingSkeleton />}>
          <DsaListing searchParams={searchParams} />
        </Suspense>
      </section>
    </CategoryPage>
  );
}
