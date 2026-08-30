import { describe, it, expect } from 'vitest';

import { isSemantic, parseDeclarations, findTierViolations } from '../lint-token-tiers.mjs';

describe('isSemantic', () => {
  it('classifies purpose-role names as Semantic', () => {
    expect(isSemantic('--padding-lg')).toBe(true);
    expect(isSemantic('--page-inset')).toBe(true);
    expect(isSemantic('--background-brand-primary')).toBe(true);
    expect(isSemantic('--border-radius-lg')).toBe(true);
  });

  it('classifies numeric scale steps as Primitive, even under a Semantic prefix', () => {
    expect(isSemantic('--space-600')).toBe(false);
    expect(isSemantic('--border-radius-600')).toBe(false);
    expect(isSemantic('--size-400')).toBe(false);
    expect(isSemantic('--color-poppy-500')).toBe(false);
  });

  it('classifies Component (--bds-*) tokens as not Semantic', () => {
    expect(isSemantic('--bds-toast-shadow')).toBe(false);
  });
});

describe('findTierViolations', () => {
  it('flags a Semantic token referencing another Semantic token', () => {
    const line = '--page-inset: var(--padding-lg);';
    const v = findTierViolations(parseDeclarations(line), [line]);
    expect(v).toHaveLength(1);
    expect(v[0].token).toBe('--page-inset');
    expect(v[0].refs).toEqual(['--padding-lg']);
  });

  it('KNOWN LIMITATION (#2187): a Primitive-named token pointing up at a Semantic is NOT flagged', () => {
    // --gutter-page matches no Semantic prefix → classifies Primitive, so the
    // narrow rule skips it. This is exactly the shape the original bug had; the
    // broad "only --bds-* may reference a Semantic" rule is deferred to #2187.
    const line = '--gutter-page: var(--padding-lg);';
    expect(findTierViolations(parseDeclarations(line), [line])).toHaveLength(0);
  });

  it('allows a Semantic token referencing a Primitive', () => {
    const decls = parseDeclarations('--page-inset: var(--space-600);');
    expect(findTierViolations(decls, ['--page-inset: var(--space-600);'])).toHaveLength(0);
  });

  it('allows a Component token referencing a Semantic (the t4 role)', () => {
    const decls = parseDeclarations('--bds-toast-shadow: var(--box-shadow-md);');
    expect(findTierViolations(decls, ['--bds-toast-shadow: var(--box-shadow-md);'])).toHaveLength(0);
  });

  it('honours a reasoned bds-lint-ignore, hard-fails a bare one', () => {
    const line = '--page-inset: var(--padding-lg); /* bds-lint-ignore — deliberate, tracked in #2186 */';
    expect(findTierViolations(parseDeclarations(line), [line])).toHaveLength(0);

    const bare = '--page-inset: var(--padding-lg); /* bds-lint-ignore */';
    const v = findTierViolations(parseDeclarations(bare), [bare]);
    expect(v).toHaveLength(1);
    expect(v[0].bare).toBe(true);
  });

  it('ignores a Primitive referencing anything (out of this gate scope)', () => {
    const decls = parseDeclarations('--space-600: var(--space-500);');
    expect(findTierViolations(decls, ['--space-600: var(--space-500);'])).toHaveLength(0);
  });
});
