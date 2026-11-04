import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { CATEGORY_ILLUSTRATIONS } from '@/components/illustrations';
import type { Category } from '@/features/catalog/categories';

/** Shows articles once they exist, and the planned topic count until then. */
export function contentLabel(articleCount: number | undefined, topicCount: number): string {
  if (articleCount) return `${articleCount} ${articleCount === 1 ? 'article' : 'articles'}`;
  return `${topicCount} topics`;
}

export function CategoryCard({
  category,
  articleCount,
}: {
  category: Category;
  articleCount?: number;
}) {
  const Illustration = CATEGORY_ILLUSTRATIONS[category.slug];
  const Icon = category.icon;

  return (
    <Link
      href={category.href}
      className="group bm-reveal relative flex h-full flex-col overflow-hidden rounded-xl border bg-card transition-[transform,box-shadow] duration-(--motion-base) ease-(--ease-out) hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10"
    >
      {/* Accent line that draws across the top on hover. */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 z-10 h-0.5 origin-left scale-x-0 bg-primary transition-transform duration-(--motion-slow) ease-(--ease-out) group-hover:scale-x-100 group-focus-visible:scale-x-100"
      />
      <div className="flex h-36 items-center justify-center border-b bg-background/40 px-6 py-3">
        <Illustration className="h-full w-auto" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="flex items-center gap-2 text-lg font-medium tracking-tight">
          <Icon
            aria-hidden
            className="size-4 shrink-0 text-primary transition-transform duration-(--motion-base) ease-(--ease-out) group-hover:scale-110"
          />
          {category.name}
        </h3>
        <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
          {category.description}
        </p>
        <div className="flex items-center justify-between pt-3 font-mono text-xs text-muted-foreground">
          {contentLabel(articleCount, category.topics.length)}
          <ArrowRight
            aria-hidden
            className="size-4 transition-[transform,color] duration-(--motion-base) ease-(--ease-out) group-hover:translate-x-1 group-hover:text-primary"
          />
        </div>
      </div>
    </Link>
  );
}
