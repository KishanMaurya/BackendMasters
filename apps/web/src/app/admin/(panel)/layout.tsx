import { ArrowUpRight, LogOut } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/layout/logo';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { buttonVariants } from '@/components/ui/button-variants';
import { signOut } from '@/features/admin/actions';
import { AdminNav } from '@/features/admin/components/admin-nav';

/** Access is checked by each page's API call, because layouts don't re-run on navigation. */
export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
      <aside
        aria-label="Admin menu"
        className="flex flex-col gap-4 border-b p-4 lg:sticky lg:top-0 lg:h-dvh lg:border-r lg:border-b-0"
      >
        <div className="flex items-center justify-between gap-2">
          <Logo />
          <ThemeToggle />
        </div>
        <AdminNav />
        <div className="flex items-center gap-1 lg:mt-auto lg:flex-col lg:items-stretch">
          <Link
            href="/"
            target="_blank"
            className={buttonVariants({ variant: 'ghost', className: 'lg:justify-start' })}
          >
            <ArrowUpRight aria-hidden />
            View site
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className={buttonVariants({ variant: 'ghost', className: 'w-full lg:justify-start' })}
            >
              <LogOut aria-hidden />
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
