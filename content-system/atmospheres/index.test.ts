/// <reference types="vite/client" />
import { describe, it, expect } from 'vitest';
import {
  ATMOSPHERE_MANIFEST,
  getAtmosphereImportPath,
  getAtmosphereSafePairings,
} from './index';
import { ATMOSPHERE_VALUES } from '../vocabularies/atmosphere';

/**
 * Atmosphere manifest contract tests.
 *
 * Pin every atmosphere has the new schema fields so adding a new
 * atmosphere can't ship without declaring its surface posture +
 * safePairings — the portal contrast preflight depends on them.
 */

describe('ATMOSPHERE_MANIFEST', () => {
  it('declares an entry for every atmosphere in ATMOSPHERE_VALUES', () => {
    for (const atmosphere of ATMOSPHERE_VALUES) {
      expect(ATMOSPHERE_MANIFEST[atmosphere]).toBeDefined();
      expect(ATMOSPHERE_MANIFEST[atmosphere].slug).toBe(atmosphere);
    }
  });

  it('declares a surfaceProfile on every entry', () => {
    for (const atmosphere of ATMOSPHERE_VALUES) {
      const entry = ATMOSPHERE_MANIFEST[atmosphere];
      expect(['single-tone-light', 'single-tone-dark', 'dual-mode', 'passthrough']).toContain(entry.surfaceProfile);
    }
  });

  it('declares safePairings as an array on every entry', () => {
    for (const atmosphere of ATMOSPHERE_VALUES) {
      expect(Array.isArray(ATMOSPHERE_MANIFEST[atmosphere].safePairings)).toBe(true);
    }
  });

  it('only `none` may have an empty safePairings list', () => {
    for (const atmosphere of ATMOSPHERE_VALUES) {
      const pairings = ATMOSPHERE_MANIFEST[atmosphere].safePairings;
      if (atmosphere === 'none') {
        expect(pairings.length).toBe(0);
      } else {
        expect(pairings.length).toBeGreaterThan(0);
      }
    }
  });

  it('every safePairing has fg + bg as `--` custom-property names', () => {
    for (const atmosphere of ATMOSPHERE_VALUES) {
      for (const pair of ATMOSPHERE_MANIFEST[atmosphere].safePairings) {
        expect(pair.fg.startsWith('--')).toBe(true);
        expect(pair.bg.startsWith('--')).toBe(true);
        expect(pair.fg).not.toBe(pair.bg);
      }
    }
  });

  it('dark-mode atmospheres pair --text-primary with --background-primary', () => {
    const darks = ATMOSPHERE_VALUES.filter(
      (a) => ATMOSPHERE_MANIFEST[a].themeMode === 'dark',
    );
    expect(darks.length).toBeGreaterThan(0);
    for (const slug of darks) {
      const pairings = ATMOSPHERE_MANIFEST[slug].safePairings;
      const hasPrimaryBody = pairings.some(
        (p) => p.fg === '--text-primary' && p.bg === '--background-primary',
      );
      expect(hasPrimaryBody).toBe(true);
    }
  });

  it('light-mode atmospheres pair brand fill with --text-on-color-dark', () => {
    const lights = ATMOSPHERE_VALUES.filter(
      (a) => ATMOSPHERE_MANIFEST[a].themeMode === 'light',
    );
    for (const slug of lights) {
      const pairings = ATMOSPHERE_MANIFEST[slug].safePairings;
      const hasBrandHover = pairings.some(
        (p) => p.fg === '--text-on-color-dark' && p.bg === '--background-brand-primary-hover',
      );
      expect(hasBrandHover).toBe(true);
    }
  });

  it('dark-mode atmospheres pair brand fill with --text-on-color-light', () => {
    const darks = ATMOSPHERE_VALUES.filter(
      (a) => ATMOSPHERE_MANIFEST[a].themeMode === 'dark',
    );
    for (const slug of darks) {
      const pairings = ATMOSPHERE_MANIFEST[slug].safePairings;
      const hasBrandHover = pairings.some(
        (p) => p.fg === '--text-on-color-light' && p.bg === '--background-brand-primary-hover',
      );
      expect(hasBrandHover).toBe(true);
    }
  });

  it('does not reference the retired --text-on-brand alias', () => {
    for (const atmosphere of ATMOSPHERE_VALUES) {
      for (const pair of ATMOSPHERE_MANIFEST[atmosphere].safePairings) {
        expect(pair.fg).not.toBe('--text-on-brand');
        expect(pair.bg).not.toBe('--text-on-brand');
      }
    }
  });

  it('dark single-tone atmospheres do NOT promise --text-muted on --background-primary', () => {
    // The default generator emission of text-muted on near-black sits
    // ~4.06:1 — below AA. Atmospheres can override the muted token to
    // fix it; until they do, the pair stays out of the safe set so the
    // portal preflight catches it.
    const darks = ATMOSPHERE_VALUES.filter(
      (a) => ATMOSPHERE_MANIFEST[a].surfaceProfile === 'single-tone-dark',
    );
    for (const slug of darks) {
      const pairings = ATMOSPHERE_MANIFEST[slug].safePairings;
      const hasMutedOnPrimary = pairings.some(
        (p) => p.fg === '--text-muted' && p.bg === '--background-primary',
      );
      expect(hasMutedOnPrimary).toBe(false);
    }
  });
});

