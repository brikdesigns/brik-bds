import { describe, it, expect } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  parseClassAllowlist,
  canonicalRoots,
  classRoot,
  extractClassReferences,
  extractClassDefinitions,
  classifyClass,
  classSourceScan,
  classRuntimeScan,
  assertCanonicalClasses,
  DEFAULT_CLASS_ALIASES,
  DEFAULT_CLASS_EXEMPT_PATTERNS,
} from '../canonical-class-check.mjs';

// Miniature canonical class fixture — distilled from dist/styles.css.
// Stays deterministic across BDS releases. Includes the canonical roots
// the violation classifier needs to check against (`bds-button`,
// `bds-avatar`, `bds-badge`, `bds-card`, `bds-accordion-item`).
const STYLES_CSS_FIXTURE = `
/**
 * Canonical fixture — distilled from dist/styles.css.
 */
.bds-button { padding: 0; }
.bds-button--primary { background: var(--background-brand-primary); }
.bds-button--secondary { background: transparent; }
.bds-button--ghost { padding-left: 0; }
.bds-button--md { font-size: 14px; }
.bds-button__content { display: inline-flex; }
.bds-button-group { display: flex; gap: 8px; }

.bds-avatar { width: 40px; }
.bds-avatar--sm { width: 24px; }
.bds-avatar--lg { width: 64px; }
.bds-avatar__image { object-fit: cover; }
.bds-avatar__status--online { background: var(--background-positive); }

.bds-badge { display: inline-flex; }
.bds-badge--brand { color: var(--text-brand); }

.bds-card { padding: 16px; }
.bds-card__header { padding-bottom: 8px; }

.bds-accordion-item { border-top: 1px solid var(--border-primary); }
.bds-accordion-item__icon { transition: transform 0.2s; }

/* enough roots to clear the 20-token sanity floor in the CLI */
.bds-tag { padding: 2px 6px; }
.bds-tag--info { background: var(--background-info); }
.bds-chip { display: inline-flex; }
.bds-divider { height: 1px; }
.bds-dialog { position: fixed; }
.bds-tabs { display: flex; }
.bds-tabs__tab { padding: 8px; }
.bds-field { display: flex; flex-direction: column; }
.bds-field__label { font-size: 14px; }
.bds-checkbox { width: 16px; }
.bds-radio { width: 16px; }
.bds-switch { width: 32px; }
.bds-tooltip { position: absolute; }
`;

describe('parseClassAllowlist', () => {
  it('captures every .bds-* class declaration', () => {
    const allowlist = parseClassAllowlist(STYLES_CSS_FIXTURE);
    expect(allowlist.has('bds-button')).toBe(true);
    expect(allowlist.has('bds-button--primary')).toBe(true);
    expect(allowlist.has('bds-button__content')).toBe(true);
    expect(allowlist.has('bds-avatar__status--online')).toBe(true);
    expect(allowlist.has('bds-accordion-item')).toBe(true);
  });

  it('ignores classes not prefixed with bds-', () => {
    const allowlist = parseClassAllowlist(`.foo { color: red; } .btn { padding: 0; }`);
    expect(allowlist.size).toBe(0);
  });

  it('skips bds- classes inside block comments', () => {
    const allowlist = parseClassAllowlist('/* example: .bds-fake-button */');
    expect(allowlist.has('bds-fake-button')).toBe(false);
  });

  it('returns an empty Set for empty input', () => {
    expect(parseClassAllowlist('').size).toBe(0);
  });
});

describe('classRoot', () => {
  it('returns the bare block for plain classes', () => {
    expect(classRoot('bds-button')).toBe('bds-button');
    expect(classRoot('btn')).toBe('btn');
  });

  it('strips BEM modifiers (--)', () => {
    expect(classRoot('bds-button--primary')).toBe('bds-button');
    expect(classRoot('btn--primary')).toBe('btn');
  });

  it('strips BEM elements (__)', () => {
    expect(classRoot('bds-button__content')).toBe('bds-button');
    expect(classRoot('tp-card__bio-btn')).toBe('tp-card');
  });

  it('uses the FIRST separator when both __ and -- appear', () => {
    expect(classRoot('bds-avatar__status--online')).toBe('bds-avatar');
    expect(classRoot('bds-button--primary__inner')).toBe('bds-button');
  });

  it('preserves hyphens INSIDE the root (no separator)', () => {
    expect(classRoot('bds-accordion-item')).toBe('bds-accordion-item');
    expect(classRoot('bds-accordion-item__icon')).toBe('bds-accordion-item');
  });
});

