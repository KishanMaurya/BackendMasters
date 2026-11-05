import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { BRAND } from '@backendmasters/shared';
import { COPYRIGHT_YEAR, SOCIAL_LINKS } from '@/config/site';
import { CATEGORIES } from '@/features/catalog/categories';
import { Logo } from './logo';

const heading = 'font-mono text-xs tracking-widest text-muted-foreground uppercase';
const link =
  'text-sm text-foreground/80 transition-colors duration-(--motion-fast) hover:text-primary';

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:grid-cols-[1.6fr_1.4fr_0.7fr_0.7fr]">
        <div className="max-w-sm space-y-4">
          <Logo />
          <p className="text-sm leading-relaxed text-muted-foreground">
            A learning platform for engineers who want to understand how real systems are built,
            designed and scaled.
          </p>
          <p className="font-mono text-xs tracking-wide text-primary">{BRAND.tagline}</p>
        </div>

        <nav aria-label="Learning categories" className="space-y-4">
          <h2 className={heading}>Learn</h2>
          <ul className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
            {CATEGORIES.map((category) => (
              <li key={category.slug}>
                <Link href={category.href} className={link}>
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="About" className="space-y-4">
          <h2 className={heading}>About</h2>
          <ul className="space-y-2.5">
            <li>
              <Link href="/about" className={link}>
                About {BRAND.name}
              </Link>
            </li>
            <li>
              <Link href="/articles" className={link}>
                All articles
              </Link>
            </li>
            <li>
              <Link href="/learn" className={link}>
                Learning paths
              </Link>
            </li>
            <li>
              <Link href="/about#contact" className={link}>
                Contact
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Social media" className="space-y-4">
          <h2 className={heading}>Follow</h2>
          <ul className="space-y-2.5">
            {SOCIAL_LINKS.map((social) => (
              <li key={social.href}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${link} inline-flex items-center gap-1`}
                >
                  {social.label}
                  <ArrowUpRight className="size-3.5" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-muted-foreground sm:px-6">
          © {COPYRIGHT_YEAR} {BRAND.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
