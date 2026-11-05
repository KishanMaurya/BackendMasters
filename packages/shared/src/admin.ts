/** Contracts for the content-management API. Everything here sits behind AdminGuard. */
import type { CategorySlug, Difficulty } from './content.js';

/** Reserved because GET /articles/slugs would shadow an article with this slug. */
export const RESERVED_ARTICLE_SLUGS: readonly string[] = ['slugs'];

/** Where an article stands for readers. "scheduled" is published with a future date. */
export type ArticleState = 'draft' | 'scheduled' | 'published';

export const ARTICLE_STATES: readonly ArticleState[] = ['draft', 'scheduled', 'published'];

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export interface AdminIdentity {
  id: string;
  displayName: string;
}

export interface AdminArticleListItem {
  id: string;
  slug: string;
  title: string;
  state: ArticleState;
  categorySlug: CategorySlug;
  categoryName: string;
  isFeatured: boolean;
  publishedAt: string | null;
  updatedAt: string;
  readingTimeMinutes: number;
}

export interface AdminArticle extends AdminArticleListItem {
  description: string;
  content: string;
  coverImageUrl: string | null;
  categoryId: string;
  difficulty: Difficulty | null;
  seoTitle: string | null;
  seoDescription: string | null;
  tagIds: string[];
}

export interface ArticleInput {
  slug: string;
  title: string;
  description: string;
  content: string;
  coverImageUrl: string | null;
  categoryId: string;
  difficulty: Difficulty | null;
  seoTitle: string | null;
  seoDescription: string | null;
  isFeatured: boolean;
  tagIds: string[];
}

export interface ArticleUpdateInput extends ArticleInput {
  /** The updatedAt the editor loaded. A mismatch means someone saved in between. */
  expectedUpdatedAt: string;
}

/** `revalidated` is false when the content changed but the live site could not be told. */
export interface ContentChange<T> {
  result: T;
  revalidated: boolean;
}

export interface AdminCategory {
  id: string;
  slug: CategorySlug;
  name: string;
  description: string;
  sortOrder: number;
  articleCount: number;
}

export interface CategoryInput {
  name: string;
  description: string;
  sortOrder: number;
}

export interface AdminTag {
  id: string;
  slug: string;
  name: string;
  articleCount: number;
}

export interface TagInput {
  slug: string;
  name: string;
}

export interface DashboardStats {
  articles: { published: number; scheduled: number; drafts: number; featured: number };
  views: { total: number; last30Days: number };
  categories: number;
  tags: number;
  recent: AdminArticleListItem[];
}

export interface UploadedImage {
  url: string;
}
