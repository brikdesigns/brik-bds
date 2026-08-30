#!/usr/bin/env node
/**
 * lint-token-purpose-slots — census every purpose slot that ships in
 * `dist/tokens.css`, and fail when one is neither registered here nor
 * documented in token-anatomy.
 *
 * ── Why this exists ────────────────────────────────────────────────────────
 *
 * docs/foundation/token-anatomy documents ONE formula — the colour intent form
 * `--{purpose}-{role}`, whose `purpose` vocabulary is the closed list
 * page/surface/background/text/border/color. 325 of the 701 token names that
 * ship are outside that list (`--font-size-100`, `--gap-md`, `--ease-spring`).
 * Nothing said whether those were drift or a second legitimate formula, so
 * brik-bds#1910 axis 3 could not be answered and the naming ADR could not be
 * written. The verdict, recorded in token-anatomy § Non-color anatomy: they are
 * a second formula — `--{property}-{step}` at Tier 2, `--{role}-{step}` at
 * Tier 3 — and a short list of genuine drift.
 *
 * This gate is what keeps that verdict from rotting. It is NOT the naming gate
 * brik-bds#1910 AC#5 asks for: that one rejects a name whose *segments* fall
 * outside the ADR, and it cannot be written until the ADR exists. This one
 * answers a narrower, already-decided question — does the doc still name every
 * slot the registry ships? A slot added to `dist/tokens.css` without a doc
 * entry is exactly how the colour-only formula came to describe half a system.
 *
 * Sibling gates, and why this is none of them:
 *   - canonical-check         → forbids INVENTED token names in consumers.
 *   - cascade-contract-check  → forbids CONSUMERS redefining canonical tokens.
 *   - lint-token-shadowing    → one NAME declared twice with different values.
 *   - this                    → one SLOT shipping with no documented formula.
 *
 * ── Disposition ────────────────────────────────────────────────────────────
 *
 * A slot is green four ways:
 *   • `family: 'color'`    — the intent formula token-anatomy already documents
 *   • `family: 'property'` / `'role'` / `'component'` — the second formula,
 *     documented in § Non-color anatomy; the slot name must appear there
 *   • an entry in DRIFT_BACKLOG (slot → tracking issue) — known drift, still
 *     shipping, visible on the board rather than silently green
 *   • a member of SLOTLESS_EXCEPTIONS — decided carve-out, no rename owed
 *
 * An unregistered slot has none of the three and hard-fails. That is the whole
 * point: a new prefix cannot ship undocumented.
 *
 * ── CLI ────────────────────────────────────────────────────────────────────
 *   node scripts/lint-token-purpose-slots.mjs [file.css]  default: dist/tokens.css
 *   node scripts/lint-token-purpose-slots.mjs --census    full per-slot table
 *   node scripts/lint-token-purpose-slots.mjs --json      machine-readable
 *
 * Exit 0 = clean, 1 = unregistered or undocumented slot, 2 = the check broke.
 * Exit 2 matters: a parse that finds no tokens must never read as clean
 * (`gate-scanned-nothing-reports-clean`), so the denominator is asserted and
 * reported on every run.
 *
 * Issue: brikdesigns/brik-bds#1910 (axis 3 — token purpose slots)
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

/**
 * Every purpose slot that ships, longest-match-first at lookup time so
 * `--border-radius-100` keys to `border-radius` (a property scale) and not to
 * `border` (a colour purpose). That collision is not cosmetic: `--border-*` is
 * 45 colour tokens AND 44 length tokens under one first segment.
 *
 *   family: 'color'     — intent formula, token-anatomy § Anatomy
 *   family: 'property'  — Tier 2, named after the CSS property it feeds
 *   family: 'role'      — Tier 3, named after the semantic role it serves
 *   family: 'component' — Tier 4, ADR-014 `--bds-{component}-{property}`
 * The step vocabulary each slot actually uses is MEASURED, not declared here —
 * see stepVocabulary(). Two sources of truth for one fact is how the docs came
 * to disagree with the registry in the first place.
 */
