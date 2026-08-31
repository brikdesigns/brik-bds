#!/usr/bin/env node
/**
 * Generate `tokens/modes-{collection}.css` from `design-tokens/tokens-studio.json`.
 *
 * Operationalizes the dormant non-color modes documented in BDS #340. Reads
 * the multi-modal Figma export, resolves primitive references, and emits one
 * CSS block per non-default mode keyed to `[data-mode-{collection}="{mode}"]`
 * — same pattern the dark-color cascade uses, generalized.
 *
 * Currently wires:
 *   - spacing     → padding-* and gap-* tokens
 *   - typography  → display-* and heading-* type scales
 *
 * Easy to extend to:
 *   - border-radius / border-width / elevation / breakpoint / icon
 *
 * Run:
 *   node scripts/generate-modes-css.mjs              # all wired collections
 *   node scripts/generate-modes-css.mjs --collection spacing
 *
 * Output: writes tokens/modes-{collection}.css and prints a per-mode summary.
 *
 * Source-of-truth contract: this script is RE-RUNNABLE. When Figma updates
 * the spacing modes (or any wired collection), re-run via `npm run build:modes`
 * and commit the regenerated CSS files. Don't hand-edit the output.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const TOKENS_STUDIO = path.join(ROOT, 'design-tokens/tokens-studio.json');
const TOKENS_DIR = path.join(ROOT, 'tokens');

// ─── Mode-collection registry ───────────────────────────────────────
//
// `key`: the data-mode-{key} attribute name on :root
// `groups`: which top-level token groups this collection writes
//   (these groups appear inside each `<collection>/<mode>` slice in
//    tokens-studio.json — e.g. spacing/default has `padding`, `gap`)
// `defaultMode`: the mode that's already in `figma-tokens.css`; we don't
//   re-emit it (it's the no-attr base)
// `nonDefaultModes`: the modes we DO emit overrides for
// `unitSuffix`: 'px' for spacing, '' for unitless tokens (border-radius), etc.
// `tokenPrefix`: how to format the CSS variable name. '<group>-<name>' yields
//   --padding-xl / --gap-md.

const COLLECTIONS = {
  spacing: {
    groups: ['padding', 'gap'],
    defaultMode: 'default',
    nonDefaultModes: ['compact', 'comfortable', 'spacious'],
    unitSuffix: 'px',
    tokenName: (group, name) => `--${group}-${name}`,
    resolve: resolveSpaceRef,
    description:
      'Spacing density mode — modulates padding-* and gap-* tokens. ' +
      'Pairs with the layout primitives (Stack, Cluster, Grid) shipped ' +
      'in PR #482; each primitive\'s gap/padding props pick up the mode ' +
      'automatically once `[data-mode-spacing]` is set on :root.',
  },
  typography: {
    groups: ['display', 'heading'],
    defaultMode: 'default',
    nonDefaultModes: ['compact', 'comfortable', 'spacious', 'expressive'],
    unitSuffix: '',
    tokenName: (group, name) => `--${group}-${name}`,
    resolve: resolveFontSizeRef,
    description:
      'Typography heading-scale variant — selects one named heading scale. ' +
      'compact/comfortable/spacious are uniform density steps; expressive is a ' +
      'steeper modular curve (smaller small end, larger large end) for editorial / ' +
      'marketing surfaces. The variants are mutually exclusive — this axis owns ' +
      '--heading-* alone (see ADR-013 amendment 2026-06-21, BDS #928). Emitted as ' +
      'var(--font-size-NNN) references (matching how figma-tokens.css emits the ' +
      'default scale), so each variant reuses the shared font-size primitives. ' +
      'display-* is mode-invariant in Figma today so only heading-* emits overrides.',
  },
  'border-radius': {
    // Flat slice: the border-radius/{mode} tokens (none/sm/md/lg) sit at the
    // slice root, not under group keys like spacing's padding/gap — so `flat`
    // treats the slice itself as one implicit group.
    flat: true,
    defaultMode: 'soft',
    nonDefaultModes: ['sharp', 'round', 'pill'],
    // Attribute reads `data-mode-radius`, not `data-mode-border-radius` (#340
    // sketch + #929) — the shorter axis name. Output file is modes-borderradius.css.
    attr: 'radius',
    fileName: 'borderradius',
    unitSuffix: 'px', // resolve returns the raw primitive value; suffix the unit (like spacing)
    tokenName: (_group, name) => `--border-radius-${name}`,
    resolve: resolveRadiusRef,
    description:
      'Corner-radius mode — overrides the semantic --border-radius-{none,sm,md,lg} ' +
      'tokens. sharp / round tighten or loosen the ramp; pill maps every step to ' +
      'the full 999px round for fully-rounded surfaces. Default (soft) is the ' +
      'figma-tokens.css base and emits no attribute. Emitted as raw primitive px ' +
      'values (like the spacing modes) rather than var() aliases — the pill/circle ' +
      'primitives are Semantic-tier by name, so a var() alias would be off-model.',
  },
  elevation: {
    // Elevation is the first COMPOSITE collection: each token is a multi-part
    // box-shadow, not a single value, so it uses the dedicated emitElevation
    // branch (see generate()) rather than the generic emitCollection loop.
    composite: true,
    sizes: ['sm', 'md', 'lg', 'xl'],
    defaultMode: 'subtle',
    nonDefaultModes: ['flat', 'lifted', 'dramatic'],
    // Override the canonical --shadow-* tokens (BDS #2233 / PR #2237), NOT the
    // deprecated --box-shadow-* aliases — gap-fills.css derives those from
    // --shadow-*, so a --shadow-* override cascades to both.
    tokenName: (size) => `--shadow-${size}`,
    description:
      'Elevation depth mode — overrides the composed --shadow-* box-shadow ' +
      'tokens. NOTE: Figma source (elevation/* in tokens-studio.json) carries ' +
      'only a y-offset + blur-radius per size — no x-offset, spread, or color — ' +
      'and the lifted/dramatic slices are byte-identical to the subtle default. ' +
      'So the only mode the source differentiates is `flat` (all-zero → a ' +
      'zeroed box-shadow shorthand). lifted/dramatic emit NOTHING until Figma authors distinct values ' +
      'incl. spread + color (tracked follow-up). See tokens/gap-fills.css for the ' +
      'hand-authored --shadow-* default composition this overrides.',
  },
};

// ─── Helpers ────────────────────────────────────────────────────────

function loadTokensStudio() {
  return JSON.parse(fs.readFileSync(TOKENS_STUDIO, 'utf8'));
}

function resolveSpaceRef(value, primitives) {
  // {space.NNNN} → primitive value
  const m = String(value).match(/^\{space\.(\w+)\}$/);
  if (!m) return value;
  return primitives.space?.[m[1]]?.$value ?? value;
}

function resolveFontSizeRef(value) {
  // {font-size.NNN} → var(--font-size-NNN) reference. Emitting the reference
  // (not the resolved px) mirrors how figma-tokens.css emits the default type
  // scale and reuses the shared primitive, avoiding float-precision noise.
  const m = String(value).match(/^\{font-size\.(\w+)\}$/);
  if (!m) return value;
  return `var(--font-size-${m[1]})`;
}

function resolveRadiusRef(value, primitives) {
  // {border-radius.NNN} → the primitive's RAW value (px via unitSuffix), same as
  // resolveSpaceRef — NOT a var(--border-radius-NNN) alias. The named steps
  // `pill`/`circle` are Semantic-tier by name (isSemantic in lint-token-tiers.mjs),
  // so a var() alias to them is an off-model Semantic→Semantic reference; resolving
  // the scale straight from the Primitive value is the tier-legal form (ADR-025).
  const m = String(value).match(/^\{border-radius\.(\w+)\}$/);
  if (!m) return value;
  return primitives['border-radius']?.[m[1]]?.$value ?? value;
}

function readModeTokens(data, collectionKey, modeName) {
  const sliceKey = `${collectionKey}/${modeName}`;
  const slice = data[sliceKey];
  if (!slice) {
    throw new Error(`Missing slice in tokens-studio.json: ${sliceKey}`);
  }
  return slice;
}

// ─── Per-collection emit ────────────────────────────────────────────

function emitCollection(data, collectionKey) {
  const cfg = COLLECTIONS[collectionKey];
  const primitives = data['primitives/value'] ?? {};
  const defaultSlice = readModeTokens(data, collectionKey, cfg.defaultMode);
  // Attribute may differ from the collection key (border-radius → data-mode-radius).
  const attr = cfg.attr ?? collectionKey;

  const lines = [];
  lines.push('/**');
  lines.push(` * BDS ${collectionKey} Mode Overrides`);
  lines.push(' *');
  lines.push(' * Auto-generated by scripts/generate-modes-css.mjs from');
  lines.push(' * design-tokens/tokens-studio.json. Do not hand-edit — re-run');
  lines.push(' * the generator after any Figma mode update.');
  lines.push(' *');
  lines.push(` * ${cfg.description}`);
  lines.push(' *');
  lines.push(` * Selector contract: \`[data-mode-${attr}="${cfg.nonDefaultModes.join('|')}"]\``);
  lines.push(' * on :root (html). Default mode requires no attribute (uses figma-tokens.css base).');
  lines.push(' *');
  lines.push(' * Companion to figma-tokens-dark.css and modes-borderwidth.css per the cascade');
  lines.push(' * documented in tokens/CASCADE.md.');
  lines.push(' */');
  lines.push('');

  // A `flat` collection (border-radius) keeps its tokens at the slice root
  // rather than under group keys — model it as a single unnamed group so the
  // one emit loop covers both shapes. `groupOf(slice, name)` reads the right
  // level, and the group comment is suppressed when the group is unnamed.
  const groupNames = cfg.flat ? [null] : cfg.groups;
  const groupOf = (slice, groupName) => (groupName === null ? slice : (slice[groupName] ?? {}));

  // Emit one selector block per non-default mode
  for (const modeName of cfg.nonDefaultModes) {
    const slice = readModeTokens(data, collectionKey, modeName);

    // Buffer the override lines so empty groups/modes emit nothing — e.g.
    // typography's display-* group is mode-invariant in Figma today, so it
    // produces no overrides and shouldn't leave a dangling group comment.
    const body = [];
    for (const groupName of groupNames) {
      const entries = Object.entries(groupOf(slice, groupName)).sort(([a], [b]) => a.localeCompare(b));
      if (entries.length === 0) continue;

      const groupLines = [];
      for (const [tokenName, def] of entries) {
        const resolved = cfg.resolve(def.$value, primitives);
        // Skip emitting overrides equal to the default value — leaner CSS
        const defaultDef = groupOf(defaultSlice, groupName)[tokenName];
        const defaultResolved = defaultDef ? cfg.resolve(defaultDef.$value, primitives) : null;
        if (resolved === defaultResolved) continue;
        groupLines.push(`  ${cfg.tokenName(groupName, tokenName)}: ${resolved}${cfg.unitSuffix};`);
      }

      if (groupLines.length === 0) continue;
      if (groupName !== null) body.push(`  /* ${groupName} */`);
      body.push(...groupLines);
    }

    if (body.length === 0) continue; // mode identical to default — nothing to emit

    lines.push(`/* ─── ${modeName.charAt(0).toUpperCase() + modeName.slice(1)} ────────────────────────────────────────── */`);
    lines.push(`[data-mode-${attr}="${modeName}"] {`);
    lines.push(...body);
    lines.push('}');
    lines.push('');
  }

  return lines.join('\n');
}