describe('canonicalRoots', () => {
  it('reduces an allowlist to distinct bds-* block roots', () => {
    const allowlist = parseClassAllowlist(STYLES_CSS_FIXTURE);
    const roots = canonicalRoots(allowlist);
    expect(roots.has('bds-button')).toBe(true);
    expect(roots.has('bds-avatar')).toBe(true);
    expect(roots.has('bds-accordion-item')).toBe(true);
    // Modifier/element entries do NOT become separate roots
    expect(roots.has('bds-button--primary')).toBe(false);
    expect(roots.has('bds-button__content')).toBe(false);
  });

  it('ignores entries that lack the bds- prefix', () => {
    const roots = canonicalRoots(new Set(['bds-button', 'foo', 'btn']));
    expect(roots).toEqual(new Set(['bds-button']));
  });
});

describe('extractClassReferences', () => {
  it('finds CSS class selectors', () => {
    const refs = extractClassReferences(`.btn--primary { color: red; } .tp-card__name { font-weight: 700; }`);
    expect(refs.has('btn--primary')).toBe(true);
    expect(refs.has('tp-card__name')).toBe(true);
  });

  it('finds class= and className= attributes', () => {
    const refs = extractClassReferences(`<a class="btn btn--primary nav-cta">x</a> <Foo className="card card--lg" />`);
    expect(refs.has('btn')).toBe(true);
    expect(refs.has('btn--primary')).toBe(true);
    expect(refs.has('nav-cta')).toBe(true);
    expect(refs.has('card')).toBe(true);
    expect(refs.has('card--lg')).toBe(true);
  });

  it('honors bds-lint-ignore line comments', () => {
    const refs = extractClassReferences([
      '.btn { padding: 0; } /* bds-lint-ignore — legacy primitive */',
      '.card { padding: 0; }',
    ].join('\n'));
    expect(refs.has('btn')).toBe(false);
    expect(refs.has('card')).toBe(true);
  });

  it('skips classes inside block comments', () => {
    const refs = extractClassReferences('/* example: .btn--primary */ .real-class { color: red; }');
    expect(refs.has('btn--primary')).toBe(false);
    expect(refs.has('real-class')).toBe(true);
  });

  it('captures classes adjacent to selector combinators', () => {
    const refs = extractClassReferences('.parent > .child:hover { color: red; }');
    expect(refs.has('parent')).toBe(true);
    expect(refs.has('child')).toBe(true);
  });
});

describe('extractClassDefinitions', () => {
  it('captures rule-head class selectors', () => {
    const css = `.btn { padding: 0; } .btn--primary { color: red; } .btn:hover { color: blue; }`;
    const defs = extractClassDefinitions(css);
    expect(defs.has('btn')).toBe(true);
    expect(defs.has('btn--primary')).toBe(true);
  });
});

