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
import { PREFIX } from './lib/bds-prefix.mjs';

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
//   --bds-padding-xl / --bds-gap-md.

export const COLLECTIONS = {
  spacing: {
    groups: ['padding', 'gap'],
    defaultMode: 'default',
    nonDefaultModes: ['compact', 'comfortable', 'spacious'],
    unitSuffix: 'px',
    tokenName: (group, name) => `${PREFIX}${group}-${name}`,
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
    tokenName: (group, name) => `${PREFIX}${group}-${name}`,
    resolve: resolveFontSizeRef,
    description:
      'Typography heading-scale variant — selects one named heading scale. ' +
      'compact/comfortable/spacious are uniform density steps; expressive is a ' +
      'steeper modular curve (smaller small end, larger large end) for editorial / ' +
      'marketing surfaces. The variants are mutually exclusive — this axis owns ' +
      '--bds-heading-* alone (see ADR-013 amendment 2026-06-21, BDS #928). Emitted as ' +
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
    // `none` is the square-corner constant (0) every mode must preserve — a
    // component that asks for --bds-border-radius-none means "no rounding". Figma's
    // pill slice authors none=999 (it maps every step to pill), which both
    // contradicts the token's meaning and gives it two value types (naming-canon
    // Rule 2 / ADR-033 § 5). Hold it out of the mode ladder.
    skipTokens: ['none'],
    tokenName: (_group, name) => `${PREFIX}border-radius-${name}`,
    resolve: resolveRadiusRef,
    description:
      'Corner-radius mode — overrides the semantic --border-radius-{none,sm,md,lg} ' +
      'tokens. sharp / round tighten or loosen the ramp; pill maps every step to ' +
      'the full 999px round for fully-rounded surfaces. Default (soft) is the ' +
      'figma-tokens.css base and emits no attribute. Emitted as raw primitive px ' +
      'values (like the spacing modes) rather than var() aliases — the pill/circle ' +
      'primitives are Semantic-tier by name, so a var() alias would be off-model.',
  },
  layout: {
    // The layout TIER (ADR-042) — the one collection whose values legitimately
    // vary by DEVICE rather than by a runtime-switchable density/style MODE.
    // Every other entry in this registry emits a `[data-mode-*]` override
    // block a consumer flips at runtime; this one has no such attribute —
    // there is nothing to flip, because the three Figma modes (mobile/tablet/
    // desktop) are baked at BUILD time into one piecewise clamp() per token
    // that already threads all three endpoints (same reason breakpoint can't
    // be a runtime mode either — see tokens/CASCADE.md § Breakpoint; var()
    // cannot parametrize anything here, so there is no selector to write).
    fluid: true,
    // Figma mode name → the `breakpoint/default` rung it reads its device
    // width from. `desktop` reads `wider` (1440), not `desktop` (1024) — 1440
    // is the width of the Figma frames the desktop endpoint was measured on
    // (ADR-042 D4).
    modes: ['mobile', 'tablet', 'desktop'],
    rungs: { mobile: 'mobile', tablet: 'tablet', desktop: 'wider' },
    resolve: resolveSpaceRef,
    outputFile: 'layout-fluid.css',
    description:
      'Layout tier — device-fluid --bds-page-inset / --bds-section-padding-block. ' +
      'Interpolates continuously between the mobile/tablet/desktop endpoints ' +
      'via one piecewise calc(clamp(…) + clamp(…)) per token (ADR-042), ' +
      'rather than a [data-mode-*] override block.',
  },
  elevation: {
    // Elevation is the first COMPOSITE collection: each token is a multi-part
    // box-shadow, not a single value, so it uses the dedicated emitElevation
    // branch (see generate()) rather than the generic emitCollection loop.
    composite: true,
    sizes: ['sm', 'md', 'lg', 'xl'],
    defaultMode: 'subtle',
    nonDefaultModes: ['flat', 'lifted', 'dramatic'],
    // Override the canonical --bds-shadow-* tokens (BDS #2233 / PR #2237), NOT the
    // deprecated --bds-box-shadow-* aliases — gap-fills.css derives those from
    // --bds-shadow-*, so a --bds-shadow-* override cascades to both.
    tokenName: (size) => `${PREFIX}shadow-${size}`,
    description:
      'Elevation depth mode — overrides the composed --bds-shadow-* box-shadow ' +
      'tokens. Figma source (elevation/* in tokens-studio.json) carries a ' +
      'y-offset (box-shadow group), blur-radius, spread, and opacity per size ' +
      '(#2243); x-offset is invariantly 0 and the color is always black, so only ' +
      'the alpha varies (rides the opacity sub-token). `flat` composes to a ' +
      'zeroed shorthand (no visible shadow); `lifted`/`dramatic` compose the ' +
      'full `0px y blur spread rgba(0,0,0,α)`. `subtle` is the default (no ' +
      'attribute) and uses the hand-authored --bds-shadow-* in tokens/gap-fills.css, ' +
      'which this overrides.',
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
  return `var(${PREFIX}font-size-${m[1]})`;
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
        if (cfg.skipTokens?.includes(tokenName)) continue; // mode-invariant constant (e.g. radius `none`)
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
  // Figma elevation carries a y-offset (`box-shadow` group), a `blur-radius`, a
  // `spread`, and an `opacity` per size (#2243). The x-offset is invariantly 0
  // and the shadow color is always black — matching the hand-authored --bds-shadow-*
  // in gap-fills.css, every one of which is `0px … rgba(0,0,0,α)` — so only the
  // alpha varies and it rides the `opacity` sub-token.
  const y = slice['box-shadow']?.[size]?.$value ?? 0;
  const blur = slice['blur-radius']?.[size]?.$value ?? 0;
  const spread = slice['spread']?.[size]?.$value ?? 0;
  const opacity = slice['opacity']?.[size]?.$value ?? 0;

  // A shadow with no length AND full transparency is absent → emit a
  // fully-zeroed box-shadow SHORTHAND (`0px 0px 0px 0px transparent`), NOT the
  // `none` keyword. The base --bds-shadow-* in gap-fills.css is a box-shadow
  // shorthand; overriding it with `none` gives one token name two value types,
  // which ADR-033 § 5 rejects (naming-canon Rule 2 — a `bds-lint-ignore` does
  // not rescue it). The all-zero shorthand renders identically (no visible
  // shadow) while keeping one value type. This is the `flat` mode.
  if (y === 0 && blur === 0 && spread === 0 && opacity === 0) {
    return '0px 0px 0px 0px transparent';
  }

  // Round the alpha to kill Figma's float32 drift (0.08 → 0.0799999…).
  const alpha = Math.round(opacity * 1000) / 1000;
  return `0px ${y}px ${blur}px ${spread}px rgba(0, 0, 0, ${alpha})`;
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
  lines.push(' * hand-authored --bds-shadow-* composition in gap-fills.css).');
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

// ─── Fluid emit (layout tier, ADR-042) ──────────────────────────────
//
// The layout tier has no default/override shape — it has three device
// endpoints that all feed ONE calc() expression per token, so it gets its own
// branch rather than a mode-by-mode selector loop like emitCollection, and
// rather than a shadow box per size like emitElevation.

/** Round to 4 decimals (killing float noise) and format, trimming a trailing
 *  `.0000` (and any other trailing zeros) so `1` prints as `1`, not `1.0000`. */
export function fmtNum(n) {
  const rounded = Math.round(n * 10000) / 10000;
  const normalized = rounded === 0 ? 0 : rounded; // -0 → 0
  if (Number.isInteger(normalized)) return String(normalized);
  return normalized.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
}

/**
 * Pure math for one layout-tier token's piecewise fluid clamp (ADR-042 D3):
 *
 *   calc(clamp(v0, b1 + s1·vw, v1) + clamp(0, b2 + s2·vw, v2 − v1))
 *
 * Three endpoints (v0 @ w0px, v1 @ w1px, v2 @ w2px) become two linear
 * segments so one fluid value threads all three rungs exactly — a single
 * clamp() from mobile straight to desktop misses the tablet rung. Bounds and
 * intercepts are emitted in `rem` (so a 200%-zoom root raises the floor with
 * it, per WCAG 1.4.4); slope stays in `vw` (device width is what should drive
 * it, not the root font size). No special-casing is needed for a degenerate
 * segment (v1 === v0 or v2 === v1) — the slope term reduces to 0 and the
 * bound collapses to a constant on its own.
 *
 * Throws on non-monotonic endpoints — a silently wrong clamp is worse than a
 * red build (ADR-042 § Refusal).
 */
export function buildFluidValue({ w0, w1, w2, v0, v1, v2 }) {
  if (!(v0 <= v1 && v1 <= v2)) {
    throw new Error(
      `Non-monotonic layout endpoints (need v0 ≤ v1 ≤ v2): v0=${v0} v1=${v1} v2=${v2}`
    );
  }

  const slope1 = ((v1 - v0) / (w1 - w0)) * 100;
  const base1 = (v0 - ((v1 - v0) / (w1 - w0)) * w0) / 16;
  const min1 = v0 / 16;
  const max1 = v1 / 16;

  const slope2 = ((v2 - v1) / (w2 - w1)) * 100;
  const base2 = (-((v2 - v1) / (w2 - w1)) * w1) / 16;
  const max2 = (v2 - v1) / 16;

  const seg1 = `clamp(${fmtNum(min1)}rem, ${fmtNum(base1)}rem + ${fmtNum(slope1)}vw, ${fmtNum(max1)}rem)`;
  const seg2 = `clamp(0rem, ${fmtNum(base2)}rem + ${fmtNum(slope2)}vw, ${fmtNum(max2)}rem)`;

  return `calc(${seg1} + ${seg2})`;
}

function emitFluid(data, collectionKey) {
  const cfg = COLLECTIONS[collectionKey];
  const primitives = data['primitives/value'] ?? {};
  const rungSlice = readModeTokens(data, 'breakpoint', 'default');

  const rungPx = (rungName) => {
    const token = rungSlice[rungName];
    if (!token || typeof token.$value !== 'number') {
      throw new Error(
        `Missing/invalid breakpoint/default rung "${rungName}" needed by the ${collectionKey} fluid tier`
      );
    }
    return token.$value;
  };
  const w0 = rungPx(cfg.rungs.mobile);
  const w1 = rungPx(cfg.rungs.tablet);
  const w2 = rungPx(cfg.rungs.desktop);

  const slices = {};
  for (const mode of cfg.modes) slices[mode] = readModeTokens(data, collectionKey, mode);

  // Variable set is read off the desktop slice; every mode must carry the
  // same names (Figma authors all three modes on one variable collection).
  const names = Object.keys(slices.desktop).sort((a, b) => a.localeCompare(b));

  const lines = [];
  lines.push('/**');
  lines.push(` * BDS ${collectionKey} tier — device-fluid clamp() (ADR-042)`);
  lines.push(' *');
  lines.push(' * Auto-generated by scripts/generate-modes-css.mjs from');
  lines.push(' * design-tokens/tokens-studio.json. Do not hand-edit — re-run');
  lines.push(' * `npm run build:modes` after any Figma mode update.');
  lines.push(' *');
  for (const w of cfg.description.match(/.{1,76}(\s|$)/g) ?? [cfg.description]) {
    lines.push(` * ${w.trim()}`);
  }
  lines.push(' *');
  lines.push(' * Source: `layout/mobile` + `layout/tablet` + `layout/desktop`');
  lines.push(' * (design-tokens/tokens-studio.json). Rung px read from');
  lines.push(` * \`breakpoint/default\` — mobile→\`${cfg.rungs.mobile}\` (${w0}),`);
  lines.push(` * tablet→\`${cfg.rungs.tablet}\` (${w1}), desktop→\`${cfg.rungs.desktop}\` (${w2}).`);
  lines.push(' *');
  lines.push(' * No `@media`: a media/container query CONDITION cannot read a custom');
  lines.push(' * property (`var()` only resolves in declaration values), so a');
  lines.push(' * [data-mode-*]-style attribute block would be inert here — the whole');
  lines.push(' * point is one clamp() that already threads all three device rungs.');
  lines.push(' *');
  lines.push(' * `vw`, never `cqi`: this tier is page-level and full-bleed; a `cqi`');
  lines.push(' * read against a narrow container would shrink the margin it is meant');
  lines.push(' * to hold steady.');
  lines.push(' *');
  lines.push(' * Bounds/intercepts in `rem` (so WCAG 1.4.4 200%-zoom raises the floor');
  lines.push(' * with the root font size), slope in `vw` (device width drives it, not');
  lines.push(' * font size). Flat above the desktop rung — segment 2 clamps at v2 − v1.');
  lines.push(' */');
  lines.push('');
  lines.push(':root {');

  for (const name of names) {
    const v0 = cfg.resolve(slices.mobile[name]?.$value, primitives);
    const v1 = cfg.resolve(slices.tablet[name]?.$value, primitives);
    const v2 = cfg.resolve(slices.desktop[name]?.$value, primitives);
    if (typeof v0 !== 'number' || typeof v1 !== 'number' || typeof v2 !== 'number') {
      throw new Error(
        `Could not resolve an alias for --${name} across layout/{mobile,tablet,desktop}`
      );
    }
    const value = buildFluidValue({ w0, w1, w2, v0, v1, v2 });
    lines.push(`  ${PREFIX}${name}: ${value}; /* ${v0} → ${v1} → ${v2}px at ${w0} / ${w1} / ${w2} */`);
  }

  lines.push('}');
  lines.push('');

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
  // the COLLECTIONS registry above. Composite collections (elevation) and the
  // fluid layout tier each route to their own emitter: elevation because one
  // CSS token composes multiple source sub-tokens, layout because it has no
  // default/override shape at all — three endpoints feed one calc().
  const css = cfg.composite
    ? emitElevation(data, collectionKey)
    : cfg.fluid
    ? emitFluid(data, collectionKey)
    : emitCollection(data, collectionKey);

  // Output file may differ from the collection key (border-radius →
  // modes-borderradius.css; layout → layout-fluid.css, no `modes-` prefix
  // since it carries no [data-mode-*] block for that prefix to describe).
  const outFile = cfg.fluid
    ? path.join(TOKENS_DIR, cfg.outputFile)
    : path.join(TOKENS_DIR, `modes-${cfg.fileName ?? collectionKey}.css`);
  fs.writeFileSync(outFile, css);

  // Summary
  const overrideCount = (css.match(/^\s+--/gm) ?? []).length;
  if (cfg.fluid) {
    console.log(`  ✓ tokens/${cfg.outputFile} (${overrideCount} device-fluid declaration(s))`);
  } else {
    const fileName = cfg.fileName ?? collectionKey;
    console.log(`  ✓ tokens/modes-${fileName}.css (${overrideCount} overrides across ${cfg.nonDefaultModes.length} modes)`);
  }
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

// Only run when invoked directly (node scripts/generate-modes-css.mjs), NOT when
// imported — the mode-emission coverage guard imports COLLECTIONS to know which
// collections are wired without regenerating any files.
const isCliEntry = path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1] ?? '');
if (isCliEntry) main();
