import { describe, it, expect } from 'vitest';

import { isSemantic, parseDeclarations, findTierViolations, resolvesToColor } from '../lint-token-tiers.mjs';

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

  it('flags a Primitive-named token pointing up at a non-color Semantic (t2→t3, ADR-035)', () => {
    // --gutter-page matches no Semantic prefix → classifies Primitive. The broad
    // rule (ADR-035, #2187) now catches it: --padding-lg is not a color, so the
    // alias is off-model. This is exactly the shape the original --gutter-page
    // bug had (ADR-025), previously a KNOWN LIMITATION.
    const line = '--gutter-page: var(--padding-lg);';
    const v = findTierViolations(parseDeclarations(line), [line]);
    expect(v).toHaveLength(1);
    expect(v[0].token).toBe('--gutter-page');
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

  it('ignores a Primitive referencing a Primitive (no Semantic in the reference)', () => {
    const decls = parseDeclarations('--space-600: var(--space-500);');
    expect(findTierViolations(decls, ['--space-600: var(--space-500);'])).toHaveLength(0);
  });

  it('ALLOWS a color role-alias — Semantic → Semantic that resolves to --color-* (ADR-035)', () => {
    // --border-focus (a color role) aliases --border-brand-primary, which
    // resolves to a --color-* Primitive → theme-tracks → sanctioned.
    const defs = {
      '--border-focus': ['--border-brand-primary'],
      '--border-brand-primary': ['--color-poppy-500'],
    };
    const line = '--border-focus: var(--border-brand-primary);';
    expect(findTierViolations(parseDeclarations(line), [line], defs)).toHaveLength(0);
  });

  it('ALLOWS a color role-alias through a multi-hop chain to --color-*', () => {
    const defs = {
      '--text-link': ['--text-text-link'],
      '--text-text-link': ['--color-poppy-light'],
    };
    const line = '--text-link: var(--text-text-link);';
    expect(findTierViolations(parseDeclarations(line), [line], defs)).toHaveLength(0);
  });

  it('FLAGS a non-color same-category alias — --display-fluid → --display (type scale)', () => {
    // Same category (type), but the target resolves to a --font-size-* Primitive,
    // not a color → off-model (the alias parasitizes the type scale, #2186).
    const defs = { '--display-lg': ['--font-size-1600'] };
    const line = '--display-fluid-lg: clamp(var(--font-size-1100), 7vw, var(--display-lg));';
    const v = findTierViolations(parseDeclarations(line), [line], defs);
    expect(v).toHaveLength(1);
    expect(v[0].refs).toEqual(['--display-lg']);
  });
});

describe('resolvesToColor', () => {
  it('is true for a --color-* Primitive and for anything resolving to one', () => {
    expect(resolvesToColor('--color-poppy-500', {})).toBe(true);
    expect(resolvesToColor('--border-brand-primary', { '--border-brand-primary': ['--color-poppy-500'] })).toBe(true);
  });

  it('is false for a non-color scale and for an unknown/raw-valued token', () => {
    expect(resolvesToColor('--display-lg', { '--display-lg': ['--font-size-1600'] })).toBe(false);
    expect(resolvesToColor('--space-600', {})).toBe(false);
  });

  it('does not loop on a reference cycle', () => {
    expect(resolvesToColor('--a', { '--a': ['--b'], '--b': ['--a'] })).toBe(false);
  });
});
