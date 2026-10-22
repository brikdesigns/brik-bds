/**
 * Type definitions for @brikdesigns/bds/site-a11y.
 *
 * Source: scripts/site-a11y/*.mjs (hand-authored ESM). Hand-written to keep the
 * .mjs portable and out of the BDS lib build, matching scripts/canonical-check.d.ts.
 */
import type { Page, Response, TestInfo } from '@playwright/test';

// ── baseline-match ──────────────────────────────────────────────────────────

export type Theme = 'light' | 'dark';

export interface Finding {
  ruleId: string;
  selector: string;
  failureSummary: string;
}

/** An entry in the `marketing-site-a11y-gate.md` object schema. */
export interface BaselineObjectEntry {
  selector?: string;
  fingerprint?: string;
  criterion?: string;
  measured?: string;
  approvedBy?: string;
  approvedAt?: string;
  burnDown?: string;
  tracks?: string;
}

export type BaselineEntryValue = string | BaselineObjectEntry;

/** route → ruleId → entries */
export type RouteEntries = Record<string, Record<string, BaselineEntryValue[]>>;

export interface BaselineFile {
  complianceProfile?: ComplianceProfile;
  fingerprints?: RouteEntries;
  fingerprintsDark?: RouteEntries;
  routes?: RouteEntries;
  routesDark?: RouteEntries;
  [key: string]: unknown;
}

export interface CompiledBaseline {
  fingerprints: Record<Theme, Record<string, Record<string, Set<string>>>>;
  selectors: Record<Theme, Record<string, Record<string, Set<string>>>>;
}

/** One baseline entry that matched nothing this run. */
export interface BaselineEntry {
  scope: 'fingerprint' | 'selector';
  theme: Theme;
  routePath: string;
  ruleId: string;
  value: string;
}

export function normalizeSelector(selector: string): string;
export function contrastFingerprint(failureSummary: string): string | null;
export function fingerprintOf(finding: Finding): string | null;
export function isWellFormedFingerprint(value: string): boolean;
export function entryValue(entry: BaselineEntryValue): string;
export function compileBaseline(baseline: BaselineFile): CompiledBaseline;
export function isWaived(compiled: CompiledBaseline, theme: Theme, routePath: string, finding: Finding): boolean;
export function unmatchedEntries(
  compiled: CompiledBaseline,
  theme: Theme,
  routePath: string,
  findings: Finding[],
): BaselineEntry[];
export function orphanRoutes(baseline: BaselineFile, audited: Iterable<string>): string[];

// ── grade ───────────────────────────────────────────────────────────────────

export type ComplianceProfile = 'covered' | 'non-covered';
export type Tier = 'BLOCK' | 'TRACKED-DEBT' | 'ADVISORY';
export type GradeReason = 'impact' | 'best-practice' | 'net-new' | 'legal-floor' | 'baseline';

export interface GradableFinding extends Finding {
  impact: string;
  tags?: string[];
}

export interface Grade {
  tier: Tier;
  reason: GradeReason;
  /** Legal-floor WCAG criteria the finding sits on, e.g. `['1.4.3']`. */
  floor: string[];
}

export const BLOCKING_IMPACTS: Set<string>;
export const LEGAL_FLOOR_CRITERIA: Set<string>;
export const COMPLIANCE_PROFILES: ComplianceProfile[];
export function criteriaOf(tags?: string[]): string[];
export function resolveProfile(explicit: ComplianceProfile | undefined, baseline?: BaselineFile): ComplianceProfile;
export function gradeFinding(finding: GradableFinding, opts: { listed: boolean; profile: ComplianceProfile }): Grade;

// ── goto-rendered ───────────────────────────────────────────────────────────

export interface GotoRenderedOptions {
  waitUntil?: 'load' | 'domcontentloaded' | 'commit' | 'networkidle';
  /** Selector that must match exactly once. Default `'main'`; `null` skips. */
  renders?: string | null;
  /** Status the route must answer with. Default: any status below 400. */
  status?: number;
}

export function gotoRendered(page: Page, path: string, options?: GotoRenderedOptions): Promise<Response>;
export function expectMeasured(measured: number, label: string, what: string): void;

// ── audit ───────────────────────────────────────────────────────────────────

export const AXE_TAGS: string[];
export const DEFAULT_EXCLUDES: string[];

export interface AuditorConfig {
  baselinePath: string;
  complianceProfile?: ComplianceProfile;
  exclude?: string[];
  tags?: string[];
  theme?: (testInfo: TestInfo) => Theme;
  renders?: string | null;
  waitUntil?: GotoRenderedOptions['waitUntil'];
}

export interface GradedFinding extends GradableFinding, Grade {
  help: string;
}

export interface AuditResult {
  block: GradedFinding[];
  trackedDebt: GradedFinding[];
  advisory: GradedFinding[];
  staleBaseline: BaselineEntry[];
}

export interface Auditor {
  loadRoute(page: Page, routePath: string, options?: GotoRenderedOptions): Promise<Response>;
  auditPage(page: Page, testInfo: TestInfo, routeKey: string): Promise<AuditResult>;
  baseline: BaselineFile;
  profile: ComplianceProfile;
}

export interface SweepRoute {
  path: string;
  name: string;
  renders?: string | null;
  status?: number;
}

export interface RouteSweepConfig extends AuditorConfig {
  routes: SweepRoute[];
  title?: string;
  alsoAudited?: string[];
}

export function createAuditor(config: AuditorConfig): Auditor;
export function defineRouteSweep(config: RouteSweepConfig): Auditor;
