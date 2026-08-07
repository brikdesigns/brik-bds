#!/usr/bin/env node

/**
 * Disabled-treatment check — every disabled-scoped rule implements one of
 * ADR-028's two mechanisms, and the fade always reads the token.
 *
 * ADR-028 chose the disabled treatment by one structural property: a control
 * that paints its own fill uses the **token swap** (`--background-disabled` /
 * `--text-disabled` / `--border-disabled`, pt-1); a control with no fill of its
 * own uses the **opacity fade** standardised on `var(--state-disabled-opacity)`
 * (pt-2). `color: var(--text-muted)` with no fill change is explicitly NOT a
 * third mechanism (pt-4) — it darkens the label toward a backdrop that stays
 * put, which is the fade's failure mode written by hand.
 *
 * #1687 landed that rule across the cohort: the token moved 0.4 → 0.5 (the
 * measured floor), all 30 disabled-scoped `opacity` rules were pointed at it,
 * and the muted-text swap was retired from NavItem / DatePicker / Stepper.
 *
 * Nothing kept it that way. `contrast-gate` scores the token's *value* — the
 * `alpha` field #1687 added to `tokens/contrast-pairings.json` composites the
 * fade and fails below AA-large — but it cannot see whether a component still
 * *reads* the token. And the visual gate cannot see it either: ADR-010 Q2 makes
 * `disabled` an `argTypes` control rather than a story, so 27 of the 28
 * disabled states have no baseline to move (#1697). A component that hardcoded
 * `opacity: 0.4` again, or dropped the fade entirely, would pass every gate in
 * the repo. This is that gate — the structural half of the pair, asserting the
 * mechanism where `contrast-gate` asserts the number.
 *
 * Classification is selector-scoped, the same way ADR-028's inventory was
 * measured: `:not(…)` groups are stripped before the selector is tested, so
 * `:hover:not(:disabled)` is an ENABLED rule and its `opacity: 0.5` is not a
 * disabled literal. TabBar alone carries six of those.
 *
 * Verdicts are per component (per CSS file), not per rule. A disabled-scoped
 * rule that only sets `cursor: not-allowed`, suppresses a hover, or repaints a
 * slider thumb is SUPPORTING — it needs no mechanism of its own, because the
 * mechanism lives on the component's root rule in the same file.
 *
 * Usage:
 *   node scripts/lint-disabled-fade.mjs           # gate; exit 1 on a violation
 *   node scripts/lint-disabled-fade.mjs --report  # full inventory, always exit 0
 *   node scripts/lint-disabled-fade.mjs --json    # machine-readable verdicts
 *   node scripts/lint-disabled-fade.mjs --root <dir>   # point at a fixture tree
 *
 * Escape hatch: `bds-lint-ignore disabled-fade — <reason>` on the offending
 * declaration line. A bare marker is rejected (#1469) — an ungated bypass of a
 * gate is not a gate.
 *
 * brik-bds#1697 (ADR-028 § Amendment 2026-08-06).
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import lintIgnore from './lib/bds-lint-ignore.cjs';

const { isBareLintIgnore, lintIgnoreReason, BARE_IGNORE_MESSAGE } = lintIgnore;

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** `--flag value` override, so the suite can point the gate at fixtures. */
function argValue(flag) {
  const i = process.argv.indexOf(flag);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : null;
}

const SCAN_ROOT = argValue('--root') ?? join(ROOT, 'components', 'ui');
const reportMode = process.argv.includes('--report');
const jsonMode = process.argv.includes('--json');

const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';
const DIM = '\x1b[2m';
const NC = '\x1b[0m';

/** The one token the fade is allowed to read (ADR-028 pt-2). */
const FADE_TOKEN = '--state-disabled-opacity';
/** The token-swap trio (ADR-028 pt-1). */
const SWAP_TOKENS = [
  '--background-disabled',
  '--text-disabled',
  '--border-disabled',
];

/**
 * A `background` value that paints nothing. `currentColor` is deliberately NOT
 * here: it resolves to the label colour and is a fill.
 */
