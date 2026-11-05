import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { SOLUTION_LANGUAGES } from '@backendmasters/shared';
import { DifficultyBadge } from '@/components/catalog/difficulty-badge';
import { topicName } from '@/features/dsa/components/dsa-listing';
import { SolutionTabs } from '@/features/dsa/components/solution-tabs';
import { getDsaProblem, getDsaSlugs } from '@/features/dsa/queries';
import { renderArticle } from '@/features/articles/rendered-article';
import { codeFence } from '@/features/markdown/code-fence';

/** Blocking, for the same reason as article pages. See docs/ARCHITECTURE.md §6. */
export const instant = false;

/** Cache Components needs at least one param to validate the route at build time. */
const BUILD_PLACEHOLDER = '__placeholder__';

export async function generateStaticParams() {
  const slugs = await getDsaSlugs();
  return slugs.length > 0 ? slugs.map((slug) => ({ slug })) : [{ slug: BUILD_PLACEHOLDER }];
}

export async function generateMetadata({ params }: PageProps<'/dsa/[slug]'>): Promise<Metadata> {
  const problem = await getDsaProblem((await params).slug);
  if (!problem) return {};
  return {
    title: problem.title,
    description: `${problem.title}: brute force to optimal, with a dry run and solutions in JavaScript, TypeScript, Java and Go.`,
  };
}

async function Markdown({ source }: { source: string }) {
  const { content } = await renderArticle(source);
  return <div className="bm-article">{content}</div>;
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="space-y-3">
      <h2 id={id} className="text-2xl font-semibold tracking-tight">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default async function DsaProblemPage({ params }: PageProps<'/dsa/[slug]'>) {
  const { slug } = await params;
  const problem = await getDsaProblem(slug);
  if (!problem) notFound();

  const solutions = await Promise.all(
    SOLUTION_LANGUAGES.map(async ({ key, label, fence }) => ({
      key,
      label,
      content: <Markdown source={codeFence(problem.solutions[key], fence)} />,
    })),
  );

  return (
    <>
      <header className="border-b">
        <div className="mx-auto max-w-4xl space-y-4 px-4 py-10 sm:px-6 sm:py-14">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground">
              <li>
                <Link href="/dsa" className="hover:text-foreground">
                  DSA
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link href={`/dsa?topic=${problem.topic}`} className="hover:text-foreground">
                  {topicName(problem.topic)}
                </Link>
              </li>
            </ol>
          </nav>
          <h1 className="text-3xl leading-[1.15] font-semibold tracking-tight sm:text-5xl">
            {problem.title}
          </h1>
          <DifficultyBadge difficulty={problem.difficulty} />
        </div>
      </header>

      <div className="mx-auto w-full max-w-4xl space-y-12 px-4 py-10 sm:px-6 sm:py-14">
        <Section id="statement" title="Problem">
          <Markdown source={problem.problemStatement} />
        </Section>

        {problem.examples.length > 0 && (
          <Section id="examples" title="Examples">
            <ol className="space-y-3">
              {problem.examples.map((example, index) => (
                <li key={index} className="rounded-xl border bg-card p-4 text-sm">
                  <dl className="grid gap-x-3 gap-y-1 sm:grid-cols-[6rem_minmax(0,1fr)]">
                    <dt className="text-muted-foreground">Input</dt>
                    <dd className="font-mono break-words">{example.input}</dd>
                    <dt className="text-muted-foreground">Output</dt>
                    <dd className="font-mono break-words">{example.output}</dd>
                    {example.explanation && (
                      <>
                        <dt className="text-muted-foreground">Why</dt>
                        <dd>{example.explanation}</dd>
                      </>
                    )}
                  </dl>
                </li>
              ))}
            </ol>
          </Section>
        )}

        {problem.constraints.length > 0 && (
          <Section id="constraints" title="Constraints">
            <ul className="list-disc space-y-1 pl-5 font-mono text-sm">
              {problem.constraints.map((constraint) => (
                <li key={constraint}>{constraint}</li>
              ))}
            </ul>
          </Section>
        )}

        {problem.bruteForceApproach && (
          <Section id="brute-force" title="Brute force">
            <Markdown source={problem.bruteForceApproach} />
          </Section>
        )}

        <Section id="optimized" title="Optimized approach">
          <Markdown source={problem.optimizedApproach} />
        </Section>

        {problem.explanation && (
          <Section id="explanation" title="Why it works">
            <Markdown source={problem.explanation} />
          </Section>
        )}

        <Section id="complexity" title="Complexity">
          <dl className="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2">
            <div className="bg-card p-4">
              <dt className="font-mono text-xs text-muted-foreground">Time</dt>
              <dd className="mt-1 font-mono">{problem.timeComplexity}</dd>
            </div>
            <div className="bg-card p-4">
              <dt className="font-mono text-xs text-muted-foreground">Space</dt>
              <dd className="mt-1 font-mono">{problem.spaceComplexity}</dd>
            </div>
          </dl>
        </Section>

        {problem.dryRun && (
          <Section id="dry-run" title="Dry run">
            <Markdown source={problem.dryRun} />
          </Section>
        )}

        <Section id="solutions" title="Solutions">
          <SolutionTabs solutions={solutions} />
        </Section>
      </div>
    </>
  );
}
