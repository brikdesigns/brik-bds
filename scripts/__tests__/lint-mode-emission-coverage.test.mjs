import { describe, it, expect } from 'vitest';

import {
  multiModalCollections,
  wiredAttrFor,
  findCoverageViolations,
} from '../lint-mode-emission-coverage.mjs';

// A minimal tokens-studio shape: only the `collection/{mode}` keys matter.
function studio(collections) {
  const out = { $metadata: {}, global: {}, 'primitives/value': {} };
  for (const [coll, modes] of Object.entries(collections)) {
    for (const m of modes) out[`${coll}/${m}`] = {};
  }
  return out;
}

describe('multiModalCollections', () => {
  it('returns only collections with >1 mode, excluding primitives', () => {
    const data = studio({ spacing: ['default', 'compact'], elevation: ['a', 'b'], solo: ['only'] });
    const mm = multiModalCollections(data);
    expect(Object.keys(mm).sort()).toEqual(['elevation', 'spacing']);
    expect(mm).not.toHaveProperty('solo'); // single-mode → not multi-modal
    expect(mm).not.toHaveProperty('primitives');
  });
});

describe('wiredAttrFor', () => {
  it('maps registry collections to their data-mode attr (attr override honored)', () => {
    expect(wiredAttrFor('spacing')).toBe('spacing');
    expect(wiredAttrFor('border-radius')).toBe('radius'); // cfg.attr override
    expect(wiredAttrFor('elevation')).toBe('elevation');
  });
  it('maps the legacy border-width collection to borderwidth', () => {
    expect(wiredAttrFor('border-width')).toBe('borderwidth');
  });
  it('returns null for an unknown collection', () => {
    expect(wiredAttrFor('nonesuch')).toBeNull();
  });
});

describe('findCoverageViolations — proves the gate fails on the exact drift #340 hit', () => {
  it('flags a NEW multi-modal collection with no emission and no exclusion as dormant', () => {
    // The #340 shape: a multi-modal source collection that never reaches dist.
    const data = studio({ newthing: ['default', 'loud', 'quiet'] });
    const css = ':root {}'; // nothing emitted
    const rows = findCoverageViolations(data, css);
    const bad = rows.find((r) => r.collection === 'newthing');
    expect(bad.status).toBe('dormant');
  });

  it('flags a wired collection whose [data-mode-*] block is missing from dist as missing-emission', () => {
    const data = studio({ spacing: ['default', 'compact'] });
    const css = ':root { --x: 1; }'; // spacing is registry-wired but never emitted here
    const rows = findCoverageViolations(data, css);
    expect(rows.find((r) => r.collection === 'spacing').status).toBe('missing-emission');
  });

  it('flags an excluded collection that IS emitted as a stale exclusion', () => {
    const data = studio({ breakpoint: ['default', 'compact'] });
    const css = '[data-mode-breakpoint="compact"] { --x: 1; }'; // excluded, yet emitted
    const rows = findCoverageViolations(data, css);
    expect(rows.find((r) => r.collection === 'breakpoint').status).toBe('stale-exclusion');
  });

  it('passes a wired collection whose block is present, and a genuinely-unwired excluded one', () => {
    const data = studio({ spacing: ['default', 'compact'], breakpoint: ['default', 'compact'] });
    const css = '[data-mode-spacing="compact"] { --gap-md: 8px; }';
    const rows = findCoverageViolations(data, css);
    expect(rows.find((r) => r.collection === 'spacing').status).toBe('ok');
    expect(rows.find((r) => r.collection === 'breakpoint').status).toBe('excluded');
  });
});
