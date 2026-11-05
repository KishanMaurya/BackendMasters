import { CategoryPage, categoryMetadata } from '@/components/catalog/category-page';
import { LazyExplainer } from '@/features/explainers/lazy-explainer';

export const metadata = categoryMetadata('observability');

export default function Page() {
  return (
    <CategoryPage
      slug="observability"
      interactive={
        <div className="max-w-3xl">
          <LazyExplainer name="tracing" />
        </div>
      }
    />
  );
}
