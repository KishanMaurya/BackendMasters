import { CategoryPage, categoryMetadata } from '@/components/catalog/category-page';

export const metadata = categoryMetadata('observability');

export default function Page() {
  return <CategoryPage slug="observability" />;
}