// ─── Composite emit (elevation) ─────────────────────────────────────
//
// Elevation tokens are multi-part box-shadows, so the single-value
// emitCollection loop can't express them. This branch composes the Figma
// sub-tokens into a CSS box-shadow shorthand per size.

function composeShadow(slice, size) {
  // Figma elevation carries only a y-offset (`box-shadow` group) and a
  // `blur-radius` per size — no x-offset, spread, or color. A shadow whose
  // lengths are all 0 is absent → emit a fully-zeroed box-shadow SHORTHAND
  // (`0px 0px 0px 0px transparent`), NOT the `none` keyword. The base
  // --shadow-* in gap-fills.css is a box-shadow shorthand; overriding it with
  // `none` gives one token name two value types, which ADR-033 § 5 rejects
  // (naming-canon Rule 2 — a `bds-lint-ignore` does not rescue it). The
  // all-zero shorthand renders identically (no visible shadow) while keeping
  // one value type. Any non-zero mode can't be faithfully reproduced without
  // the missing spread/color, so it returns null and is skipped — never
  // fabricated.
  const y = slice['box-shadow']?.[size]?.$value;
  const blur = slice['blur-radius']?.[size]?.$value;
  if (y === 0 && blur === 0) return '0px 0px 0px 0px transparent';
  return null;
}

