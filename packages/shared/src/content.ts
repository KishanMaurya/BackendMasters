/** Content contracts shared by the API and the web app. */

export const CATEGORY_SLUGS = [
  'dsa',
  'lld',
  'hld',
  'system-design',
  'aws',
  'observability',
  'backend-engineering',
  'interview-questions',
] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface ArticleSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  categorySlug: CategorySlug;
  categoryName: string;
  coverImageUrl: string | null;
  readingTimeMinutes: number;
  difficulty: Difficulty | null;
  publishedAt: string;
  isFeatured: boolean;
}

export interface ArticleAuthor {
  displayName: string;
  avatarUrl: string | null;
}

export interface TagSummary {
  slug: string;
  name: string;
}

export interface ArticleDetail extends ArticleSummary {
  content: string;
  tags: TagSummary[];
  author: ArticleAuthor | null;
  seoTitle: string | null;
  seoDescription: string | null;
  updatedAt: string;
}

export interface CategorySummary {
  slug: CategorySlug;
  name: string;
  description: string;
  articleCount: number;
}
