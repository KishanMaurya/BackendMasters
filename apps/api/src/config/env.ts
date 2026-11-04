import { z } from 'zod';

const blankToUndefined = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

const optionalString = z.preprocess(blankToUndefined, z.string().optional());

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65535).default(4000),
    CORS_ORIGINS: z.preprocess(blankToUndefined, z.string().default('http://localhost:3000')),
    SWAGGER_ENABLED: z.preprocess(blankToUndefined, z.stringbool().optional()),
    SUPABASE_URL: z.preprocess(blankToUndefined, z.url().optional()),
    SUPABASE_PUBLISHABLE_KEY: optionalString,
    SUPABASE_SECRET_KEY: optionalString,
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV !== 'production') return;
    for (const key of [
      'SUPABASE_URL',
      'SUPABASE_PUBLISHABLE_KEY',
      'SUPABASE_SECRET_KEY',
    ] as const) {
      if (!env[key]) {
        ctx.addIssue({ code: 'custom', path: [key], message: 'Required in production' });
      }
    }
  });

export type Env = z.infer<typeof envSchema>;

/** Used by ConfigModule. Fails startup with every problem listed, never printing a value. */
export function validateEnv(raw: Record<string, unknown>): Env {
  const result = envSchema.safeParse(raw);
  if (!result.success) {
    const problems = result.error.issues
      .map((issue) => `  ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${problems}`);
  }
  return result.data;
}
