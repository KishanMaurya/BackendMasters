import { CategoryPage, categoryMetadata } from '@/components/catalog/category-page';

export const metadata = categoryMetadata('interview-questions');

export default function Page() {
  return <CategoryPage slug="interview-questions" />;
}
