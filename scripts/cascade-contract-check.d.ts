/**
 * Type definitions for @brikdesigns/bds/cascade-contract-check.
 *
 * Source: scripts/cascade-contract-check.mjs (hand-authored ESM with named
 * exports + CLI entry). Hand-written to keep the .mjs portable and out of the
 * BDS lib build. ADR-013 §2.
 */

export type ExemptPattern = string | RegExp;

export type CascadeRule = 'no-redefinition' | 'typography-family';

export interface CascadeViolation {
  /** Which rule fired. */
  rule: CascadeRule;
  severity: 'error';
  /** The offending token name (the redefined token, or the font-family token). */
  token: string;
  /** File the violation was found in (`<input>` for raw-string scans). */
  file: string;
  /** 1-based line number. */
  line: number;
  message: string;
}

export interface ScanOptions {
  /** CSS string to inspect. */
  css: string;
  /** File path — used for messages and whole-file brand-scope (`theme-*.css`). */
  file?: string;
  /** Token names or RegExps to skip (transitional burn-down allowlist). */
  exemptTokens?: ExemptPattern[];
}

export interface ScanResult {
  violations: CascadeViolation[];
  file: string;
}

/** Scan one CSS string for cascade-contract violations. Does not throw. */
export function scanCascadeContract(opts: ScanOptions): ScanResult;

/** Throw on the first violation (vitest-friendly). */
export function assertCascadeContract(css: string, opts?: Omit<ScanOptions, 'css'>): void;

/** Family of a font-size token (`--heading-lg` → `'heading'`), or null. */
export function familyOfSizeToken(token: string): string | null;

/** Family of a `--font-family-*` token (`--font-family-display` → `'display'`), or null. */
export function familyOfFontFamilyToken(token: string): string | null;

/** Scale families a consumer may never redefine. */
export const SCALE_FAMILIES: string[];

/** Semantic families a consumer may override only within Brand-Kit scope. */
export const BRANDABLE_FAMILIES: string[];

/** `--font-family-{family}` → family map. */
export const FONT_FAMILY_TO_FAMILY: Record<string, string>;
