/**
 * Entry-body parser for `CollectionEntry.astro`.
 *
 * `section.body` is untrusted CMS text. This turns it into a flat list of
 * typed blocks that the block renders as text nodes only — never `set:html` —
 * so nothing in the body can become markup.
 *
 * Convention (the only structure recognised; anything else is literal text):
 *   - blank line            — ends the current paragraph or list
 *   - `## text`             — heading, rendered h3 (the section title is the h2)
 *   - `### text`            — sub-heading, rendered h4
 *   - `- text` lines        — consecutive lines form one list
 *   - any other line        — paragraph; adjacent lines are joined with a space
 *
 * A `### ` that appears before any `## ` is promoted to h3, so the outline
 * never skips a level under the h2.
 */
export type EntryBlock =
  | { readonly type: 'paragraph'; readonly text: string }
  | { readonly type: 'heading'; readonly level: 3 | 4; readonly text: string }
  | { readonly type: 'list'; readonly items: readonly string[] };

export function parseEntryBody(body: string): EntryBlock[] {
  const blocks: EntryBlock[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];
  let seenH3 = false;

  const flush = () => {
    if (paragraph.length > 0) blocks.push({ type: 'paragraph', text: paragraph.join(' ') });
    if (list.length > 0) blocks.push({ type: 'list', items: list });
    paragraph = [];
    list = [];
  };

  for (const raw of body.replace(/\r\n?/g, '\n').split('\n')) {
    const line = raw.trim();
    if (line === '') {
      flush();
      continue;
    }

    const heading = /^(##|###) (\S.*)$/.exec(line);
    if (heading) {
      flush();
      const level = heading[1] === '###' && seenH3 ? 4 : 3;
      if (level === 3) seenH3 = true;
      blocks.push({ type: 'heading', level, text: heading[2] });
      continue;
    }

    const item = /^- (\S.*)$/.exec(line);
    if (item) {
      if (paragraph.length > 0) flush();
      list.push(item[1]);
      continue;
    }

    if (list.length > 0) flush();
    paragraph.push(line);
  }
  flush();

  return blocks;
}
