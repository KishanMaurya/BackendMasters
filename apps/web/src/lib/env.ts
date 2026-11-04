import { z } from 'zod';

const blankToUndefined = (value: unknown) => (value === '' ? undefined : value);

/** Server-only settings. Importing this into a client component would fail on the missing values. */
const schema = z.object({
  API_URL: z.preprocess(blankToUndefined, z.url().default('http://localhost:4000/api/v1')),
  NEXT_PUBLIC_SITE_URL: z.preprocess(blankToUndefined, z.url().default('http://localhost:3000')),
});

export const env = schema.parse({
  API_URL: process.env.API_URL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});
