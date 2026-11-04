import { CategoryPage, categoryMetadata } from '@/components/catalog/category-page';

export const metadata = categoryMetadata('backend-engineering');

export default function Page() {
  return <CategoryPage slug="backend-engineering" />;
}
