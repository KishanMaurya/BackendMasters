'use client';

import { Search } from 'lucide-react';
import { lazy, Suspense, useEffect, useRef, useState, type MouseEvent } from 'react';

const loadDialog = () => import('./search-dialog');
const SearchDialog = lazy(loadDialog);

/**
 * A plain link that still works without JavaScript or in a new tab. With JavaScript, it opens
 * the dialog, which loads on first use. Cmd+K or Ctrl+K opens it from anywhere.
 */
export function SearchTrigger() {
  const [open, setOpen] = useState(false);
  const [used, setUsed] = useState(false);
  const triggerRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setUsed(true);
        setOpen(true);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  function onClick(event: MouseEvent) {
    // Let new-tab and new-window clicks do what they normally do.
    if (event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    setUsed(true);
    setOpen(true);
  }

  return (
    <>
      <a
        ref={triggerRef}
        href="/search"
        aria-haspopup="dialog"
        onPointerEnter={() => void loadDialog()}
        onFocus={() => void loadDialog()}
        onClick={onClick}
        className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors duration-(--motion-fast) hover:bg-muted hover:text-foreground sm:flex"
      >
        <Search aria-hidden className="size-4" />
        Search
      </a>
      {used && (
        <Suspense>
          <SearchDialog open={open} onOpenChange={setOpen} returnFocusTo={triggerRef} />
        </Suspense>
      )}
    </>
  );
}
