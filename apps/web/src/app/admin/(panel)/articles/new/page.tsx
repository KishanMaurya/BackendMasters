import type { Metadata } from 'next';
import type { AdminCategory, AdminTag } from '@backendmasters/shared';
import { loadAdmin } from '@/features/admin/api';
import { ArticleEditor } from '@/features/admin/components/article-editor';

export const metadata: Metadata = { title: 'New article' };

export const instant = false;

export default async function NewArticlePage() {
  const [categories, tags] = await Promise.all([
    loadAdmin<AdminCategory[]>('/admin/categories'),
    loadAdmin<AdminTag[]>('/admin/tags'),
  ]);

  return <ArticleEditor article={null} categories={categories} tags={tags} />;
}