describe('classifyClass', () => {
  function setup() {
    const allowlist = parseClassAllowlist(STYLES_CSS_FIXTURE);
    const roots = canonicalRoots(allowlist);
    return {
      allowlist,
      roots,
      aliases: DEFAULT_CLASS_ALIASES,
      exemptPatterns: DEFAULT_CLASS_EXEMPT_PATTERNS,
    };
  }

  it('passes canonical bds-* classes that exist in the allowlist', () => {
    const opts = setup();
    expect(classifyClass('bds-button', opts).kind).toBe('ok');
    expect(classifyClass('bds-button--primary', opts).kind).toBe('ok');
    expect(classifyClass('bds-button__content', opts).kind).toBe('ok');
    expect(classifyClass('bds-accordion-item__icon', opts).kind).toBe('ok');
  });

  it('flags invented bds-* names not in the allowlist', () => {
    const opts = setup();
    const v = classifyClass('bds-button--cta', opts);
    expect(v.kind).toBe('invented-bds');
    expect(v.class).toBe('bds-button--cta');
  });

  it('flags invented bds-* roots that do not exist in canon', () => {
    const opts = setup();
    expect(classifyClass('bds-fake-thing', opts).kind).toBe('invented-bds');
  });

  it('flags non-prefixed class roots that shadow a canonical root', () => {
    const opts = setup();
    const v = classifyClass('button', opts);
    expect(v.kind).toBe('shadow-root');
    expect(v.canonical).toBe('bds-button');
  });

  it('flags BEM modifiers on shadowing roots', () => {
    const opts = setup();
    const v = classifyClass('button--primary', opts);
    expect(v.kind).toBe('shadow-root');
    expect(v.canonical).toBe('bds-button');
  });

  it('flags shorthand aliases (btn → bds-button)', () => {
    const opts = setup();
    const v = classifyClass('btn', opts);
    expect(v.kind).toBe('shadow-alias');
    expect(v.alias).toBe('btn');
    expect(v.canonical).toBe('bds-button');
  });

  it('flags BEM modifiers on alias shorthand', () => {
    const opts = setup();
    const v = classifyClass('btn--primary', opts);
    expect(v.kind).toBe('shadow-alias');
    expect(v.canonical).toBe('bds-button');
  });

  it('passes project-namespaced BEM blocks (the layout escape hatch)', () => {
    const opts = setup();
    expect(classifyClass('tp-card', opts).kind).toBe('ok');
    expect(classifyClass('tp-card__portrait', opts).kind).toBe('ok');
    expect(classifyClass('team-card__name', opts).kind).toBe('ok');
    expect(classifyClass('hero-section__inner', opts).kind).toBe('ok');
  });

  it('passes utility-style classes that do not collide', () => {
    const opts = setup();
    expect(classifyClass('flex', opts).kind).toBe('ok');
    expect(classifyClass('container', opts).kind).toBe('ok');
    expect(classifyClass('sr-only', opts).kind).toBe('ok');
  });

  it('respects exempt-pattern overrides (default exempts `card`)', () => {
    const opts = setup();
    // `card` shadows `bds-card` in raw allowlist terms, but the default
    // exempts the bare `card` root because of legitimate project-local
    // collisions (e.g. `.team-card`, `.feature-card` are too common to
    // ban via this rule).
    expect(classifyClass('card', opts).kind).toBe('ok');
    expect(classifyClass('card--lg', opts).kind).toBe('ok');
  });

  it('still flags `card` when exemptPatterns is overridden to empty', () => {
    const opts = { ...setup(), exemptPatterns: [] };
    expect(classifyClass('card', opts).kind).toBe('shadow-root');
  });
});

