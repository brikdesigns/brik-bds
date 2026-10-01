import { describe, it, expect } from 'vitest';
import {
  scanCascadeContract,
  familyOfSizeToken,
  familyOfFontFamilyToken,
} from '../cascade-contract-check.mjs';

const scan = (css, opts = {}) => scanCascadeContract({ css, ...opts }).violations;
const rules = (css, opts) => scan(css, opts).map((v) => v.rule);

describe('cascade-contract-check — family helpers', () => {
  it('maps size tokens to families', () => {
    expect(familyOfSizeToken('--bds-heading-lg')).toBe('heading');
    expect(familyOfSizeToken('--bds-display-sm')).toBe('display');
    expect(familyOfSizeToken('--bds-label-md')).toBe('label');
    expect(familyOfSizeToken('--bds-surface-primary')).toBeNull();
  });
  it('maps font-family tokens to families', () => {
    expect(familyOfFontFamilyToken('--bds-font-family-display')).toBe('display');
    expect(familyOfFontFamilyToken('--bds-font-family-heading')).toBe('heading');
    expect(familyOfFontFamilyToken('--font-family-nope')).toBeNull();
  });
});

describe('Rule 1 — no-redefinition: scale families', () => {
  it('flags a :root heading remap (the brikdesigns scaffold offender)', () => {
    const css = `:root {\n  --bds-heading-lg: var(--bds-font-size-700);\n  --bds-heading-huge: var(--bds-font-size-1200);\n}`;
    const v = scan(css);
    expect(v).toHaveLength(2);
    expect(v.every((x) => x.rule === 'no-redefinition')).toBe(true);
    expect(v[0].token).toBe('--bds-heading-lg');
    expect(v[0].line).toBe(2);
  });

  it('flags scale redefinition EVEN inside Brand-Kit scope (scale is never brandable)', () => {
    const css = `.theme-brand-brik {\n  --bds-display-sm: 72px;\n}`;
    expect(rules(css)).toEqual(['no-redefinition']);
  });

  it('flags --font-size-* redefinition too', () => {
    const css = `:root { --bds-font-size-700: 2rem; }`;
    expect(rules(css)).toEqual(['no-redefinition']);
  });

  it('does not flag a var() *reference* to a scale token (only definitions)', () => {
    const css = `.title { font-size: var(--bds-heading-lg); }`;
    expect(scan(css)).toHaveLength(0);
  });
});

describe('Rule 1 — no-redefinition: brandable families', () => {
  it('flags a brandable redefinition at bare :root', () => {
    const css = `:root { --bds-surface-secondary: #eee; }`;
    expect(rules(css)).toEqual(['no-redefinition']);
  });

  it('ALLOWS a brandable redefinition inside .theme-{client} scope', () => {
    const css = `.theme-brand-brik {\n  --bds-surface-secondary: var(--bds-color-tan-100);\n  --bds-text-link: var(--bds-color-poppy-700);\n}`;
    expect(scan(css)).toHaveLength(0);
  });

  it('ALLOWS a brandable redefinition when an ancestor selector is brand-scoped', () => {
    const css = `:root[data-theme="dark"] .theme-brand-brik {\n  --bds-surface-secondary: #222;\n}`;
    expect(scan(css)).toHaveLength(0);
  });

  it('ALLOWS a brandable redefinition in a theme-{client}.css file (whole-file scope)', () => {
    const css = `:root { --bds-surface-secondary: #eee; }`;
    expect(scan(css, { file: 'src/styles/theme-acme.css' })).toHaveLength(0);
  });

  it('ALLOWS [data-audience] scope binding', () => {
    const css = `[data-audience="marketing"] { --bds-background-brand-primary: #f30; }`;
    expect(scan(css)).toHaveLength(0);
  });
});

describe('Rule 2 — typography-family', () => {
  it('flags display family paired with heading-scale size (the #536 bug)', () => {
    const css = `.hero-title {\n  font-family: var(--bds-font-family-display);\n  font-size: var(--bds-heading-huge);\n}`;
    const v = scan(css);
    expect(v).toHaveLength(1);
    expect(v[0].rule).toBe('typography-family');
    expect(v[0].line).toBe(3);
  });

  it('passes when family and size share a family', () => {
    const css = `.hero-title {\n  font-family: var(--bds-font-family-display);\n  font-size: var(--bds-display-sm);\n}`;
    expect(scan(css)).toHaveLength(0);
  });

  it('does not cross rules — family in one rule, size in another', () => {
    const css = `.a { font-family: var(--bds-font-family-display); }\n.b { font-size: var(--bds-heading-lg); }`;
    expect(scan(css)).toHaveLength(0);
  });

  it('ignores rules with only one of the two declarations', () => {
    const css = `.a { font-size: var(--bds-heading-lg); }`;
    expect(scan(css)).toHaveLength(0);
  });
});

