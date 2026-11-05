import { codeFence } from './code-fence';

describe('codeFence', () => {
  it('wraps code with a language', () => {
    expect(codeFence('a', 'ts')).toBe('```ts\na\n```');
  });

  it('uses a longer fence than any backticks inside', () => {
    const fenced = codeFence('```\ninner\n```', 'md');
    expect(fenced.startsWith('````md\n')).toBe(true);
    expect(fenced.endsWith('\n````')).toBe(true);
  });
});