describe('classSourceScan', () => {
  function withTempDir(fn) {
    const dir = mkdtempSync(join(tmpdir(), 'canonical-class-check-'));
    try {
      return fn(dir);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }

  it('reports zero violations for a canonical fixture', () => {
    const allowlist = parseClassAllowlist(STYLES_CSS_FIXTURE);
    withTempDir((dir) => {
      writeFileSync(join(dir, 'a.astro'), `<a class="bds-button bds-button--primary">x</a>`);
      writeFileSync(join(dir, 'b.tsx'), `<Foo className="bds-avatar bds-avatar--lg" />`);
      const result = classSourceScan({ paths: [dir], allowlist });
      expect(result.violations).toEqual([]);
      expect(result.scannedFiles).toBe(2);
    });
  });

  it('flags shadow-root violations with file paths', () => {
    const allowlist = parseClassAllowlist(STYLES_CSS_FIXTURE);
    withTempDir((dir) => {
      writeFileSync(join(dir, 'drift.astro'), `<a class="button button--primary">x</a>`);
      const result = classSourceScan({ paths: [dir], allowlist });
      const buttonViolation = result.violations.find((v) => v.class === 'button');
      expect(buttonViolation).toBeDefined();
      expect(buttonViolation.kind).toBe('shadow-root');
      expect(buttonViolation.canonical).toBe('bds-button');
      expect(buttonViolation.files[0]).toContain('drift.astro');
    });
  });

  it('flags shadow-alias violations (the Vale `btn--primary` case)', () => {
    const allowlist = parseClassAllowlist(STYLES_CSS_FIXTURE);
    withTempDir((dir) => {
      writeFileSync(
        join(dir, 'global.css'),
        `.btn { padding: 0; } .btn--primary { color: red; } .btn--secondary { color: blue; }`,
      );
      const result = classSourceScan({ paths: [dir], allowlist });
      const btn = result.violations.find((v) => v.class === 'btn');
      expect(btn?.kind).toBe('shadow-alias');
      expect(btn?.alias).toBe('btn');
      expect(btn?.canonical).toBe('bds-button');
    });
  });

  it('flags invented bds-* names', () => {
    const allowlist = parseClassAllowlist(STYLES_CSS_FIXTURE);
    withTempDir((dir) => {
      writeFileSync(join(dir, 'a.astro'), `<a class="bds-button bds-button--cta">x</a>`);
      const result = classSourceScan({ paths: [dir], allowlist });
      const v = result.violations.find((x) => x.class === 'bds-button--cta');
      expect(v?.kind).toBe('invented-bds');
    });
  });

  it('passes project-namespaced BEM blocks (layout CSS stays project-local)', () => {
    const allowlist = parseClassAllowlist(STYLES_CSS_FIXTURE);
    withTempDir((dir) => {
      writeFileSync(
        join(dir, 'TeamPreview.astro'),
        `<li class="tp-card"><div class="tp-card__portrait" /><h3 class="tp-card__name">x</h3></li>`,
      );
      const result = classSourceScan({ paths: [dir], allowlist });
      expect(result.violations).toEqual([]);
    });
  });

  it('skips test files and __tests__ dirs by default', () => {
    const allowlist = parseClassAllowlist(STYLES_CSS_FIXTURE);
    withTempDir((dir) => {
      mkdirSync(join(dir, '__tests__'));
      writeFileSync(join(dir, '__tests__', 'fixture.astro'), `<a class="btn btn--primary" />`);
      const result = classSourceScan({ paths: [dir], allowlist });
      expect(result.violations).toEqual([]);
      expect(result.scannedFiles).toBe(0);
    });
  });

  it('aggregates the same violation across multiple files', () => {
    const allowlist = parseClassAllowlist(STYLES_CSS_FIXTURE);
    withTempDir((dir) => {
      writeFileSync(join(dir, 'a.astro'), `<a class="btn btn--primary" />`);
      writeFileSync(join(dir, 'b.astro'), `<a class="btn" />`);
      const result = classSourceScan({ paths: [dir], allowlist });
      const btn = result.violations.find((v) => v.class === 'btn');
      expect(btn?.files.length).toBe(2);
    });
  });

  it('throws on empty allowlist (caller error, not silent pass)', () => {
    expect(() =>
      classSourceScan({ paths: ['nonexistent'], allowlist: new Set() }),
    ).toThrowError(/allowlist is empty/);
  });
});

describe('classRuntimeScan', () => {
  it('flags definitions that shadow canonical roots', () => {
    const allowlist = parseClassAllowlist(STYLES_CSS_FIXTURE);
    const css = `.btn { padding: 0; } .btn--primary { color: red; } .tp-card { display: grid; }`;
    const result = classRuntimeScan({ css, allowlist });
    const classes = result.violations.map((v) => v.class).sort();
    expect(classes).toEqual(['btn', 'btn--primary']);
  });

  it('does not flag canonical bds-* definitions', () => {
    const allowlist = parseClassAllowlist(STYLES_CSS_FIXTURE);
    const css = `.bds-button { padding: 0; } .bds-button--primary { color: red; }`;
    const result = classRuntimeScan({ css, allowlist });
    expect(result.violations).toEqual([]);
  });

  it('throws on empty allowlist', () => {
    expect(() =>
      classRuntimeScan({ css: '.foo {}', allowlist: new Set() }),
    ).toThrowError(/allowlist is empty/);
  });
});

describe('assertCanonicalClasses', () => {
  it('does not throw on canonical CSS', () => {
    const allowlist = parseClassAllowlist(STYLES_CSS_FIXTURE);
    expect(() =>
      assertCanonicalClasses(`.bds-button { padding: 0; }`, { allowlist }),
    ).not.toThrow();
  });

  it('throws with a descriptive message on violations', () => {
    const allowlist = parseClassAllowlist(STYLES_CSS_FIXTURE);
    expect(() =>
      assertCanonicalClasses(`.btn--primary { padding: 0; }`, { allowlist }),
    ).toThrowError(/canonical-class-check.*btn--primary/s);
  });
});
