import { CategoryPage, categoryMetadata } from '@/components/catalog/category-page';

export const metadata = categoryMetadata('lld');

export default function Page() {
  return <CategoryPage slug="lld" />;
}
