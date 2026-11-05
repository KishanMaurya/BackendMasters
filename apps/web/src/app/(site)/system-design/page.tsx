import { CategoryPage, categoryMetadata } from '@/components/catalog/category-page';
import { ArchitectureExplorer } from '@/features/architecture/architecture-explorer';

export const metadata = categoryMetadata('system-design');

export default function Page() {
  return <CategoryPage slug="system-design" interactive={<ArchitectureExplorer />} />;
}
