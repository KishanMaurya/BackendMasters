import { z } from 'zod';
import { RESERVED_ARTICLE_SLUGS } from '@backendmasters/shared';

/**
 * Form validation, for fast feedback and to check Server Action input. The API validates
 * everything again and is the one that decides.
 */
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const SLUG_MESSAGE = 'Use lowercase letters, numbers and single hyphens';

const blankToNull = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? null : value;

export const signInSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
});

export const articleSchema = z.object({
  slug: z
    .string()
    .regex(SLUG, SLUG_MESSAGE)
    .max(120, 'Keep it under 120 characters')
    .refine((slug) => !RESERVED_ARTICLE_SLUGS.includes(slug), 'That slug is reserved'),
  title: z.string().trim().min(1, 'Add a title').max(200, 'Keep it under 200 characters'),
  description: z.string().max(500, 'Keep it under 500 characters'),
  content: z.string().max(200_000, 'This article is too long'),
  coverImageUrl: z.preprocess(blankToNull, z.url().nullable()),
  categoryId: z.uuid('Choose a category'),
  difficulty: z.preprocess(blankToNull, z.enum(['easy', 'medium', 'hard']).nullable()),
  seoTitle: z.preprocess(
    blankToNull,
    z.string().max(200, 'Keep it under 200 characters').nullable(),
  ),
  seoDescription: z.preprocess(
    blankToNull,
    z.string().max(300, 'Keep it under 300 characters').nullable(),
  ),
  isFeatured: z.boolean(),
  tagIds: z.array(z.uuid()).max(20, 'Use 20 tags at most'),
});

export const categorySchema = z.object({
  name: z.string().trim().min(1, 'Add a name').max(100),
  description: z.string().max(500),
  sortOrder: z.coerce.number().int().min(0).max(10_000),
});

export const tagSchema = z.object({
  slug: z.string().regex(SLUG, SLUG_MESSAGE).max(80),
  name: z.string().trim().min(1, 'Add a name').max(80),
});

export const uuidSchema = z.uuid();
export const isoDateSchema = z.iso.datetime({ offset: true });

export type FieldErrors = Record<string, string>;

export function toFieldErrors(error: z.ZodError): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? 'form');
    errors[field] ??= issue.message;
  }
  return errors;
}
