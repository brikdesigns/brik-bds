/**
 * Type definitions for @brikdesigns/bds/canonical-class-check.
 *
 * Source: scripts/canonical-class-check.mjs (hand-authored ESM with named
 * exports + CLI entry). These types are hand-written to keep the .mjs file
 * portable and avoid pulling the canonical-class-check tooling into the BDS
 * lib build — same separation as canonical-check.d.ts.
 */

export type ExemptPattern = string | RegExp;

/** Map of shorthand class root → canonical BDS root (without `bds-` prefix). */
export type AliasMap = Readonly<Record<string, string>>;

export interface ClassSourceScanOptions {
  /** Filesystem paths to scan (files or directories). */
  paths: string[];
  /** Canonical class allowlist parsed from BDS dist/styles.css. */
  allowlist: Set<string>;
  /** Shorthand → canonical aliases. Default: `{ btn: 'button' }`. */
  aliases?: AliasMap;
  /** Class roots to skip (string or RegExp). Default exempts `card`. */
  exemptPatterns?: ExemptPattern[];
  /** File extensions to include. Default: ['.css', '.astro', '.tsx', '.jsx', '.html']. */
  extensions?: string[];
  /** Path patterns to exclude. Default skips __tests__, *.test.*, node_modules, dist, .git, storybook-static. */
  excludePathPatterns?: ExemptPattern[];
}

export type ClassViolationKind = 'invented-bds' | 'shadow-root' | 'shadow-alias';

export interface ClassViolation {
  /** The offending class name as written in source. */
  class: string;
  /** Why it was flagged. */
  kind: ClassViolationKind;
  /** Canonical BDS root the violation shadows (for `shadow-*` kinds). */
  canonical?: string;
  /** Shorthand alias root (only for `shadow-alias`). */
  alias?: string;
  /** Files where the class was referenced (sourceScan only). */
  files?: string[];
}

export interface ClassSourceScanResult {
  violations: ClassViolation[];
  scannedFiles: number;
  canonicalCount: number;
  canonicalRootCount: number;
}

export interface ClassRuntimeScanOptions {
  /** CSS string to inspect (typically generator output). */
  css: string;
  /** Canonical class allowlist parsed from BDS dist/styles.css. */
  allowlist: Set<string>;
  /** Shorthand → canonical aliases. */
  aliases?: AliasMap;
  /** Class roots to skip. */
  exemptPatterns?: ExemptPattern[];
}

export interface ClassRuntimeScanResult {
  violations: ClassViolation[];
  emittedCount: number;
  canonicalRootCount: number;
}

export interface AssertCanonicalClassesOptions
  extends Omit<ClassRuntimeScanOptions, 'css' | 'allowlist'> {
  /** Pre-parsed allowlist. If omitted, the allowlist is read from `allowlistPath`. */
  allowlist?: Set<string>;
  /** Path to a styles.css file. Defaults to node_modules/@brikdesigns/bds/dist/styles.css. */
  allowlistPath?: string;
}

export const DEFAULT_CLASS_ALIASES: AliasMap;
export const DEFAULT_CLASS_EXEMPT_PATTERNS: readonly RegExp[];
export const DEFAULT_SCAN_EXTENSIONS: readonly string[];
export const DEFAULT_EXCLUDE_PATH_PATTERNS: readonly RegExp[];

/** Parse a styles.css string into a Set of canonical `bds-*` class names. */
export function parseClassAllowlist(cssText: string): Set<string>;

/** Read a styles.css file from disk and parse it. Throws on missing file. */
export function parseClassAllowlistFromFile(path: string): Set<string>;

/** Resolve the default styles.css path (consumer node_modules first, then BDS-self). */
export function resolveDefaultClassAllowlistPath(cwd?: string): string;

/** Reduce a class allowlist to its set of distinct BEM block roots. */
export function canonicalRoots(allowlist: Set<string>): Set<string>;

/** Split a BEM class name into its block root (everything before the first `__` or `--`). */
export function classRoot(className: string): string;

/** Extract every class name referenced in markup attributes and CSS selectors. */
export function extractClassReferences(text: string): Set<string>;

/** Extract every class definition (CSS rule selector head) from a CSS string. */
export function extractClassDefinitions(css: string): Set<string>;

/** Decide whether a single class name is canonical, project-local, or violating. */
export function classifyClass(
  className: string,
  opts: {
    allowlist: Set<string>;
    roots: Set<string>;
    aliases: AliasMap;
    exemptPatterns: ExemptPattern[];
  },
):
  | { kind: 'ok' }
  | { kind: 'invented-bds'; class: string }
  | { kind: 'shadow-root'; class: string; canonical: string }
  | { kind: 'shadow-alias'; class: string; alias: string; canonical: string };

/** Scan filesystem paths for class-name violations. Does not throw. */
export function classSourceScan(opts: ClassSourceScanOptions): ClassSourceScanResult;

/** Scan a CSS string for violating class definitions. Does not throw. */
export function classRuntimeScan(opts: ClassRuntimeScanOptions): ClassRuntimeScanResult;

/** Vitest-friendly: throw on the first non-canonical class definition in `css`. */
export function assertCanonicalClasses(css: string, opts?: AssertCanonicalClassesOptions): void;
