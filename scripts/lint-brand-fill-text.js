#!/usr/bin/env node
/**
 * lint-brand-fill-text — text ON the Poppy brand fill must be white.
 *
 * ADR-015 (§ Amendment 2026-09-12) + tokens/contrast-pairings.json:
 *   On --surface-/-background-brand-primary the on-color text is ALWAYS
 *   --text-on-color-dark (mode-invariant white), at normal weight. Darkening it
 *   to --text-primary, or using the theme-FLIPPING --text-inverse (white in
 *   light, BLACK in dark) on the mode-invariant Poppy fill, are DISALLOWED —
 *   both render dark text on the brand in dark mode, which passes contrast
 *   (black-on-Poppy is 5.55:1) but violates the brand rule the operator set.
 *
 * Why a POSITIVE lint (not the contrast gate): the contrast gate and axe ACCEPT
 * white-on-Poppy but also accept dark-on-Poppy, so neither FAILS when a
 * component darkens on-brand text — the exact reversion this closes (#2488). The
 * contrast gate scores token pairings, not "is the foreground the sanctioned
 * one." This asserts the sanctioned foreground.
 *
 * Rule: for any component CSS rule whose background is a brand-primary fill, any
 * `color:` on that rule OR on a descendant selector under it must be
 * --text-on-color-dark. Anything else (--text-inverse, --text-primary,
 * --text-secondary, --text-muted, a raw hex, …) is a violation.
 *
 * Escape hatch: `bds-lint-ignore` on the offending `color:` line (e.g. a genuine
 * nested surface inside a brand band that re-establishes its own light backdrop).
 *
 * Scope: foreground COLOR only. Bold-vs-normal on the fill is a size/role call
 * (labels/CTAs are legitimately bold); the small-body case is lint-brand-text-size.
 *
 * Usage: node scripts/lint-brand-fill-text.js   # exit 1 on any un-ignored violation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const COMPONENTS = path.join(ROOT, 'components');
const BRAND_FILL = /background(-color)?:\s*var\(--(surface|background)-brand-primary\)/;
const SANCTIONED_FG = '--text-on-color-dark';
// `color:` as its own property — NOT `background-color:` (which ends in "color:").
const COLOR_TOKEN = /(?:^|[;{\s])color:\s*var\((--[a-z0-9-]+)\)/i;

function componentCssFiles() {
  const out = execSync(
    `grep -rlE -e "(surface|background)-brand-primary" "${COMPONENTS}" || true`,
    { encoding: 'utf8' },
  );
  return out.split('\n').filter((f) => f && f.endsWith('.css'));
}

/** Flat {selector, body, bodyStart} rules. Inner rules of @media match too — the
 *  regex ignores the @media wrapper and keeps each real rule's own selector. */
function rules(css) {
  const noComments = css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
  const out = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(noComments))) {
    out.push({ selector: m[1].trim(), body: m[2], index: m.index });
  }
  return out;
}

/** A rule's `color:` sits ON/UNDER a brand fill if its selector equals a
 *  brand-fill selector or is a descendant of one (prefix + separator). */
function underBrandFill(selector, brandSelectors) {
  return brandSelectors.some(
    (bf) =>
      selector === bf ||
      selector.startsWith(`${bf} `) ||
      selector.startsWith(`${bf}.`) ||
      selector.startsWith(`${bf}:`) ||
      selector.startsWith(`${bf}>`),
  );
}

function main() {
  const violations = [];
  for (const file of componentCssFiles()) {
    const raw = fs.readFileSync(file, 'utf8');
    const rs = rules(raw);
    // Brand-fill container selectors (split comma groups).
    const brandSelectors = rs
      .filter((r) => BRAND_FILL.test(r.body))
      .flatMap((r) => r.selector.split(',').map((s) => s.trim()));
    if (brandSelectors.length === 0) continue;

    for (const r of rs) {
      const cm = r.body.match(COLOR_TOKEN);
      if (!cm) continue;
      const token = cm[1];
      if (token === SANCTIONED_FG) continue;
      // per-line escape hatch
      const colorLine = r.body.split('\n').find((l) => COLOR_TOKEN.test(l)) ?? '';
      if (colorLine.includes('bds-lint-ignore')) continue;
      for (const sel of r.selector.split(',').map((s) => s.trim())) {
        if (underBrandFill(sel, brandSelectors)) {
          violations.push({ file: path.relative(ROOT, file), selector: sel, token });
          break;
        }
      }
    }
  }

  if (violations.length) {
    console.error('✗ brand-fill-text: text on the Poppy brand fill must be --text-on-color-dark (white).\n');
    for (const v of violations) {
      console.error(`  ${v.file}\n    ${v.selector}\n    → color: var(${v.token})  (use var(--text-on-color-dark), or bds-lint-ignore a genuine nested surface)\n`);
    }
    console.error('ADR-015 § Amendment 2026-09-12 / tokens/contrast-pairings.json. --text-inverse flips BLACK in dark on the mode-invariant Poppy fill.');
    process.exit(1);
  }
  console.log('✓ brand-fill-text: on-brand text is --text-on-color-dark.');
}

main();
