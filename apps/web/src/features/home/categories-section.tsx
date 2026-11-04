import { CategoryCard } from '@/components/catalog/category-card';
import { SectionHeading } from '@/components/catalog/section-heading';
import { getArticleCounts } from '@/features/articles/queries';
import { CATEGORIES } from '@/features/catalog/categories';

export async function CategoriesSection() {
  const counts = await getArticleCounts();

  return (
    <section
      aria-labelledby="tracks"
      className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-24"
    >
      <SectionHeading
        id="tracks"
        eyebrow="Learning categories"
        title="Everything between a working feature and a working system."
        description="Eight tracks that connect, from the algorithm inside a function to the architecture around a product."
      />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORIES.map((category) => (
          <CategoryCard
            key={category.slug}
            category={category}
            articleCount={counts[category.slug]}
          />
        ))}
      </div>
    </section>
  );
}
