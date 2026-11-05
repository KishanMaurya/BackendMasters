import type { FieldErrors } from './schemas';

export type ActionResult<T = undefined> =
  { ok: true; data: T; warning?: string } | { ok: false; error: string; fieldErrors?: FieldErrors };

export const NOT_REVALIDATED_WARNING =
  'Saved, but the live site could not be refreshed. It can take up to an hour to update.';
