import { CategoryPage, categoryMetadata } from '@/components/catalog/category-page';

export const metadata = categoryMetadata('dsa');

export default function Page() {
  return <CategoryPage slug="dsa" />;
}
