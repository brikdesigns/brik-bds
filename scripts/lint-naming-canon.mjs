#!/usr/bin/env node
/**
 * lint-naming-canon — enforce ADR-033's vocabulary: one word per concept, one
 * prop name per axis, one step vocabulary per tier.
 *
 * ── Why this exists ────────────────────────────────────────────────────────
 *
 * ADR-008/017/030 govern the *shape* of a name and token-anatomy governs its
 * *structure*. Nothing governed the *words*, so every component and token was
 * free to invent a synonym for a concept the system already had a word for —
 * and every existing gate passed, because the shape was correct. `negative` has
 * four spellings (`error`, `negative`, `danger`, `destructive`),
 * `--box-shadow-md` is a blur length at one line and a shadow list at another,
 * and `.bds-banner--tone-error` sits beside `.bds-badge--error`.
 *
 * ADR-033 closes those lists. This gate is what stops them re-opening — it is
 * #1910 AC #5, and ADR-033 § Enforcement is its spec.
 *
 * ── The six rules (ADR-033 § Enforcement) ──────────────────────────────────
 *
 *   1  step        A token's step falls outside its family's vocabulary (§ 3)
 *                  and is not a § Named exception. Reads dist/tokens.css.
 *   2  type        One name defined twice with different value TYPES (§ 5's
 *                  `--box-shadow-md` class). Reads dist/tokens.css.
 *   3  union       A prop union mixes axes from § 2's table, or carries a
 *                  § Retired valence word. Reads components/ui/**\/*.tsx.
 *   4  modifier    A BEM modifier with no axis prefix (§ 4), or a retired
 *                  word. Reads components/ui/**\/*.css. Exempts a bare
 *                  service-line modifier on a block that emits from a
 *                  `ServiceLine` value — § 4's named exception, #1982.
 *   5  vocabulary  A word in a governed axis position that is on no closed
 *                  list — § 6's default-deny. Reads both.
 *   6  reference   A `var(--*-status-*)` consumption of the family § Token
 *                  families retired and #1958 deleted. Reads components/,
 *                  content-system/, lib/, docs-site/.
 *
 * ── Why rule 6 reads references, when 1-5 read names ───────────────────────
 *
 * Rules 1-5 judge a name at the site that DECLARES it, which is the right unit
 * for a word that is merely wrong. It is the wrong unit for a word that is
 * gone. Deleting `--background-status-error` does not break a build: an
 * unresolvable custom property is not a CSS error, so `background: var(--back
 * ground-status-error)` renders transparent and ships. #1958 deleted twenty
 * such names, and the only thing that can catch the twenty-first typo is a gate
 * reading the consumption side.
 *
 * ── Why rule 2 is not lint-token-shadowing ─────────────────────────────────
 *
 * `lint-token-shadowing` asks "is one name declared twice with different
 * values", is type-blind, and ACCEPTS a `bds-lint-ignore` marker on the winner.
 * That is why `--box-shadow-md` is green there: the override is deliberate and
 * marked. Rule 2 asks the narrower, harder question — do the two declarations
 * have different value *types* — and does NOT honour the marker, because a
 * consumer reading line 329 concludes `--box-shadow-md` is a length and is
 * wrong no matter how deliberate the override is. A marked override of a value
 * is a decision; a marked override of a *type* is a name carrying two concepts.
 *
 * Rule 2 therefore resolves `var()` transitively before classifying. Skipping
 * refs is what makes the exemplar invisible: `--box-shadow-md: 8px` (length) vs
 * `--box-shadow-md: var(--shadow-md)` reads as one type until the ref resolves
 * to `0px 4px 12px 0px rgba(...)`.
 *
 * ── Sibling gates, and why this is none of them ────────────────────────────
 *
 * ADR-033 § Enforcement names the five this must not duplicate:
 *   - lint-token-purpose-slots  → does the SLOT ship documented (structure).
 *   - lint-token-shadowing      → one name declared twice (value, type-blind).
 *   - slot-pattern-check        → modifier SHAPE, by regex, not vocabulary.
 *   - lint-component-props      → docs match source.
 *   - lint-mdx-tokens           → phantom token names in docs.
 * This one governs the WORDS, which none of them read.
 *
 * ── The baseline, and why it can only shrink ────────────────────────────────
 *
 * All five rules are red on `main` today — 22 step words, 6 type collisions, 17
 * mixed-or-retired unions, 197 bare-or-retired modifiers, 4 default-deny words.
 * A gate that fails `main` on merge is not shippable, so all 246 are listed in
 * `tokens/naming-canon-baseline.json`, each keyed to the remediation issue that
 * burns it down (#1909, #1910, #1923–#1927).
 *
 * The baseline is a countdown, not a carve-out. A stale entry — one that no
 * longer violates — is itself a failure, so an entry cannot outlive its fix and
 * the file can only shrink. That is the difference between an allowlist with an
 * owner and the drift this ADR exists to stop.
 *
 * ── The baseline is a SNAPSHOT, and that races the merge queue ──────────────
 *
 * A violation absent from the baseline fails, which is the point — but the
 * baseline is generated against one commit. If another PR lands a new violation
 * between generation and merge, both PRs are individually green and `main` goes
 * red on the merge, with no conflict to block it. That is #1961: #1952's branch
 * was cut before #1953 landed two bare Breadcrumb modifiers, so its baseline
 * never listed them.
 *
 * The fix is branch protection — require branches up to date before merging, so
 * this gate re-runs against the merge RESULT. Do not "fix" it by downgrading an
 * unbaselined violation to a warning: that lets a genuinely new violation reach
 * `main` unnoticed, which is the whole failure the gate exists to prevent.
 *
 * ── CLI ────────────────────────────────────────────────────────────────────
 *   node scripts/lint-naming-canon.mjs              all five rules
 *   node scripts/lint-naming-canon.mjs --rule 3     one rule
 *   node scripts/lint-naming-canon.mjs --json       machine-readable
 *   node scripts/lint-naming-canon.mjs --census     every finding, baselined too
 *   node scripts/lint-naming-canon.mjs --no-baseline  ignore the baseline
 *   node scripts/lint-naming-canon.mjs --tokens <f> --components <dir>
 *
 * Exit 0 = clean, 1 = a violation or a stale baseline entry, 2 = the check
 * broke. Exit 2 matters: a parse that finds nothing must never read as clean
 * (`gate-scanned-nothing-reports-clean`), so every denominator is asserted.
 *
 * Issue: brikdesigns/brik-bds#1936 (#1910 AC #5)
 * Spec:  docs/adrs/ADR-033-naming-canon-one-word-per-concept.md § Enforcement
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { SLOT_REGISTRY } from './lint-token-purpose-slots.mjs';

// ── Vocabulary — every list closed by ADR-033 ───────────────────────────────

/** § 1. The valence axis, in the token layer's words. */
const VALENCE = new Set(['negative', 'positive', 'warning', 'info', 'neutral']);

