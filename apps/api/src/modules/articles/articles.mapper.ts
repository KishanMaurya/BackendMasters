import type {
  ArticleDetail,
  ArticleSummary,
  CategorySlug,
  Difficulty,
} from '@backendmasters/shared';

export interface ArticleSummaryRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  cover_image_url: string | null;
  reading_time_minutes: number;
  difficulty: Difficulty | null;
  published_at: string | null;
  is_featured: boolean;
  category: { slug: string; name: string };
}

export interface ArticleDetailRow extends ArticleSummaryRow {
  content: string;
  seo_title: string | null;
  seo_description: string | null;
  updated_at: string;
  author: { display_name: string; avatar_url: string | null } | null;
  article_tags: { tags: { slug: string; name: string } }[];
}

export function toArticleSummary(row: ArticleSummaryRow): ArticleSummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    categorySlug: row.category.slug as CategorySlug,
    categoryName: row.category.name,
    coverImageUrl: row.cover_image_url,
    readingTimeMinutes: row.reading_time_minutes,
    difficulty: row.difficulty,
    // Always set on published rows: a database constraint guarantees it.
    publishedAt: row.published_at as string,
    isFeatured: row.is_featured,
  };
}

export function toArticleDetail(row: ArticleDetailRow): ArticleDetail {
  return {
    ...toArticleSummary(row),
    content: row.content,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    updatedAt: row.updated_at,
    author: row.author
      ? { displayName: row.author.display_name, avatarUrl: row.author.avatar_url }
      : null,
    tags: row.article_tags.map(({ tags }) => tags).sort((a, b) => a.name.localeCompare(b.name)),
  };
}
