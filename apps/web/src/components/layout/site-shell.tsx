import { ViewTransition, type ReactNode } from 'react';
import { SiteFooter } from './site-footer';
import { SiteHeader } from './site-header';

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="fixed top-2 left-2 z-50 -translate-y-20 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus-visible:translate-y-0"
      >
        Skip to content
      </a>
      <SiteHeader />
      <ViewTransition>
        <main id="main" className="flex flex-1 flex-col">
          {children}
        </main>
      </ViewTransition>
      <SiteFooter />
    </>
  );
}
