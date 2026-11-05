import { CategoryPage, categoryMetadata } from '@/components/catalog/category-page';
import { LazyExplainer } from '@/features/explainers/lazy-explainer';

export const metadata = categoryMetadata('hld');

export default function Page() {
  return (
    <CategoryPage
      slug="hld"
      interactive={
        <div className="grid gap-6 lg:grid-cols-2">
          <LazyExplainer name="load-balancer" />
          <LazyExplainer name="caching" />
          <LazyExplainer name="sharding" />
          <LazyExplainer name="kafka" />
        </div>
      }
    />
  );
}
