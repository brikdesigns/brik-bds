import { describe, it, expect } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  parseAllowlist,
  parseAllowlistFromFile,
  stripCssComments,
  extractTokenReferences,
  extractTokenDefinitions,
  sourceScan,
  runtimeScan,
  assertCanonicalCss,
  DEFAULT_EXEMPT_PATTERNS,
} from '../canonical-check.mjs';

// A miniature canonical registry — covers each prefix the scanner cares about
// without depending on the live dist/tokens.css. Tests stay deterministic
// across BDS releases.
const TOKENS_CSS_FIXTURE = `
/**
 * Canonical fixture — distilled from dist/tokens.css.
 */
:root {
  /* Text family */
  --text-primary: #111;
  --text-on-color-dark: #fff;
  --text-on-color-light: #111;
  --text-link: var(--background-brand-primary);

  /* Surface family */
  --surface-primary: #fff;
  --surface-secondary: #f8f8f8;
  --surface-brand-primary: var(--background-brand-primary);

  /* Background family */
  --background-primary: #fff;
  --background-brand-primary: #2a55b4;
  --background-brand-primary-hover: #1f3f8a;

  /* Border family — semantic + sizing tiers */
  --border-primary: #e0e0e0;
  --border-radius-100: 4px;
  --border-width-100: 1px;

  /* Color primitives */
  --color-grayscale-100: #f5f5f5;
  --color-blue-500: #2a55b4;

  /* Sentinel non-prefix token — must NOT appear in allowlist */
  --space-100: 4px;
  --font-size-md: 16px;

  /* extra padding to clear the 20-token sanity floor in the CLI */
  --text-secondary: #555;
  --text-muted: #888;
  --text-inverse: #fff;
  --text-disabled: #aaa;
  --surface-muted: #f0f0f0;
  --surface-inverse: #111;
  --background-secondary: #f5f5f5;
  --background-muted: #f0f0f0;
  --background-disabled: #eee;
  --border-secondary: #ccc;
  --border-disabled: #ddd;
  --color-grayscale-200: #eee;
  --color-grayscale-300: #ddd;
  --color-blue-400: #4a75d4;
}
`;

describe('parseAllowlist', () => {
  it('captures every --token-name declaration', () => {
    const allowlist = parseAllowlist(TOKENS_CSS_FIXTURE);
    expect(allowlist.has('--text-primary')).toBe(true);
    expect(allowlist.has('--surface-primary')).toBe(true);
    expect(allowlist.has('--background-brand-primary')).toBe(true);
    expect(allowlist.has('--border-primary')).toBe(true);
    expect(allowlist.has('--color-grayscale-100')).toBe(true);
  });

  it('captures sizing-tier border tokens (separate semantic, still canonical)', () => {
    const allowlist = parseAllowlist(TOKENS_CSS_FIXTURE);
    expect(allowlist.has('--border-radius-100')).toBe(true);
    expect(allowlist.has('--border-width-100')).toBe(true);
  });

  it('captures non-prefix tokens too (the parser is prefix-agnostic; filtering happens in the scanner)', () => {
    const allowlist = parseAllowlist(TOKENS_CSS_FIXTURE);
    expect(allowlist.has('--space-100')).toBe(true);
    expect(allowlist.has('--font-size-md')).toBe(true);
  });

  it('returns an empty Set for empty input', () => {
    expect(parseAllowlist('').size).toBe(0);
  });

  it('skips declarations that appear inside a /* … */ block on the same line', () => {
    // The parser anchors on line-start / `{` / `;` boundaries. `/*` is none
    // of those, so a same-line commented declaration is correctly ignored
    // even though parseAllowlist itself doesn't run stripCssComments. Real
    // dist/tokens.css never has this shape — it's defensive.
    const allowlist = parseAllowlist('/* --surface-fake: red; */');
    expect(allowlist.has('--surface-fake')).toBe(false);
  });
});

describe('stripCssComments', () => {
  it('removes single-line block comments', () => {
    const out = stripCssComments('a /* ignore */ b');
    expect(out).toContain('a');
    expect(out).toContain('b');
    expect(out).not.toContain('ignore');
  });

  it('removes multi-line block comments with continuation lines', () => {
    const input = [
      '/* note: --color-grayscale-* primitives are referenced',
      '   directly in BDS components — that is intentional and',
      '   should not surface as a violation */',
      '--surface-primary: #fff;',
    ].join('\n');
    const out = stripCssComments(input);
    expect(out).not.toContain('--color-grayscale-');
    expect(out).toContain('--surface-primary');
  });

  it('removes leading-line // comments (TS / JS)', () => {
    const out = stripCssComments(['// banned token: --surface-paper', '--surface-primary: #fff;'].join('\n'));
    expect(out).not.toContain('--surface-paper');
    expect(out).toContain('--surface-primary');
  });

  it('preserves URLs that contain `//`', () => {
    // Line-leading // is what we strip; mid-line `//` (URLs etc) survives.
    const input = "background: url('https://example.com/img.png');";
    expect(stripCssComments(input)).toContain("https://example.com/img.png");
  });
});