/** § Retired vocabulary → Valence words. retired → canonical. */
const RETIRED_VALENCE = {
  error: 'negative',
  success: 'positive',
  danger: 'negative',
  destructive: 'negative',
  information: 'info',
  progress: 'info',
};

/**
 * § 2. One word per axis, and each word names exactly one axis.
 *
 * `values: null` means the list is closed per-component, not library-wide —
 * `variant` (form) and `status` (presence/lifecycle) are both legitimately
 * per-subject, so rule 5 cannot default-deny their members. The axes with a
 * library-wide closed list are the ones rule 5 polices.
 */
/** § 2. The orientation axis (#2001 amendment). Shared so the name-identified
 * check below reads the same closed value list rule 5 does. */
const ORIENTATION_VALUES = new Set(['horizontal', 'vertical']);

const AXES = {
  tone: { concept: 'valence', values: VALENCE },
  status: { concept: 'presence/lifecycle', values: null },
  variant: { concept: 'form', values: null },
  emphasis: { concept: 'hue source', values: new Set(['neutral', 'brand', 'accent']) },
  appearance: { concept: 'fill treatment', values: new Set(['solid', 'subtle', 'muted']) },
  density: { concept: 'spacing compression', values: new Set(['comfortable', 'compact']) },
  orientation: { concept: 'layout direction', values: ORIENTATION_VALUES },
};

/**
 * § 2 axes a union carries in its TYPE NAME, not only in its member values.
 *
 * The orientation axis (#2001) is the first, and needed a mechanism the
 * value-based rule-3 path could not supply, for two reasons the audit measured:
 *
 *   1. A retired PROP NAME with CANONICAL values. `StackDirection` and
 *      `FormLayout` are `'horizontal' | 'vertical'` — the values are already
 *      right, so nothing in rule 3/5 can see that `direction`/`layout` is the
 *      wrong word. Only the type name carries the drift.
 *   2. A retired VALUE that collides with an unrelated per-component union.
 *      Field spells the axis `'stacked' | 'inline'`, but `inline` also means
 *      "edit in place" on `SheetEditTarget = 'inline' | 'page'` — so `inline`
 *      cannot be retired the library-wide way a valence word is, or Sheet's
 *      legitimate value fails. Scoping the retirement to unions this axis
 *      actually NAMES leaves Sheet alone.
 *
 * The value-corroboration guard (every member ∈ the axis vocabulary) is what
 * keeps `SortDirection = 'asc' | 'desc' | 'none'` — a real `direction` that is
 * not this axis — out of the finding set.
 */
const NAME_IDENTIFIED_AXES = {
  orientation: {
    canonical: 'orientation',
    retiredNames: { direction: 'orientation', layout: 'orientation' },
    values: ORIENTATION_VALUES,
    retiredValues: { stacked: 'vertical', inline: 'horizontal' },
  },
};

/** § Retired vocabulary → Axis words. Value-level retirements, with their axis. */
const RETIRED_AXIS_VALUES = {
  grayscale: { to: 'neutral', axis: 'emphasis' },
  announcement: { to: 'brand', axis: 'emphasis' },
};

