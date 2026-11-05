import type { Metadata } from 'next';
import type { AdminCategory, AdminTag } from '@backendmasters/shared';
import { loadAdmin } from '@/features/admin/api';
import { CategoryEditor, TagManager } from '@/features/admin/components/taxonomy-manager';

export const metadata: Metadata = { title: 'Categories & tags' };

export const instant = false;

export default async function TaxonomyPage() {
  const [categories, tags] = await Promise.all([
    loadAdmin<AdminCategory[]>('/admin/categories'),
    loadAdmin<AdminTag[]>('/admin/tags'),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">Categories &amp; tags</h1>

      <section aria-labelledby="tags" className="space-y-3">
        <h2 id="tags" className="text-lg font-semibold tracking-tight">
          Tags
        </h2>
        <TagManager tags={tags} />
      </section>

      <section aria-labelledby="categories" className="space-y-3">
        <div>
          <h2 id="categories" className="text-lg font-semibold tracking-tight">
            Categories
          </h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            These names appear on article cards and pages. Adding or removing a category needs a
            code change, because each one has its own page and illustration.
          </p>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {categories.map((category) => (
            <CategoryEditor key={category.id} category={category} />
          ))}
        </div>
      </section>
    </div>
  );
}
