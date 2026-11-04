'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';
import { NAV_ITEMS } from '@/config/site';
import { cn } from '@/lib/utils';

export function isActivePath(pathname: string, href: string): boolean {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}

/** Indicator's base width. It's scaled with a transform, so moving it never triggers layout. */
const INDICATOR_WIDTH = 100;

export function NavLinks() {
  const pathname = usePathname();
  const listRef = useRef<HTMLUListElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);

  const moveTo = useCallback((link: HTMLElement | null) => {
    const indicator = indicatorRef.current;
    if (!indicator) return;
    if (!link) {
      indicator.style.opacity = '0';
      return;
    }
    indicator.style.opacity = '1';
    indicator.style.transform = `translateX(${link.offsetLeft}px) scaleX(${link.offsetWidth / INDICATOR_WIDTH})`;
  }, []);

  const moveToActive = useCallback(() => {
    moveTo(listRef.current?.querySelector<HTMLElement>('a[aria-current="page"]') ?? null);
  }, [moveTo]);

  useEffect(() => {
    moveToActive();
    // Web fonts change link widths after first paint.
    void document.fonts?.ready.then(moveToActive);
    window.addEventListener('resize', moveToActive);
    return () => window.removeEventListener('resize', moveToActive);
  }, [moveToActive, pathname]);

  return (
    <ul ref={listRef} onMouseLeave={moveToActive} className="relative flex items-stretch">
      {NAV_ITEMS.map((item) => {
        const active = isActivePath(pathname, item.href);
        return (
          <li key={item.href} className="flex">
            <Link
              href={item.href}
              aria-current={active ? 'page' : undefined}
              onMouseEnter={(event) => moveTo(event.currentTarget)}
              onFocus={(event) => moveTo(event.currentTarget)}
              onBlur={moveToActive}
              className={cn(
                'flex h-full items-center rounded-md px-3 text-sm whitespace-nowrap transition-colors duration-(--motion-fast) hover:text-foreground',
                active ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
      <span
        ref={indicatorRef}
        aria-hidden
        style={{ width: INDICATOR_WIDTH, opacity: 0 }}
        className="pointer-events-none absolute -bottom-px left-0 h-0.5 origin-left bg-primary transition-[transform,opacity] duration-(--motion-base) ease-(--ease-out)"
      />
    </ul>
  );
}
