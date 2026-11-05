import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { AdminArticle, AdminCategory, AdminTag } from '@backendmasters/shared';
import { loadAdmin, loadAdminOptional } from '@/features/admin/api';
import { ArticleEditor } from '@/features/admin/components/article-editor';
import { uuidSchema } from '@/features/admin/schemas';

export const metadata: Metadata = { title: 'Edit article' };

export const instant = false;

export default async function EditArticlePage({ params }: PageProps<'/admin/articles/[id]'>) {
  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) notFound();

  const [article, categories, tags] = await Promise.all([
    loadAdminOptional<AdminArticle>(`/admin/articles/${id}`),
    loadAdmin<AdminCategory[]>('/admin/categories'),
    loadAdmin<AdminTag[]>('/admin/tags'),
  ]);
  if (!article) notFound();

  return <ArticleEditor key={article.id} article={article} categories={categories} tags={tags} />;
}
