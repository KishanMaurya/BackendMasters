'use client';

import { Moon, Sun } from 'lucide-react';
import { THEME_STORAGE_KEY } from './theme';

export function ThemeToggle() {
  function toggle() {
    const isDark = document.documentElement.classList.toggle('dark');
    try {
      localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
    } catch {
      // Storage can be blocked. The theme still applies for this page view.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch between dark and light theme"
      className="relative grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors duration-(--motion-fast) hover:bg-muted hover:text-foreground"
    >
      {/* CSS picks the icon, so the server render is always correct for either theme. */}
      <Sun className="absolute size-[1.05rem] scale-0 -rotate-90 transition-transform duration-(--motion-base) ease-(--ease-out) dark:scale-100 dark:rotate-0" />
      <Moon className="absolute size-[1.05rem] scale-100 rotate-0 transition-transform duration-(--motion-base) ease-(--ease-out) dark:scale-0 dark:rotate-90" />
    </button>
  );
}
