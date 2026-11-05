import { secretsMatch } from './revalidate-secret';

describe('secretsMatch', () => {
  it('accepts only an exact match', () => {
    expect(secretsMatch('secret', 'secret')).toBe(true);
    expect(secretsMatch('secret2', 'secret')).toBe(false);
    expect(secretsMatch('SECRET', 'secret')).toBe(false);
  });

  it('refuses everything when no secret is configured', () => {
    expect(secretsMatch('anything', undefined)).toBe(false);
    expect(secretsMatch('', '')).toBe(false);
    expect(secretsMatch(null, 'secret')).toBe(false);
  });
});
