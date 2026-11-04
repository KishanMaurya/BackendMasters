'use client';

import { Dialog } from '@base-ui/react/dialog';
import { ArrowUpRight, Search, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { CSSProperties, RefObject } from 'react';
import { CATEGORIES } from '@/features/catalog/categories';
import { isActivePath } from './nav-links';

const PRIMARY_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Learning paths', href: '/learn' },
  { label: 'Search', href: '/search' },
  { label: 'About', href: '/about' },
];

export default function MobileMenuPanel({
  open,
  onOpenChange,
  returnFocusTo,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  returnFocusTo: RefObject<HTMLButtonElement | null>;
}) {
  const pathname = usePathname();
  const close = () => onOpenChange(false);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50 transition-opacity duration-(--motion-base) data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup
          finalFocus={returnFocusTo}
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col overflow-y-auto border-l bg-background transition-transform duration-(--motion-base) ease-(--ease-out) data-ending-style:translate-x-full data-starting-style:translate-x-full"
        >
          <div className="flex h-16 shrink-0 items-center justify-between border-b px-4">
            <Dialog.Title className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
              Menu
            </Dialog.Title>
            <Dialog.Close
              aria-label="Close menu"
              className="grid size-9 place-items-center rounded-lg hover:bg-muted"
            >
              <X className="size-5" />
            </Dialog.Close>
          </div>
          <nav aria-label="Mobile" className="flex flex-col gap-6 p-4">
            <ul className="space-y-1">
              {PRIMARY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={close}
                    aria-current={isActivePath(pathname, link.href) ? 'page' : undefined}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 font-heading text-lg hover:bg-muted aria-[current=page]:text-primary"
                  >
                    {link.label}
                    {link.href === '/search' && <Search className="size-4 text-muted-foreground" />}
                  </Link>
                </li>
              ))}
            </ul>
            <div>
              <p className="px-3 pb-2 font-mono text-xs tracking-widest text-muted-foreground uppercase">
                Tracks
              </p>
              <ul className="space-y-1">
                {CATEGORIES.map((category, index) => {
                  const Icon = category.icon;
                  return (
                    <li
                      key={category.slug}
                      style={{ '--i': index } as CSSProperties}
                      className="bm-enter"
                    >
                      <Link
                        href={category.href}
                        onClick={close}
                        aria-current={isActivePath(pathname, category.href) ? 'page' : undefined}
                        className="group/item flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-muted aria-[current=page]:text-primary"
                      >
                        <Icon className="size-4 text-muted-foreground" />
                        {category.name}
                        <ArrowUpRight className="ml-auto size-4 text-muted-foreground opacity-0 transition-opacity group-hover/item:opacity-100" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