export const SLOT_REGISTRY = [
  // ── Colour intent formula (already documented) ──────────────────────────
  { slot: 'color', family: 'color', tier: 'primitive' },
  { slot: 'page', family: 'color', tier: 'semantic' },
  { slot: 'surface', family: 'color', tier: 'semantic' },
  { slot: 'background', family: 'color', tier: 'semantic' },
  { slot: 'text', family: 'color', tier: 'semantic' },
  { slot: 'border', family: 'color', tier: 'semantic' },

  // ── Tier 2 — property scales, keyed by CSS property name ────────────────
  { slot: 'font-size', family: 'property', tier: 'primitive' },
  { slot: 'font-weight', family: 'property', tier: 'primitive' },
  { slot: 'font-family', family: 'property', tier: 'primitive' },
  { slot: 'font-line-height', family: 'property', tier: 'primitive' },
  { slot: 'font-casing', family: 'property', tier: 'primitive' },
  { slot: 'letter-spacing', family: 'property', tier: 'primitive' },
  { slot: 'space', family: 'property', tier: 'primitive' },
  { slot: 'size', family: 'property', tier: 'primitive' },
  { slot: 'border-radius', family: 'property', tier: 'primitive' },
  { slot: 'border-width', family: 'property', tier: 'primitive' },
  { slot: 'shadow-blur', family: 'property', tier: 'primitive' },
  { slot: 'shadow-offset', family: 'property', tier: 'primitive' },
  { slot: 'shadow-spread', family: 'property', tier: 'primitive' },
  { slot: 'blur-radius', family: 'property', tier: 'primitive' },
  { slot: 'duration', family: 'property', tier: 'primitive' },
  { slot: 'delay', family: 'property', tier: 'primitive' },
  { slot: 'iteration', family: 'property', tier: 'primitive' },
  { slot: 'breakpoint', family: 'property', tier: 'primitive' },
  { slot: 'aspect', family: 'property', tier: 'primitive' },

  // ── Tier 3 — semantic roles ─────────────────────────────────────────────
  { slot: 'gap', family: 'role', tier: 'semantic' },
  { slot: 'padding', family: 'role', tier: 'semantic' },
  { slot: 'gutter', family: 'role', tier: 'semantic' },
  { slot: 'heading', family: 'role', tier: 'semantic' },
  { slot: 'display', family: 'role', tier: 'semantic' },
  { slot: 'body', family: 'role', tier: 'semantic' },
  { slot: 'label', family: 'role', tier: 'semantic' },
  { slot: 'subtitle', family: 'role', tier: 'semantic' },
  { slot: 'icon', family: 'role', tier: 'semantic' },
  { slot: 'shadow', family: 'role', tier: 'semantic' },
  { slot: 'box-shadow', family: 'role', tier: 'semantic' },
  { slot: 'ease', family: 'role', tier: 'semantic' },
  { slot: 'content-width', family: 'role', tier: 'semantic' },
  { slot: 'measure', family: 'role', tier: 'semantic' },
  { slot: 'state', family: 'role', tier: 'semantic' },

  // ── Tier 4 — component knobs (ADR-014) ──────────────────────────────────
  { slot: 'bds', family: 'component', tier: 'component' },
];

/**
 * slot → tracking issue. Drift that ships today. Registered so the census is
 * complete and the gate stays green, NOT so it is condoned — each entry is a
 * rename owed, sequenced behind the brik-bds#1910 naming ADR.
 *
 * A bare entry (no issue number) hard-fails, same as no entry at all.
 */
const DRIFT_BACKLOG = {
  // Tier 4 without the mandatory `--bds-` prefix — the retired
  // `--{component}-{prop}` pattern in token-anatomy § Drift patterns
  // (ADR-014). 6 live references in components/ui/Tooltip/Tooltip.css.
  tooltip: 1910,

  // Style Dictionary's primitive easing export. Two names for one concept
  // (`--easing-ease-in` vs `--ease-in`) at DIFFERENT values, and the stutter
  // in `easing-ease-` is the tell. Zero `var()` references in components/;
  // `--ease-*` carries all 70.
  easing: 1910,
};

/**
 * Slots that legitimately carry no purpose prefix. Not drift, not a rename
 * owed — a deliberate carve-out, mirrored in `EXCEPTIONS` at
 * scripts/__tests__/inspect-widget-tokens.test.mjs.
 *
 * `--web` / `--tablet` / `--mobile` are unitless Figma primitives with zero
 * `var()` consumers, and `--breakpoint-*` — the family a rename would move them
 * to — has none either (measured 2026-08-20 across brik-bds, brik-client-portal,
 * brikdesigns). Renaming one dead family into another buys nothing. Whether BDS
 * ships breakpoint tokens at all is the brik-bds#1910 naming ADR's call.
 *
 * Kept as an explicit set rather than a DRIFT_BACKLOG entry because the two are
 * different claims: drift is owed a rename, an exception is not, and a gate that
 * prints "drift" for a decided carve-out re-opens a settled question every run.
 */
const SLOTLESS_EXCEPTIONS = new Set(['web', 'tablet', 'mobile']);

const DOC_PATH = path.join('docs-site', 'content', 'docs', 'foundation', 'token-anatomy.mdx');

/** Strip comments but keep byte offsets stable so line numbers stay true. */
function blankComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
}

function lineOf(src, index) {
  return src.slice(0, index).split('\n').length;
}

