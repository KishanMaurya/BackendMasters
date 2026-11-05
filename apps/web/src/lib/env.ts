import { z } from 'zod';

const blankToUndefined = (value: unknown) => (value === '' ? undefined : value);

/** Server-only settings. Importing this into a client component would fail on the missing values. */
const schema = z.object({
  API_URL: z.preprocess(blankToUndefined, z.url().default('http://localhost:4000/api/v1')),
  NEXT_PUBLIC_SITE_URL: z.preprocess(blankToUndefined, z.url().default('http://localhost:3000')),
  // The admin area needs these two. The public site works without them.
  NEXT_PUBLIC_SUPABASE_URL: z.preprocess(blankToUndefined, z.url().optional()),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.preprocess(blankToUndefined, z.string().optional()),
  REVALIDATE_SECRET: z.preprocess(blankToUndefined, z.string().min(32).optional()),
});

export const env = schema.parse({
  API_URL: process.env.API_URL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  REVALIDATE_SECRET: process.env.REVALIDATE_SECRET,
});
