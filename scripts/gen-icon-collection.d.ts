/**
 * Type definitions for @brikdesigns/bds/gen-icon-collection.
 *
 * Source: scripts/gen-icon-collection.mjs (hand-authored ESM with named
 * exports + CLI entry). These types are hand-written to keep the .mjs file
 * portable and avoid pulling this tooling into the BDS lib build.
 */

/** A single Iconify glyph record, copied verbatim from `@iconify-json/ph`. */
export interface IconifyIconData {
  body: string;
  width?: number;
  height?: number;
  [key: string]: unknown;
}

/** An Iconify alias record — resolves to `parent`, optionally with its own transforms. */
export interface IconifyAliasData {
  parent: string;
  [key: string]: unknown;
}

/** The subset of `@iconify-json/ph/icons.json`'s shape this script reads. */
export interface PhosphorIconSet {
  prefix: string;
  width?: number;
  height?: number;
  icons: Record<string, IconifyIconData>;
  aliases?: Record<string, IconifyAliasData>;
}

/** A trimmed IconifyJSON collection, as written to the output path. */
export interface IconCollection {
  prefix: string;
  icons: Record<string, IconifyIconData>;
  width?: number;
  height?: number;
  aliases?: Record<string, IconifyAliasData>;
}

export interface CollectReferencesOptions {
  /** Source roots to scan, relative to `cwd`. Default: `DEFAULT_SCAN_DIRS`. */
  srcDirs?: string[];
  /** Base directory source roots resolve against. Default: `process.cwd()`. */
  cwd?: string;
}

export interface BuildCollectionResult {
  collection: IconCollection;
  /** Bare `ph:*` names with no match in `phData` (typo or wrong name). */
  missing: string[];
}

export const DEFAULT_SCAN_DIRS: readonly string[];
export const DEFAULT_OUTPUT_PATH: string;

/** The Phosphor name suffixes that already encode a weight. */
export const PH_WEIGHT_SUFFIXES: readonly string[];

/** Every distinct bare `ph:*` reference under `srcDirs`, resolved against `cwd`. */
export function collectReferences(options?: CollectReferencesOptions): string[];

/** Whether `name` already carries an explicit Phosphor weight suffix. */
export function isWeighted(name: string): boolean;

/** Expand `names` to include each one's `-bold` twin, where Phosphor ships it. */
export function withBoldTwins(names: string[], phData: PhosphorIconSet): string[];

/** Resolve `names` against `phData` into a trimmed, closed IconifyJSON collection. */
export function buildCollection(names: string[], phData: PhosphorIconSet): BuildCollectionResult;