/** Longest-match-first, so `border-radius` wins over `border`. */
const SLOTS_BY_LENGTH = [...SLOT_REGISTRY].sort((a, b) => b.slot.length - a.slot.length);

const T_SHIRT = new Set([
  'tiny', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', 'xxl', 'huge',
]);

/**
 * A null/reset step is orthogonal to the scale it sits beside — every scale
 * needs one, so `--gap-none` next to `--gap-md` is not two vocabularies.
 * Classified separately and excluded from the MIXED test for that reason.
 */
const RESET_STEPS = new Set(['none', '0']);

/**
 * Which step vocabulary a token's tail is drawn from. Reported per slot so a
 * slot carrying two vocabularies is visible rather than asserted — that is
 * brik-bds#1910 axis 5's input, measured here instead of eyeballed.
 */
function stepVocabulary(name, slot) {
  const tail = name.replace(/^--/, '').slice(slot.length).replace(/^-/, '');
  if (tail === '') return 'bare';
  if (RESET_STEPS.has(tail)) return 'reset';
  if (/^\d+$/.test(tail)) return 'numeric';
  if (/^\d+-\d+$/.test(tail)) return 'ratio';
  if (T_SHIRT.has(tail)) return 't-shirt';
  return 'word';
}

function slotFor(name) {
  const bare = name.replace(/^--/, '');
  for (const entry of SLOTS_BY_LENGTH) {
    if (bare === entry.slot || bare.startsWith(`${entry.slot}-`)) return entry;
  }
  return null;
}

/**
 * Every custom property DEFINED in the file, with its first definition line.
 * Definitions only — a `var()` reference is a consumption, not a slot claim.
 */
