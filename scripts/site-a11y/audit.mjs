import fs from 'node:fs';
import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

import { compileBaseline, isWaived, orphanRoutes, unmatchedEntries } from './baseline-match.mjs';
import { BLOCKING_IMPACTS, gradeFinding, resolveProfile } from './grade.mjs';
import { gotoRendered } from './goto-rendered.mjs';

/**
 * The shared site a11y gate (brik-llm#5076, ADR-051 D6).
 *
 * One axe pass, one baseline matcher and one ADR-032 grader for every Brik
 * client site. A site's spec supplies only what is its own: the route list,
 * site-specific exclusions, and where its baseline lives. Before this, six
 * sites each carried a copy of the same 100-200 lines, and the copies had
 * drifted — only brikdesigns had the fingerprint matcher and the stale-entry
 * ratchet, and none graded by compliance profile.
 */

/**
 * WCAG 2.1 AA — the standard in the compliance canon. Do not bump to 2.2 or
 * AAA without a review per rule.
 */
export const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

/**
 * Review tooling injected on Netlify previews only. None of it ships to
 * production, so auditing it would gate a site on markup it does not own.
 *
 * - `bfb-*` / `#brik-feedback` — the Brik feedback widget (its #fff on #e35335
 *   controls fail AA; tracked at brikdesigns/brik-client-portal#2581).
 * - Netlify Drawer and other netlify iframes — preview chrome.
 */
export const DEFAULT_EXCLUDES = [
  '[class^="bfb-"]',
  '[class*=" bfb-"]',
  '[id^="bfb"]',
  '#brik-feedback',
  'iframe[title="Netlify Drawer"]',
  'iframe[src*="netlify"]',
];

function readBaseline(baselinePath) {
  try {
    return JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
  } catch (err) {
    throw new Error(`site-a11y: cannot read baseline at ${baselinePath}: ${err.message}`);
  }
}

/**
 * Bind the gate to one site. Returns `{ loadRoute, auditPage, baseline, profile }`.
 *
 * Config:
 *   baselinePath       absolute path to the site's baseline.json (required)
 *   complianceProfile  'covered' | 'non-covered'. Default: the baseline's
 *                      `complianceProfile`, else 'covered' (ADR-032 fail-safe)
 *   exclude            extra selectors to exclude, on top of DEFAULT_EXCLUDES
 *   tags               axe tags. Default AXE_TAGS
 *   theme              (testInfo) => 'light' | 'dark'. Default 'light'
 *   renders, waitUntil defaults for `gotoRendered`
 */
