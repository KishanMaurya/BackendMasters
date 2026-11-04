import { CategoryPage, categoryMetadata } from '@/components/catalog/category-page';

export const metadata = categoryMetadata('aws');

export default function Page() {
  return <CategoryPage slug="aws" />;
}
