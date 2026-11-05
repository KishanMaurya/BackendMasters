import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const LINK = 'inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm hover:bg-muted';

/** Previous and next links. Renders nothing when everything fits on one page. */
export function PageLinks({
  page,
  pages,
  href,
}: {
  page: number;
  pages: number;
  href: (page: number) => string;
}) {
  if (pages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-between gap-4">
      {page > 1 ? (
        <Link rel="prev" href={href(page - 1)} className={LINK}>
          <ChevronLeft aria-hidden className="size-4" />
          Previous
        </Link>
      ) : (
        <span />
      )}
      <span className="font-mono text-xs text-muted-foreground">
        Page {page} of {pages}
      </span>
      {page < pages ? (
        <Link rel="next" href={href(page + 1)} className={LINK}>
          Next
          <ChevronRight aria-hidden className="size-4" />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