/** § 3. The t-shirt step vocabulary — nine rungs, closed. */
const T_SHIRT = new Set(['3xs', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl']);

/**
 * A null/reset step is orthogonal to the scale beside it — every scale needs
 * one, so `--gap-none` next to `--gap-md` is not a second vocabulary. Same
 * carve-out lint-token-purpose-slots makes, for the same reason.
 */
const RESET_STEPS = new Set(['none', '0']);

/**
 * § 3 + § Retired vocabulary → Step words. Retired as STEP words, with the
 * migration target the ADR measured per family. A family absent here still
 * fails rule 1 if it uses the word as a step — the table records where the
 * migration target is already known, not the closed set of affected families
 * (§ 3's prose retires the words generally; its table is the measured mapping).
 */
const RETIRED_STEPS = {
  tiny: { '--gap-': '2xs', '--icon-': '3xs', default: 'xs' },
  huge: { '--gap-': '2xl', '--icon-': '3xl', '--border-width-': '2xl', default: 'xl' },
  standard: { '--border-width-': 'deleted, not renamed', default: 'md' },
  thin: { '--border-width-': 'deleted, not renamed', default: 'sm' },
  bold: { '--border-width-': 'deleted, not renamed', default: 'lg' },
  normal: { '--duration-': 'md', default: 'md' },
  fast: { '--duration-': 'sm', default: 'sm' },
  slow: { '--duration-': 'lg', default: 'lg' },
  narrow: { '--content-width-': 'sm', default: 'sm' },
  default: { '--content-width-': 'md', default: 'md' },
  wide: { '--content-width-': 'lg', default: 'lg' },
  xxl: { default: '2xl' },
};

/**
 * § Named exceptions — not retired. A shape constant, a CSS keyword, or a role
 * has no position on a linear scale, so a step vocabulary cannot express it.
 */
const NAMED_EXCEPTIONS = new Set([
  '--size-pill', '--size-circle',
  '--border-radius-pill', '--border-radius-circle',
  '--aspect-square', '--aspect-cinema', '--aspect-photo-landscape', '--aspect-photo-portrait',
  '--iteration-infinite',
  '--content-width-full',
  '--shadow-overlay',
  '--duration-marquee', '--duration-autoplay',
  '--web', '--tablet', '--mobile',
]);

/**
 * § 4. The axis prefixes a BEM modifier may carry. `variant-` and `preset-` are
 * the counter-example ADR-033 § "The same modifier value is spelled two ways"
 * measures: 13 prefixed values, zero bare twins, already internally consistent.
 */
const MODIFIER_AXES = new Set([
  ...Object.keys(AXES), 'gap', 'padding', 'align', 'preset', 'size', 'justify', 'constrain',
]);

/**
 * Modifiers that are not axis values at all — a state or a structural boolean,
 * which ADR-008 § 3 governs and § 4 does not reach. `--disabled` is not "the
 * disabled value of some axis"; it is the presence of a state.
 *
 * Kept deliberately short. A value that names a *choice along an axis* belongs
 * behind a prefix; only a boolean belongs here.
 */
const BOOLEAN_MODIFIERS = new Set([
  'disabled', 'active', 'selected', 'open', 'closed', 'loading', 'readonly',
  'required', 'checked', 'expanded', 'collapsed', 'collapsible', 'sticky',
  'unread', 'empty', 'hidden', 'visible', 'focused', 'hovered', 'pressed',
  'dragging', 'invalid',
]);

/**
 * The colour intent formula's purpose slots, imported rather than re-listed so
 * there is one source of truth for which slots are colours.
 *
 * ADR-033 § 3 governs the STEP of the two non-colour formulas —
 * `--{property}-{step}` at Primitive, `--{role}-{step}` at Semantic. A colour
 * token's tail is a ROLE, not a step: `--color-blue-light` and
 * `--background-brand-primary` name a rung of a hue ramp and a brand role, and
 * § 3's t-shirt/numeric vocabulary cannot express either.
 *
 * This matters because the ramps would otherwise dominate rule 1. Grouping by
 * family puts `--color-blue-500` (numeric) beside `--color-blue-light` (word) in
 * one family, so the measured "takes steps" test fires and 57 ramp rungs across
 * 10 hues read as step-word violations — a disposition ADR-033 never made. That
 * the ramps carry two vocabularies at all is a real finding, but it is a finding
 * for an ADR amendment (§ 6), not something this gate may assert on its own.
 * Filed as brik-bds#1949.
 */
const SLOTS_BY_LENGTH = [...SLOT_REGISTRY].sort((a, b) => b.slot.length - a.slot.length);

/**
 * The registry entry a token name belongs to, LONGEST MATCH FIRST — so
 * `--border-width-thin` keys to the `border-width` property slot and not to the
 * `border` colour purpose. Getting this backwards silently exempts every
 * `--border-width-*` and `--border-radius-*` token from rule 1, which is how the
 * four `--border-width-{thin,standard,bold,huge}` violations ADR-033 § 3 names
 * explicitly disappeared from a passing run mid-build.
 */
function slotFor(name) {
  const bare = name.replace(/^--/, '');
  return SLOTS_BY_LENGTH.find((e) => bare === e.slot || bare.startsWith(`${e.slot}-`)) ?? null;
}

function isColorToken(name) {
  return slotFor(name)?.family === 'color';
}

const DEFAULT_TOKENS = path.join('dist', 'tokens.css');
const DEFAULT_COMPONENTS = path.join('components', 'ui');
const BASELINE_PATH = path.join('tokens', 'naming-canon-baseline.json');
const ADR = 'docs/adrs/ADR-033-naming-canon-one-word-per-concept.md';

// ── CSS parsing ─────────────────────────────────────────────────────────────

/** Strip comments but keep byte offsets stable so line numbers stay true. */
function blankComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
}

function lineOf(src, index) {
  return src.slice(0, index).split('\n').length;
}

/**
 * Every custom-property declaration in the file, in source order, grouped by
 * name. Declarations only — a `var()` reference is a consumption, not a claim
 * on the name.
 */
function collectDeclarations(cssPath) {
  const raw = fs.readFileSync(cssPath, 'utf8');
  const clean = blankComments(raw);
  const byName = new Map();
  let declarations = 0;

  for (const m of clean.matchAll(/(--[A-Za-z0-9_-]+)\s*:\s*([^;}]+)[;}]/g)) {
    declarations += 1;
    const name = m[1];
    if (!byName.has(name)) byName.set(name, []);
    byName.get(name).push({
      value: m[2].trim().replace(/\s+/g, ' '),
      line: lineOf(clean, m.index),
    });
  }
  return { byName, declarations };
}

/**
 * The value type a declaration resolves to, following `var()` to the last
 * declaration of the referenced name (which is the one that wins the cascade).
 *
 * Following the ref is the whole of rule 2: `--box-shadow-md: var(--shadow-md)`
 * is a shadow list, not a reference, and treating it as its own type is what
 * hides the collision with the `8px` at line 329.
 */
function resolveType(value, byName, seen = new Set()) {
  const v = value.trim();
  const ref = v.match(/^var\(\s*(--[A-Za-z0-9_-]+)\s*(?:,[\s\S]*)?\)$/);
  if (ref) {
    const target = ref[1];
    if (seen.has(target)) return 'cycle';
    const decls = byName.get(target);
    if (!decls || decls.length === 0) return 'unresolved';
    seen.add(target);
    // The LAST declaration wins the cascade, so that is the one a consumer gets.
    return resolveType(decls[decls.length - 1].value, byName, seen);
  }
  return classifyLiteral(v);
}

/**
 * Classify a literal CSS value. Coarse on purpose: rule 2 asks whether two
 * declarations of one name are the same KIND of thing, not whether they are
 * equal. `4px` and `8px` are one type; `8px` and `0 4px 12px rgba(...)` are two.
 */
