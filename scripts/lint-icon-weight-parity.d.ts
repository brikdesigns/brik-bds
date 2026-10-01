/**
 * Type definitions for @brikdesigns/bds/lint-icon-weight-parity.
 *
 * Source: scripts/lint-icon-weight-parity.mjs (hand-authored ESM with named
 * exports + CLI entry). These types are hand-written to keep the .mjs file
 * portable and avoid pulling this tooling into the BDS lib build.
 */

import type { IconCollection } from './gen-icon-collection.d.ts';

/** BDS's semantic icon weight — kept in sync with `IconWeight` in `components/ui/Icon/icon-weight.ts`. */
export type IconWeight =
  | 'outline-thin'
  | 'outline-light'
  | 'outline'
  | 'outline-bold'
  | 'fill'
  | 'duotone'
  | 'regular'
  | 'bold';

export interface CheckWeightParityOptions {
  /** Bare `ph:*` reference names (no `ph:` prefix), as returned by `collectReferences`. */
  names: string[];
  /** The committed collection to check coverage against. */
  collection: IconCollection;
  /** The semantic weight to resolve each name at. */
  weight: IconWeight;
}

export interface MissingGlyph {
  /** The bare reference as it appears in source. */
  name: string;
  /** The weight-resolved name `<Icon>` would request at runtime. */
  resolved: string;
}

export interface CheckWeightParityResult {
  /** References whose resolved glyph is absent from the collection. Empty = parity. */
  missing: MissingGlyph[];
  /** Total references checked. */
  checked: number;
  weight: IconWeight;
}

/** Each semantic weight → its Phosphor icon-name token (`''` = no suffix). */
export const PHOSPHOR_WEIGHT_TOKEN: Record<IconWeight, string>;

export const DEFAULT_WEIGHT: IconWeight;
export const DEFAULT_COLLECTION_PATH: string;

/** The glyph name `<Icon>` actually requests for a bare `ph:*` reference at `weight`. */
export function resolveAtWeight(name: string, weight: IconWeight): string;

/** Which of `names`, resolved at `weight`, are absent from `collection`. */
export function checkWeightParity(options: CheckWeightParityOptions): CheckWeightParityResult;
