import Link from 'next/link';
import type { AdminArticleListItem } from '@backendmasters/shared';
import { StateBadge } from './state-badge';

const dateFormat = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'Asia/Kolkata',
});

export function ArticleTable({ articles }: { articles: AdminArticleListItem[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full min-w-[36rem] text-sm">
        <thead>
          <tr className="border-b text-left font-mono text-xs text-muted-foreground">
            <th scope="col" className="px-4 py-3 font-normal">
              Title
            </th>
            <th scope="col" className="px-4 py-3 font-normal">
              Status
            </th>
            <th scope="col" className="px-4 py-3 font-normal">
              Category
            </th>
            <th scope="col" className="px-4 py-3 font-normal">
              Updated
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {articles.map((article) => (
            <tr key={article.id}>
              <td className="px-4 py-3">
                <Link
                  href={`/admin/articles/${article.id}`}
                  className="font-medium hover:text-primary"
                >
                  {article.title}
                </Link>
                {article.isFeatured && (
                  <span className="ml-2 font-mono text-xs text-muted-foreground">Featured</span>
                )}
              </td>
              <td className="px-4 py-3">
                <StateBadge state={article.state} />
              </td>
              <td className="px-4 py-3 text-muted-foreground">{article.categoryName}</td>
              <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                <time dateTime={article.updatedAt}>
                  {dateFormat.format(new Date(article.updatedAt))}
                </time>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