function classifyLiteral(v) {
  if (/^(#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\()/.test(v)) return 'color';
  if (/^(none|0)$/.test(v)) return 'reset';
  if (/^-?[\d.]+(px|rem|em|ch|vh|vw|vmin|vmax|%)$/.test(v)) return 'length';
  if (/^-?[\d.]+m?s$/.test(v)) return 'time';
  if (/^-?[\d.]+$/.test(v)) return 'number';
  if (/^(cubic-bezier|steps)\(/.test(v) || /^(linear|ease|ease-in|ease-out|ease-in-out)$/.test(v)) return 'easing';
  if (/^-?[\d.]+\s*\/\s*-?[\d.]+$/.test(v)) return 'ratio';
  // A shadow list, a font stack, a gradient — any multi-part value.
  if (/,/.test(v) || /\s/.test(v)) return 'list';
  return 'keyword';
}

// ── Rule 1 — step vocabulary ────────────────────────────────────────────────

/**
 * Which step vocabulary a tail is drawn from, under ADR-033 § 3's lists. Note
 * this is NOT lint-token-purpose-slots' `stepVocabulary`: that one's T_SHIRT set
 * includes `tiny`, `huge`, and `xxl`, which § 3 retires. Reusing it would make
 * every rule-1 violation classify as a legal t-shirt step and the rule would
 * find nothing.
 */
function stepVocabulary(tail) {
  if (tail === '') return 'bare';
  if (RESET_STEPS.has(tail)) return 'reset';
  if (/^\d+$/.test(tail)) return 'numeric';
  if (/^\d+-\d+$/.test(tail)) return 'ratio';
  if (T_SHIRT.has(tail)) return 't-shirt';
  return 'word';
}

/**
 * Group tokens into families by everything before the last segment, so
 * `--gap-md` and `--gap-tiny` share the family `--gap-` while
 * `--background-brand-primary` keys to `--background-brand-`.
 *
 * A family TAKES STEPS if it is measured to carry at least one numeric or
 * t-shirt step. Measured, not declared: a declared list of step-taking families
 * is a second source of truth, and two sources for one fact is how the docs came
 * to disagree with the registry. It is also what keeps `--font-weight-bold` and
 * `--letter-spacing-wide` green — `bold` and `wide` are the CSS keyword values
 * of those properties, and neither family ships a single numeric or t-shirt
 * step, so neither takes steps and § 3 does not reach them.
 */
function stepFindings(byName) {
  const families = new Map();
  for (const name of byName.keys()) {
    const segments = name.replace(/^--/, '').split('-');
    if (segments.length < 2) continue;
    // § 3 governs the two non-colour formulas only — a colour token's tail is a
    // role, not a step. See isColorToken.
    if (isColorToken(name)) continue;
    const tail = segments[segments.length - 1];
    const family = `--${segments.slice(0, -1).join('-')}-`;
    if (!families.has(family)) families.set(family, []);
    families.get(family).push({ name, tail, vocab: stepVocabulary(tail) });
  }

  const findings = [];
  for (const [family, members] of families) {
    const takesSteps = members.some((m) => m.vocab === 'numeric' || m.vocab === 't-shirt');
    if (!takesSteps) continue;
    for (const m of members) {
      if (m.vocab !== 'word') continue;
      if (NAMED_EXCEPTIONS.has(m.name)) continue;
      const retired = RETIRED_STEPS[m.tail];
      const to = retired ? (retired[family] ?? retired.default) : null;
      findings.push({
        rule: 1,
        id: m.name,
        detail: retired
          ? `step \`${m.tail}\` is retired for ${family}* → \`${to}\``
          : `step \`${m.tail}\` is outside ${family}*'s vocabulary (numeric | t-shirt | none)`,
      });
    }
  }
  return findings;
}

// ── Rule 2 — one name, two value types ─────────────────────────────────────

function typeFindings(byName) {
  const findings = [];
  for (const [name, decls] of byName) {
    if (decls.length < 2) continue;
    const types = new Map();
    for (const d of decls) {
      const t = resolveType(d.value, byName, new Set([name]));
      // An unresolvable or cyclic ref is not evidence of a second type. Nor is a
      // bare `keyword`, which is whatever did not parse as a known category, so
      // it carries no category information to collide with. Counting it manufactured
      // five findings that are not type collisions at all: `--font-family-body`
      // (`Poppins` at :149 vs `Poppins, sans-serif` at :843 — one font stack, one
      // with a fallback) and `--border-on-color-dark` (`white` at :836 vs a
      // resolved `#fff` at :471 — one colour, two spellings).
      if (t === 'unresolved' || t === 'cycle' || t === 'keyword') continue;
      if (!types.has(t)) types.set(t, d.line);
    }
    if (types.size < 2) continue;
    const shown = [...types.entries()].map(([t, line]) => `${t} at :${line}`).join(', ');
    findings.push({
      rule: 2,
      id: name,
      detail: `defined with ${types.size} value types — ${shown}`,
    });
  }
  return findings;
}

// ── Component source parsing ────────────────────────────────────────────────

function walk(dir, ext, acc = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const e of entries) {
    const child = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === '__tests__' || e.name === 'node_modules') continue;
      walk(child, ext, acc);
    } else if (e.name.endsWith(ext) && !/\.(stories|test)\./.test(e.name)) {
      acc.push(child);
    }
  }
  return acc;
}

/**
 * Every exported string-literal union in a component's source, with its member
 * list. A union of one member is not a vocabulary, so it cannot mix axes.
 */
function collectUnions(componentsDir) {
  const unions = [];
  const files = walk(componentsDir, '.tsx');
  for (const file of files) {
    const src = fs.readFileSync(file, 'utf8');
    for (const m of src.matchAll(/export type (\w+)\s*=\s*([^;]+);/g)) {
      const members = [...m[2].matchAll(/'([^']+)'/g)].map((x) => x[1]);
      if (members.length < 2) continue;
      // A union with a non-literal member (a referenced type, a template) is a
      // composition, not a closed vocabulary this gate can judge.
      unions.push({
        file, name: m[1], members,
        line: src.slice(0, m.index).split('\n').length,
      });
    }
  }
  return { unions, files: files.length };
}

/**
 * Every axis whose closed list claims this member. A SET, not one axis: ADR-033
 * puts `neutral` on § 1's valence list *and* on § 2's emphasis list, so a member
 * can be legal on more than one axis and a single-valued lookup gets it wrong.
 *
 * That is not a hypothetical. With `axisOf` returning the first match,
 * `BadgeEmphasis = 'neutral' | 'brand' | 'accent'` — verbatim § 2 — read as
 * valence + emphasis and failed rule 3, and so did `TextLinkTone`, whose values
 * ADR-033 § 2 records as "already correct". A gate that rejects the ADR's own
 * example is worse than no gate.
 *
 * An empty set is the common case and is not a finding: a `variant` or `status`
 * union is legitimately per-component (§ 2 leaves both lists open).
 */
function axesOf(member) {
  const axes = new Set();
  // `tone` IS the valence axis (§ 2's table), so it is named once. Adding a
  // separate `valence` entry double-counts it — `positive` then reported as two
  // axes on its own, and every valence union read as mixed.
  if (Object.prototype.hasOwnProperty.call(RETIRED_VALENCE, member)) axes.add('tone');
  if (Object.prototype.hasOwnProperty.call(RETIRED_AXIS_VALUES, member)) {
    axes.add(RETIRED_AXIS_VALUES[member].axis);
  }
  for (const [axis, spec] of Object.entries(AXES)) {
    if (spec.values && spec.values.has(member)) axes.add(axis);
  }
  return axes;
}

/**
 * A union is mixed when NO single axis can account for every member that any
 * closed list claims — i.e. the intersection of those members' axis sets is
 * empty. Unclaimed members are per-component values and place no constraint.
 *
 * Badge's `positive | warning | brand` is mixed: {valence} ∩ {emphasis} = ∅.
 * `neutral | brand | accent` is not: {valence,emphasis} ∩ {emphasis} = {emphasis}.
 */
function mixedAxes(members) {
  const sets = members.map(axesOf).filter((s) => s.size > 0);
  if (sets.length < 2) return null;
  let common = null;
  for (const s of sets) {
    common = common === null ? new Set(s) : new Set([...common].filter((a) => s.has(a)));
  }
  if (common.size > 0) return null;
  return [...new Set(sets.flatMap((s) => [...s]))].sort();
}

// ── Rule 3 — a union carries one axis ──────────────────────────────────────

