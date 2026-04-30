/**
 * Type definitions for @brikdesigns/bds/canonical-check.
 *
 * Source: scripts/canonical-check.mjs (hand-authored ESM with named exports
 * + CLI entry). These types are hand-written to keep the .mjs file portable
 * and avoid pulling the canonical-check tooling into the BDS lib build.
 */

export type ExemptPattern = string | RegExp;

export interface SourceScanOptions {
  /** Filesystem paths to scan (files or directories). */
  paths: string[];
  /** Canonical token allowlist parsed from BDS tokens.css. */
  allowlist: Set<string>;
  /** Prefixes to scan. Default: ['text', 'surface', 'background', 'border', 'color']. */
  prefixes?: string[];
  /** File extensions to include. Default: ['.css', '.ts', '.tsx', '.astro', '.mjs', '.js']. */
  extensions?: string[];
  /** Path patterns to exclude (string or RegExp). Default skips __tests__, *.test.*, node_modules, dist, .git. */
  excludePathPatterns?: ExemptPattern[];
  /** Token names or RegExps to skip. Default exempts --border-(radius|width)-* and --color-fd-*. */
  exemptTokens?: ExemptPattern[];
}

export interface SourceScanViolation {
  /** Non-canonical token name (e.g. `--surface-paper`). */
  token: string;
  /** Files where the token was referenced. */
  files: string[];
}

export interface SourceScanResult {
  violations: SourceScanViolation[];
  scannedFiles: number;
  canonicalCount: number;
}

export interface RuntimeScanOptions {
  /** CSS string to inspect (typically generator output). */
  css: string;
  /** Canonical token allowlist parsed from BDS tokens.css. */
  allowlist: Set<string>;
  /** Prefixes to validate. Default: ['text', 'surface', 'background', 'border'] (omits --color-* — primitives). */
  prefixes?: string[];
  /** Token names or RegExps to skip. */
  exemptTokens?: ExemptPattern[];
}

export interface RuntimeScanResult {
  violations: string[];
  emittedCount: number;
}

export interface AssertCanonicalCssOptions extends Omit<RuntimeScanOptions, 'css' | 'allowlist'> {
  /** Pre-parsed allowlist. If omitted, the allowlist is read from `allowlistPath`. */
  allowlist?: Set<string>;
  /** Path to a tokens.css file. Defaults to node_modules/@brikdesigns/bds/dist/tokens.css. */
  allowlistPath?: string;
}

export const DEFAULT_PREFIXES: readonly string[];
export const DEFAULT_EXEMPT_PATTERNS: readonly RegExp[];
export const DEFAULT_SCAN_EXTENSIONS: readonly string[];
export const DEFAULT_EXCLUDE_PATH_PATTERNS: readonly RegExp[];

/** Parse a tokens.css string into a Set of canonical `--token-name`s. */
export function parseAllowlist(cssText: string): Set<string>;

/** Read a tokens.css file from disk and parse it. Throws on missing file. */
export function parseAllowlistFromFile(path: string): Set<string>;

/** Resolve the default tokens.css path (consumer node_modules first, then BDS-self). */
export function resolveDefaultAllowlistPath(cwd?: string): string;

/** Strip CSS / JS block comments and leading-line `//` comments from text. */
export function stripCssComments(input: string): string;

/** Extract every token reference (matching prefixes) from text — names only. */
export function extractTokenReferences(text: string, prefixes?: string[]): Set<string>;

/** Extract every CSS custom-property *declaration* (LHS) from a CSS string. */
export function extractTokenDefinitions(css: string, prefixes?: string[]): Set<string>;

/** Scan filesystem paths for non-canonical token references. Does not throw. */
export function sourceScan(opts: SourceScanOptions): SourceScanResult;

/** Scan a CSS string for non-canonical token *definitions*. Does not throw. */
export function runtimeScan(opts: RuntimeScanOptions): RuntimeScanResult;

/** Vitest-friendly: throw on the first non-canonical definition in `css`. */
export function assertCanonicalCss(css: string, opts?: AssertCanonicalCssOptions): void;
