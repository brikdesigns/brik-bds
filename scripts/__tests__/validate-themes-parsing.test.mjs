/**
 * Proof that validate-themes.js reads CSS and not the prose beside it (#1965).
 *
 * Comments in `tokens/gap-fills.css` are load-bearing: they name tokens, cite
 * issues, and record traps. That makes them a parsing hazard for a gate that
 * reads the file as CSS, and both hazards had already fired silently:
 *
 *   1. A brace in a comment ended the block early, so every declaration below
 *      it resolved to undefined — surfacing on an unrelated token ~150 lines
 *      away (#1955).
 *   2. Prose of the form "There is no --border-info: …" parsed AS a declaration
 *      whose value ran to the next real semicolon, eating the real
 *      `--background-info` declaration. It was invisible from #1959 to #1972,
 *      and no gate could fail on it because no gate could see it.
 *
 * Both are asserted here on the exact shapes that shipped, not on synthetic
 * ones, because the point is that these are the comments people actually write.
 */

import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require_ = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const { blankComments, parseDecls, extractBlock } = require_(path.join(HERE, '..', 'validate-themes.js'));

function fixture(css) {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'validate-themes-')), 'tokens.css');
  fs.writeFileSync(file, css);
  return file;
}

describe('blankComments', () => {
  it('blanks the body but preserves byte offsets', () => {
    const src = 'a/* xx */b';
    expect(blankComments(src)).toBe('a        b');
    expect(blankComments(src)).toHaveLength(src.length);
  });

  it('preserves newlines so line numbers stay true', () => {
    expect(blankComments('a/* x\ny */b').split('\n')).toHaveLength(2);
  });
});

describe('#1965 hazard 1 — a brace inside a comment must not end the block', () => {
  it('parses declarations that follow a comment containing a brace', () => {
    // The tempting case: brace-expansion shorthand for a token pair.
    const file = fixture(`:root {
  --before: #111111;
  /* --color-system-neutral{,-light} are theme-invariant */
  --after: #222222;
}
`);
    const vars = extractBlock(file, /:root/);
    expect(vars['--before']).toBe('#111111');
    expect(vars['--after']).toBe('#222222');
  });

  it('the unfixed parser would have stopped at the comment brace', () => {
    // Pins the old behaviour so the assertion above cannot pass vacuously.
    const css = ':root {\n  /* a } brace */\n  --after: #222222;\n}\n';
    const naiveEnd = css.indexOf('}', css.indexOf('{') + 1);
    expect(css.slice(0, naiveEnd)).not.toContain('--after');
    expect(blankComments(css).indexOf('}', css.indexOf('{') + 1)).toBeGreaterThan(naiveEnd);
  });
});

describe('#1965 hazard 2 — prose naming a token must not parse as a declaration', () => {
  it('does not mint a phantom declaration from "There is no --x: …" prose', () => {
    // Verbatim shape from gap-fills.css, which is why --background-info was
    // undefined: `[^;]+` ran from the comment to the next real semicolon.
    const file = fixture(`:root {
  /* There is no --border-info: the gray one retired with the rename and blue
     has no border counterpart. */
  --background-info: var(--color-system-blue);
}
`);
    const vars = extractBlock(file, /:root/);
    expect(vars['--border-info']).toBeUndefined();
    expect(vars['--background-info']).toBe('var(--color-system-blue)');
  });

  it('the phantom used to swallow the real declaration', () => {
    const body = `
  /* There is no --border-info: the gray one retired. */
  --background-info: var(--color-system-blue);
`;
    // Unblanked, the prose wins and the real token vanishes.
    expect(parseDecls(body)['--border-info']).toBeDefined();
    expect(parseDecls(body)['--background-info']).toBeUndefined();
    // Blanked, only the real declaration survives.
    expect(parseDecls(blankComments(body))['--border-info']).toBeUndefined();
    expect(parseDecls(blankComments(body))['--background-info']).toBe('var(--color-system-blue)');
  });
});

describe('the shipped registry', () => {
  it('--background-info resolves in the real gap-fills.css', () => {
    // The regression that motivated the fix, asserted against the live file
    // rather than a fixture — a fixture cannot catch the next comment someone
    // writes above this declaration.
    const vars = extractBlock(path.join(HERE, '..', '..', 'tokens', 'gap-fills.css'), /:root/);
    expect(vars['--background-info']).toBe('var(--color-system-blue)');
    expect(vars['--border-info']).toBeUndefined();
  });
});
