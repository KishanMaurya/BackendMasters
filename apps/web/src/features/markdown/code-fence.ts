/** Wraps source in a Markdown code block, with a fence longer than any backticks inside it. */
export function codeFence(source: string, language: string): string {
  const longest = Math.max(2, ...[...source.matchAll(/`+/g)].map(([run]) => run.length));
  const fence = '`'.repeat(longest + 1);
  return `${fence}${language}\n${source}\n${fence}`;
}