function collect(cssPath) {
  const raw = fs.readFileSync(cssPath, 'utf8');
  const clean = blankComments(raw);
  const defs = new Map();
  const declRe = /(^|[{;\s])(--[A-Za-z0-9_-]+)\s*:/g;
  let m;
  let declarations = 0;

  while ((m = declRe.exec(clean)) !== null) {
    declarations += 1;
    const name = m[2];
    if (!defs.has(name)) defs.set(name, lineOf(clean, m.index + m[1].length));
  }
  return { defs, declarations };
}

function analyse(cssPath) {
  const { defs, declarations } = collect(cssPath);
  const bySlot = new Map();
  const unregistered = [];

  for (const [name, line] of defs) {
    const entry = slotFor(name);
    if (!entry) {
      const bare = name.replace(/^--/, '');
      const drifted = bare.split('-')[0];
      const excepted = SLOTLESS_EXCEPTIONS.has(drifted);
      const backlogged = Object.prototype.hasOwnProperty.call(DRIFT_BACKLOG, drifted)
        && Number.isInteger(DRIFT_BACKLOG[drifted]);
      const family = excepted ? 'exception' : 'drift';
      const key = `${drifted} (${family})`;
      if (!bySlot.has(key)) {
        bySlot.set(key, {
          slot: drifted, family, tier: '—',
          names: [], firstLine: line,
          disposition: excepted ? 'slotless by exception'
            : backlogged ? `#${DRIFT_BACKLOG[drifted]}` : null,
        });
      }
      bySlot.get(key).names.push({ name, line });
      if (!excepted && !backlogged) unregistered.push({ name, line, slot: drifted });
      continue;
    }
    if (!bySlot.has(entry.slot)) {
      bySlot.set(entry.slot, {
        ...entry, names: [], firstLine: line, disposition: 'registered', vocab: new Set(),
      });
    }
    bySlot.get(entry.slot).names.push({ name, line });
    bySlot.get(entry.slot).vocab.add(stepVocabulary(name, entry.slot));
  }

  const slots = [...bySlot.values()].map((s) => ({
    ...s,
    vocab: s.vocab ? [...s.vocab].sort() : [],
  }));
  return { slots, tokens: defs.size, declarations, unregistered };
}

/**
 * A registered non-colour slot must be NAMED in token-anatomy. The colour
 * purposes are already in the § Anatomy table; the second formula's slots have
 * to be written down too, or the doc drifts back to describing half a system.
 */
function undocumentedSlots(slots) {
  if (!fs.existsSync(DOC_PATH)) return { error: `${DOC_PATH} not found` };
  const doc = fs.readFileSync(DOC_PATH, 'utf8');
  const missing = slots
    .filter((s) => s.family === 'property' || s.family === 'role')
    .filter((s) => !doc.includes(`--${s.slot}-`))
    .map((s) => s.slot);
  return { missing };
}

function main() {
  const args = process.argv.slice(2);
  const json = args.includes('--json');
  const census = args.includes('--census');
  const target = args.find((a) => !a.startsWith('--'))
    ?? path.join(process.cwd(), 'dist', 'tokens.css');

  if (!fs.existsSync(target)) {
    console.error(`SCAN FAILED — ${target} does not exist. Run \`npm run build:dist-tokens\` first.`);
    process.exit(2);
  }

  let result;
  try {
    result = analyse(target);
  } catch (err) {
    console.error(`SCAN FAILED — ${err.message}`);
    process.exit(2);
  }

  const { slots, tokens, declarations, unregistered } = result;

  // A parse that found nothing is a broken parse, not a clean file.
  if (tokens === 0 || slots.length === 0) {
    console.error(`SCAN FAILED — parsed ${tokens} token(s) into ${slots.length} slot(s) from ${target}.`);
    console.error('A zero denominator is a broken scan, not a clean registry.');
    process.exit(2);
  }

  const doc = undocumentedSlots(slots);
  if (doc.error) {
    console.error(`SCAN FAILED — ${doc.error}`);
    process.exit(2);
  }

  slots.sort((a, b) => b.names.length - a.names.length);

  if (json) {
    console.log(JSON.stringify({
      file: path.relative(process.cwd(), target),
      tokens,
      declarations,
      slots: slots.map((s) => ({
        slot: s.slot, family: s.family, tier: s.tier,
        stepVocabularies: s.vocab, count: s.names.length,
        firstLine: s.firstLine, disposition: s.disposition,
      })),
      unregistered,
      undocumented: doc.missing,
    }, null, 2));
    process.exit(unregistered.length > 0 || doc.missing.length > 0 ? 1 : 0);
  }

  // Denominator first, always — what was scanned, not only what was found.
  console.error(`lint-token-purpose-slots: ${tokens} token name(s) / ${declarations} declaration(s) in ${path.relative(process.cwd(), target)} → ${slots.length} slot(s)`);

  if (census) {
    console.error('');
    console.error('  count  slot                 family     tier       step vocabularies');
    for (const s of slots) {
      const scales = s.vocab.filter((v) => v !== 'reset' && v !== 'bare');
      const vocab = s.vocab.length ? s.vocab.join(' + ') : '—';
      console.error(
        `  ${String(s.names.length).padStart(5)}  ${s.slot.padEnd(20)} ${s.family.padEnd(10)} ${s.tier.padEnd(10)} ${vocab}`
        + (scales.length > 1 ? '  ← MIXED (axis 5)' : '')
        + (s.disposition && s.disposition !== 'registered' ? `  ← drift, ${s.disposition}` : '')
      );
    }
  }

  for (const s of slots.filter((x) => x.family === 'exception')) {
    console.error(`  · --${s.slot} — slotless by exception, ${s.names.length} token(s), line ${s.firstLine}`);
  }

  for (const s of slots.filter((x) => x.family === 'drift')) {
    const tag = s.disposition ? `drift, rename owed (${s.disposition})` : 'UNREGISTERED';
    console.error(`  ${s.disposition ? '·' : '✗'} --${s.slot}-* — ${tag}, ${s.names.length} token(s), first at line ${s.firstLine}`);
  }

  for (const slot of doc.missing) {
    console.error(`  ✗ --${slot}-* ships but is not named in ${DOC_PATH}`);
  }

  if (unregistered.length > 0 || doc.missing.length > 0) {
    console.error('');
    if (unregistered.length > 0) {
      console.error(`${unregistered.length} token(s) in ${new Set(unregistered.map((u) => u.slot)).size} unregistered slot(s).`);
      console.error('Add the slot to SLOT_REGISTRY (and document it in token-anatomy) if it is');
      console.error('legitimate, or to DRIFT_BACKLOG (slot → issue number) if it is a rename owed.');
    }
    if (doc.missing.length > 0) {
      console.error(`${doc.missing.length} registered slot(s) missing from the docs. Add them to`);
      console.error(`${DOC_PATH} § Non-color anatomy.`);
    }
    process.exit(1);
  }

  const drift = slots.filter((s) => s.family === 'drift').length;
  const exc = slots.filter((s) => s.family === 'exception').length;
  console.error(`clean — every slot registered and documented (${drift} rename(s) owed, ${exc} slotless exception(s)).`);
  process.exit(0);
}

/**
 * CLI-entry guard. `SLOT_REGISTRY` is imported by lint-naming-canon.mjs, which
 * needs to know which slots are colour purposes (ADR-033 § 3's step rule governs
 * the non-colour formulas only). Without the guard, that import would run this
 * gate and exit the importing process.
 */
const isCliEntry = (() => {
  try {
    return path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1] ?? '');
  } catch (err) {
    console.error(`lint-token-purpose-slots: could not determine CLI entry — ${err.message}`);
    return false;
  }
})();

if (isCliEntry) main();
