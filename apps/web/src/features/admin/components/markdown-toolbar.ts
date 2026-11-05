export interface TextEdit {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

export type MarkdownAction = 'bold' | 'italic' | 'code' | 'link' | 'heading' | 'list' | 'codeblock';

const WRAPS: Partial<Record<MarkdownAction, { before: string; after: string; empty: string }>> = {
  bold: { before: '**', after: '**', empty: 'bold text' },
  italic: { before: '_', after: '_', empty: 'italic text' },
  code: { before: '`', after: '`', empty: 'code' },
  link: { before: '[', after: '](https://)', empty: 'link text' },
  codeblock: { before: '```ts\n', after: '\n```', empty: 'code' },
};

const LINE_PREFIXES: Partial<Record<MarkdownAction, string>> = {
  heading: '## ',
  list: '- ',
};

/** Pure, so it can be tested without a browser. The selection stays on the affected text. */
export function applyMarkdown(
  value: string,
  start: number,
  end: number,
  action: MarkdownAction,
): TextEdit {
  const prefix = LINE_PREFIXES[action];
  if (prefix) {
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const lines = value.slice(lineStart, end).split('\n');
    const replaced = lines.map((line) => prefix + line).join('\n');
    return {
      value: value.slice(0, lineStart) + replaced + value.slice(end),
      selectionStart: start + prefix.length,
      selectionEnd: lineStart + replaced.length,
    };
  }

  const wrap = WRAPS[action] as NonNullable<(typeof WRAPS)[MarkdownAction]>;
  const selected = value.slice(start, end) || wrap.empty;
  return {
    value: value.slice(0, start) + wrap.before + selected + wrap.after + value.slice(end),
    selectionStart: start + wrap.before.length,
    selectionEnd: start + wrap.before.length + selected.length,
  };
}

export function insertAt(value: string, position: number, text: string): TextEdit {
  const caret = position + text.length;
  return {
    value: value.slice(0, position) + text + value.slice(position),
    selectionStart: caret,
    selectionEnd: caret,
  };
}
