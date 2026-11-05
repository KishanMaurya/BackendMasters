import { SearchTrigger } from '@/features/search/components/search-trigger';
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
          <SearchTrigger />
          <ThemeToggle />
          <div className="lg:hidden">
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
