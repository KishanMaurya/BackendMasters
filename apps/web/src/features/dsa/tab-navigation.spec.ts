import { tabIndexForKey } from './tab-navigation';

describe('tabIndexForKey', () => {
  it('moves to the next and previous tab', () => {
    expect(tabIndexForKey('ArrowRight', 0, 4)).toBe(1);
    expect(tabIndexForKey('ArrowLeft', 2, 4)).toBe(1);
  });

  it('wraps around at both ends', () => {
    expect(tabIndexForKey('ArrowRight', 3, 4)).toBe(0);
    expect(tabIndexForKey('ArrowLeft', 0, 4)).toBe(3);
  });

  it('jumps to the first and last tab', () => {
    expect(tabIndexForKey('Home', 2, 4)).toBe(0);
    expect(tabIndexForKey('End', 1, 4)).toBe(3);
  });

  it('ignores every other key, so Tab and Enter keep working', () => {
    expect(tabIndexForKey('Tab', 1, 4)).toBeNull();
    expect(tabIndexForKey('Enter', 1, 4)).toBeNull();
  });
});