describe('getAtmosphereImportPath', () => {
  it('returns the canonical @import path for editorial-luxury', () => {
    expect(getAtmosphereImportPath('editorial-luxury')).toBe(
      '@brikdesigns/bds/atmospheres/editorial-luxury.css',
    );
  });
});

describe('getAtmosphereSafePairings', () => {
  it('returns the same array as ATMOSPHERE_MANIFEST[slug].safePairings', () => {
    for (const slug of ATMOSPHERE_VALUES) {
      expect(getAtmosphereSafePairings(slug)).toEqual(
        ATMOSPHERE_MANIFEST[slug].safePairings,
      );
    }
  });

  it('returns an empty array for `none`', () => {
    expect(getAtmosphereSafePairings('none')).toEqual([]);
  });
});

// ── Architecture compliance gate ────────────────────────────────────
//
// Atmospheres must NEVER override color-foundation tokens. These tests
// are the hard regression gate added in brik-bds#369.
//
// CSS files are loaded via import.meta.glob (Vite/Vitest feature) so
// no @types/node is required.

const CSS_MODULES = import.meta.glob<string>('./*.css', {
  query: '?raw',
  import: 'default',
  eager: true,
});

describe('Atmosphere CSS — color-foundation compliance (brik-bds#369)', () => {
  it('finds at least 6 CSS files to validate', () => {
    expect(Object.keys(CSS_MODULES).length).toBeGreaterThanOrEqual(6);
  });

  for (const [filePath, content] of Object.entries(CSS_MODULES)) {
    const file = filePath.replace(/^\.\//, '');

    it(`${file}: does not declare color-foundation tokens`, () => {
      // Match property declarations of the banned semantic categories.
      const BANNED = /--(page|surface|background|text|border)-[a-z]/;
      const violations = content
        .split('\n')
        .map((line, i) => ({ line: line.trim(), num: i + 1 }))
        .filter(({ line }) => {
          const match = line.match(/^(--[a-z][a-zA-Z0-9-]*):/);
          return match != null && BANNED.test(match[1]);
        });
      expect(violations).toEqual([]);
    });

    it(`${file}: does not set a top-level body{} rule`, () => {
      const hasBodyBlock = /^\s*body\s*\{/m.test(content);
      expect(hasBodyBlock).toBe(false);
    });

    it(`${file}: does not use retired --atmosphere-paper/ink local vars`, () => {
      const hasRetiredVar = /--atmosphere-(paper|cream-paper|ink)/.test(content);
      expect(hasRetiredVar).toBe(false);
    });
  }
});
