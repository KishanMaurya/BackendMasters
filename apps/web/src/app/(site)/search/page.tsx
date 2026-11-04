import type { Metadata } from 'next';
import { CategoryCard } from '@/components/catalog/category-card';
import { PageHeader } from '@/components/catalog/page-header';
import { CATEGORIES } from '@/features/catalog/categories';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search BackendMasters articles, interview questions and DSA problems.',
  robots: { index: false },
};

export default function SearchPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Search' }]}
        title="Search"
        lede="Search will open once articles are published. For now, browse what's planned in each track."
      />
      <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {CATEGORIES.map((category) => (
          <CategoryCard key={category.slug} category={category} />
        ))}
      </div>
    </>
  );
}