describe('extractTokenReferences', () => {
  it('finds every reference in the configured prefix family', () => {
    const css = `
      .foo { color: var(--text-primary); background: var(--background-primary); }
      .bar { border-color: var(--border-primary); }
    `;
    const refs = extractTokenReferences(css);
    expect(refs).toContain('--text-primary');
    expect(refs).toContain('--background-primary');
    expect(refs).toContain('--border-primary');
  });

  it('skips tokens outside the configured prefixes', () => {
    const css = `.foo { padding: var(--space-100); font-size: var(--font-size-md); }`;
    const refs = extractTokenReferences(css);
    expect(refs.has('--space-100')).toBe(false);
    expect(refs.has('--font-size-md')).toBe(false);
  });

  it('honors a custom prefix list', () => {
    const css = `.foo { color: var(--text-primary); padding: var(--space-100); }`;
    const refs = extractTokenReferences(css, ['space']);
    expect(refs.has('--space-100')).toBe(true);
    expect(refs.has('--text-primary')).toBe(false);
  });

  it('skips lines annotated with `bds-lint-ignore` (consistent with other BDS lint scripts)', () => {
    const css = [
      '--text-input-focus-ring-width: 1px; /* bds-lint-ignore — component-scoped */',
      '--surface-paper: #fff; /* not annotated */',
    ].join('\n');
    const refs = extractTokenReferences(css);
    expect(refs.has('--text-input-focus-ring-width')).toBe(false);
    expect(refs.has('--surface-paper')).toBe(true);
  });

  it('does not collapse `-*` glob suffixes inside block comments', () => {
    // Regression: the block-comment stripper must remove the entire comment
    // BEFORE token extraction. Otherwise the regex grabs `--color-grayscale`
    // from "--color-grayscale-*" and emits a false positive.
    const input = '/* references --color-grayscale-* primitives */\n--surface-primary: #fff;';
    const refs = extractTokenReferences(input);
    expect(refs.has('--color-grayscale')).toBe(false);
    expect(refs.has('--surface-primary')).toBe(true);
  });
});

describe('extractTokenDefinitions', () => {
  it('finds LHS declarations only — not var() references', () => {
    const css = `.foo { --surface-primary: #fff; color: var(--text-primary); }`;
    const defs = extractTokenDefinitions(css);
    expect(defs.has('--surface-primary')).toBe(true);
    expect(defs.has('--text-primary')).toBe(false);
  });

  it('honors prefix filtering', () => {
    const css = `:root { --surface-primary: #fff; --space-100: 4px; }`;
    const defs = extractTokenDefinitions(css, ['surface']);
    expect(defs.has('--surface-primary')).toBe(true);
    expect(defs.has('--space-100')).toBe(false);
  });
});

