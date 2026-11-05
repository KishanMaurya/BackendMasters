import Link from 'next/link';
import { CategoryCard } from '@/components/catalog/category-card';
import { PageHeader } from '@/components/catalog/page-header';
import { SectionHeading } from '@/components/catalog/section-heading';
import {
  ApiIllustration,
  DistributedSystemsIllustration,
  InterviewIllustration,
  KafkaIllustration,
} from '@/components/illustrations';
import { getArticleCounts } from '@/features/articles/queries';
import { CATEGORIES, getCategory } from '@/features/catalog/categories';
import { LEARNING_PATHS, type LearningPath } from '@/features/catalog/paths';
import { pageMetadata } from '@/features/seo/metadata';

export const metadata = pageMetadata({
  title: 'Learning Paths',
  description:
    'Structured routes through DSA, design, cloud and observability, for interviews, production ownership and infrastructure.',
  path: '/learn',
});

const PATH_ILLUSTRATIONS = {
  interview: InterviewIllustration,
  production: ApiIllustration,
  cloud: KafkaIllustration,
} as const;

function Route({ path }: { path: LearningPath }) {
  const Illustration = PATH_ILLUSTRATIONS[path.id as keyof typeof PATH_ILLUSTRATIONS];
  // Stations are equal-width columns, so the first and last centres sit half a column in.
  const inset = `${50 / path.stations.length}%`;

  return (
    <li className="group bm-reveal rounded-xl border bg-card p-5 sm:p-7">
      <div className="flex items-start justify-between gap-6">
        <div className="space-y-1.5">
          <h3 className="text-xl font-medium tracking-tight sm:text-2xl">{path.name}</h3>
          <p className="text-sm text-muted-foreground">{path.audience}</p>
        </div>
        <div className="hidden w-28 shrink-0 sm:block">
          <Illustration />
        </div>
      </div>

      {/* Stations on a line. Vertical on small screens, horizontal from md. */}
      <div className="relative mt-7">
        <div
          aria-hidden
          style={{ left: inset, right: inset }}
          className="absolute top-[0.6875rem] hidden h-0.5 overflow-hidden bg-border md:block"
        >
          <div className="bm-rail-packet flex h-full w-full justify-end">
            <span className="h-full w-10 rounded-full bg-brand-signal" />
          </div>
        </div>
        <ol className="relative flex flex-col gap-1 md:flex-row md:gap-0">
          {path.stations.map((slug, index) => {
            const station = getCategory(slug);
            return (
              <li key={slug} className="relative md:flex-1">
                {index < path.stations.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute top-7 bottom-[-0.5rem] left-[0.6875rem] w-0.5 bg-border md:hidden"
                  />
                )}
                <Link
                  href={station.href}
                  className="group/station flex items-center gap-3 rounded-lg py-1.5 text-sm md:flex-col md:gap-2 md:py-0 md:text-center"
                >
                  <span className="relative grid size-6 shrink-0 place-items-center rounded-full border bg-card font-mono text-[0.625rem] text-muted-foreground transition-colors duration-(--motion-fast) group-hover/station:border-primary group-hover/station:text-primary">
                    {index + 1}
                  </span>
                  <span className="transition-colors duration-(--motion-fast) group-hover/station:text-primary md:px-1 md:text-[0.8125rem]">
                    {station.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </li>
  );
}

export default async function LearnPage() {
  const counts = await getArticleCounts();

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Learn' }]}
        title="Learning paths"
        lede="Three routes through the material, depending on what you're working towards. Follow one in order, or jump to any station."
        illustration={<DistributedSystemsIllustration live title="A cluster of connected nodes" />}
      />

      <section aria-labelledby="paths" className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6">
        <h2 id="paths" className="sr-only">
          Paths
        </h2>
        <ul className="space-y-4">
          {LEARNING_PATHS.map((path) => (
            <Route key={path.id} path={path} />
          ))}
        </ul>
      </section>

      <section aria-labelledby="all" className="border-t px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <SectionHeading id="all" eyebrow="All tracks" title="Or browse by subject." />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((category) => (
              <CategoryCard
                key={category.slug}
                category={category}
                articleCount={counts[category.slug]}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