function unionFindings(unions) {
  const findings = [];
  for (const u of unions) {
    const retired = u.members.filter((v) => Object.prototype.hasOwnProperty.call(RETIRED_VALENCE, v));
    const retiredAxis = u.members.filter((v) => Object.prototype.hasOwnProperty.call(RETIRED_AXIS_VALUES, v));
    const mixed = mixedAxes(u.members);
    const id = `${u.name}`;

    if (retired.length > 0) {
      findings.push({
        rule: 3,
        id,
        where: `${u.file}:${u.line}`,
        detail: `retired valence word(s) ${retired.map((v) => `\`${v}\` → \`${RETIRED_VALENCE[v]}\``).join(', ')}`,
      });
    }
    if (retiredAxis.length > 0) {
      findings.push({
        rule: 3,
        id: `${id}#axis`,
        where: `${u.file}:${u.line}`,
        detail: `retired axis value(s) ${retiredAxis.map((v) => `\`${v}\` → ${RETIRED_AXIS_VALUES[v].axis}="${RETIRED_AXIS_VALUES[v].to}"`).join(', ')}`,
      });
    }
    // No single axis accounts for every claimed member — Badge's
    // `positive|warning|error|info|progress|brand|neutral` is valence + emphasis.
    if (mixed) {
      findings.push({
        rule: 3,
        id: `${id}#mixed`,
        where: `${u.file}:${u.line}`,
        detail: `mixes ${mixed.length} axes (${mixed.join(' + ')}) — split the union`,
      });
    }
  }
  return findings;
}

// ── Rule 3 (name-identified axes) — a retired PROP NAME, or a retired value
//    on a union this axis names (§ 2, #2001) ──────────────────────────────────

/**
 * A union carries a name-identified axis when its type name ends in the axis's
 * canonical word OR one of its retired words, AND every member belongs to the
 * axis's vocabulary — the second half is what excludes a homonym like
 * `SortDirection`. A canonically-named union with canonical values (e.g.
 * `DividerOrientation`) is correct and produces nothing.
 */