describe('sourceScan', () => {
  function withTempDir(fn) {
    const dir = mkdtempSync(join(tmpdir(), 'canonical-check-'));
    try {
      return fn(dir);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }

  it('reports zero violations for a canonical fixture', () => {
    const allowlist = parseAllowlist(TOKENS_CSS_FIXTURE);
    withTempDir((dir) => {
      writeFileSync(join(dir, 'a.css'), '.foo { color: var(--text-primary); }');
      writeFileSync(join(dir, 'b.tsx'), `const x = 'var(--background-primary)';`);
      const result = sourceScan({ paths: [dir], allowlist });
      expect(result.violations).toEqual([]);
      expect(result.scannedFiles).toBe(2);
      expect(result.canonicalCount).toBe(allowlist.size);
    });
  });

  it('flags non-canonical names with file paths', () => {
    const allowlist = parseAllowlist(TOKENS_CSS_FIXTURE);
    withTempDir((dir) => {
      writeFileSync(join(dir, 'drift.css'), '.foo { color: var(--surface-paper); }');
      const result = sourceScan({ paths: [dir], allowlist });
      expect(result.violations.length).toBe(1);
      expect(result.violations[0].token).toBe('--surface-paper');
      expect(result.violations[0].files[0]).toContain('drift.css');
    });
  });

  it('exempts --border-(radius|width)-* by default', () => {
    const allowlist = parseAllowlist('--surface-primary: #fff;');
    withTempDir((dir) => {
      writeFileSync(join(dir, 'a.css'), '.foo { border-radius: var(--border-radius-99); }');
      const result = sourceScan({ paths: [dir], allowlist });
      expect(result.violations).toEqual([]);
    });
  });

  it('skips test files and __tests__ dirs by default', () => {
    const allowlist = parseAllowlist(TOKENS_CSS_FIXTURE);
    withTempDir((dir) => {
      mkdirSync(join(dir, '__tests__'));
      writeFileSync(join(dir, '__tests__', 'fake.test.ts'), `'var(--surface-paper)'`);
      const result = sourceScan({ paths: [dir], allowlist });
      expect(result.violations).toEqual([]);
      expect(result.scannedFiles).toBe(0);
    });
  });

  it('honors custom exemptTokens (string match + regex)', () => {
    const allowlist = parseAllowlist('--surface-primary: #fff;');
    withTempDir((dir) => {
      writeFileSync(
        join(dir, 'a.css'),
        '.a { color: var(--color-fd-foo); } .b { color: var(--surface-allowed); }',
      );
      const result = sourceScan({
        paths: [dir],
        allowlist,
        exemptTokens: [...DEFAULT_EXEMPT_PATTERNS, '--surface-allowed'],
      });
      expect(result.violations).toEqual([]);
    });
  });

  it('throws on empty allowlist (caller error, not silent pass)', () => {
    expect(() =>
      sourceScan({ paths: ['nonexistent'], allowlist: new Set() }),
    ).toThrowError(/allowlist is empty/);
  });
});

describe('runtimeScan', () => {
  it('flags non-canonical generator output', () => {
    const allowlist = parseAllowlist(TOKENS_CSS_FIXTURE);
    const css = `:root {
      --text-primary: #111;
      --text-on-brand: #fff;          /* non-canonical */
      --surface-paper: #faf7f2;       /* non-canonical */
      --border-radius-200: 8px;       /* exempt — sizing tier */
    }`;
    const result = runtimeScan({ css, allowlist });
    expect(result.violations).toContain('--text-on-brand');
    expect(result.violations).toContain('--surface-paper');
    expect(result.violations).not.toContain('--text-primary');
    expect(result.violations).not.toContain('--border-radius-200');
  });

  it('omits --color-* from default prefixes (those are primitives, not semantic)', () => {
    const allowlist = parseAllowlist(TOKENS_CSS_FIXTURE);
    const css = `:root { --color-bespoke: #ff0000; }`;
    const result = runtimeScan({ css, allowlist });
    expect(result.violations).toEqual([]);
  });

  it('counts emitted definitions accurately', () => {
    const allowlist = parseAllowlist(TOKENS_CSS_FIXTURE);
    const css = `:root { --text-primary: #111; --surface-primary: #fff; }`;
    const result = runtimeScan({ css, allowlist });
    expect(result.emittedCount).toBe(2);
  });
});

describe('assertCanonicalCss', () => {
  it('returns silently for canonical CSS', () => {
    const allowlist = parseAllowlist(TOKENS_CSS_FIXTURE);
    expect(() =>
      assertCanonicalCss(`:root { --text-primary: #111; }`, { allowlist }),
    ).not.toThrow();
  });

  it('throws with the offending tokens listed in the message', () => {
    const allowlist = parseAllowlist(TOKENS_CSS_FIXTURE);
    let captured;
    try {
      assertCanonicalCss(
        `:root { --text-on-brand: #fff; --surface-paper: #faf; }`,
        { allowlist },
      );
    } catch (err) {
      captured = err;
    }
    expect(captured, 'expected assertCanonicalCss to throw').toBeDefined();
    expect(captured.message).toContain('--text-on-brand');
    expect(captured.message).toContain('--surface-paper');
    expect(captured.message).toMatch(/2 non-canonical token name\(s\)/);
  });
});

describe('parseAllowlistFromFile', () => {
  it('throws a descriptive error when the file is missing', () => {
    expect(() => parseAllowlistFromFile('/no/such/path/tokens.css')).toThrowError(
      /allowlist source not found/,
    );
  });

  it('reads and parses an existing tokens.css', () => {
    const dir = mkdtempSync(join(tmpdir(), 'canonical-check-'));
    try {
      const path = join(dir, 'tokens.css');
      writeFileSync(path, TOKENS_CSS_FIXTURE);
      const allowlist = parseAllowlistFromFile(path);
      expect(allowlist.has('--text-primary')).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
