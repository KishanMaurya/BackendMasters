import { Search } from 'lucide-react';
import Link from 'next/link';
import { Logo } from './logo';
import { MobileMenu } from './mobile-menu';
import { NavLinks } from './nav-links';
import { ThemeToggle } from './theme-toggle';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        <Logo />
        <nav aria-label="Primary" className="hidden self-stretch lg:flex">
          <NavLinks />
        </nav>
        <div className="flex items-center gap-1">
          <Link
            href="/search"
            className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors duration-(--motion-fast) hover:bg-muted hover:text-foreground sm:flex"
          >
            <Search className="size-4" />
            Search
          </Link>
          <ThemeToggle />
          <div className="lg:hidden">
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
