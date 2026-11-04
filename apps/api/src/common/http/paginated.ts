import type { PaginationMeta } from '@backendmasters/shared';

/** Returned by a controller to put its pagination details in the response's `meta`. */
export class Paginated<T> {
  constructor(
    readonly items: T[],
    readonly pagination: PaginationMeta,
  ) {}
}
