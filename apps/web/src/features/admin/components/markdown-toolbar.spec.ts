import { applyMarkdown, insertAt } from './markdown-toolbar';

describe('applyMarkdown', () => {
  it('wraps the selection and keeps it selected', () => {
    const edit = applyMarkdown('a word here', 2, 6, 'bold');
    expect(edit.value).toBe('a **word** here');
    expect(edit.value.slice(edit.selectionStart, edit.selectionEnd)).toBe('word');
  });

  it('selects placeholder text when nothing is selected', () => {
    const edit = applyMarkdown('', 0, 0, 'link');
    expect(edit.value).toBe('[link text](https://)');
    expect(edit.value.slice(edit.selectionStart, edit.selectionEnd)).toBe('link text');
  });

  it('prefixes every selected line', () => {
    expect(applyMarkdown('one\ntwo\nthree', 4, 13, 'list').value).toBe('one\n- two\n- three');
  });

  it('prefixes the whole line when the caret is mid-line', () => {
    expect(applyMarkdown('first\nsecond', 8, 8, 'heading').value).toBe('first\n## second');
  });

  it('handles the first line', () => {
    expect(applyMarkdown('title', 0, 0, 'heading').value).toBe('## title');
  });
});

describe('insertAt', () => {
  it('inserts text and puts the caret after it', () => {
    const edit = insertAt('ab', 1, 'XY');
    expect(edit).toEqual({ value: 'aXYb', selectionStart: 3, selectionEnd: 3 });
  });
});
