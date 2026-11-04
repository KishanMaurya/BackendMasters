import { CategoryPage, categoryMetadata } from '@/components/catalog/category-page';

export const metadata = categoryMetadata('hld');

export default function Page() {
  return <CategoryPage slug="hld" />;
}
