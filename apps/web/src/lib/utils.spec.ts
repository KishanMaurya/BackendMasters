import { cn } from './utils';

describe('cn', () => {
  it('joins classes, leaving out those switched off', () => {
    const off = false as boolean;
    expect(cn('a', off && 'b', null, undefined, '', 'c')).toBe('a c');
  });
});
