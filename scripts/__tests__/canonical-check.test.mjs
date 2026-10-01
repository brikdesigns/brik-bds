import { describe, it, expect } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
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
  buildSarif,
  DEFAULT_EXEMPT_PATTERNS,
  SARIF_VERSION,
  SARIF_RULE_ID,
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
  --bds-text-primary: #111;
  --bds-text-on-color-dark: #fff;
  --bds-text-on-color-light: #111;
  --bds-text-link: var(--bds-background-brand-primary);

  /* Surface family */
  --bds-surface-primary: #fff;
  --bds-surface-secondary: #f8f8f8;
  --bds-surface-brand-primary: var(--bds-background-brand-primary);

  /* Background family */
  --bds-background-primary: #fff;
  --bds-background-brand-primary: #2a55b4;
  --bds-background-brand-primary-hover: #1f3f8a;

  /* Border family — semantic + sizing tiers */
  --bds-border-primary: #e0e0e0;
  --bds-border-radius-100: 4px;
  --bds-border-width-100: 1px;

  /* Color primitives */
  --bds-color-grayscale-100: #f5f5f5;
  --bds-color-blue-500: #2a55b4;

  /* Sentinel non-prefix token — must NOT appear in allowlist */
  --bds-space-100: 4px;
  --font-size-md: 16px;

  /* extra padding to clear the 20-token sanity floor in the CLI */
  --bds-text-secondary: #555;
  --bds-text-muted: #888;
  --bds-text-inverse: #fff;
  --bds-text-disabled: #aaa;
  --bds-surface-muted: #f0f0f0;
  --bds-surface-inverse: #111;
  --bds-background-secondary: #f5f5f5;
  --bds-background-muted: #f0f0f0;
  --bds-background-disabled: #eee;
  --bds-border-secondary: #ccc;
  --bds-border-disabled: #ddd;
  --bds-color-grayscale-200: #eee;
  --bds-color-grayscale-300: #ddd;
  --bds-color-blue-400: #4a75d4;
}
`;

describe('parseAllowlist', () => {
  it('captures every --token-name declaration', () => {
    const allowlist = parseAllowlist(TOKENS_CSS_FIXTURE);
    expect(allowlist.has('--bds-text-primary')).toBe(true);
    expect(allowlist.has('--bds-surface-primary')).toBe(true);
    expect(allowlist.has('--bds-background-brand-primary')).toBe(true);
    expect(allowlist.has('--bds-border-primary')).toBe(true);
    expect(allowlist.has('--bds-color-grayscale-100')).toBe(true);
  });

  it('captures sizing-tier border tokens (separate semantic, still canonical)', () => {
    const allowlist = parseAllowlist(TOKENS_CSS_FIXTURE);
    expect(allowlist.has('--bds-border-radius-100')).toBe(true);
    expect(allowlist.has('--bds-border-width-100')).toBe(true);
  });

  it('captures non-prefix tokens too (the parser is prefix-agnostic; filtering happens in the scanner)', () => {
    const allowlist = parseAllowlist(TOKENS_CSS_FIXTURE);
    expect(allowlist.has('--bds-space-100')).toBe(true);
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
      '--bds-surface-primary: #fff;',
    ].join('\n');
    const out = stripCssComments(input);
    expect(out).not.toContain('--color-grayscale-');
    expect(out).toContain('--bds-surface-primary');
  });

  it('removes leading-line // comments (TS / JS)', () => {
    const out = stripCssComments(['// banned token: --surface-paper', '--bds-surface-primary: #fff;'].join('\n'));
    expect(out).not.toContain('--surface-paper');
    expect(out).toContain('--bds-surface-primary');
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
      .foo { color: var(--bds-text-primary); background: var(--bds-background-primary); }
      .bar { border-color: var(--bds-border-primary); }
    `;
    const refs = extractTokenReferences(css);
    expect(refs).toContain('--bds-text-primary');
    expect(refs).toContain('--bds-background-primary');
    expect(refs).toContain('--bds-border-primary');
  });

  it('skips tokens outside the configured prefixes', () => {
    const css = `.foo { padding: var(--bds-space-100); font-size: var(--font-size-md); }`;
    const refs = extractTokenReferences(css);
    expect(refs.has('--bds-space-100')).toBe(false);
    expect(refs.has('--font-size-md')).toBe(false);
  });

  it('honors a custom prefix list', () => {
    const css = `.foo { color: var(--bds-text-primary); padding: var(--bds-space-100); }`;
    const refs = extractTokenReferences(css, ['space']);
    expect(refs.has('--bds-space-100')).toBe(true);
    expect(refs.has('--bds-text-primary')).toBe(false);
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
    const input = '/* references --color-grayscale-* primitives */\n--bds-surface-primary: #fff;';
    const refs = extractTokenReferences(input);
    expect(refs.has('--color-grayscale')).toBe(false);
    expect(refs.has('--bds-surface-primary')).toBe(true);
  });
});

