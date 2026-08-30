import { describe, it, expect } from 'vitest';

import {
  stripComments,
  parseRuleBlocks,
  extractAstroStyles,
  scanCssText,
} from '../lint-page-grid.mjs';

describe('stripComments', () => {
  it('blanks comment content but preserves newlines', () => {
    const out = stripComments('a /* x {\n} y */ b');
    expect(out).toBe('a       \n       b');
  });
});

describe('parseRuleBlocks', () => {
  it('attributes declarations to the innermost rule through @layer', () => {
    const blocks = parseRuleBlocks(
      '@layer bds-components {\n  .x {\n    max-width: 10px;\n  }\n}',
    );
    const rule = blocks.find((b) => b.selector === '.x');
    expect(rule.decls).toEqual([
      expect.objectContaining({ prop: 'max-width', value: '10px', line: 3 }),
    ]);
  });

  it('survives braces inside comments (section-shell header shape)', () => {
    const blocks = parseRuleBlocks(
      '/* example:\n .foo { padding: 1px; }\n*/\n.y { margin-inline: auto; }',
    );
    expect(blocks).toHaveLength(1);
    expect(blocks[0].selector).toBe('.y');
  });
});

describe('extractAstroStyles', () => {
  it('returns style content with the correct line offset', () => {
    const astro = '---\nconst x = 1;\n---\n<div />\n<style>\n.z { color: red; }\n</style>\n';
    const [style] = extractAstroStyles(astro);
    expect(style.css).toContain('.z');
    // `.z` sits on file line 6; offset 5 + parser line 1 = 6.
    const blocks = parseRuleBlocks(style.css, style.lineOffset);
    expect(blocks[0].decls[0].line).toBe(6);
  });
});

describe('scanCssText — page-container detection', () => {
  it('flags a content-width container whose padding-inline bypasses --page-inset', () => {
    const v = scanCssText(
      '.c { max-width: var(--content-width-xl); margin-inline: auto; padding-inline: var(--padding-lg); }',
    );
    expect(v).toHaveLength(1);
    expect(v[0].selector).toBe('.c');
  });

  it('flags a hardcoded gutter in a container', () => {
    const v = scanCssText(
      '.c { max-width: var(--content-width-wide); padding-inline: 24px; }',
    );
    expect(v).toHaveLength(1);
  });

  it('flags a Footer-style centering inset built on another token', () => {
    const v = scanCssText(
      '.f { padding-inline: max(var(--padding-lg), calc((100% - var(--content-width-xl)) / 2)); }',
    );
    expect(v).toHaveLength(1);
  });

  it('allows the canonical recipe', () => {
    const v = scanCssText(
      '.c { max-width: var(--content-width-xl); margin-inline: auto; padding-inline: var(--page-inset); }',
    );
    expect(v).toHaveLength(0);
  });

  it('allows the ADR-014 hook fallback shape (section shell)', () => {
    const v = scanCssText(
      '.c { max-width: var(--bds-blueprint-section-content-width, var(--content-width-xl)); margin-inline: auto; padding-inline: var(--bds-blueprint-section-padding-inline, var(--page-inset)); }',
    );
    expect(v).toHaveLength(0);
  });

  it('allows the max() centering inset built on --page-inset', () => {
    const v = scanCssText(
      '.f { padding-inline: max(var(--page-inset), calc((100% - var(--content-width-narrow)) / 2)); }',
    );
    expect(v).toHaveLength(0);
  });

  it('flags the removed --gutter-page alias — no longer a valid page inset (ADR-025)', () => {
    const v = scanCssText(
      '.c { max-width: var(--content-width-xl); margin-inline: auto; padding-inline: var(--gutter-page); }',
    );
    expect(v).toHaveLength(1);
  });

  it('allows a container with no padding-inline of its own', () => {
    const v = scanCssText('.c { max-width: var(--content-width-xl); margin-inline: auto; }');
    expect(v).toHaveLength(0);
  });

  it('ignores padding-inline outside a container rule (buttons, chips)', () => {
    const v = scanCssText('.btn { padding-inline: var(--padding-md); }');
    expect(v).toHaveLength(0);
  });

  it('honors a reasoned bds-lint-ignore, hard-fails a bare one', () => {
    const reasoned = scanCssText(
      '.c {\n  max-width: var(--content-width-xl);\n  padding-inline: var(--padding-xl); /* bds-lint-ignore — legacy inset, visual change gated on #771 */\n}',
    );
    expect(reasoned).toHaveLength(0);

    const bare = scanCssText(
      '.c {\n  max-width: var(--content-width-xl);\n  padding-inline: var(--padding-xl); /* bds-lint-ignore */\n}',
    );
    expect(bare).toHaveLength(1);
    expect(bare[0].bare).toBe(true);
  });
});
