/**
 * Unit tests for extractLintIgnores — the build-time half of the inspector↔lint
 * violation-set baseline (brik-bds#2170).
 *
 * The token linter suppresses any source line carrying a `bds-lint-ignore`
 * marker, but that marker is a CSS comment stripped from the runtime CSSOM the
 * inspector reads. This extractor recovers the { selector, property } exception
 * set from source so the inspector can honor the same baseline. These tests pin
 * the selector-attribution and property-parsing that make the two agree.
 */
import { describe, it, expect } from 'vitest';
import { extractLintIgnores } from '../build-inspector-manifest.mjs';

describe('extractLintIgnores (#2170)', () => {
  it('extracts a trailing-comment ignore with its enclosing selector', () => {
    const css = `
.bds-address-input__dropdown {
  padding: var(--padding-sm);
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.12); /* bds-lint-ignore — shadow tokens resolve to zero */
}`;
    expect(extractLintIgnores(css)).toEqual([
      { selector: '.bds-address-input__dropdown', property: 'box-shadow' },
    ]);
  });

  it('emits one entry per selector in a comma group', () => {
    const css = `
.bds-a, .bds-b > .c {
  height: 15px; /* bds-lint-ignore off-scale nudge */
}`;
    expect(extractLintIgnores(css)).toEqual([
      { selector: '.bds-a', property: 'height' },
      { selector: '.bds-b>.c', property: 'height' },
    ]);
  });

  it('attributes to the innermost selector inside an at-rule', () => {
    const css = `
@media (min-width: 600px) {
  .bds-thing__row {
    margin-top: 6px; /* bds-lint-ignore micro nudge */
  }
}`;
    expect(extractLintIgnores(css)).toEqual([
      { selector: '.bds-thing__row', property: 'margin-top' },
    ]);
  });

  it('ignores a declaration with no marker', () => {
    const css = `.bds-x { box-shadow: 0px 1px 2px rgba(0,0,0,0.1); }`;
    expect(extractLintIgnores(css)).toEqual([]);
  });

  it('skips a standalone comment marker that is not a declaration', () => {
    const css = `
.bds-x {
  /* bds-lint-ignore — a note, not a declaration */
  color: var(--text-primary);
}`;
    expect(extractLintIgnores(css)).toEqual([]);
  });

  it('never emits an at-rule prelude or an empty selector', () => {
    // House style is one declaration per line; the property is read off the
    // marker's own line. An @font-face declaration has no BDS selector, so its
    // marker (top-of-stack is the @-prelude) is dropped, not mis-attributed.
    const css = `
@font-face {
  src: url(x.woff2); /* bds-lint-ignore vendored */
}
.bds-real {
  width: 24px; /* bds-lint-ignore keep */
}`;
    const out = extractLintIgnores(css);
    expect(out.every((e) => e.selector && !e.selector.startsWith('@'))).toBe(true);
    expect(out).toContainEqual({ selector: '.bds-real', property: 'width' });
  });
});
