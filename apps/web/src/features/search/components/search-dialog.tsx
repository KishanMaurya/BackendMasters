'use client';

import { Dialog } from '@base-ui/react/dialog';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useState, type KeyboardEvent, type RefObject } from 'react';
import { contentPath, type ContentKind, type SearchSuggestion } from '@backendmasters/shared';
import { cn } from '@/lib/utils';
import { MIN_SUGGESTION_LENGTH, searchHref } from '../search-params';

const DEBOUNCE_MS = 180;

const KIND_LABELS: Record<ContentKind, string> = {
  article: 'Article',
  problem: 'DSA',
  question: 'Question',
};

export default function SearchDialog({
  open,
  onOpenChange,
  returnFocusTo,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  returnFocusTo: RefObject<HTMLAnchorElement | null>;
}) {
  const router = useRouter();
  const listId = useId();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ query: string; items: SearchSuggestion[] } | null>(null);
  const [active, setActive] = useState(-1);
  const trimmed = query.trim();
  const ready = trimmed.length >= MIN_SUGGESTION_LENGTH;
  // Results for older text are never shown, so there's nothing to clear when typing.
  const suggestions = ready && results?.query === trimmed ? results.items : [];

  useEffect(() => {
    if (!ready) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/search/suggest?q=${encodeURIComponent(trimmed)}`, { signal: controller.signal })
        .then((response) => (response.ok ? response.json() : { suggestions: [] }))
        .then((body: { suggestions: SearchSuggestion[] }) => {
          setResults({ query: trimmed, items: body.suggestions });
          setActive(-1);
        })
        // Suggestions are only a shortcut. Pressing Enter still runs the full search.
        .catch(() => undefined);
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [ready, trimmed]);

  function go(href: string) {
    onOpenChange(false);
    router.push(href);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown' && suggestions.length > 0) {
      event.preventDefault();
      setActive((current) => (current + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp' && suggestions.length > 0) {
      event.preventDefault();
      setActive((current) => (current <= 0 ? suggestions.length : current) - 1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const selected = suggestions[active];
      if (selected) go(contentPath(selected.kind, selected.slug));
      else if (trimmed) go(searchHref({ q: trimmed }));
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50 transition-opacity duration-(--motion-fast) data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup
          finalFocus={returnFocusTo}
          className="fixed top-[12vh] left-1/2 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-xl border bg-card transition-[opacity,transform] duration-(--motion-fast) data-ending-style:-translate-y-1 data-ending-style:opacity-0 data-starting-style:-translate-y-1 data-starting-style:opacity-0"
        >
          <Dialog.Title className="sr-only">Search</Dialog.Title>
          <div className="flex items-center gap-3 border-b px-4">
            <Search aria-hidden className="size-4 shrink-0 text-muted-foreground" />
            <input
              type="search"
              role="combobox"
              aria-expanded={suggestions.length > 0}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
              aria-label="Search articles, problems and questions"
              autoFocus
              maxLength={100}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search articles, problems and questions"
              className="h-12 w-full bg-transparent text-sm outline-none"
            />
          </div>
          <ul
            id={listId}
            role="listbox"
            aria-label="Suggestions"
            className="max-h-80 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => (
              <li
                key={`${suggestion.kind}:${suggestion.slug}`}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === active}
                onPointerEnter={() => setActive(index)}
                onClick={() => go(contentPath(suggestion.kind, suggestion.slug))}
                className={cn(
                  'flex cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-sm',
                  index === active && 'bg-muted',
                )}
              >
                {suggestion.title}
                <span className="shrink-0 font-mono text-xs text-muted-foreground">
                  {KIND_LABELS[suggestion.kind]}
                </span>
              </li>
            ))}
          </ul>
          <p className="border-t px-4 py-2 text-xs text-muted-foreground">
            {trimmed ? 'Press Enter to search everything.' : 'Type to see suggestions.'}
          </p>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
