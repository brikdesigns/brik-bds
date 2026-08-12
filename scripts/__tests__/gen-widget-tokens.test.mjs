import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  parseTokenCss,
  resolveToken,
  reconcile,
} from '../gen-widget-tokens.mjs';

/**
 * Unit cover for the DevBar widget token generator (brik-bds#1750).
 *
 * The CI gate (`npm run gen:widget-tokens:check`) proves the committed widgets
 * are in sync. These tests prove the generator can still SEE drift — a gate that
 * silently matches everything is the failure mode being replaced, since the
 * thing it replaced was a comment that also never disagreed with anything.
 */

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..', '..');

const FIXTURE_CSS = `
:root {
  --color-grayscale-100: #f2f2f2;
  --color-grayscale-500: #828282;
  --color-grayscale-950: #1b1b1b;
  --color-grayscale-light: var(--color-grayscale-500);
  --text-primary: var(--color-grayscale-950);
  --border-radius-300: 10px;
}
`;

const declared = parseTokenCss(FIXTURE_CSS);

describe('resolveToken', () => {
  it('returns a literal declaration as-is', () => {
    expect(resolveToken(declared, '--color-grayscale-100')).toBe('#f2f2f2');
  });

  it('follows a var() alias to the stop it points at', () => {
    // The 6-step names are DEPRECATED aliases (#1739). Both spellings must
    // resolve so #1740 AC 6 can delete the alias layer without breaking this.
    expect(resolveToken(declared, '--color-grayscale-light')).toBe('#828282');
  });

  it('returns null for a token that is not declared', () => {
    expect(resolveToken(declared, '--color-grayscale-404')).toBeNull();
  });

  it('throws rather than looping on a cyclic alias', () => {
    const cyclic = parseTokenCss(
      ':root {\n  --color-a: var(--color-b);\n  --color-b: var(--color-a);\n}',
    );
    expect(() => resolveToken(cyclic, '--color-a')).toThrow(/Cyclic/);
  });
});

describe('reconcile', () => {
  it('rewrites a drifted literal and reports it', () => {
    const src = `    colorGrayscaleDarkest: '#333333', // --color-grayscale-950\n`;
    const { next, drifted } = reconcile(src, declared);
    expect(drifted).toEqual([
      { token: '--color-grayscale-950', was: '#333333', now: '#1b1b1b' },
    ]);
    expect(next).toContain("'#1b1b1b', // --color-grayscale-950");
  });

  it('leaves an in-sync entry byte-identical', () => {
    const src = `    colorGrayscaleLightest:'#f2f2f2', // --color-grayscale-100\n`;
    const { next, drifted } = reconcile(src, declared);
    expect(drifted).toEqual([]);
    expect(next).toBe(src);
  });

  it('preserves the hand-aligned column when rewriting', () => {
    const src = `    colorGrayscaleLight:   '#bdbdbd', // --color-grayscale-500\n`;
    const { next } = reconcile(src, declared);
    expect(next).toBe(
      `    colorGrayscaleLight:   '#828282', // --color-grayscale-500\n`,
    );
  });

  it('ignores entries annotated with a non-primitive token', () => {
    // --text-* / --border-radius-* are redeclared per theme and per mode, so
    // they have no single value a generator may pick. Explicitly out of scope.
    const src =
      `    textPrimary: '#333333', // --text-primary\n` +
      `    radius300:   '12px',    // --border-radius-300\n`;
    const { next, drifted, unresolved } = reconcile(src, declared);
    expect(drifted).toEqual([]);
    expect(unresolved).toEqual([]);
    expect(next).toBe(src);
  });

  it('reports a --color-* annotation that names no declared token', () => {
    const src = `    colorGhost: '#abcdef', // --color-grayscale-404\n`;
    const { next, unresolved } = reconcile(src, declared);
    expect(unresolved).toEqual([
      { token: '--color-grayscale-404', literal: '#abcdef' },
    ]);
    expect(next).toBe(src); // never guesses — leaves the file alone
  });
});

describe('committed widgets', () => {
  it('inspect-widget grayscale entries name numeric stops, not 6-step aliases', () => {
    // Forward-compatibility with #1740 AC 6, which removes the alias layer.
    const src = readFileSync(
      join(repoRoot, 'components/ui/BrikDevBar/widgets/inspect-widget.js'),
      'utf8',
    );
    const legacy = [
      ...src.matchAll(
        /\/\/\s*--color-(?:grayscale|poppy|tan)-(lightest|lighter|light|dark|darker|darkest)\b/g,
      ),
    ];
    expect(legacy.map((m) => m[0])).toEqual([]);
  });
});
