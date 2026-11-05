'use client';

import { Binary, ClipboardCheck, FileText, LayoutDashboard, Tags } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/articles', label: 'Articles', icon: FileText, exact: false },
  { href: '/admin/dsa', label: 'DSA problems', icon: Binary, exact: false },
  { href: '/admin/interview', label: 'Interview questions', icon: ClipboardCheck, exact: false },
  { href: '/admin/taxonomy', label: 'Categories & tags', icon: Tags, exact: false },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className="flex gap-1 overflow-x-auto lg:flex-col">
      {LINKS.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors duration-(--motion-fast) hover:bg-muted hover:text-foreground aria-[current=page]:bg-muted aria-[current=page]:text-foreground"
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
