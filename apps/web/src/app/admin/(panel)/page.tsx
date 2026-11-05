import type { Metadata } from 'next';
import Link from 'next/link';
import type { AdminIdentity, DashboardStats } from '@backendmasters/shared';
import { buttonVariants } from '@/components/ui/button-variants';
import { loadAdmin } from '@/features/admin/api';
import { ArticleTable } from '@/features/admin/components/article-table';

export const metadata: Metadata = { title: 'Dashboard' };

export const instant = false;

export default async function DashboardPage() {
  const [me, stats] = await Promise.all([
    loadAdmin<AdminIdentity>('/admin/me'),
    loadAdmin<DashboardStats>('/admin/stats'),
  ]);

  const tiles = [
    { label: 'Published', value: stats.articles.published },
    { label: 'Drafts', value: stats.articles.drafts },
    { label: 'Scheduled', value: stats.articles.scheduled },
    { label: 'Featured', value: stats.articles.featured },
    { label: 'Views, 30 days', value: stats.views.last30Days },
    { label: 'Views, all time', value: stats.views.total },
    { label: 'Categories', value: stats.categories },
    { label: 'Tags', value: stats.tags },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Signed in as {me.displayName}</p>
        </div>
        <Link href="/admin/articles/new" className={buttonVariants({ size: 'lg' })}>
          New article
        </Link>
      </header>

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-4">
        {tiles.map(({ label, value }) => (
          <div key={label} className="flex flex-col-reverse gap-1 bg-card p-4">
            <dt className="font-mono text-xs text-muted-foreground">{label}</dt>
            <dd className="font-heading text-3xl font-semibold tabular-nums">
              {value.toLocaleString('en-IN')}
            </dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="recent" className="space-y-3">
        <h2 id="recent" className="text-lg font-semibold tracking-tight">
          Recently edited
        </h2>
        {stats.recent.length > 0 ? (
          <ArticleTable articles={stats.recent} />
        ) : (
          <p className="text-sm text-muted-foreground">No articles yet.</p>
        )}
      </section>
    </div>
  );
}
