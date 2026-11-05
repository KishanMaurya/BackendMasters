import Form from 'next/form';
import Link from 'next/link';
import { DifficultyBadge } from '@/components/catalog/difficulty-badge';
import { PageLinks } from '@/components/catalog/page-links';
import { buttonVariants } from '@/components/ui/button-variants';
import {
  interviewHref,
  parseInterviewFilters,
  plainPreview,
  QUESTIONS_PER_PAGE,
} from '../listing-params';
import { getInterviewFacets, getInterviewPage } from '../queries';

const FIELD =
  'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50';

function FacetSelect({
  name,
  label,
  value,
  options,
}: {
  name: string;
  label: string;
  value?: string;
  options: readonly string[];
}) {
  // A value from an old link may no longer exist, and should still show as selected.
  const all = value && !options.includes(value) ? [value, ...options] : options;
  return (
    <label className="block space-y-1 text-xs text-muted-foreground">
      {label}
      <select name={name} defaultValue={value ?? ''} className={`${FIELD} text-foreground`}>
        <option value="">All</option>
        {all.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export async function QuestionBank({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseInterviewFilters(await searchParams);
  const [page, facets] = await Promise.all([getInterviewPage(filters), getInterviewFacets()]);
  const filtered = Boolean(
    filters.q ||
    filters.technology ||
    filters.topic ||
    filters.difficulty ||
    filters.interviewCategory,
  );

  return (
    <div className="space-y-6">
      <h2 id="questions" className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Question bank
      </h2>

      <Form action="/interview-questions" className="space-y-3 rounded-xl border bg-card p-4">
        <label className="block space-y-1 text-xs text-muted-foreground">
          Search
          <input
            type="search"
            name="q"
            defaultValue={filters.q}
            maxLength={100}
            placeholder="event loop, indexes, visibility timeout…"
            className={`${FIELD} text-foreground`}
          />
        </label>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <FacetSelect
            name="technology"
            label="Technology"
            value={filters.technology}
            options={facets.technologies}
          />
          <FacetSelect name="topic" label="Topic" value={filters.topic} options={facets.topics} />
          <FacetSelect
            name="difficulty"
            label="Difficulty"
            value={filters.difficulty}
            options={['easy', 'medium', 'hard']}
          />
          <FacetSelect
            name="category"
            label="Interview category"
            value={filters.interviewCategory}
            options={facets.interviewCategories}
          />
        </div>
        <div className="flex items-center gap-2">
          <button type="submit" className={buttonVariants({ size: 'lg' })}>
            Search
          </button>
          {filtered && (
            <Link
              href="/interview-questions"
              className={buttonVariants({ variant: 'ghost', size: 'lg' })}
            >
              Clear
            </Link>
          )}
        </div>
      </Form>

      {page === null ? (
        <p role="status" className="text-sm text-muted-foreground">
          Questions can&apos;t be loaded right now. Please try again in a moment.
        </p>
      ) : page.items.length === 0 ? (
        <p role="status" className="text-muted-foreground">
          {filtered
            ? 'No questions match. Try fewer filters or different words.'
            : 'No questions are published yet. They’ll appear here as they’re ready.'}
        </p>
      ) : (
        <>
          <p role="status" className="font-mono text-xs text-muted-foreground">
            {page.pagination.total} {page.pagination.total === 1 ? 'question' : 'questions'}
          </p>
          <ul className="divide-y rounded-xl border bg-card">
            {page.items.map((question) => (
              <li key={question.id}>
                <Link
                  href={`/interview-questions/${question.slug}`}
                  className="block space-y-1.5 p-4 transition-colors duration-(--motion-fast) hover:bg-muted/50"
                >
                  <span className="flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground">
                    {question.technology}
                    <span aria-hidden>·</span>
                    {question.topic}
                    <DifficultyBadge difficulty={question.difficulty} />
                  </span>
                  <span className="block font-medium">{question.title}</span>
                  <span className="line-clamp-2 block text-sm text-muted-foreground">
                    {plainPreview(question.shortAnswer)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <PageLinks
            page={filters.page}
            pages={Math.ceil(page.pagination.total / QUESTIONS_PER_PAGE)}
            href={(target) => interviewHref({ ...filters, page: target })}
          />
        </>
      )}
    </div>
  );
}

export function QuestionBankSkeleton() {
  return (
    <div aria-hidden className="space-y-3">
      <div className="h-44 animate-pulse rounded-xl border bg-card" />
      <div className="h-64 animate-pulse rounded-xl border bg-card" />
    </div>
  );
}