function nameIdentifiedAxisFindings(unions) {
  const findings = [];
  for (const u of unions) {
    const lowered = u.name.toLowerCase();
    for (const [axis, spec] of Object.entries(NAME_IDENTIFIED_AXES)) {
      const retiredName = Object.keys(spec.retiredNames).find((n) => lowered.endsWith(n));
      const usesCanonical = lowered.endsWith(spec.canonical);
      if (!retiredName && !usesCanonical) continue;

      // Corroborate before asserting the axis: a shared word is not the axis.
      const vocab = new Set([...spec.values, ...Object.keys(spec.retiredValues)]);
      if (!u.members.every((m) => vocab.has(m))) continue;

      if (retiredName) {
        findings.push({
          rule: 3,
          id: `${u.name}#name`,
          where: `${u.file}:${u.line}`,
          detail: `type name carries the retired ${axis} word \`${retiredName}\` → \`${spec.canonical}\` (§ 2)`,
        });
      }
      const retiredVals = u.members.filter(
        (m) => Object.prototype.hasOwnProperty.call(spec.retiredValues, m)
      );
      if (retiredVals.length > 0) {
        findings.push({
          rule: 3,
          id: `${u.name}#values`,
          where: `${u.file}:${u.line}`,
          detail: `retired ${axis} value(s) ${retiredVals
            .map((v) => `\`${v}\` → \`${spec.retiredValues[v]}\``)
            .join(', ')}`,
        });
      }
    }
  }
  return findings;
}

// ── Rule 4 — a BEM modifier carries its axis prefix ────────────────────────

/**
 * Every BEM modifier authored in component CSS, with the files it appears in.
 * Reads CSS only: a modifier built from a runtime value in TSX
 * (`` `bds-x--${tone}` ``) has no static spelling to judge, which is the same
 * blind spot slot-pattern-check documents.
 */
function collectModifiers(componentsDir) {
  const files = walk(componentsDir, '.css');
  const mods = new Map();
  const occurrences = [];
  for (const file of files) {
    const src = fs.readFileSync(file, 'utf8');
    // The block is captured lazily so `.bds-service-tag__dot--sm` yields block
    // `service-tag`, not `service`: a greedy block would swallow the element
    // separator, and rule 4's service-line carve-out is keyed on the block.
    for (const m of src.matchAll(/\.bds-([a-z0-9-]+?)(?:__[a-z0-9-]+)?--([a-z0-9-]+)/g)) {
      const [, block, mod] = m;
      if (!mods.has(mod)) mods.set(mod, new Set());
      mods.get(mod).add(file);
      occurrences.push({ block, mod, file });
    }
  }
  return { mods, occurrences, files: files.length };
}

// ── Rule 4's service-line carve-out (§ Named exceptions) ───────────────────

/**
 * The six service lines, read from the type that defines them rather than
 * re-listed here. A second copy is a second thing to forget: `back-office` was
 * renamed from `service` once already, and the alias is still in the union
 * pending a major.
 */
function serviceLines(componentsDir) {
  const config = path.join(componentsDir, 'ServiceTag', 'service-config.ts');
  const src = fs.readFileSync(config, 'utf8');
  const m = /export type ServiceLine\s*=\s*([^;]+);/.exec(src);
  if (!m) throw new Error(`${config} no longer declares \`export type ServiceLine\` — the carve-out cannot be sourced`);
  const values = new Set([...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]));
  if (values.size === 0) throw new Error(`${config} declares ServiceLine with no string members`);
  return values;
}

/**
 * The BEM blocks that emit a modifier from a `ServiceLine`-typed value. Both
 * halves are required: the identifier has to be annotated `ServiceLine`, AND
 * the block has to interpolate that identifier. Card is why — it imports
 * `ServiceLine` and derives `CardTint` from it, but emits its service tint as
 * the already-compliant `bds-card--tint-${tint}` while `.bds-card--brand` is an
 * unrelated variant. A directory-level "imports ServiceLine" test would exempt
 * that variant and hide a real § 4 finding.
 */
function serviceLineBlocks(componentsDir) {
  const blocks = new Set();
  for (const file of walk(componentsDir, '.tsx')) {
    const src = fs.readFileSync(file, 'utf8');
    const idents = new Set(
      [...src.matchAll(/(\w+)\??\s*:\s*ServiceLine\b(?!\w)/g)].map((m) => m[1])
    );
    if (idents.size === 0) continue;
    for (const m of src.matchAll(/`bds-([a-z0-9-]+?)--\$\{(\w+)\}`/g)) {
      if (idents.has(m[2])) blocks.add(m[1]);
    }
  }
  return blocks;
}

/**
 * `exempt(mod, file)` — true when every occurrence of `mod` in `file` sits on a
 * service-line-emitting block. "Every" is the load-bearing word: one file can
 * declare two blocks, and a single non-service occurrence has to keep the whole
 * (mod, file) pair reportable, or the carve-out becomes the blanket allowlist
 * #1982 AC #2 forbids.
 */
function serviceLineExemption(occurrences, lines, blocks) {
  const byPair = new Map();
  for (const { block, mod, file } of occurrences) {
    const key = `${mod} ${file}`;
    if (!byPair.has(key)) byPair.set(key, []);
    byPair.get(key).push(block);
  }
  return (mod, file) => {
    if (!lines.has(mod)) return false;
    const seen = byPair.get(`${mod} ${file}`);
    return Array.isArray(seen) && seen.length > 0 && seen.every((b) => blocks.has(b));
  };
}

function modifierFindings(mods, exempt = () => false) {
  const findings = [];
  for (const [mod, files] of mods) {
    const live = [...files].filter((f) => !exempt(mod, f)).sort();
    if (live.length === 0) continue;
    const where = live[0];
    const prefix = [...MODIFIER_AXES].find((a) => mod.startsWith(`${a}-`));

    if (prefix) {
      // Prefixed — the axis is explicit, so the VALUE is judgeable.
      const value = mod.slice(prefix.length + 1);
      if (Object.prototype.hasOwnProperty.call(RETIRED_VALENCE, value)) {
        findings.push({
          rule: 4, id: `--${mod}`, where,
          detail: `retired valence word \`${value}\` → \`${RETIRED_VALENCE[value]}\``,
        });
      } else if (Object.prototype.hasOwnProperty.call(RETIRED_AXIS_VALUES, value)) {
        findings.push({
          rule: 4, id: `--${mod}`, where,
          detail: `retired axis value \`${value}\` → ${RETIRED_AXIS_VALUES[value].axis}-${RETIRED_AXIS_VALUES[value].to}`,
        });
      }
      continue;
    }

    if (BOOLEAN_MODIFIERS.has(mod)) continue;

    // A bare value may be legal on more than one axis (`neutral` is valence and
    // emphasis), and that ambiguity is precisely what § 4's prefix removes — so
    // name every candidate rather than guessing one.
    const axes = [...axesOf(mod)].sort();
    const retired = Object.prototype.hasOwnProperty.call(RETIRED_VALENCE, mod);
    findings.push({
      rule: 4,
      id: `--${mod}`,
      where,
      detail: retired
        ? `bare modifier carrying retired word \`${mod}\` → \`--tone-${RETIRED_VALENCE[mod]}\``
        : axes.length > 0
          ? `bare modifier — ${axes.map((a) => `\`--${a}-${mod}\``).join(' or ')}, needs its axis prefix`
          : 'bare modifier — needs its axis prefix (§ 4)',
    });
  }
  return findings;
}

// ── Rule 5 — § 6's default-deny ────────────────────────────────────────────

/**
 * A word standing in a GOVERNED axis position that is on no closed list. The
 * scope is deliberately narrow: § 6 closes the lists the ADR closes, so
 * default-deny reaches a `tone`/`emphasis`/`appearance`/`density` union member
 * and a modifier already carrying one of those prefixes. It does NOT reach
 * `variant` or `status`, whose lists § 2 leaves open per-component, nor an
 * arbitrary CSS keyword value.
 *
 * This is what catches the NOVEL word — `tone="catastrophic"`,
 * `--tone-emergency` — which rules 3 and 4 cannot, because they only know the
 * words already retired. A new word is legal only via a § 6 amendment.
 */
function vocabularyFindings(unions, mods) {
  const findings = [];
  const governed = Object.entries(AXES).filter(([, spec]) => spec.values);

  for (const u of unions) {
    // A union names its axis through its type name — `BannerTone` → tone.
    const lowered = u.name.toLowerCase();
    const match = governed.find(([axis]) => lowered.endsWith(axis));
    if (!match) continue;
    const [axis, spec] = match;
    for (const member of u.members) {
      if (spec.values.has(member)) continue;
      // Already reported by rule 3 as a named retirement; not a novel word.
      if (Object.prototype.hasOwnProperty.call(RETIRED_VALENCE, member)) continue;
      if (Object.prototype.hasOwnProperty.call(RETIRED_AXIS_VALUES, member)) continue;
      findings.push({
        rule: 5,
        id: `${u.name}.${member}`,
        where: `${u.file}:${u.line}`,
        detail: `\`${member}\` is on no closed list for the ${axis} axis (${[...spec.values].join(' · ')}) — needs a § 6 amendment`,
      });
    }
  }

  for (const [mod, files] of mods) {
    const match = governed.find(([axis]) => mod.startsWith(`${axis}-`));
    if (!match) continue;
    const [axis, spec] = match;
    const value = mod.slice(axis.length + 1);
    if (spec.values.has(value)) continue;
    if (Object.prototype.hasOwnProperty.call(RETIRED_VALENCE, value)) continue;
    if (Object.prototype.hasOwnProperty.call(RETIRED_AXIS_VALUES, value)) continue;
    findings.push({
      rule: 5,
      id: `--${mod}`,
      where: [...files].sort()[0],
      detail: `\`${value}\` is on no closed list for the ${axis} axis (${[...spec.values].join(' · ')}) — needs a § 6 amendment`,
    });
  }
  return findings;
}

// ── Rule 6 — the deleted family must not come back ─────────────────────────

/**
 * Every directory in this repo where a reference to a deleted token can live.
 * `components/` + `content-system/` are the published surface, `stories/` +
 * `.storybook/` render it, `tokens/` can alias one name to another, and
 * `docs-site/` is where both of the live references #1958 found actually were —
 * #1956 had cleared `components/ui`, and no gate had ever read the docs site.
 *
 * #1958's AC also named `lib/`, from the `@/lib/tokens` import path in
 * CLAUDE.md. That path is a CONSUMER-repo alias; brik-bds has no root `lib/`
 * (`find . -maxdepth 3 -type d -name lib` returns only `docs-site/lib`, already
 * covered here, and `scripts/lib`, which is tooling). Listing it would have
 * been a silently-empty scan, which is why a named-but-missing directory is a
 * hard failure below rather than an empty walk.
 */
const REFERENCE_DIRS = ['components', 'content-system', 'docs-site', 'stories', 'tokens', '.storybook'];
const REFERENCE_EXTS = ['.css', '.ts', '.tsx', '.mdx'];
const REFERENCE_SKIP_DIRS = new Set(['node_modules', '__tests__', '.next', 'dist', 'out', 'build']);

/**
 * The two shapes a reference takes. Prose ABOUT the retired family is legal —
 * this ADR, this file, and the migration notes all have to be able to name it —
 * so matching a bare token name would make the gate un-documentable. Both
 * patterns therefore require the syntax that makes the name load-bearing.
 */
