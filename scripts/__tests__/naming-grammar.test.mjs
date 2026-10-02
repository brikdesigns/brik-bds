/**
 * tokens/naming-grammar.json (#2669, ADR-043): the reserved-word rule for
 * component stems, the grammar's internal consistency, and the docs check.
 */

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expectedFormulas, missingFormulas, repeatedHeadings } from '../lint-naming-grammar-docs.mjs';

const REPO = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const grammar = JSON.parse(fs.readFileSync(path.join(REPO, 'tokens', 'naming-grammar.json'), 'utf8'));

const RESERVED = new Set(Object.entries(grammar.reservedWords).filter(([k]) => !k.startsWith('$')).flatMap(([, v]) => v));

/** The first body segment after the `--{id}-` prefix, or null if the name has no registered ID. */
function stemOf(name) {
  const bare = name.replace(/^--/, '');
  const id = Object.keys(grammar.ids.registry)
    .sort((a, b) => b.length - a.length)
    .find((i) => bare.startsWith(`${i}-`));
  return id ? bare.slice(id.length + 1).split('-')[0] : null;
}

const reservedStem = (name) => RESERVED.has(stemOf(name));

describe('component stem vs reserved words (ADR-043 section 5)', () => {
  it.each(['--bds-text-area-min-width', '--bds-page-padding-inline'])('fails: %s', (name) => {
    expect(reservedStem(name)).toBe(true);
  });

  it.each(['--bds-button-padding', '--bds-textarea-min-width', '--bds-footer-surface'])('passes: %s', (name) => {
    expect(reservedStem(name)).toBe(false);
  });
});

describe('grammar consistency', () => {
  it('reserved words cover the first segment of every non-component slot', () => {
    for (const { slot, tier } of grammar.slots) {
      if (tier !== 'component') expect(RESERVED.has(slot.split('-')[0]), slot).toBe(true);
    }
  });

  it('no registered ID is a reserved word or prefixes another ID', () => {
    const ids = Object.keys(grammar.ids.registry);
    for (const id of ids) {
      expect(id, id).toMatch(/^[a-z]+(-[a-z]+)*$/);
      expect(RESERVED.has(id), id).toBe(false);
      for (const other of ids) if (other !== id) expect(other.startsWith(`${id}-`), `${id} / ${other}`).toBe(false);
    }
  });

  it('colour steps are numeric 50-950', () => {
    expect(grammar.tiers.primitive.color.steps).toEqual(
      ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
    );
  });
});

describe('token-anatomy.mdx docs check', () => {
  const mdx = fs.readFileSync(path.join(REPO, grammar.docs.page), 'utf8');

  it('passes on the current page', () => {
    expect(missingFormulas(grammar, mdx)).toEqual([]);
  });

  it('fails when a grammar formula changes and the page does not', () => {
    const drifted = structuredClone(grammar);
    drifted.tiers.semantic.formula = '{purpose}-{role}-{state}';
    expect(missingFormulas(drifted, mdx)).toEqual(['--{purpose}-{role}-{state}']);
    expect(expectedFormulas(grammar)).toHaveLength(5);
  });

  it('fails when the page does not print the --{id}-{body} shape', () => {
    const noShape = mdx.replaceAll(grammar.shape, '--{body}');
    expect(missingFormulas(grammar, noShape)).toEqual([grammar.shape]);
  });

  it('fails when the page does not print the scale body --{scale}-{step}', () => {
    const noScale = mdx.replaceAll(`--${grammar.tiers.primitive.scale.body}`, '--{property}-{step}');
    expect(missingFormulas(grammar, noScale)).toEqual([`--${grammar.tiers.primitive.scale.body}`]);
  });
});

describe('token-anatomy.mdx repeated-heading check (#2689)', () => {
  const mdx = fs.readFileSync(path.join(REPO, grammar.docs.page), 'utf8');

  it('passes on the current page', () => {
    expect(repeatedHeadings(mdx)).toEqual([]);
  });

  it('fails when a section is pasted twice', () => {
    expect(repeatedHeadings(`${mdx}\n## Tier\n\nagain\n`)).toEqual(['Tier']);
  });

  it('ignores a repeated heading inside a fenced code block', () => {
    expect(repeatedHeadings('## A\n\n```\n## A\n```\n')).toEqual([]);
  });
});

describe('named colour families state their purpose (#2689)', () => {
  const color = grammar.tiers.primitive.color;

  it('has a one-sentence purpose for system, social and annotation', () => {
    for (const f of ['system', 'social', 'annotation']) {
      expect(color.namedFamilies.$purposes[f], f).toMatch(/\.$/);
    }
    expect(color.namedSteps.$purposes.grayscale).toMatch(/never rebinds/);
  });

  it('keeps the social marks out of system', () => {
    for (const n of color.namedFamilies.social) expect(color.namedFamilies.system).not.toContain(n);
    expect(color.namedFamilies.system).not.toContain('transparent');
    expect(grammar.steps.namedExceptions).toContain('--color-system-transparent');
  });
});
