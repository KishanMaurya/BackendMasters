import type { Element } from 'hast';
import { createHighlighter, type Highlighter } from 'shiki';

// The -default variants are the ones that meet 4.5:1 on our card colours. Plain github-dark doesn't.
const THEMES = { light: 'github-light-default', dark: 'github-dark-default' } as const;

const LANGUAGES = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  go: 'Go',
  java: 'Java',
  python: 'Python',
  sql: 'SQL',
  bash: 'Bash',
  json: 'JSON',
} as const;

const ALIASES: Record<string, keyof typeof LANGUAGES> = {
  js: 'javascript',
  ts: 'typescript',
  golang: 'go',
  py: 'python',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
};

const PLAIN = 'text';

export type HighlightLanguage = keyof typeof LANGUAGES | typeof PLAIN;

function isSupported(language: string): language is keyof typeof LANGUAGES {
  return language in LANGUAGES;
}

export function normalizeLanguage(language: string | undefined): HighlightLanguage {
  if (!language) return PLAIN;
  const lower = language.toLowerCase();
  const resolved = ALIASES[lower] ?? lower;
  return isSupported(resolved) ? resolved : PLAIN;
}

export function languageLabel(language: HighlightLanguage): string {
  return language === PLAIN ? 'Text' : LANGUAGES[language];
}

let instance: Promise<Highlighter> | undefined;

function getHighlighter(): Promise<Highlighter> {
  instance ??= createHighlighter({
    themes: Object.values(THEMES),
    langs: Object.keys(LANGUAGES),
  });
  return instance;
}

/** Runs on the server only, so no grammar or theme ever reaches the browser. */
export async function highlight(source: string, language: HighlightLanguage): Promise<Element> {
  const highlighter = await getHighlighter();
  const root = highlighter.codeToHast(source, {
    lang: language,
    themes: THEMES,
    // Both themes are emitted as CSS variables. article.css picks one, so switching needs no JS.
    defaultColor: false,
  });
  return root.children[0] as Element;
}