const REFERENCE_PATTERNS = [
  // The CSS consumption. This is the form that renders nothing once the name is
  // deleted, and the form the AC names.
  { re: /var\(\s*(--(?:[a-z0-9-]+-)?status-[a-z0-9-]+)/g, form: 'var()' },
  // The docs-site ColorGrid form: the name is a data string the component wraps
  // in var() at render time, so a stale one paints a blank swatch and no
  // var()-shaped grep finds it. Both `status-` swatches in color.mdx were live
  // in this form when #1958 started, and the handoff that scoped the issue read
  // them as zero consumers because it grepped for `var(`.
  { re: /cssVar:\s*'(--(?:[a-z0-9-]+-)?status-[a-z0-9-]+)'/g, form: 'cssVar' },
];

function walkExts(dir, exts, acc = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const e of entries) {
    const child = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (REFERENCE_SKIP_DIRS.has(e.name)) continue;
      walkExts(child, exts, acc);
    } else if (exts.some((x) => e.name.endsWith(x))) {
      // Stories and tests are IN scope here, unlike walk(): a story that paints
      // itself with a deleted token is a broken story, and there is no
      // vocabulary judgement to be blind to — the name either exists or it does
      // not.
      acc.push(child);
    }
  }
  return acc;
}

function collectReferences(dirs) {
  const byName = new Map();
  let files = 0;
  for (const dir of dirs) {
    // A directory that moved or was renamed must not read as a directory with
    // nothing in it. walkExts() swallows ENOENT so one bad entry cannot abort
    // the others; the coverage claim is asserted here instead.
    if (!fs.existsSync(dir)) {
      throw new Error(`reference dir ${dir} does not exist — fix REFERENCE_DIRS or pass --refs`);
    }
    for (const file of walkExts(dir, REFERENCE_EXTS)) {
      files += 1;
      const src = fs.readFileSync(file, 'utf8');
      for (const { re, form } of REFERENCE_PATTERNS) {
        for (const m of src.matchAll(re)) {
          const name = m[1];
          if (!byName.has(name)) byName.set(name, []);
          byName.get(name).push({ where: `${file}:${lineOf(src, m.index)}`, form });
        }
      }
    }
  }
  return { byName, files };
}

/**
 * What each deleted name actually resolved to, transcribed from the block
 * #1958 removed from `tokens/gap-fills.css` rather than derived from the name.
 *
 * Deriving it is what makes a gate print a target that breaks the thing it was
 * asked to fix — #1982's failure mode, one rule over. Three of these are not
 * "drop the `status-` segment": the `-subtle` names fold into `surface`
 * (the purpose already means the subtle tint, #1909 § D), `status-neutral`
 * aliased `--surface-neutral` and NOT `--background-neutral` (the saturated
 * #363636 is a different colour from the #d4d4d4 it shipped), and a retired
 * valence word has to route through § 1 — `--background-status-error` is
 * `--background-negative`, never `--background-error`, which does not exist.
 */
const REFERENCE_TARGETS = {
  '--background-status-error': '--background-negative',
  '--background-status-error-subtle': '--surface-negative',
  '--background-status-success': '--background-positive',
  '--background-status-success-subtle': '--surface-positive',
  '--background-status-warning': '--background-warning',
  '--background-status-warning-subtle': '--surface-warning',
  '--text-status-error': '--text-negative',
  '--text-status-success': '--text-positive',
  '--text-status-warning': '--text-warning',
  '--surface-status-error': '--surface-negative',
  '--surface-status-success': '--surface-positive',
  '--surface-status-warning': '--surface-warning',
  '--background-status-info': '--background-info',
  '--background-status-info-subtle': '--surface-info',
  '--text-status-info': '--text-info',
  '--surface-status-info': '--surface-info',
  '--background-status-neutral': '--surface-neutral',
  '--text-status-neutral': '--text-neutral',
  '--background-status-purple': '--background-accent-purple',
  '--background-status-orange': '--background-accent-orange',
};

/**
 * A name outside the twenty is a novel `status-` spelling, not a stale
 * reference — nothing was deleted that it could point at. Say so instead of
 * guessing a target, because the guess is the dangerous half.
 */
function referenceTarget(name) {
  return Object.prototype.hasOwnProperty.call(REFERENCE_TARGETS, name)
    ? REFERENCE_TARGETS[name]
    : null;
}

function referenceFindings(refs) {
  const findings = [];
  for (const [name, sites] of refs.byName) {
    const target = referenceTarget(name);
    const extra = sites.length > 1 ? ` (+${sites.length - 1} more site(s))` : '';
    findings.push({
      rule: 6,
      id: name,
      where: sites[0].where,
      detail: target
        ? `\`${name}\` was deleted with the status family (#1958) → \`${target}\`; `
          + `reference is a ${sites[0].form}${extra}`
        : `\`${name}\` uses the retired \`status-\` segment (§ Token families) and was never `
          + `a token — no migration target; reference is a ${sites[0].form}${extra}`,
    });
  }
  return findings;
}

// ── Baseline ────────────────────────────────────────────────────────────────

/**
 * The baseline is `{ "<rule>": { "<id>": <issue> } }`. An entry with no integer
 * issue number is not a disposition and hard-fails, same as no entry at all —
 * an allowlist with no owner is how the audit re-rots.
 */
function loadBaseline(file) {
  if (!fs.existsSync(file)) return { rules: {}, path: file, present: false };
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    return { error: `${file} is not valid JSON — ${err.message}` };
  }
  return { rules: parsed.rules ?? {}, path: file, present: true };
}

// ── Reporting ───────────────────────────────────────────────────────────────

const RULE_NAMES = {
  1: 'step vocabulary (§ 3)',
  2: 'one name, two value types (§ 5)',
  3: 'union mixes axes or carries a retired word (§ 2)',
  4: 'BEM modifier without its axis prefix (§ 4)',
  5: 'word on no closed list — default-deny (§ 6)',
  6: 'reference to a deleted --*-status-* token (§ Token families)',
};

