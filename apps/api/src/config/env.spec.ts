import { validateEnv } from './env.js';

const SUPABASE = {
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_PUBLISHABLE_KEY: 'publishable',
  SUPABASE_SECRET_KEY: 'secret',
  WEB_REVALIDATE_URL: 'https://example.com/api/revalidate',
  REVALIDATE_SECRET: 'x'.repeat(32),
};

describe('validateEnv', () => {
  it('applies development defaults', () => {
    const env = validateEnv({});
    expect(env.NODE_ENV).toBe('development');
    expect(env.PORT).toBe(4000);
    expect(env.CORS_ORIGINS).toBe('http://localhost:3000');
  });

  it('treats blank values from a copied .env.example as unset', () => {
    const env = validateEnv({ SUPABASE_URL: '', SUPABASE_SECRET_KEY: '  ', SWAGGER_ENABLED: '' });
    expect(env.SUPABASE_URL).toBeUndefined();
    expect(env.SUPABASE_SECRET_KEY).toBeUndefined();
    expect(env.SWAGGER_ENABLED).toBeUndefined();
  });

  it('reads SWAGGER_ENABLED=false as false', () => {
    expect(validateEnv({ SWAGGER_ENABLED: 'false' }).SWAGGER_ENABLED).toBe(false);
  });

  it('rejects an invalid port and URL', () => {
    expect(() => validateEnv({ PORT: '99999' })).toThrow(/PORT/);
    expect(() => validateEnv({ SUPABASE_URL: 'not-a-url' })).toThrow(/SUPABASE_URL/);
  });

  it('requires every Supabase value in production', () => {
    expect(() => validateEnv({ NODE_ENV: 'production' })).toThrow(
      /SUPABASE_URL[\s\S]*SUPABASE_PUBLISHABLE_KEY[\s\S]*SUPABASE_SECRET_KEY/,
    );
    expect(validateEnv({ NODE_ENV: 'production', ...SUPABASE }).NODE_ENV).toBe('production');
  });

  it('rejects a short revalidation secret', () => {
    expect(() => validateEnv({ REVALIDATE_SECRET: 'short' })).toThrow(/REVALIDATE_SECRET/);
  });

  it('never includes values in the error message', () => {
    expect(() => validateEnv({ NODE_ENV: 'production', SUPABASE_SECRET_KEY: 'hunter2' })).toThrow(
      expect.not.objectContaining({ message: expect.stringContaining('hunter2') }),
    );
  });
});
