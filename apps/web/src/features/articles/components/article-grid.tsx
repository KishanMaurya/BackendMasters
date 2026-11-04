import type { ArticleSummary } from '@backendmasters/shared';
import { ArticleCard } from './article-card';

export function ArticleGrid({ articles }: { articles: readonly ArticleSummary[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