function emitElevation(data, collectionKey) {
  const cfg = COLLECTIONS[collectionKey];

  const lines = [];
  lines.push('/**');
  lines.push(` * BDS ${collectionKey} Mode Overrides (composite box-shadow)`);
  lines.push(' *');
  lines.push(' * Auto-generated by scripts/generate-modes-css.mjs from');
  lines.push(' * design-tokens/tokens-studio.json. Do not hand-edit — re-run');
  lines.push(' * the generator after any Figma mode update.');
  lines.push(' *');
  lines.push(` * ${cfg.description}`);
  lines.push(' *');
  lines.push(` * Selector contract: \`[data-mode-${collectionKey}="${cfg.nonDefaultModes.join('|')}"]\``);
  lines.push(' * on :root (html). Default mode (subtle) requires no attribute (uses the');
  lines.push(' * hand-authored --shadow-* composition in gap-fills.css).');
  lines.push(' */');
  lines.push('');

  const skipped = [];
  for (const modeName of cfg.nonDefaultModes) {
    const slice = readModeTokens(data, collectionKey, modeName);

    const body = [];
    for (const size of cfg.sizes) {
      const composed = composeShadow(slice, size);
      if (composed === null) continue; // source can't faithfully compose this
      body.push(`  ${cfg.tokenName(size)}: ${composed};`);
    }

    if (body.length === 0) { skipped.push(modeName); continue; }

    lines.push(`/* ─── ${modeName.charAt(0).toUpperCase() + modeName.slice(1)} ────────────────────────────────────────── */`);
    lines.push(`[data-mode-${collectionKey}="${modeName}"] {`);
    lines.push(...body);
    lines.push('}');
    lines.push('');
  }

  if (skipped.length) {
    console.log(
      `  ⚠ elevation: ${skipped.join(', ')} carry no distinct source values ` +
      `(identical to subtle, no spread/color) — not emitted. Needs Figma authoring.`
    );
  }

  return lines.join('\n');
}

