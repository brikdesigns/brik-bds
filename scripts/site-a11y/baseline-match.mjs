/**
 * Baseline matching for the shared site a11y gate — keyed on the violation,
 * not the selector.
 *
 * Lifted from brikdesigns `tests/a11y/lib/baseline-match.ts` (brikdesigns#1361,
 * #1447), the only site whose matcher had already been fixed for the two ways a
 * baseline rots. brik-llm#5076 moves it here so every client site consumes one
 * copy (ADR-051 D6).
 *
 * Why a colour-pair fingerprint and not a selector (brikdesigns#1361): any DOM
 * change re-roots axe's selector, so a selector-keyed waiver reads the same
 * already-accepted violation as new. On brikdesigns, 89 of 160 selector entries
 * (56%) had silently stopped matching. The identity of a contrast debt is its
 * colour pair, and a fingerprint of it survives a DOM change.
 *
 * Fingerprints stay ROUTE-scoped, never site-wide, so a new route that renders
 * the same debt still fails and needs a deliberate entry.
 *
 * The selector half (`routes` / `routesDark`) is the escape hatch for rules that
 * carry no colour. It is also the shape every site except brikdesigns used
 * before this module, so their `baseline.json` files load unchanged.
 *
 * An entry is a string, or an object in the `marketing-site-a11y-gate.md`
 * schema (`{ selector | fingerprint, criterion, approvedBy, ... }`). Only the
 * selector or fingerprint takes part in matching.
 */

/**
 * Axe emits positional indices like `:nth-child(3)` to point at a specific
 * node, but the underlying violation is usually identical across siblings.
 * Stripping them on both sides collapses repeats into one entry.
 */
export function normalizeSelector(selector) {
  return selector.replace(/:nth-child\(\d+\)/g, '').replace(/:nth-of-type\(\d+\)/g, '');
}

/**
 * The colour pair axe names in a `color-contrast` failure summary, as
 * `"<fg> on <bg>"`. Returns null when the summary carries no pair — every
 * non-contrast rule, and a contrast finding axe could not resolve a background
 * for. Hex is lower-cased; 6- and 8-digit (alpha) forms are both accepted.
 */
export function contrastFingerprint(failureSummary) {
  const match =
    /foreground color: (#[0-9a-f]{6}(?:[0-9a-f]{2})?), background color: (#[0-9a-f]{6}(?:[0-9a-f]{2})?)/i.exec(
      failureSummary,
    );
  if (!match) return null;
  return `${match[1].toLowerCase()} on ${match[2].toLowerCase()}`;
}

/** The stable identity of a finding, or null when it has none. */
export function fingerprintOf(finding) {
  if (finding.ruleId !== 'color-contrast') return null;
  return contrastFingerprint(finding.failureSummary);
}

/**
 * A well-formed fingerprint entry. A typo'd entry silently waives nothing
 * while reading in review as a waiver.
 */
export function isWellFormedFingerprint(value) {
  return /^#[0-9a-f]{6}([0-9a-f]{2})? on #[0-9a-f]{6}([0-9a-f]{2})?$/.test(value);
}

/** The matchable value of one baseline entry — a string, or an object entry's selector/fingerprint. */
export function entryValue(entry) {
  if (typeof entry === 'string') return entry;
  const value = entry?.fingerprint ?? entry?.selector;
  if (typeof value !== 'string') {
    throw new Error(
      `baseline entry ${JSON.stringify(entry)} has no "selector" or "fingerprint" — it would waive nothing while reading as a waiver`,
    );
  }
  return value;
}

function index(source, normalize) {
  const out = {};
  for (const [route, rules] of Object.entries(source)) {
    out[route] = {};
    for (const [ruleId, values] of Object.entries(rules)) {
      out[route][ruleId] = new Set(values.map((v) => normalize(entryValue(v))));
    }
  }
  return out;
}

export function compileBaseline(baseline) {
  const identity = (v) => v.toLowerCase();
  return {
    fingerprints: {
      light: index(baseline.fingerprints ?? {}, identity),
      dark: index(baseline.fingerprintsDark ?? {}, identity),
    },
    selectors: {
      light: index(baseline.routes ?? {}, normalizeSelector),
      dark: index(baseline.routesDark ?? {}, normalizeSelector),
    },
  };
}

/**
 * True when the finding is listed in the baseline for this route and theme.
 *
 * Fingerprint first: a contrast finding matches on its colour pair regardless
 * of where axe rooted the selector this run. The selector path only decides
 * findings that have no fingerprint.
 *
 * Listed is not the same as allowed — `grade.mjs` decides whether a listed
 * finding is debt or still blocks (the ADR-032 legal floor).
 */
export function isWaived(compiled, theme, routePath, finding) {
  const fingerprint = fingerprintOf(finding);
  if (fingerprint !== null) {
    return compiled.fingerprints[theme][routePath]?.[finding.ruleId]?.has(fingerprint) ?? false;
  }
  return (
    compiled.selectors[theme][routePath]?.[finding.ruleId]?.has(normalizeSelector(finding.selector)) ??
    false
  );
}

/**
 * The reverse of `isWaived`: entries that match NOTHING on this route + theme
 * (brikdesigns#1447).
 *
 * Two things make an entry stop matching, and they look the same in a diff:
 * the debt was paid and nobody removed the line, or a token under the colour
 * pair was re-pointed. Either way the entry now stands ready to re-accept a
 * defect silently, so a stale entry fails the run.
 *
 * `findings` must be the same population `isWaived` is consulted for — the
 * blocking-impact set. A wider set would call an entry live when it only
 * matches an advisory finding; a narrower one would report a working entry as
 * stale.
 */
export function unmatchedEntries(compiled, theme, routePath, findings) {
  const seenFingerprints = new Set();
  const seenSelectors = new Set();
  for (const f of findings) {
    const fingerprint = fingerprintOf(f);
    if (fingerprint !== null) seenFingerprints.add(`${f.ruleId} ${fingerprint}`);
    // Selector half only when there is NO fingerprint — the precedence
    // `isWaived` applies. The two must agree or an entry could read live here
    // and waive nothing there.
    else seenSelectors.add(`${f.ruleId} ${normalizeSelector(f.selector)}`);
  }

  const out = [];
  const sweep = (scope, source, seen) => {
    for (const [ruleId, values] of Object.entries(source[routePath] ?? {})) {
      for (const value of values) {
        if (!seen.has(`${ruleId} ${value}`)) {
          out.push({ scope, theme, routePath, ruleId, value });
        }
      }
    }
  };
  sweep('fingerprint', compiled.fingerprints[theme], seenFingerprints);
  sweep('selector', compiled.selectors[theme], seenSelectors);
  return out;
}

/**
 * Route keys in the baseline that no audited route covers (brikdesigns#1447).
 *
 * `unmatchedEntries` only speaks for routes the suite visits. An entry parked
 * under a renamed or dropped route is never evaluated and rots in silence.
 */
export function orphanRoutes(baseline, audited) {
  const covered = new Set(audited);
  const keys = ['fingerprints', 'fingerprintsDark', 'routes', 'routesDark'];
  const orphans = new Set();
  for (const key of keys) {
    for (const routePath of Object.keys(baseline[key] ?? {})) {
      if (!covered.has(routePath)) orphans.add(`${key}.${routePath}`);
    }
  }
  return [...orphans].sort();
}
