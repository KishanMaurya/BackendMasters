'use client';

import { Menu } from 'lucide-react';
import { lazy, Suspense, useRef, useState } from 'react';

const loadPanel = () => import('./mobile-menu-panel');
const MobileMenuPanel = lazy(loadPanel);

/** The trigger ships with the page. The dialog and its content load on first use. */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [used, setUsed] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Open menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        onPointerEnter={() => void loadPanel()}
        onFocus={() => void loadPanel()}
        onClick={() => {
          setUsed(true);
          setOpen(true);
        }}
        className="grid size-9 place-items-center rounded-lg text-foreground hover:bg-muted"
      >
        <Menu className="size-5" />
      </button>
      {used && (
        <Suspense>
          <MobileMenuPanel open={open} onOpenChange={setOpen} returnFocusTo={triggerRef} />
        </Suspense>
      )}
    </>
  );
}
