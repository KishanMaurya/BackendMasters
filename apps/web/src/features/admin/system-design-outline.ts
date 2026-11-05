import { SYSTEM_DESIGN_ANATOMY } from '@/features/catalog/categories';

/** The tracks whose articles follow the ten-section format. */
export const SYSTEM_DESIGN_CATEGORIES: readonly string[] = ['hld', 'system-design'];

export function systemDesignOutline(): string {
  return SYSTEM_DESIGN_ANATOMY.map((section) => `## ${section}\n`).join('\n');
}

const HEADING = /^#{1,3}\s+(.+?)\s*$/gm;

/** Sections the format asks for that the Markdown doesn't have a heading for yet. */
export function missingSections(markdown: string): string[] {
  const headings = [...markdown.matchAll(HEADING)].map(([, text]) => text?.toLowerCase());
  return SYSTEM_DESIGN_ANATOMY.filter((section) => !headings.includes(section.toLowerCase()));
}
