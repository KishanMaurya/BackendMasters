import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Eyebrow } from '@/components/catalog/section-heading';
import { getCategory } from '@/features/catalog/categories';

export function InterviewSection() {
  const { topics, href } = getCategory('interview-questions');

  return (
    <section
      aria-labelledby="interview"
      className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1fr_1.1fr] lg:gap-16"
    >
      <div className="space-y-6">
        <Eyebrow>Interview preparation</Eyebrow>
        <h2 id="interview" className="text-3xl font-semibold tracking-tight sm:text-5xl">
          Prepare for Your Next Engineering Interview.
        </h2>
        <p className="max-w-lg text-muted-foreground sm:text-lg">
          Short answers you can say out loud, with the reasoning behind them for when the
          interviewer asks why.
        </p>

        <figure className="bm-reveal max-w-lg rounded-xl border bg-card p-5">
          <figcaption className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
            System design · Sample
          </figcaption>
          <p className="mt-3 font-heading text-lg font-medium">What is a cache stampede?</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            A popular key expires and many requests miss it at once, so they all hit the database
            together. Prevent it by coalescing concurrent requests, adding jitter to expiry times,
            or refreshing the key before it expires.
          </p>
        </figure>
      </div>

      <ul className="grid content-start gap-3 sm:grid-cols-2">
        {topics.map((topic) => (
          <li key={topic}>
            <Link
              href={`${href}?technology=${encodeURIComponent(topic)}`}
              className="group/q flex items-center justify-between gap-3 rounded-xl border bg-card p-4 transition-colors duration-(--motion-fast) hover:border-primary/60"
            >
              <span className="text-sm font-medium">
                {topic}
                <span className="block pt-0.5 text-xs font-normal text-muted-foreground">
                  Interview Questions
                </span>
              </span>
              <ArrowRight
                aria-hidden
                className="size-4 shrink-0 text-muted-foreground transition-[transform,color] duration-(--motion-base) ease-(--ease-out) group-hover/q:translate-x-1 group-hover/q:text-primary"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
