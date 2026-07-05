import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  CANONICAL_CLASS,
  extractBdsClasses,
  classifyClass,
  slotPatternScan,
} from '../slot-pattern-check.mjs';

describe('CANONICAL_CLASS grammar (ADR-008 §4)', () => {
  it.each([
    'bds-card',
    'bds-card--primary',
    'bds-card__title',
    'bds-card__title--error',
    'bds-accordion-item',
    'bds-accordion-item__icon',
    'bds-task-console__item--in-progress',
    'bds-progress-circle__center--md',
  ])('accepts canonical name %s', (cls) => {
    expect(CANONICAL_CLASS.test(cls)).toBe(true);
  });

  it.each([
    'bds-card__myTitle', // camelCase
    'bds-Card__title', // uppercase block
    'bds-card__title_text', // single underscore
    'bds-card__title--Error', // uppercase modifier
    'bds-card__title__extra', // double slot
    'bds-card--a--b', // double modifier
    'bds-card__', // empty slot
    'bds-card--', // empty modifier
  ])('rejects off-pattern name %s', (cls) => {
    expect(CANONICAL_CLASS.test(cls)).toBe(false);
  });
});

describe('classifyClass reasons', () => {
  it('names the single-underscore case', () => {
    expect(classifyClass('bds-card__title_text')).toEqual({
      ok: false,
      reason: 'single underscore (use `__` for slots)',
    });
  });
  it('names the uppercase case', () => {
    expect(classifyClass('bds-card__myTitle').reason).toMatch(/uppercase/);
  });
  it('passes a canonical class', () => {
    expect(classifyClass('bds-card__title--error')).toEqual({ ok: true });
  });
});

describe('extractBdsClasses', () => {
  it('normalizes template interpolation to a valid segment', () => {
    const found = extractBdsClasses('`bds-progress-circle__center--${size}`');
    expect([...found]).toContain('bds-progress-circle__center--x');
  });

  it('skips dynamic prefixes ending in a separator', () => {
    // `'bds-badge--' + tone` — the real modifier is a runtime value.
    const found = extractBdsClasses(`"bds-badge--" + tone`);
    expect([...found]).not.toContain('bds-badge--');
    expect([...found]).not.toContain('bds-badge-');
  });

  it('skips --bds-* CSS custom properties (ADR-014, not BEM slots)', () => {
    // A snake_case *custom property* must not be judged under the BEM grammar.
    const found = extractBdsClasses('background: var(--bds-footer_surface, #fff);');
    expect([...found]).not.toContain('bds-footer_surface');
    // But a real class of the same block is still captured.
    const cls = extractBdsClasses('<div className="bds-footer__surface" />');
    expect(cls).toContain('bds-footer__surface');
  });

  it('honors bds-lint-ignore lines', () => {
    const found = extractBdsClasses('const x = "bds-card__myTitle"; // bds-lint-ignore');
    expect(found.size).toBe(0);
  });

  it('captures classes from className attributes and bdsClass calls', () => {
    const src = `
      <div className="bds-card bds-card__title" />
      bdsClass('bds-badge', 'bds-badge--positive')
    `;
    const found = extractBdsClasses(src);
    expect(found).toContain('bds-card');
    expect(found).toContain('bds-card__title');
    expect(found).toContain('bds-badge--positive');
  });
});

describe('slotPatternScan', () => {
  let dir;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'slot-scan-'));
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it('reports 0 violations on a clean file', () => {
    writeFileSync(join(dir, 'clean.tsx'), `<div className="bds-card__title--error" />`);
    const r = slotPatternScan({ paths: [dir] });
    expect(r.violations).toHaveLength(0);
    expect(r.scannedFiles).toBe(1);
  });

  it('flags an off-pattern class with its file', () => {
    writeFileSync(join(dir, 'bad.tsx'), `<div className="bds-card__myTitle" />`);
    const r = slotPatternScan({ paths: [dir] });
    expect(r.violations).toHaveLength(1);
    expect(r.violations[0].class).toBe('bds-card__myTitle');
    expect(r.violations[0].files[0]).toMatch(/bad\.tsx$/);
  });

  it('does not flag valid + dynamic classes together', () => {
    writeFileSync(
      join(dir, 'mixed.tsx'),
      'const a = "bds-card__body--large"; const b = `bds-badge--${tone}`;',
    );
    const r = slotPatternScan({ paths: [dir] });
    expect(r.violations).toHaveLength(0);
  });
});
