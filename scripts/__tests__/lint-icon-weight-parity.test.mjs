import { describe, it, expect } from 'vitest';

import {
  resolveAtWeight,
  checkWeightParity,
  PHOSPHOR_WEIGHT_TOKEN,
  DEFAULT_WEIGHT,
} from '../lint-icon-weight-parity.mjs';

describe('resolveAtWeight', () => {
  it('appends the Phosphor suffix token for a bare name', () => {
    expect(resolveAtWeight('house', 'outline-bold')).toBe('house-bold');
    expect(resolveAtWeight('house', 'fill')).toBe('house-fill');
    expect(resolveAtWeight('house', 'duotone')).toBe('house-duotone');
  });

  it('leaves the name unchanged for the suffix-less weights', () => {
    expect(resolveAtWeight('house', 'outline')).toBe('house');
    expect(resolveAtWeight('house', 'regular')).toBe('house');
  });

  it('passes an already-weighted name through unchanged', () => {
    expect(resolveAtWeight('house-fill', 'outline-bold')).toBe('house-fill');
  });

  it('covers every key PHOSPHOR_WEIGHT_TOKEN declares', () => {
    for (const weight of Object.keys(PHOSPHOR_WEIGHT_TOKEN)) {
      expect(() => resolveAtWeight('house', weight)).not.toThrow();
    }
  });
});

describe('checkWeightParity', () => {
  const COLLECTION = {
    icons: {
      house: {},
      'house-bold': {},
      gear: {},
    },
    aliases: {
      cog: { parent: 'gear' },
    },
  };

  it('reports no missing glyphs when every resolved name is bundled', () => {
    const result = checkWeightParity({
      names: ['house'],
      collection: COLLECTION,
      weight: 'outline-bold',
    });
    expect(result).toEqual({ missing: [], checked: 1, weight: 'outline-bold' });
  });

  it('flags a reference whose resolved weight twin is not bundled — the brikdesigns-fork defect', () => {
    // `gear` is bundled bare but has no `gear-bold`: the exact shape of
    // brikdesigns' fork, which dropped the bold-twin expansion so its own
    // --check passed while every rendered icon was actually missing (#2406).
    const result = checkWeightParity({
      names: ['gear'],
      collection: COLLECTION,
      weight: 'outline-bold',
    });
    expect(result.missing).toEqual([{ name: 'gear', resolved: 'gear-bold' }]);
    expect(result.checked).toBe(1);
  });

  it('finds a resolved name bundled only as an alias', () => {
    const result = checkWeightParity({
      names: ['cog'],
      collection: COLLECTION,
      weight: 'outline',
    });
    expect(result.missing).toEqual([]);
  });

  it('passes at a weight with no suffix once the bare name is bundled', () => {
    const result = checkWeightParity({
      names: ['gear'],
      collection: COLLECTION,
      weight: DEFAULT_WEIGHT === 'outline-bold' ? 'outline' : DEFAULT_WEIGHT,
    });
    expect(result.missing).toEqual([]);
  });

  it('checks multiple references independently', () => {
    const result = checkWeightParity({
      names: ['house', 'gear'],
      collection: COLLECTION,
      weight: 'outline-bold',
    });
    expect(result.checked).toBe(2);
    expect(result.missing).toEqual([{ name: 'gear', resolved: 'gear-bold' }]);
  });
});
