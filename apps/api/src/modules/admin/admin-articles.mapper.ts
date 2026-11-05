import type {
  AdminArticle,
  AdminArticleListItem,
  ArticleState,
  CategorySlug,
  Difficulty,
} from '@backendmasters/shared';

export interface AdminArticleListRow {
  id: string;
  slug: string;
  title: string;
  status: 'draft' | 'published';
  is_featured: boolean;
  published_at: string | null;
  updated_at: string;
  reading_time_minutes: number;
  category: { id: string; slug: string; name: string };
}

export interface AdminArticleRow extends AdminArticleListRow {
  description: string;
  content: string;
  cover_image_url: string | null;
  difficulty: Difficulty | null;
  seo_title: string | null;
  seo_description: string | null;
  article_tags: { tag_id: string }[];
}

export function articleState(
  status: AdminArticleListRow['status'],
  publishedAt: string | null,
  now = new Date(),
): ArticleState {
  if (status === 'draft') return 'draft';
  return publishedAt && new Date(publishedAt) > now ? 'scheduled' : 'published';
}

export function toAdminListItem(row: AdminArticleListRow): AdminArticleListItem {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    state: articleState(row.status, row.published_at),
    categorySlug: row.category.slug as CategorySlug,
    categoryName: row.category.name,
    isFeatured: row.is_featured,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    readingTimeMinutes: row.reading_time_minutes,
  };
}

export function toAdminArticle(row: AdminArticleRow): AdminArticle {
  return {
    ...toAdminListItem(row),
    description: row.description,
    content: row.content,
    coverImageUrl: row.cover_image_url,
    categoryId: row.category.id,
    difficulty: row.difficulty,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    tagIds: row.article_tags.map(({ tag_id }) => tag_id),
  };
}
