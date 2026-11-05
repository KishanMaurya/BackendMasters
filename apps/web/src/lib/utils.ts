export type ClassValue = string | false | null | undefined;

/**
 * Joins class names, leaving out any that are switched off. It doesn't resolve conflicts between
 * Tailwind classes, which a merging library does at about 15 KB on every page. If two classes
 * conflict, remove one rather than relying on order.
 */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}
