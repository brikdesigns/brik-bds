import { describe, it, expect } from 'vitest';

import { isSemantic, parseDeclarations, findTierViolations, resolvesToColor } from '../lint-token-tiers.mjs';

describe('isSemantic', () => {
  it('classifies purpose-role names as Semantic', () => {
    expect(isSemantic('--bds-padding-lg')).toBe(true);
    expect(isSemantic('--bds-page-inset')).toBe(true);
    expect(isSemantic('--bds-background-brand-primary')).toBe(true);
    expect(isSemantic('--bds-border-radius-lg')).toBe(true);
  });

  it('classifies numeric scale steps as Primitive, even under a Semantic prefix', () => {
    expect(isSemantic('--bds-space-600')).toBe(false);
    expect(isSemantic('--bds-border-radius-600')).toBe(false);
    expect(isSemantic('--bds-size-400')).toBe(false);
    expect(isSemantic('--bds-color-poppy-500')).toBe(false);
  });

  it('classifies Component (--bds-*) tokens as not Semantic', () => {
    expect(isSemantic('--bds-toast-shadow')).toBe(false);
  });
});

describe('findTierViolations', () => {
  it('flags a Semantic token referencing another Semantic token', () => {
    const line = '--bds-page-inset: var(--bds-padding-lg);';
    const v = findTierViolations(parseDeclarations(line), [line]);
    expect(v).toHaveLength(1);
    expect(v[0].token).toBe('--bds-page-inset');
    expect(v[0].refs).toEqual(['--bds-padding-lg']);
  });

  it('flags a Primitive-named token pointing up at a non-color Semantic (t2→t3, ADR-035)', () => {
    // --gutter-page matches no Semantic prefix → classifies Primitive. The broad
    // rule (ADR-035, #2187) now catches it: --padding-lg is not a color, so the
    // alias is off-model. This is exactly the shape the original --gutter-page
    // bug had (ADR-025), previously a KNOWN LIMITATION.
    const line = '--gutter-page: var(--bds-padding-lg);';
    const v = findTierViolations(parseDeclarations(line), [line]);
    expect(v).toHaveLength(1);
    expect(v[0].token).toBe('--gutter-page');
  });

  it('allows a Semantic token referencing a Primitive', () => {
    const decls = parseDeclarations('--bds-page-inset: var(--bds-space-600);');
    expect(findTierViolations(decls, ['--bds-page-inset: var(--bds-space-600);'])).toHaveLength(0);
  });

  it('allows a Component token referencing a Semantic (the t4 role)', () => {
    const decls = parseDeclarations('--bds-toast-shadow: var(--bds-box-shadow-md);');
    expect(findTierViolations(decls, ['--bds-toast-shadow: var(--bds-box-shadow-md);'])).toHaveLength(0);
  });

  it('honours a reasoned bds-lint-ignore, hard-fails a bare one', () => {
    const line = '--bds-page-inset: var(--bds-padding-lg); /* bds-lint-ignore — deliberate, tracked in #2186 */';
    expect(findTierViolations(parseDeclarations(line), [line])).toHaveLength(0);

    const bare = '--bds-page-inset: var(--bds-padding-lg); /* bds-lint-ignore */';
    const v = findTierViolations(parseDeclarations(bare), [bare]);
    expect(v).toHaveLength(1);
    expect(v[0].bare).toBe(true);
  });

  it('ignores a Primitive referencing a Primitive (no Semantic in the reference)', () => {
    const decls = parseDeclarations('--bds-space-600: var(--bds-space-500);');
    expect(findTierViolations(decls, ['--bds-space-600: var(--bds-space-500);'])).toHaveLength(0);
  });

  it('ALLOWS a color role-alias — Semantic → Semantic that resolves to --color-* (ADR-035)', () => {
    // --border-focus (a color role) aliases --border-brand-primary, which
    // resolves to a --color-* Primitive → theme-tracks → sanctioned.
    const defs = {
      '--bds-border-focus': ['--bds-border-brand-primary'],
      '--bds-border-brand-primary': ['--bds-color-poppy-500'],
    };
    const line = '--bds-border-focus: var(--bds-border-brand-primary);';
    expect(findTierViolations(parseDeclarations(line), [line], defs)).toHaveLength(0);
  });

  it('ALLOWS a color role-alias through a multi-hop chain to --color-*', () => {
    const defs = {
      '--bds-text-link': ['--bds-text-text-link'],
      '--bds-text-text-link': ['--bds-color-poppy-500'],
    };
    const line = '--bds-text-link: var(--bds-text-text-link);';
    expect(findTierViolations(parseDeclarations(line), [line], defs)).toHaveLength(0);
  });

  it('FLAGS a non-color same-category alias — --display-fluid → --display (type scale)', () => {
    // Same category (type), but the target resolves to a --font-size-* Primitive,
    // not a color → off-model (the alias parasitizes the type scale, #2186).
    const defs = { '--bds-display-lg': ['--bds-font-size-1600'] };
    const line = '--bds-display-fluid-lg: clamp(var(--bds-font-size-1100), 7vw, var(--bds-display-lg));';
    const v = findTierViolations(parseDeclarations(line), [line], defs);
    expect(v).toHaveLength(1);
    expect(v[0].refs).toEqual(['--bds-display-lg']);
  });
});

describe('resolvesToColor', () => {
  it('is true for a --color-* Primitive and for anything resolving to one', () => {
    expect(resolvesToColor('--bds-color-poppy-500', {})).toBe(true);
    expect(resolvesToColor('--bds-border-brand-primary', { '--bds-border-brand-primary': ['--bds-color-poppy-500'] })).toBe(true);
  });

  it('is false for a non-color scale and for an unknown/raw-valued token', () => {
    expect(resolvesToColor('--bds-display-lg', { '--bds-display-lg': ['--bds-font-size-1600'] })).toBe(false);
    expect(resolvesToColor('--bds-space-600', {})).toBe(false);
  });

  it('does not loop on a reference cycle', () => {
    expect(resolvesToColor('--a', { '--a': ['--b'], '--b': ['--a'] })).toBe(false);
  });
});