function main() {
  const args = process.argv.slice(2);
  const json = args.includes('--json');
  const census = args.includes('--census');
  const noBaseline = args.includes('--no-baseline');
  const flag = (name, fallback) => {
    const i = args.indexOf(name);
    return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
  };
  const tokensPath = flag('--tokens', DEFAULT_TOKENS);
  const componentsDir = flag('--components', DEFAULT_COMPONENTS);
  const baselinePath = flag('--baseline', BASELINE_PATH);
  const referenceDirs = flag('--refs', REFERENCE_DIRS.join(',')).split(',').filter(Boolean);
  const onlyRule = args.includes('--rule') ? Number(flag('--rule', '0')) : null;

  if (onlyRule !== null && !RULE_NAMES[onlyRule]) {
    console.error(`lint-naming-canon: --rule must be 1-6, got ${onlyRule}`);
    process.exit(2);
  }

  if (!fs.existsSync(tokensPath)) {
    console.error(`SCAN FAILED — ${tokensPath} does not exist. Run \`npm run build:dist-tokens\` first.`);
    process.exit(2);
  }
  if (!fs.existsSync(componentsDir)) {
    console.error(`SCAN FAILED — ${componentsDir} does not exist.`);
    process.exit(2);
  }

  let tokens; let unions; let modifiers; let refs; let lines; let slBlocks;
  try {
    tokens = collectDeclarations(tokensPath);
    unions = collectUnions(componentsDir);
    modifiers = collectModifiers(componentsDir);
    refs = collectReferences(referenceDirs);
    lines = serviceLines(componentsDir);
    slBlocks = serviceLineBlocks(componentsDir);
  } catch (err) {
    console.error(`SCAN FAILED — ${err.message}`);
    process.exit(2);
  }

  // Every denominator asserted. A parse that found nothing must never read as
  // clean — that is how a gate goes quietly green after a regex stops matching.
  const denominators = [
    ['token declarations', tokens.declarations],
    ['token names', tokens.byName.size],
    ['prop unions', unions.unions.length],
    ['BEM modifiers', modifiers.mods.size],
    ['reference files', refs.files],
    // Both halves of rule 4's carve-out. Zero service lines means the type moved
    // and the exemption silently stopped applying; zero blocks means the
    // emission regex stopped matching. Either way the carve-out is not doing
    // what the ADR says it does, so neither may read as a clean scan.
    ['service lines', lines.size],
    ['service-line blocks', slBlocks.size],
  ];
  const empty = denominators.filter(([, n]) => n === 0);
  if (empty.length > 0) {
    console.error(`SCAN FAILED — parsed 0 ${empty.map(([n]) => n).join(', 0 ')}.`);
    console.error('A zero denominator is a broken scan, not a clean tree.');
    process.exit(2);
  }

  const baseline = noBaseline ? { rules: {} } : loadBaseline(baselinePath);
  if (baseline.error) {
    console.error(`SCAN FAILED — ${baseline.error}`);
    process.exit(2);
  }

  let all = [
    ...stepFindings(tokens.byName),
    ...typeFindings(tokens.byName),
    ...unionFindings(unions.unions),
    ...nameIdentifiedAxisFindings(unions.unions),
    ...modifierFindings(
      modifiers.mods,
      serviceLineExemption(modifiers.occurrences, lines, slBlocks)
    ),
    ...vocabularyFindings(unions.unions, modifiers.mods),
    ...referenceFindings(refs),
  ];
  if (onlyRule !== null) all = all.filter((f) => f.rule === onlyRule);

  // Partition against the baseline, and find entries that no longer violate.
  const live = [];
  const baselined = [];
  const seen = new Set();
  const bareEntries = [];
  for (const f of all) {
    const entry = baseline.rules[String(f.rule)]?.[f.id];
    seen.add(`${f.rule} ${f.id}`);
    if (entry === undefined) {
      live.push(f);
    } else if (!Number.isInteger(entry)) {
      bareEntries.push({ ...f, entry });
      live.push(f);
    } else {
      baselined.push({ ...f, issue: entry });
    }
  }

  const stale = [];
  for (const [rule, entries] of Object.entries(baseline.rules)) {
    if (onlyRule !== null && Number(rule) !== onlyRule) continue;
    for (const id of Object.keys(entries)) {
      if (!seen.has(`${rule} ${id}`)) stale.push({ rule: Number(rule), id });
    }
  }

  if (json) {
    console.log(JSON.stringify({
      tokens: path.relative(process.cwd(), tokensPath),
      components: path.relative(process.cwd(), componentsDir),
      scanned: Object.fromEntries(denominators),
      live, baselined, stale,
    }, null, 2));
    process.exit(live.length > 0 || stale.length > 0 ? 1 : 0);
  }

  // Denominator first, always — what was scanned, not only what was found.
  console.error(
    `lint-naming-canon: ${tokens.byName.size} token name(s) / ${tokens.declarations} declaration(s), `
    + `${unions.unions.length} prop union(s) in ${unions.files} file(s), `
    + `${modifiers.mods.size} BEM modifier(s) in ${modifiers.files} file(s), `
    + `${refs.files} file(s) scanned for references in ${referenceDirs.length} dir(s), `
    + `${lines.size} service line(s) exempt on ${slBlocks.size} block(s)`
  );

  for (const rule of onlyRule !== null ? [onlyRule] : [1, 2, 3, 4, 5, 6]) {
    const l = live.filter((f) => f.rule === rule);
    const b = baselined.filter((f) => f.rule === rule);
    if (l.length === 0 && b.length === 0) continue;
    console.error('');
    console.error(`  Rule ${rule} — ${RULE_NAMES[rule]}: ${l.length} live, ${b.length} baselined`);
    for (const f of l) {
      console.error(`  ✗ ${f.id} — ${f.detail}${f.where ? `  [${f.where}]` : ''}`);
    }
    if (census) {
      for (const f of b) console.error(`  · ${f.id} — ${f.detail}  (baselined, #${f.issue})`);
    }
  }

  if (bareEntries.length > 0) {
    console.error('');
    for (const f of bareEntries) {
      console.error(`  ✗ ${f.id} — baseline entry is \`${JSON.stringify(f.entry)}\`, not an issue number`);
    }
  }

  if (stale.length > 0) {
    console.error('');
    console.error(`  ${stale.length} STALE baseline entr(ies) — no longer violating, so the entry must go:`);
    for (const s of stale) console.error(`  ✗ rule ${s.rule}: ${s.id}`);
    console.error(`  Remove them from ${baselinePath}. The baseline is a countdown, not a carve-out —`);
    console.error('  an entry that outlives its fix is how the allowlist becomes permanent.');
  }

  if (live.length > 0 || stale.length > 0) {
    console.error('');
    if (live.length > 0) {
      console.error(`${live.length} naming-canon violation(s). ${ADR} is the spec.`);
      console.error('Use the canonical word, or amend the ADR per § 6 (a negative search, an');
      console.error(`\`## Amendments\` entry, and this gate's list — in one PR).`);
    }
    process.exit(1);
  }

  console.error('');
  console.error(`clean — 0 live violation(s), ${baselined.length} baselined against `
    + `${new Set(baselined.map((f) => f.issue)).size} remediation issue(s).`);
  process.exit(0);
}

main();
