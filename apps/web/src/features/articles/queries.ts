import type { ArticleSummary, CategorySlug } from '@backendmasters/shared';

/**
 * The one place pages get article data from. Each function returns nothing until
 * the database and API exist in Phase 3, when they will call apiFetch instead.
 * Pages already handle the empty result, so no mock articles ever ship.
 */
export async function getFeaturedArticles(): Promise<ArticleSummary[]> {
  return [];
}

export async function getLatestArticles(): Promise<ArticleSummary[]> {
  return [];
}

export async function getArticlesByCategory(_slug: CategorySlug): Promise<ArticleSummary[]> {
  return [];
}

export async function getArticleCounts(): Promise<Partial<Record<CategorySlug, number>>> {
  return {};
}
