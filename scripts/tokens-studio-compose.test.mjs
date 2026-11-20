/**
 * Tests for the path = name rule in scripts/lib/tokens-studio-compose.cjs (#3278).
 *
 * A token name is its Figma variable path (tokens/naming-grammar.json `body`).
 * The generator adds no collection segment, so a rootless set outside
 * `body.legacyCollectionWrap` MUST throw. The negative controls: a legacy
 * collection still wraps, and a set that carries its own path passes through.
 */
import { createRequire } from 'node:module';
import { describe, it, expect } from 'vitest';

const require = createRequire(import.meta.url);
const { flattenTokensStudio } = require('./lib/tokens-studio-compose.cjs');

const leaf = (value) => ({ $type: 'string', $value: value });

describe('flattenTokensStudio — path = name (#3278)', () => {
  it('throws on a rootless set outside the legacy list', () => {
    expect(() => flattenTokensStudio({ 'motion/default': { out: leaf('linear') } }))
      .toThrow(/has variables at its root/);
  });

  it('emits a set that carries its own path without adding the collection', () => {
    const out = flattenTokensStudio({ 'motion/default': { ease: { out: leaf('linear') } } });
    expect(out.ease.out.$value).toBe('linear');
    expect(out.motion).toBeUndefined();
  });

  it('still wraps a legacy collection under its name', () => {
    const out = flattenTokensStudio({ 'border-width/default': { sm: leaf('1px') } });
    expect(out['border-width'].sm.$value).toBe('1px');
  });
});
