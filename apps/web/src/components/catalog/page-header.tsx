import Link from 'next/link';
import type { ReactNode } from 'react';
import { InView } from '@/components/motion/in-view';

export interface Crumb {
  label: string;
  href?: string;
}

export function PageHeader({
  crumbs,
  title,
  lede,
  illustration,
}: {
  crumbs: readonly Crumb[];
  title: string;
  lede: string;
  illustration?: ReactNode;
}) {
  return (
    <header className="relative overflow-hidden border-b">
      <div
        aria-hidden
        className="bm-hero-mask pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="bm-hero-grid absolute -inset-12" />
      </div>
      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 sm:py-16 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground">
                  Home
                </Link>
              </li>
              {crumbs.map((crumb) => (
                <li key={crumb.label} className="flex items-center gap-2">
                  <span aria-hidden>/</span>
                  {crumb.href ? (
                    <Link href={crumb.href} className="hover:text-foreground">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="text-primary">
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
          <h1 className="bm-enter-heading text-4xl font-semibold tracking-tight sm:text-5xl">
            {title}
          </h1>
          <p className="bm-enter max-w-2xl text-lg leading-relaxed text-muted-foreground">{lede}</p>
        </div>
        {illustration && (
          <InView className="bm-enter mx-auto w-full max-w-64 md:max-w-xs">{illustration}</InView>
        )}
      </div>
    </header>
  );
}