describe('extractTokenDefinitions', () => {
  it('finds LHS declarations only — not var() references', () => {
    const css = `.foo { --bds-surface-primary: #fff; color: var(--bds-text-primary); }`;
    const defs = extractTokenDefinitions(css);
    expect(defs.has('--bds-surface-primary')).toBe(true);
    expect(defs.has('--bds-text-primary')).toBe(false);
  });

  it('honors prefix filtering', () => {
    const css = `:root { --bds-surface-primary: #fff; --bds-space-100: 4px; }`;
    const defs = extractTokenDefinitions(css, ['surface']);
    expect(defs.has('--bds-surface-primary')).toBe(true);
    expect(defs.has('--bds-space-100')).toBe(false);
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
      writeFileSync(join(dir, 'a.css'), '.foo { color: var(--bds-text-primary); }');
      writeFileSync(join(dir, 'b.tsx'), `const x = 'var(--bds-background-primary)';`);
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
    const allowlist = parseAllowlist('--bds-surface-primary: #fff;');
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
    const allowlist = parseAllowlist('--bds-surface-primary: #fff;');
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
      --bds-text-primary: #111;
      --text-on-brand: #fff;          /* non-canonical */
      --surface-paper: #faf7f2;       /* non-canonical */
      --bds-border-radius-200: 8px;       /* exempt — sizing tier */
    }`;
    const result = runtimeScan({ css, allowlist });
    expect(result.violations).toContain('--text-on-brand');
    expect(result.violations).toContain('--surface-paper');
    expect(result.violations).not.toContain('--bds-text-primary');
    expect(result.violations).not.toContain('--bds-border-radius-200');
  });

  it('omits --color-* from default prefixes (those are primitives, not semantic)', () => {
    const allowlist = parseAllowlist(TOKENS_CSS_FIXTURE);
    const css = `:root { --color-bespoke: #ff0000; }`;
    const result = runtimeScan({ css, allowlist });
    expect(result.violations).toEqual([]);
  });

  it('counts emitted definitions accurately', () => {
    const allowlist = parseAllowlist(TOKENS_CSS_FIXTURE);
    const css = `:root { --bds-text-primary: #111; --bds-surface-primary: #fff; }`;
    const result = runtimeScan({ css, allowlist });
    expect(result.emittedCount).toBe(2);
  });
});

