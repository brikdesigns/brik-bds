import { describe, it, expect } from 'vitest';

import {
  stripVarExpressions,
  hasHardcodedLiteral,
  scanCssText,
} from '../lint-content-rhythm.mjs';

describe('stripVarExpressions', () => {
  it('removes a var() with a px fallback', () => {
    expect(stripVarExpressions('var(--gap-md, 8px)').trim()).toBe('');
  });

  it('removes nested var() fallbacks', () => {
    expect(stripVarExpressions('var(--a, var(--b, 6px))').trim()).toBe('');
  });

  it('keeps a literal that lives outside the var()', () => {
    // calc(var(--x) + 8px) — the 8px is a hardcoded addend, not a token fallback
    expect(stripVarExpressions('calc(var(--x) + 8px)')).toContain('8px');
  });
});

describe('hasHardcodedLiteral', () => {
  it.each([
    ['12px', true],
    ['0 0 1rem', true],
    ['-4px', true],
    ['1.5em', true],
  ])('flags a raw literal %s', (value, expected) => {
    expect(hasHardcodedLiteral(value)).toBe(expected);
  });

  it.each([
    ['var(--gap-md)', false],
    ['var(--gap-md, 8px)', false], // literal only inside the token fallback
    ['0', false],
    ['0px', false],
    ['auto', false],
    ['50%', false],
  ])('allows %s', (value, expected) => {
    expect(hasHardcodedLiteral(value)).toBe(expected);
  });
});

describe('scanCssText — rhythm-bearing properties', () => {
  it('flags hardcoded margin-top', () => {
    const v = scanCssText('.x { margin-top: 12px; }');
    expect(v).toHaveLength(1);
    expect(v[0].prop).toBe('margin-top');
    expect(v[0].bare).toBe(false);
  });

  it('flags hardcoded gap', () => {
    expect(scanCssText('.x { gap: 8px; }')).toHaveLength(1);
  });

  it('does NOT flag horizontal-only spacing (margin-left, column-gap)', () => {
    expect(scanCssText('.x { margin-left: 11px; column-gap: 4px; }')).toHaveLength(0);
  });

  it('does NOT flag token-driven spacing', () => {
    expect(scanCssText('.x { gap: var(--gap-md); margin-top: var(--gap-sm); }')).toHaveLength(0);
  });

  it('does NOT flag a var() fallback literal', () => {
    expect(scanCssText('.x { margin-top: calc(var(--t, 6px) / 2); }')).toHaveLength(0);
  });

  it('does NOT flag padding (container edge, not rhythm)', () => {
    expect(scanCssText('.x { padding: 16px; }')).toHaveLength(0);
  });
});

describe('scanCssText — bds-lint-ignore semantics (#1469)', () => {
  it('allows a reasoned ignore', () => {
    const css = '.x { margin: -1px; /* bds-lint-ignore — visually-hidden clip, not rhythm */ }';
    expect(scanCssText(css)).toHaveLength(0);
  });

  it('hard-fails a bare ignore', () => {
    const v = scanCssText('.x { gap: 9px; /* bds-lint-ignore */ }');
    expect(v).toHaveLength(1);
    expect(v[0].bare).toBe(true);
  });
});
