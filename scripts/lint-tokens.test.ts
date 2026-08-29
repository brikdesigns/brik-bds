/**
 * Regression for the CSS raw-value gate (css-raw-value / css-raw-value-offscale).
 *
 * The pre-existing Rule 2 only ran on .tsx style objects, so a raw `height: 24px`
 * or `border-bottom: 2px` written directly in a component .css passed CI clean —
 * the drift this audit surfaced. checkCssRawValues closes that: it errors when a
 * raw px maps onto a scale token (value-preserving swap) and warns when it lands
 * off every scale (a genuine gap — container widths, off-scale type).
 */
import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { buildValueMaps, checkCssRawValues } = require('./lint-tokens.js');

const maps = buildValueMaps();
const run = (line: string) => checkCssRawValues(line, 1, 'X.css', maps);

describe('checkCssRawValues', () => {
  it('errors on a raw px that maps exactly to a --size-* token', () => {
    const v = run('  height: 24px;');
    expect(v).toHaveLength(1);
    expect(v[0].rule).toBe('css-raw-value');
    expect(v[0].severity).toBe('error');
    expect(v[0].message).toContain('var(--size-600)');
  });

  it('errors on a raw border-width px in a border shorthand', () => {
    const v = run('  border-bottom: 2px solid transparent;');
    expect(v).toHaveLength(1);
    expect(v[0].message).toContain('var(--border-width-md)');
  });

  it('errors on a raw font-size px that has an exact typography rung', () => {
    const v = run('  font-size: 14px;');
    expect(v[0].message).toContain('var(--body-sm)');
  });

  it('warns (never errors) on an off-scale container width', () => {
    const v = run('  min-width: 200px;');
    expect(v).toHaveLength(1);
    expect(v[0].rule).toBe('css-raw-value-offscale');
    expect(v[0].severity).toBe('warning');
  });

  it('passes a value already using a token', () => {
    expect(run('  height: var(--size-600);')).toHaveLength(0);
  });

  it('ignores a px inside a var() fallback (checkFallbackLiterals owns that)', () => {
    expect(run('  height: var(--bds-x, var(--size-600));')).toHaveLength(0);
  });

  it('skips responsive math anchors', () => {
    expect(run('  width: clamp(200px, 50vw, 400px);')).toHaveLength(0);
  });

  it('exempts micro nudges (≤2px) on dimensional props but not border-width', () => {
    expect(run('  height: 1px;')).toHaveLength(0);
    expect(run('  border-width: 1px;')[0].message).toContain('var(--border-width-sm)');
  });

  it('respects bds-lint-ignore', () => {
    expect(run('  height: 24px; /* bds-lint-ignore — runtime */')).toHaveLength(0);
  });

  it('does not fire on non-tokenizable props (box-shadow, transform, positioning)', () => {
    expect(run('  box-shadow: 0 4px 12px rgba(0,0,0,0.1);')).toHaveLength(0);
    expect(run('  transform: translate(1px, -1px);')).toHaveLength(0);
    expect(run('  top: 8px;')).toHaveLength(0);
  });
});
