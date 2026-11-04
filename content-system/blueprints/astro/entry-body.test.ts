import { describe, it, expect } from 'vitest';

import { parseEntryBody } from './entry-body';

describe('parseEntryBody', () => {
  it('splits on blank lines into paragraphs and joins soft-wrapped lines', () => {
    expect(parseEntryBody('First line\nsecond line.\n\nSecond paragraph.')).toEqual([
      { type: 'paragraph', text: 'First line second line.' },
      { type: 'paragraph', text: 'Second paragraph.' },
    ]);
  });

  it('maps `## ` to h3 and `### ` to h4 under the section h2', () => {
    expect(parseEntryBody('## Part\n\n### Detail\n\nText')).toEqual([
      { type: 'heading', level: 3, text: 'Part' },
      { type: 'heading', level: 4, text: 'Detail' },
      { type: 'paragraph', text: 'Text' },
    ]);
  });

  it('promotes a leading `### ` to h3 so the outline never skips a level', () => {
    expect(parseEntryBody('### Early\n\n## Later\n\n### Nested')).toEqual([
      { type: 'heading', level: 3, text: 'Early' },
      { type: 'heading', level: 3, text: 'Later' },
      { type: 'heading', level: 4, text: 'Nested' },
    ]);
  });

  it('groups consecutive `- ` lines into one list', () => {
    expect(parseEntryBody('Intro\n- one\n- two\n\nAfter')).toEqual([
      { type: 'paragraph', text: 'Intro' },
      { type: 'list', items: ['one', 'two'] },
      { type: 'paragraph', text: 'After' },
    ]);
  });

  it('normalises CRLF and ignores surrounding blank space', () => {
    expect(parseEntryBody('\r\n\r\nA\r\n\r\n\r\nB\r\n')).toEqual([
      { type: 'paragraph', text: 'A' },
      { type: 'paragraph', text: 'B' },
    ]);
  });

  it('leaves unsupported markup as literal text, never as markup', () => {
    expect(parseEntryBody('# Not a heading\n\n<script>x</script> **bold**')).toEqual([
      { type: 'paragraph', text: '# Not a heading' },
      { type: 'paragraph', text: '<script>x</script> **bold**' },
    ]);
  });

  it('treats a bare marker with no text as a paragraph', () => {
    expect(parseEntryBody('## \n\n-')).toEqual([
      { type: 'paragraph', text: '##' },
      { type: 'paragraph', text: '-' },
    ]);
  });

  it('returns no blocks for empty input', () => {
    expect(parseEntryBody('')).toEqual([]);
    expect(parseEntryBody('  \n \n')).toEqual([]);
  });
});
