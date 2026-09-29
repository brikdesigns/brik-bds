/**
 * Icon-catalog derivation gate (#2628).
 *
 * The catalog used to hand-list glyph names, and 8 of 75 constants had drifted
 * out of it with nothing to say so. The old drift probe grepped `Icons.<Name>`
 * out of the story file; that check cannot survive derivation, because a
 * derived story names no constants at all. These assertions replace it:
 *
 *  1. every `ph:*` constant reaches a rendered bucket — nothing is dropped,
 *     whatever `ICON_SECTIONS` says;
 *  2. `ICON_SECTIONS` files all of them, so `Ungrouped` renders empty;
 *  3. `ICON_SECTIONS` names no constant that `icons.ts` no longer exports.
 *
 * (1) holds independently of (2): it is the invariant that makes an unfiled
 * constant *visible* rather than missing, which is what the old shape got
 * wrong.
 */
import { describe, it, expect } from 'vitest';
import * as Icons from '../../icons';
import {
  CATALOG_GROUPS,
  ICON_SECTIONS,
  catalogGroup,
  iconConstants,
  isOffline,
  ungrouped,
} from './icon-catalog';

const constantNames = () => iconConstants().map((e) => e.name);

describe('icon catalog derivation', () => {
  it('derives every ph:* constant from the module, not a hand-written list', () => {
    const fromModule = Object.entries(Icons)
      .filter(([, v]) => typeof v === 'string' && (v as string).startsWith('ph:'))
      .map(([k]) => k);
    expect(constantNames().sort()).toEqual(fromModule.sort());
    expect(fromModule.length).toBeGreaterThan(0);
  });

  it('drops nothing — every constant lands in a group or in Ungrouped', () => {
    const rendered = [
      ...CATALOG_GROUPS.flatMap((g) => catalogGroup(g).flatMap((s) => s.entries.map((e) => e.name))),
      ...ungrouped().map((e) => e.name),
    ];
    expect(rendered.sort()).toEqual(constantNames().sort());
    // …and each exactly once, so no constant is double-filed.
    expect(new Set(rendered).size).toBe(rendered.length);
  });

  it('files every constant, so the Ungrouped bucket renders empty', () => {
    expect(ungrouped().map((e) => e.name)).toEqual([]);
  });

  it('has no ICON_SECTIONS entry for a constant icons.ts no longer exports', () => {
    const live = new Set(constantNames());
    expect(Object.keys(ICON_SECTIONS).filter((name) => !live.has(name))).toEqual([]);
  });

  it('orders glyphs alphabetically inside a section', () => {
    // A lookup catalog is scanned by name. The sort is explicit in
    // `iconConstants()` rather than inherited from the module namespace's
    // spec-sorted keys, so this holds if the derivation source ever changes.
    for (const group of CATALOG_GROUPS) {
      for (const { section, entries } of catalogGroup(group)) {
        const names = entries.map((e) => e.name);
        expect(names, `${group} / ${section}`).toEqual([...names].sort((a, b) => a.localeCompare(b)));
      }
    }
  });

  it('marks offline against the name the atom actually paints', () => {
    // `ph:star` renders as `ph:star-bold` at the default weight; both are in the
    // bundled subset, so the flag is true for the rewritten name, not the bare one.
    expect(isOffline('ph:star')).toBe(true);
    // A `ph:*` glyph no BDS source uses is not bundled, so it would reach the CDN.
    expect(isOffline('ph:this-glyph-does-not-exist')).toBe(false);
  });
});
