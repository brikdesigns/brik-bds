/**
 * ADR-032 grading for the shared site a11y gate.
 *
 * | Tier           | Trigger                                                     | Effect       |
 * |----------------|-------------------------------------------------------------|--------------|
 * | `BLOCK`        | serious/critical WCAG A/AA finding not in the baseline       | fails the run |
 * | `TRACKED-DEBT` | serious/critical finding listed in the baseline              | ships, reported |
 * | `ADVISORY`     | moderate/minor, or `best-practice`-tagged with no criterion | never blocks |
 *
 * Compliance profile (`brik-llm/.claude/references/marketing-site-a11y-gate.md`):
 * for a COVERED site, a legal-floor criterion admits no debt — a listed finding
 * on one still BLOCKs. A site that declares no profile is graded as covered,
 * the fail-safe ADR-032 sets.
 *
 * The legal floor is matched on the WCAG criterion tags axe puts on each rule
 * (`wcag143` → 1.4.3), not on a hand-kept rule list, so a rule axe adds later
 * under a floor criterion is covered without an edit here. Three floor
 * criteria — 1.4.11, 2.4.7 and 3.3.1 — have no axe rule in axe-core 4.11, so
 * this gate cannot see them; they stay in the set for when one ships.
 */

export const BLOCKING_IMPACTS = new Set(['critical', 'serious']);

/** WCAG 2.1 AA criteria that admit no debt allowance for a covered site (ADR-032). */
export const LEGAL_FLOOR_CRITERIA = new Set([
  '1.1.1', // non-text content
  '1.4.3', // contrast (minimum)
  '1.4.11', // non-text contrast
  '2.1.1', // keyboard
  '2.4.7', // focus visible
  '3.1.1', // language of page
  '3.3.1', // error identification
  '4.1.2', // name, role, value
]);

export const COMPLIANCE_PROFILES = ['covered', 'non-covered'];

/**
 * The WCAG success criteria an axe tag list names, e.g. `['wcag2aa', 'wcag143']`
 * → `['1.4.3']`. Principle and guideline are one digit each in WCAG 2.x, so the
 * remainder is the criterion: `wcag1411` → 1.4.11.
 */
export function criteriaOf(tags = []) {
  const out = [];
  for (const tag of tags) {
    const m = /^wcag(\d)(\d)(\d{1,2})$/.exec(tag);
    if (m) out.push(`${m[1]}.${m[2]}.${m[3]}`);
  }
  return out;
}

/**
 * The profile the gate grades against: the spec's explicit value, else the
 * baseline file's `complianceProfile`, else `covered`.
 */
export function resolveProfile(explicit, baseline = {}) {
  const profile = explicit ?? baseline.complianceProfile ?? 'covered';
  if (!COMPLIANCE_PROFILES.includes(profile)) {
    throw new Error(
      `complianceProfile "${profile}" is not one of ${COMPLIANCE_PROFILES.join(' | ')} — refusing to guess how to grade`,
    );
  }
  return profile;
}

/**
 * Grade one finding. `listed` is whether the baseline lists it
 * (`isWaived`). Returns `{ tier, reason, floor }` where `floor` is the
 * legal-floor criteria the finding sits on.
 */
export function gradeFinding(finding, { listed, profile }) {
  const criteria = criteriaOf(finding.tags);
  const floor = criteria.filter((c) => LEGAL_FLOOR_CRITERIA.has(c));
  if (!BLOCKING_IMPACTS.has(finding.impact)) return { tier: 'ADVISORY', reason: 'impact', floor };
  if ((finding.tags ?? []).includes('best-practice') && criteria.length === 0) {
    return { tier: 'ADVISORY', reason: 'best-practice', floor };
  }
  if (!listed) return { tier: 'BLOCK', reason: 'net-new', floor };
  if (profile === 'covered' && floor.length > 0) return { tier: 'BLOCK', reason: 'legal-floor', floor };
  return { tier: 'TRACKED-DEBT', reason: 'baseline', floor };
}
