import { CategoryPage, categoryMetadata } from '@/components/catalog/category-page';

export const metadata = categoryMetadata('system-design');

export default function Page() {
  return <CategoryPage slug="system-design" />;
}