export function createAuditor(config) {
  if (!config?.baselinePath) throw new Error('site-a11y: createAuditor needs a baselinePath');
  const baseline = readBaseline(config.baselinePath);
  const compiled = compileBaseline(baseline);
  const profile = resolveProfile(config.complianceProfile, baseline);
  const excludes = [...DEFAULT_EXCLUDES, ...(config.exclude ?? [])];
  const tags = config.tags ?? AXE_TAGS;
  const themeOf = config.theme ?? (() => 'light');

  /**
   * Navigate and prove the scan preconditions hold: the page rendered, and
   * reduced motion is in effect. `use: { reducedMotion }` is not a TestOptions
   * key — the config reads as correct while the preference is off in the page,
   * so the scan audits mid-fade colours no user sees (brik-llm#1776). Sites set
   * `use.contextOptions.reducedMotion: 'reduce'`; this asserts it took.
   */
  async function loadRoute(page, routePath, options = {}) {
    const response = await gotoRendered(page, routePath, {
      waitUntil: config.waitUntil,
      renders: config.renders,
      ...options,
    });
    expect(
      await page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches),
      'prefers-reduced-motion is not in effect — findings would be measured mid-animation. ' +
        'Check `use.contextOptions.reducedMotion` in playwright.config.ts.',
    ).toBe(true);
    return response;
  }

  /**
   * Run axe on the current page state and grade every finding. `routeKey` is
   * what the baseline is keyed on — for an interaction state, encode the state
   * (e.g. `/#mobile-nav-open`) so an entry for the open menu never covers the
   * closed one.
   */
  async function auditPage(page, testInfo, routeKey) {
    let builder = new AxeBuilder({ page }).withTags(tags);
    for (const selector of excludes) builder = builder.exclude(selector);
    const results = await builder.analyze();
    const theme = themeOf(testInfo);

    const findings = results.violations.flatMap((v) =>
      v.nodes.map((n) => ({
        ruleId: v.id,
        impact: v.impact ?? 'unknown',
        tags: v.tags,
        help: v.help,
        selector: Array.isArray(n.target) ? n.target.join(' >> ') : String(n.target),
        failureSummary: n.failureSummary ?? '',
      })),
    );

    const graded = findings.map((f) => ({
      ...f,
      ...gradeFinding(f, { listed: isWaived(compiled, theme, routeKey, f), profile }),
    }));
    const block = graded.filter((f) => f.tier === 'BLOCK');
    const debt = graded.filter((f) => f.tier === 'TRACKED-DEBT');
    const advisory = graded.filter((f) => f.tier === 'ADVISORY');
    const stale = unmatchedEntries(
      compiled,
      theme,
      routeKey,
      findings.filter((f) => BLOCKING_IMPACTS.has(f.impact)),
    );

    await testInfo.attach(`axe-report-${routeKey.replace(/[/#]/g, '_') || 'home'}-${theme}.json`, {
      body: JSON.stringify(
        { routeKey, theme, profile, block, trackedDebt: debt, advisory, staleBaseline: stale, total: findings.length },
        null,
        2,
      ),
      contentType: 'application/json',
    });

    if (block.length > 0) {
      const line = (f) =>
        f.reason === 'legal-floor'
          ? `  [${f.impact}] ${f.ruleId} → ${f.selector}\n    ${f.help}\n    listed in the baseline, but WCAG ${f.floor.join(', ')} is a legal-floor criterion and this site is graded "${profile}" — it cannot be carried as debt (ADR-032)`
          : `  [${f.impact}] ${f.ruleId} → ${f.selector}\n    ${f.help}`;
      expect(block, `BLOCK — serious/critical violations on ${routeKey} (${theme}):\n${block.map(line).join('\n')}`).toHaveLength(0);
    }

    if (stale.length > 0) {
      const summary = stale.map((e) => `  ${e.scope} ${e.ruleId} → ${e.value}`).join('\n');
      expect(
        stale,
        `Stale baseline entries on ${routeKey} (${theme}) — these matched no finding in this run, so ` +
          `they suppress nothing and must be deleted from the baseline:\n${summary}\n` +
          `If the defect was fixed, delete the entry in the same PR. If a selector merely moved, ` +
          `update it to the selector this run reports.`,
      ).toHaveLength(0);
    }

    return { block, trackedDebt: debt, advisory, staleBaseline: stale };
  }

  return { loadRoute, auditPage, baseline, profile };
}

/**
 * Register the first-paint sweep over a site's public routes: one test per
 * route, plus one that fails on a baseline route key no test audits.
 *
 * Config: everything `createAuditor` takes, plus
 *   routes       [{ path, name, renders?, status? }] — per-route overrides for
 *                `gotoRendered`
 *   title        describe() title. Default 'Public routes — WCAG 2.1 AA audit'
 *   alsoAudited  baseline route keys audited by another spec (e.g.
 *                `/#mobile-nav-open`), so they are not reported as orphans
 */
export function defineRouteSweep(config) {
  const { routes, title = 'Public routes — WCAG 2.1 AA audit', alsoAudited = [] } = config;
  if (!Array.isArray(routes) || routes.length === 0) {
    throw new Error('site-a11y: defineRouteSweep needs a non-empty routes list');
  }
  const auditor = createAuditor(config);

  test.describe(title, () => {
    for (const route of routes) {
      test(`${route.name} (${route.path}) has no blocking serious or critical violations`, async ({ page }, testInfo) => {
        const overrides = {};
        if ('renders' in route) overrides.renders = route.renders;
        if ('status' in route) overrides.status = route.status;
        await auditor.loadRoute(page, route.path, overrides);
        await auditor.auditPage(page, testInfo, route.path);
      });
    }

    test('every baseline route key is audited', () => {
      const orphans = orphanRoutes(auditor.baseline, [...routes.map((r) => r.path), ...alsoAudited]);
      expect(
        orphans,
        `Baseline keys no test audits — renamed or dropped routes. Delete or re-key them:\n  ${orphans.join('\n  ')}`,
      ).toEqual([]);
    });
  });

  return auditor;
}