// ─── Main ───────────────────────────────────────────────────────────

function generate(collectionKey) {
  const cfg = COLLECTIONS[collectionKey];
  if (!cfg) {
    throw new Error(`Unknown collection: ${collectionKey}. Known: ${Object.keys(COLLECTIONS).join(', ')}`);
  }
  const data = loadTokensStudio();

  // One generic emitter drives single-value collections; per-collection
  // behaviour (which groups, how a token ref resolves, unit suffix) lives in
  // the COLLECTIONS registry above. Composite collections (elevation) route to
  // their own emitter since one CSS token composes multiple source sub-tokens.
  const css = cfg.composite
    ? emitElevation(data, collectionKey)
    : emitCollection(data, collectionKey);

  // Output file may differ from the collection key (border-radius → modes-borderradius.css).
  const fileName = cfg.fileName ?? collectionKey;
  const outFile = path.join(TOKENS_DIR, `modes-${fileName}.css`);
  fs.writeFileSync(outFile, css);

  // Summary
  const overrideCount = (css.match(/^\s+--/gm) ?? []).length;
  console.log(`  ✓ tokens/modes-${fileName}.css (${overrideCount} overrides across ${cfg.nonDefaultModes.length} modes)`);
}

function main() {
  const args = process.argv.slice(2);
  const collIdx = args.indexOf('--collection');
  const targets = collIdx !== -1 && args[collIdx + 1]
    ? [args[collIdx + 1]]
    : Object.keys(COLLECTIONS);

  console.log(`Generating mode CSS for: ${targets.join(', ')}`);
  for (const c of targets) generate(c);
  console.log('Done.');
}

main();
