import type { Metadata } from 'next';
import Form from 'next/form';
import Link from 'next/link';
import {
  ARTICLE_STATES,
  CATEGORY_SLUGS,
  type AdminArticleListItem,
  type ArticleState,
  type CategorySlug,
} from '@backendmasters/shared';
import { buttonVariants } from '@/components/ui/button-variants';
import { loadAdminPage } from '@/features/admin/api';
import { ArticleTable } from '@/features/admin/components/article-table';
import { INPUT_CLASS } from '@/features/admin/components/field';
import { CATEGORIES } from '@/features/catalog/categories';

export const metadata: Metadata = { title: 'Articles' };

export const instant = false;

const PAGE_SIZE = 20;
const MAX_QUERY_LENGTH = 100;

function single(value: string | string[] | undefined): string {
  return typeof value === 'string' ? value : '';
}

export default async function AdminArticlesPage({ searchParams }: PageProps<'/admin/articles'>) {
  const params = await searchParams;
  const q = single(params.q).trim().slice(0, MAX_QUERY_LENGTH);
  const state = single(params.state);
  const category = single(params.category);
  const page = Math.max(1, Number.parseInt(single(params.page), 10) || 1);

  const validState = ARTICLE_STATES.includes(state as ArticleState) ? state : '';
  const validCategory = CATEGORY_SLUGS.includes(category as CategorySlug) ? category : '';
  const filters = new URLSearchParams({
    ...(q && { q }),
    ...(validState && { state: validState }),
    ...(validCategory && { category: validCategory }),
  });
  const { items, pagination } = await loadAdminPage<AdminArticleListItem>(
    `/admin/articles?${new URLSearchParams({ ...Object.fromEntries(filters), page: String(page), pageSize: String(PAGE_SIZE) }).toString()}`,
  );

  const lastPage = Math.max(1, Math.ceil(pagination.total / PAGE_SIZE));
  const pageHref = (target: number) =>
    `/admin/articles?${new URLSearchParams({ ...Object.fromEntries(filters), page: String(target) }).toString()}`;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Articles</h1>
        <Link href="/admin/articles/new" className={buttonVariants({ size: 'lg' })}>
          New article
        </Link>
      </header>

      <Form action="/admin/articles" className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          maxLength={MAX_QUERY_LENGTH}
          aria-label="Search titles"
          placeholder="Search titles"
          className={`${INPUT_CLASS} min-w-48 flex-1`}
        />
        <select
          name="state"
          defaultValue={validState}
          aria-label="Status"
          className={`${INPUT_CLASS} w-auto capitalize`}
        >
          <option value="">All statuses</option>
          {ARTICLE_STATES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <select
          name="category"
          defaultValue={validCategory}
          aria-label="Category"
          className={`${INPUT_CLASS} w-auto`}
        >
          <option value="">All categories</option>
          {CATEGORIES.map(({ slug, name }) => (
            <option key={slug} value={slug}>
              {name}
            </option>
          ))}
        </select>
        <button type="submit" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
          Filter
        </button>
      </Form>

      {items.length > 0 ? (
        <ArticleTable articles={items} />
      ) : (
        <p role="status" className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
          {filters.size > 0 ? 'No articles match these filters.' : 'No articles yet.'}
        </p>
      )}

      {lastPage > 1 && (
        <nav aria-label="Pagination" className="flex items-center justify-between gap-2 text-sm">
          {page > 1 ? (
            <Link href={pageHref(page - 1)} className={buttonVariants({ variant: 'outline' })}>
              Previous
            </Link>
          ) : (
            <span />
          )}
          <span className="font-mono text-xs text-muted-foreground">
            Page {page} of {lastPage}
          </span>
          {page < lastPage ? (
            <Link href={pageHref(page + 1)} className={buttonVariants({ variant: 'outline' })}>
              Next
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}