describe('assertCanonicalCss', () => {
  it('returns silently for canonical CSS', () => {
    const allowlist = parseAllowlist(TOKENS_CSS_FIXTURE);
    expect(() =>
      assertCanonicalCss(`:root { --bds-text-primary: #111; }`, { allowlist }),
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
      expect(allowlist.has('--bds-text-primary')).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe('buildSarif', () => {
  function withTempDir(fn) {
    const dir = mkdtempSync(join(tmpdir(), 'canonical-check-sarif-'));
    try {
      return fn(dir);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }

  const allowlist = parseAllowlist(TOKENS_CSS_FIXTURE);

  it('emits a well-formed 2.1.0 log with the canonical-check driver', () => {
    withTempDir((dir) => {
      writeFileSync(join(dir, 'a.css'), '.foo { color: var(--surface-paper); }');
      const result = sourceScan({ paths: [dir], allowlist });
      const sarif = buildSarif({ result, mode: 'source', cwd: dir });

      expect(sarif.version).toBe(SARIF_VERSION);
      expect(sarif.$schema).toMatch(/sarif-schema-2\.1\.0\.json$/);
      const run = sarif.runs[0];
      expect(run.tool.driver.name).toBe('canonical-check');
      expect(run.tool.driver.rules[0].id).toBe(SARIF_RULE_ID);
    });
  });

  it('emits exactly one result per violation, each with a file+startLine location', () => {
    withTempDir((dir) => {
      writeFileSync(
        join(dir, 'drift.css'),
        ['.a {', '  color: var(--surface-paper);', '  background: var(--text-on-brand);', '}'].join('\n'),
      );
      const result = sourceScan({ paths: [dir], allowlist });
      const sarif = buildSarif({ result, mode: 'source', cwd: dir });
      const results = sarif.runs[0].results;

      expect(results.length).toBe(result.violations.length);
      const paper = results.find((r) => r.message.text.includes('--surface-paper'));
      expect(paper.ruleId).toBe(SARIF_RULE_ID);
      expect(paper.level).toBe('error');
      const loc = paper.locations[0].physicalLocation;
      expect(loc.artifactLocation.uri).toBe('drift.css'); // relative to cwd
      expect(loc.region.startLine).toBe(2);
      expect(loc.region.startColumn).toBeGreaterThan(0);
      expect(paper.partialFingerprints.tokenName).toBe('--surface-paper');
    });
  });

  it('records every occurrence of a token as a separate location', () => {
    withTempDir((dir) => {
      writeFileSync(
        join(dir, 'x.css'),
        ['.a { color: var(--surface-paper); }', '.b { background: var(--surface-paper); }'].join('\n'),
      );
      const result = sourceScan({ paths: [dir], allowlist });
      const sarif = buildSarif({ result, mode: 'source', cwd: dir });
      const paper = sarif.runs[0].results.find((r) => r.message.text.includes('--surface-paper'));
      expect(paper.locations.map((l) => l.physicalLocation.region.startLine)).toEqual([1, 2]);
    });
  });

  it('produces an empty results array for a clean scan', () => {
    withTempDir((dir) => {
      writeFileSync(join(dir, 'ok.css'), '.foo { color: var(--bds-text-primary); }');
      const result = sourceScan({ paths: [dir], allowlist });
      const sarif = buildSarif({ result, mode: 'source', cwd: dir });
      expect(sarif.runs[0].results).toEqual([]);
    });
  });

  it('locates violations in runtime (--css) mode against the scanned file', () => {
    withTempDir((dir) => {
      const cssFile = join(dir, 'theme.css');
      writeFileSync(cssFile, [':root {', '  --surface-paper: #faf7f2;', '}'].join('\n'));
      const css = readFileSync(cssFile, 'utf8');
      const result = runtimeScan({ css, allowlist });
      const sarif = buildSarif({ result, mode: 'runtime', cssFile, cwd: dir });

      expect(sarif.runs[0].results.length).toBe(result.violations.length);
      const r = sarif.runs[0].results[0];
      expect(r.locations[0].physicalLocation.artifactLocation.uri).toBe('theme.css');
      expect(r.locations[0].physicalLocation.region.startLine).toBe(2);
    });
  });
});

describe('ADR-043 prefix + compat bridge (brik-bds#2670)', () => {
  const css = [
    ':root { --bds-text-primary: #111; }',
    '/* ===== BEGIN BDS PREFIX BRIDGE (generated) ===== */',
    ':root { --text-primary: var(--bds-text-primary); }',
    '/* ===== END BDS PREFIX BRIDGE ===== */',
  ].join('\n');

  it('reads a bare name as canonical while the bridge is in the allowlist', () => {
    expect(parseAllowlist(css).has('--text-primary')).toBe(true);
  });

  it('drops the bridge with includeBridge:false, so a bare name is a violation', () => {
    const allowlist = parseAllowlist(css, { includeBridge: false });
    expect(allowlist.has('--text-primary')).toBe(false);
    expect(allowlist.has('--bds-text-primary')).toBe(true);
  });

  it('scans the prefixed spelling instead of silently skipping it', () => {
    const refs = extractTokenReferences('.x { color: var(--bds-text-nope); }');
    expect(refs.has('--bds-text-nope')).toBe(true);
  });

  it('lets only bridgePaths files read bridge names, and still flags their phantoms', () => {
    const dir = mkdtempSync(join(tmpdir(), 'cc-bridge-'));
    try {
      mkdirSync(join(dir, 'widgets'));
      writeFileSync(join(dir, 'widgets', 'w.js'), 'a = "var(--text-primary) var(--text-ghost)";');
      writeFileSync(join(dir, 'c.css'), '.x { color: var(--text-primary); }');
      const result = sourceScan({
        paths: [dir],
        allowlist: parseAllowlist(css, { includeBridge: false }),
        bridgePaths: [/widgets\//],
        bridgeAllowlist: parseAllowlist(css),
      });
      const byToken = Object.fromEntries(
        result.violations.map((v) => [v.token, v.files.map((f) => f.slice(dir.length + 1))]),
      );
      expect(byToken).toEqual({
        '--text-primary': ['c.css'],
        '--text-ghost': ['widgets/w.js'],
      });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