describe('Rule 3 — import-layer', () => {
  it('flags a plain @import of tokens.css', () => {
    const css = `@import '@brikdesigns/bds/tokens.css';`;
    const v = scan(css);
    expect(v).toHaveLength(1);
    expect(v[0].rule).toBe('import-layer');
    expect(v[0].token).toBe('@brikdesigns/bds/tokens.css');
    expect(v[0].message).toContain('layer(bds-tokens)');
  });

  it('flags a plain @import of styles.css, naming bds-components', () => {
    const css = `@import "@brikdesigns/bds/styles.css";`;
    const v = scan(css);
    expect(v).toHaveLength(1);
    expect(v[0].message).toContain('layer(bds-components)');
  });

  it('passes when both imports carry their named layer', () => {
    const css = [
      `@layer bds-tokens, bds-components, client-theme, client-overrides;`,
      `@import '@brikdesigns/bds/tokens.css' layer(bds-tokens);`,
      `@import '@brikdesigns/bds/styles.css' layer(bds-components);`,
    ].join('\n');
    expect(scan(css)).toHaveLength(0);
  });

  it('accepts the url() form and a trailing media query', () => {
    const css = `@import url("@brikdesigns/bds/tokens.css") layer(bds-tokens) screen;`;
    expect(scan(css)).toHaveLength(0);
  });

  it('flags a bare `layer` — an anonymous layer cannot be ordered', () => {
    const css = `@import '@brikdesigns/bds/tokens.css' layer;`;
    const v = scan(css);
    expect(v).toHaveLength(1);
    expect(v[0].message).toContain('anonymous layer');
  });

  it('does not flag a JS/TS import of the same stylesheet', () => {
    // Astro/Vite consumers import CSS from JS, which cannot carry layer() —
    // the contract names source-order as their legal path. Anchoring the rule
    // on the `@import` at-rule excludes these structurally (brik-bds#1437).
    const js = `import '@brikdesigns/bds/tokens.css';\nimport "@brikdesigns/bds/styles.css";`;
    expect(scan(js)).toHaveLength(0);
  });

  it('ignores non-BDS and non-layer-governed BDS imports', () => {
    const css = [
      `@import 'tailwindcss';`,
      `@import '../styles/theme-brik-portal.css';`,
      `@import '@brikdesigns/bds/atmospheres/warm-soft.css';`,
    ].join('\n');
    expect(scan(css)).toHaveLength(0);
  });

  it('reports the line the offending @import sits on', () => {
    const css = [
      `/* header */`,
      `@layer bds-tokens, client-theme;`,
      ``,
      `@import '@brikdesigns/bds/tokens.css';`,
    ].join('\n');
    expect(scan(css)[0].line).toBe(4);
  });

  it('ignores a commented-out @import', () => {
    const css = `/* @import '@brikdesigns/bds/tokens.css'; */`;
    expect(scan(css)).toHaveLength(0);
  });

  it('flags each offending import independently', () => {
    const css = [
      `@import '@brikdesigns/bds/tokens.css';`,
      `@import '@brikdesigns/bds/styles.css' layer(bds-components);`,
      `@import '@brikdesigns/bds/styles.css';`,
    ].join('\n');
    expect(scan(css).map((v) => v.line)).toEqual([1, 3]);
  });
});

describe('exempt allowlist (transitional burn-down)', () => {
  it('skips an exact token name', () => {
    const css = `:root { --bds-heading-lg: var(--bds-font-size-700); }`;
    expect(scan(css, { exemptTokens: ['--bds-heading-lg'] })).toHaveLength(0);
  });

  it('skips by regex', () => {
    const css = `:root {\n  --bds-heading-lg: 1rem;\n  --bds-heading-huge: 2rem;\n}`;
    expect(scan(css, { exemptTokens: [/^--bds-heading-/] })).toHaveLength(0);
  });

  it('skips an import-layer violation by specifier', () => {
    // Lets a consumer wire the gate before its stylesheet is compliant.
    const css = `@import '@brikdesigns/bds/tokens.css';`;
    expect(scan(css, { exemptTokens: ['@brikdesigns/bds/tokens.css'] })).toHaveLength(0);
    expect(scan(css, { exemptTokens: [/tokens\.css$/] })).toHaveLength(0);
  });
});

describe('robustness', () => {
  it('ignores tokens inside comments', () => {
    const css = `:root {\n  /* --bds-heading-lg: var(--bds-font-size-700); */\n  --bds-surface-secondary: #eee;\n}`;
    // only the brandable :root redefinition should fire, not the commented scale one
    expect(scan(css).map((v) => v.token)).toEqual(['--bds-surface-secondary']);
  });

  it('handles compact single-line rules', () => {
    const css = `:root { --bds-heading-lg: 1rem; } .theme-x { --bds-surface-primary: #fff; }`;
    expect(rules(css)).toEqual(['no-redefinition']); // only the :root scale one
  });

  it('does not treat @layer / @media wrappers as brand scope', () => {
    const css = `@media (min-width: 40rem) {\n  :root { --bds-surface-primary: #fff; }\n}`;
    expect(rules(css)).toEqual(['no-redefinition']);
  });
});