const NO_FILL = /^(transparent|none|inherit|initial|unset|revert|revert-layer)$/i;

/**
 * Backdrop tokens — a control painting one of these is materialising the
 * surface it sits on, not painting a fill of its own, so it stays on the fade.
 * ADR-028 pt-2 already says this in prose ("the page or an ancestor surface
 * shows through — inputs, checkboxes, radios, switches"); a `TextInput` reading
 * `--background-input` IS that sentence expressed as a token.
 *
 * Ratified in ADR-028 § Amendment 2026-08-07. This list is the ADR's, not the
 * gate's — extend it there first. Without it RULE C reports 13 components that
 * pt-2 explicitly covers, which is how a gate ends up fitted around the tree
 * instead of the rule.
 */
const SURFACE_TOKENS = [
  '--background-primary',
  '--background-input',
  '--text-input-bg',
];
const isSurfaceFill = (value) =>
  SURFACE_TOKENS.some((t) => value.includes(`var(${t})`)) || /var\(--surface-/.test(value);

/**
 * Selector tokens that make a rule a *state* fill rather than a resting one.
 * ADR-028's property is the fill the control paints at rest — a hover overlay
 * or a checked-only fill is not what composites under the fade.
 */
const STATE_SELECTOR =
  /:hover|:active|:focus|:checked|:target|\[aria-(selected|checked|expanded|current)|\[data-state|--(selected|active|checked|current|open|pressed|dragging)\b/;

/** `.css` files under the scan root, one component per directory. */
function cssFiles(root) {
  const out = [];
  for (const entry of readdirSync(root).sort()) {
    const dir = join(root, entry);
    if (!statSync(dir).isDirectory()) continue;
    for (const file of readdirSync(dir).sort()) {
      if (file.endsWith('.css')) out.push({ component: entry, path: join(dir, file) });
    }
  }
  return out;
}

/**
 * A selector is disabled-scoped when the token `disabled` survives stripping
 * `:not(…)` groups. Without the strip, `:hover:not(:disabled)` reads as a
 * disabled rule and every enabled hover opacity in TabBar looks like a
 * hardcoded fade.
 */
function isDisabledScoped(selector) {
  const bare = selector.replace(/:not\([^)]*\)/g, '');
  return /:disabled|\[disabled\]|aria-disabled|--disabled/.test(bare);
}

/** 1-indexed line of `index` within `source`. */
function lineOf(source, index) {
  return source.slice(0, index).split('\n').length;
}

/**
 * Flat top-level rule scan. Declaration blocks in this repo's component CSS are
 * never nested (no native CSS nesting; `@media` wraps whole rules), so a
 * non-greedy `{…}` match is sufficient and needs no parser dependency.
 */
function disabledRules(css) {
  const rules = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(css)) !== null) {
    const selector = m[1].replace(/\/\*[\s\S]*?\*\//g, '').trim();
    if (!selector || selector.startsWith('@')) continue;
    if (!isDisabledScoped(selector)) continue;
    rules.push({
      selector: selector.split('\n').map((s) => s.trim()).filter(Boolean).join(' '),
      body: m[2],
      line: lineOf(css, m.index + m[1].length),
    });
  }
  return rules;
}

/**
 * The BEM base element(s) a selector's rightmost compound targets, with
 * `--modifier` suffixes and pseudos stripped: `.bds-tag--solid.bds-tag--disabled`
 * → `bds-tag`, `.bds-segmented-control-item:disabled` → `bds-segmented-control-item`.
 *
 * pt-1 asks whether the control paints ITS OWN fill, which means the fill and
 * the disabled state have to land on the same element. SegmentedControl is why:
 * its track paints `--background-secondary` but only the ITEM ever goes
 * disabled, and that item is transparent. Matching on the file alone called it
 * a violation; it is a correctly-faded fill-less control sitting on a filled
 * parent, and converting it would have repainted a track nothing disabled.
 */
function baseElements(selector) {
  const compound = selector.trim().split(/\s*[>+~]\s*|\s+/).pop() ?? '';
  const classes = compound.match(/\.[A-Za-z0-9_-]+/g) ?? [];
  return new Set(classes.map((c) => c.slice(1).split('--')[0]));
}

/**
 * The `--modifier` names a selector's rightmost compound carries, minus the
 * disabled state itself. Two rules that each name a modifier, and share none,
 * are talking about different variants of the same element.
 *
 * Tag is why: after #1701 its `--subtle` variant fades (transparent, an outline)
 * while `--solid` and `--muted` swap. All three are `.bds-tag`, so element
 * matching alone reports the swapped variants as violations of the faded one.
 * An empty set means the rule is variant-agnostic and applies to all of them.
 */
function variantModifiers(selector) {
  const compound = selector.trim().split(/\s*[>+~]\s*|\s+/).pop() ?? '';
  const classes = compound.match(/\.[A-Za-z0-9_-]+/g) ?? [];
  return new Set(
    classes
      .map((c) => c.slice(1).split('--')[1])
      .filter((mod) => mod && mod !== 'disabled'),
  );
}

/** Do a fill rule and a fade rule describe the same variant? */
function sameVariant(fillSel, fadeSel) {
  const a = variantModifiers(fillSel);
  const b = variantModifiers(fadeSel);
  if (a.size === 0 || b.size === 0) return true;
  return [...a].some((mod) => b.has(mod));
}

/**
 * Every rule in a file that paints a background, split by whether the fill is
 * resting or state-only. This is the pt-1 predicate — "does the control paint
 * its own fill" — which nothing in the repo measured: ADR-028's 26/3 inventory
 * came from scanning for disabled-scoped `opacity` rules, so it partitioned by
 * the mechanism components already had rather than by the property the decision
 * rule names (#1701).
 *
 * Disabled-scoped rules are skipped: a `--background-disabled` repaint IS the
 * swap, and counting it as evidence of a fill would make every swapped
 * component its own violation.
 *
 * Longhand only where it matters — `background: <color>` and `background-color`
 * both count, but a `background-image` / gradient is left out. It paints, but it
 * is not a flat fill the contrast measurement can score, so folding it in here
 * would put components into the cohort that `measure-disabled-contrast.mjs`
 * cannot then evaluate.
 */
function fillRules(css) {
  const rest = [];
  const state = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(css)) !== null) {
    const selector = m[1].replace(/\/\*[\s\S]*?\*\//g, '').trim();
    if (!selector || selector.startsWith('@')) continue;
    if (isDisabledScoped(selector)) continue;

    for (const decl of m[2].split(';').map((d) => d.trim()).filter(Boolean)) {
      const bg = /^background(-color)?\s*:\s*(.+)$/i.exec(
        decl.replace(/\/\*[\s\S]*?\*\//g, '').trim(),
      );
      if (!bg) continue;
      const value = bg[2].trim();
      if (NO_FILL.test(value)) continue;
      // `var(--x, transparent)` paints nothing until the var lands; treat the
      // fallback as the value, the same way `classify` treats an opacity one.
      const fallback = /^var\([^,]+,\s*(.+)\)$/.exec(value);
      if (fallback && NO_FILL.test(fallback[1].trim())) continue;

      const flat = selector.split('\n').map((s) => s.trim()).filter(Boolean).join(' ');
      // Root vs sub-part, read off the BEM selector: a fill on `__element` or a
      // pseudo-element is a part of the control, not the control's own fill.
      // Mechanical, so the report stays an observation — which token counts as a
      // "fill" rather than a surface is ADR-028's call to make, not this gate's.
      const last = flat.split(/\s+/).pop();
      const hit = {
        selector: flat,
        value,
        scope: last.includes('__') || last.includes('::') ? 'sub-part' : 'root',
        elements: baseElements(flat),
        line: lineOf(css, m.index + m[1].length),
      };
      (STATE_SELECTOR.test(selector) ? state : rest).push(hit);
    }
  }
  return { rest, state };
}

/**
 * Classify one disabled-scoped declaration block:
 *   `fade`       — reads the fade token, ADR-028 pt-2 ✓
 *   `literal`    — an opacity the token does not own (RULE A violation)
 *   `swap`       — repaints with the disabled trio, ADR-028 pt-1 ✓
 *   `muted`      — `color: var(--text-muted)` and no fill change (pt-4 drift)
 *   `supporting` — cursor / hover suppression / thumb paint; no mechanism owed
 * Order matters: a block that reads the token is a fade even if it also sets
 * `cursor`, and a literal is a violation even alongside a swap.
 */
function classify(body) {
  const decls = body
    .split(';')
    .map((d) => d.trim())
    .filter(Boolean);

  for (const decl of decls) {
    const opacity = /^opacity\s*:\s*(.+)$/i.exec(
      decl.replace(/\/\*[\s\S]*?\*\//g, '').trim(),
    );
    if (!opacity) continue;
    const value = opacity[1].trim();
    // A fallback (`var(--x, 0.4)`) is a literal in disguise: it survives the
    // token being renamed away, which is the regression this rule exists for.
    if (value === `var(${FADE_TOKEN})`) return { kind: 'fade', decl };
    return { kind: 'literal', decl, value };
  }

  if (SWAP_TOKENS.some((t) => body.includes(`var(${t})`))) {
    return { kind: 'swap' };
  }
  if (/color\s*:\s*var\(--text-muted\)/.test(body)) {
    return { kind: 'muted' };
  }
  return { kind: 'supporting' };
}

/** The `bds-lint-ignore` line covering a declaration, if any. */
function ignoreFor(css, rule, decl) {
  const lines = css.split('\n');
  // Search the rule's own lines for the declaration, then read its ignore.
  for (let i = rule.line - 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (decl && line.includes(decl.split(':')[0].trim()) && line.includes('bds-lint-ignore')) {
      return { line: i + 1, reason: lintIgnoreReason(line), bare: isBareLintIgnore(line) };
    }
    if (line.includes('}')) break;
  }
  return null;
}

const files = cssFiles(SCAN_ROOT);
/** component → { mechanisms:Set, rules:[{…, kind}] } */
const inventory = new Map();
const violations = [];

for (const { component, path } of files) {
  const css = readFileSync(path, 'utf8');
  const rel = relative(ROOT, path);
  const fills = fillRules(css);
  for (const rule of disabledRules(css)) {
    const verdict = classify(rule.body);
    const entry = inventory.get(component) ?? { mechanisms: new Set(), rules: [], fills };
    entry.fills = fills;
    entry.rules.push({ ...rule, ...verdict, file: rel });
    if (verdict.kind === 'fade') entry.mechanisms.add('fade');
    if (verdict.kind === 'swap') entry.mechanisms.add('swap');
    inventory.set(component, entry);

    if (verdict.kind === 'literal' || verdict.kind === 'muted') {
      const ignore = verdict.decl ? ignoreFor(css, rule, verdict.decl) : null;
      if (ignore && !ignore.bare) {
        // A reasoned hatch exempts the component from RULE B as well. Without
        // this the hatch is not a hatch: suppressing the literal leaves the
        // component with no mechanism, and the next rule fires on it anyway.
        entry.mechanisms.add('exempt');
        continue;
      }
      violations.push({
        rule: verdict.kind === 'literal' ? 'hardcoded-disabled-opacity' : 'muted-text-swap',
        component,
        file: rel,
        line: rule.line,
        selector: rule.selector,
        detail:
          verdict.kind === 'literal'
            ? `opacity: ${verdict.value}`
            : 'color: var(--text-muted) with no fill change',
        bareIgnore: Boolean(ignore?.bare),
      });
    }
  }
}

// RULE B — a component with disabled-scoped CSS must resolve to a mechanism.
// Supporting rules alone are not a treatment: they style a disabled control
// that nothing actually marks as disabled.
for (const [component, entry] of [...inventory].sort()) {
  if (entry.mechanisms.size > 0) continue;
  // A literal or a muted swap already reported on this component is the same
  // root cause; a second line about the missing mechanism is noise.
  if (violations.some((v) => v.component === component)) continue;
  const first = entry.rules[0];
  violations.push({
    rule: 'no-disabled-mechanism',
    component,
    file: first.file,
    line: first.line,
    selector: first.selector,
    detail: `${entry.rules.length} disabled-scoped rule(s), none reading var(${FADE_TOKEN}) or the ${SWAP_TOKENS.join(' / ')} trio`,
    bareIgnore: false,
  });
}

const fadeCohort = [...inventory]
  .filter(([, e]) => e.mechanisms.has('fade'))
  .map(([c]) => c)
  .sort();
const swapCohort = [...inventory]
  .filter(([, e]) => e.mechanisms.has('swap'))
  .map(([c]) => c)
  .sort();
const fadeRules = [...inventory].flatMap(([, e]) => e.rules.filter((r) => r.kind === 'fade'));

// RULE C — a fading component that paints its OWN resting fill, on the SAME
// element and variant that fades, is on the wrong mechanism (ADR-028 pt-1).
//
// Enforced only for a fill at the component root painting a non-surface token;
// that is the boundary ADR-028 § Amendment 2026-08-07 ratifies, and the set
// #1701 converted (Chip, Tag solid/muted). Two narrower populations stay
// report-only because the ADR has not ruled on them — see #1742:
//   - sub-part fills (Pagination's arrow, Slider's track) — a fill inside a
//     faded subtree, where nothing has measured whether the parent's single
//     opacity is the same defect or an acceptable composition
//   - surface-token fills, which pt-2 covers in prose
// Reporting them while gating only the ratified half is deliberate: silently
// dropping them would read as "covered", and gating them would be this gate
// inventing a boundary the ADR never set.
const ruleCCandidates = [...inventory]
  .map(([component, e]) => {
    if (!e.mechanisms.has('fade')) return null;
    // The elements that actually fade, so a fill only counts when it lands on
    // one of them (see baseElements).
    const fadeRulesHere = e.rules.filter((r) => r.kind === 'fade');
    const own = (e.fills?.rest ?? []).filter((f) =>
      fadeRulesHere.some(
        (r) =>
          [...baseElements(r.selector)].some((el) => f.elements.has(el)) &&
          sameVariant(f.selector, r.selector),
      ),
    );
    return own.length ? [component, { ...e, ownFills: own }] : null;
  })
  .filter(Boolean)
  .sort();

// The enforced subset. Everything else in ruleCCandidates is reported, not gated.
for (const [component, entry] of ruleCCandidates) {
  for (const f of entry.ownFills) {
    if (f.scope !== 'root' || isSurfaceFill(f.value)) continue;
    const fade = entry.rules.find((r) => r.kind === 'fade');
    violations.push({
      rule: 'fill-bearing-fader',
      component,
      file: fade.file,
      line: f.line,
      selector: f.selector,
      detail:
        `paints ${f.value} at its root, then fades at ${fade.file}:${fade.line} — ` +
        `ADR-028 pt-1 puts a control that paints its own fill on the ` +
        `${SWAP_TOKENS.join(' / ')} trio, because opacity moves the label and the ` +
        'fill toward the same backdrop',
      bareIgnore: false,
    });
  }
}
// A fading component whose only fill is state-scoped is pt-2-correct today, but
// it is the population that flips if #1701 widens the predicate — so it is
// listed separately rather than silently dropped.
const stateOnlyFills = [...inventory]
  .filter(([, e]) => e.mechanisms.has('fade') && !e.fills?.rest.length && e.fills?.state.length)
  .sort();

if (jsonMode) {
  console.log(
    JSON.stringify(
      {
        fadeCohort,
        swapCohort,
        fadeRuleCount: fadeRules.length,
        ruleCCandidates: ruleCCandidates.map(([component, e]) => ({
          component,
          restFills: e.ownFills.map((f) => ({
            selector: f.selector,
            value: f.value,
            scope: f.scope,
            line: f.line,
          })),
        })),
        stateOnlyFills: stateOnlyFills.map(([component]) => component),
        violations,
      },
      null,
      2,
    ),
  );
  process.exit(violations.length > 0 ? 1 : 0);
}

if (reportMode) {
  console.log('\n♿ Disabled treatments by component (ADR-028)\n');
  console.log(
    `  ── opacity fade (pt-2) ── ${DIM}${fadeCohort.length} component(s), ${fadeRules.length} rule(s)${NC}`,
  );
  for (const component of fadeCohort) {
    const rules = inventory.get(component).rules.filter((r) => r.kind === 'fade');
    console.log(`   ${GREEN}✓${NC} ${component} ${DIM}${rules.map((r) => `${r.file}:${r.line}`).join(', ')}${NC}`);
  }
  console.log(`\n  ── token swap (pt-1) ── ${DIM}${swapCohort.length} component(s)${NC}`);
  for (const component of swapCohort) {
    const rules = inventory.get(component).rules.filter((r) => r.kind === 'swap');
    console.log(`   ${GREEN}✓${NC} ${component} ${DIM}${rules.map((r) => `${r.file}:${r.line}`).join(', ')}${NC}`);
  }

  console.log(
    `\n  ── RULE C candidates: fading, but paint a RESTING fill ── ${DIM}${ruleCCandidates.length} component(s)${NC}`,
  );
  console.log(
    `  ${DIM}ADR-028 pt-1 says these belong on the token swap. Report-only pending #1701.${NC}`,
  );
  for (const [component, entry] of ruleCCandidates) {
    const fade = entry.rules.find((r) => r.kind === 'fade');
    console.log(`   ${YELLOW}▸${NC} ${component} ${DIM}fades at ${fade.file}:${fade.line}${NC}`);
    for (const f of entry.ownFills) {
      console.log(
        `       ${DIM}${f.line}:${NC} [${f.scope}] ${f.selector} ${DIM}→${NC} ${f.value}`,
      );
    }
  }

  console.log(
    `\n  ── fading, state-only fill (pt-2-correct today) ── ${DIM}${stateOnlyFills.length} component(s)${NC}`,
  );
  console.log(`   ${DIM}${stateOnlyFills.map(([c]) => c).join(', ') || '(none)'}${NC}`);
  console.log('');
}

if (violations.length === 0) {
  console.log(
    `${GREEN}✓${NC} lint-disabled-fade: ${fadeCohort.length} faded + ${swapCohort.length} swapped component(s), every disabled rule on an ADR-028 mechanism.`,
  );
  process.exit(0);
}

console.log(`\n${RED}✗ lint-disabled-fade: ${violations.length} violation(s)${NC}\n`);
for (const v of violations) {
  console.log(`  ${v.file}:${v.line}  ${RED}${v.rule}${NC}  ${DIM}${v.component}${NC}`);
  console.log(`      ${DIM}selector:${NC} ${v.selector}`);
  console.log(`      ${v.detail}`);
  if (v.bareIgnore) console.log(`      ${YELLOW}${BARE_IGNORE_MESSAGE}${NC}`);
}
console.log(
  `\n${YELLOW}  A disabled state has no pixel baseline to move: ADR-010 Q2 makes \`disabled\`${NC}\n` +
    `${YELLOW}  an argTypes control, not a story, so the visual gate cannot see any of this${NC}\n` +
    `${YELLOW}  (#1697). \`contrast-gate\` scores the token's VALUE; only this gate scores${NC}\n` +
    `${YELLOW}  whether components still read it.${NC}\n\n` +
    `  Fix: use \`opacity: var(${FADE_TOKEN})\` for a control with no fill of its\n` +
    `  own, or the ${SWAP_TOKENS.join(' / ')} trio\n` +
    '  for one that paints its own fill (ADR-028 pt-1/pt-2). If the control needs\n' +
    '  neither, add `bds-lint-ignore disabled-fade — <reason>` on the declaration.\n',
);
process.exit(1);
