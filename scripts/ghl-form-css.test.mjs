/**
 * GhlForm CSS guard — the frame's height is an initial value, never a floor.
 *
 * GHL's `form_embed.js` resizes the iframe by writing an inline `height`. A
 * `min-height` of the same variable pins the frame at the prop height, so the
 * short post-submit thank-you message sits in a tall empty box. Lives under
 * scripts/ because the `components` project stubs CSS (`?raw` reads '') and
 * carries no node types — same split as indicator-anatomy-css.test.mjs.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const css = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '..', 'components', 'ui', 'GhlForm', 'GhlForm.css'),
  'utf8',
);
// Declarations only: strip comments so the header prose cannot satisfy or trip a match.
const declarations = css.replace(/\/\*[\s\S]*?\*\//g, '');

describe('GhlForm CSS', () => {
  it('reserves the prop height as the initial height', () => {
    expect(declarations).toMatch(/\bheight:\s*var\(--bds-ghl-form-height\)/);
  });

  it('declares no min-height, so form_embed.js can shrink the frame', () => {
    expect(declarations).not.toMatch(/min-height\s*:/);
  });
});
