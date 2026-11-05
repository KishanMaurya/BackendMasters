import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DifficultyBadge } from '@/components/catalog/difficulty-badge';
import { renderArticle } from '@/features/articles/rendered-article';
import { interviewHref, plainPreview } from '@/features/interview/listing-params';
import { getInterviewQuestion, getInterviewSlugs } from '@/features/interview/queries';
import { codeFence } from '@/features/markdown/code-fence';

/** Blocking, for the same reason as article pages. See docs/ARCHITECTURE.md §6. */
export const instant = false;

/** Cache Components needs at least one param to validate the route at build time. */
const BUILD_PLACEHOLDER = '__placeholder__';
const SEO_DESCRIPTION_LENGTH = 160;

export async function generateStaticParams() {
  const slugs = await getInterviewSlugs();
  return slugs.length > 0 ? slugs.map((slug) => ({ slug })) : [{ slug: BUILD_PLACEHOLDER }];
}

export async function generateMetadata({
  params,
}: PageProps<'/interview-questions/[slug]'>): Promise<Metadata> {
  const question = await getInterviewQuestion((await params).slug);
  if (!question) return {};
  return {
    title: question.title,
    description: plainPreview(question.shortAnswer).slice(0, SEO_DESCRIPTION_LENGTH),
  };
}

async function Markdown({ source }: { source: string }) {
  const { content } = await renderArticle(source);
  return <div className="bm-article">{content}</div>;
}

export default async function InterviewQuestionPage({
  params,
}: PageProps<'/interview-questions/[slug]'>) {
  const { slug } = await params;
  const question = await getInterviewQuestion(slug);
  if (!question) notFound();

  return (
    <>
      <header className="border-b">
        <div className="mx-auto max-w-4xl space-y-4 px-4 py-10 sm:px-6 sm:py-14">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground">
              <li>
                <Link href="/interview-questions" className="hover:text-foreground">
                  Interview questions
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link
                  href={interviewHref({ technology: question.technology })}
                  className="hover:text-foreground"
                >
                  {question.technology}
                </Link>
              </li>
            </ol>
          </nav>
          <h1 className="text-3xl leading-[1.15] font-semibold tracking-tight sm:text-5xl">
            {question.title}
          </h1>
          <p className="flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground">
            {question.topic}
            {question.interviewCategory && (
              <>
                <span aria-hidden>·</span>
                {question.interviewCategory}
              </>
            )}
            <DifficultyBadge difficulty={question.difficulty} />
          </p>
        </div>
      </header>

      <div className="mx-auto w-full max-w-4xl space-y-12 px-4 py-10 sm:px-6 sm:py-14">
        <section
          aria-labelledby="short-answer"
          className="space-y-3 rounded-xl border-l-2 border-primary bg-card p-5"
        >
          <h2 id="short-answer" className="font-mono text-xs tracking-widest uppercase">
            Short answer
          </h2>
          <Markdown source={question.shortAnswer} />
        </section>

        {question.detailedExplanation && (
          <section aria-labelledby="detail" className="space-y-3">
            <h2 id="detail" className="text-2xl font-semibold tracking-tight">
              Detailed explanation
            </h2>
            <Markdown source={question.detailedExplanation} />
          </section>
        )}

        {question.practicalExample && (
          <section aria-labelledby="practical" className="space-y-3">
            <h2 id="practical" className="text-2xl font-semibold tracking-tight">
              Practical example
            </h2>
            <Markdown source={question.practicalExample} />
          </section>
        )}

        {question.codeExample && (
          <section aria-labelledby="code" className="space-y-3">
            <h2 id="code" className="text-2xl font-semibold tracking-tight">
              Code example
            </h2>
            <Markdown source={codeFence(question.codeExample, question.codeLanguage ?? '')} />
          </section>
        )}

        {question.related.length > 0 && (
          <section aria-labelledby="related" className="space-y-3">
            <h2 id="related" className="text-2xl font-semibold tracking-tight">
              Related questions
            </h2>
            <ul className="divide-y rounded-xl border bg-card">
              {question.related.map((related) => (
                <li key={related.id}>
                  <Link
                    href={`/interview-questions/${related.slug}`}
                    className="flex flex-wrap items-center justify-between gap-2 p-4 transition-colors duration-(--motion-fast) hover:bg-muted/50"
                  >
                    {related.title}
                    <DifficultyBadge difficulty={related.difficulty} />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
