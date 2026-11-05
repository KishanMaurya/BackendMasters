import { createHash, timingSafeEqual } from 'node:crypto';

/** Hashing first makes both sides the same length, as the constant-time comparison requires. */
export function secretsMatch(provided: string | null, expected: string | undefined): boolean {
  if (!provided || !expected) return false;
  const digest = (value: string) => createHash('sha256').update(value).digest();
  return timingSafeEqual(digest(provided), digest(expected));
}
