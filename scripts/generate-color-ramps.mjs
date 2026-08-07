#!/usr/bin/env node
/**
 * generate-color-ramps.mjs — 11-step numeric color ramps for BDS (brik-bds#1737).
 *
 * Reads every Brand Kit under `design-tokens/brand-kits/*.json` and emits
 * `design-tokens/color-ramps.generated.json`: for each color family, an 11-step
 * scale keyed `50, 100, 200 … 900, 950`, produced by interpolation — never
 * hand-tuned per family (brik-bds#1065 AC 1).
 *
 * ── Where the families actually live ────────────────────────────────────────
 * #1737's acceptance criteria say the anchors come from
 * `design-tokens/foundations.json`. They do not. That file's
 * `primitives/value.color` holds only `grayscale`, `system`, and `annotation`
 * — the brand families (blue, green, orange, pink, poppy, purple, tan, yellow,
 * grayscale) live in the Brand Kit Library, `design-tokens/brand-kits/*.json`,
 * per the two-library split in docs-site getting-started/figma-library-
 * architecture.mdx. Reading the Brand Kit is also what makes this generator
 * reusable for a future client kit rather than Brik-only.
 *
 * ── The mapping, and why it is anchor-preserving ────────────────────────────
 * The six existing named stops are pinned at fixed numeric positions, byte for
 * byte:
 *
 *     lightest → 100     dark    → 700
 *     lighter  → 300     darker  → 800
 *     light    → 500     darkest → 950
 *
 * and the five new stops are the OKLCh midpoints of their neighbours:
 *
 *     200 = mid(100, 300)      600 = mid(500, 700)
 *     400 = mid(300, 500)      900 = mid(800, 950)
 *     50  = mid(100, white)    ← the only stop with no darker-side neighbour
 *
 * The alternative — re-deriving all 11 stops from a single anchor on an even
 * OKLCh curve — was rejected. It moves every existing brand value, which
 * changes every rendered pixel in the library, invalidates the visual
 * baselines, and re-opens every pairing in `tokens/contrast-pairings.json`.
 * Anchor-preserving gets the same 11-step scale for zero value churn, and
 * satisfies "existing 6-step values are reproducible as a subset" exactly
 * rather than approximately. The generator ASSERTS that round-trip.
 *
 * `light → 500` is load-bearing: 500 is the brand base by convention
 * (`--color-poppy-light` is annotated "Brand primary base" in the kit), and it
 * puts the generated 600 between `light` and `dark` — the intermediate
 * AA-passing near-Poppy step that ADR-016 Option C's durable fix for #479
 * needs and that the 6-step ladder had nowhere to put.
 *
 * The mapping is ORDINAL, not absolute-lightness. Families do not share an L
 * range (green's `light` sits at L 0.93, poppy's at L 0.63), so a global
 * lightness ladder would map green's brand base to 100. An ordinal mapping
 * keeps every family inside its own range and keeps the semantic ladder
 * intact.
 *
 * ── Modes ───────────────────────────────────────────────────────────────────
 *   node scripts/generate-color-ramps.mjs            # write the generated file
 *   node scripts/generate-color-ramps.mjs --check    # fail if committed file is stale (CI drift gate)
 *   node scripts/generate-color-ramps.mjs --report   # read-only table + WCAG ratios
 *
 * Out of scope here (separate sub-issues): writing the ramps back to Figma
 * (#1738), aliasing the 6-step names onto the numeric stops (#1739), and
 * migrating consumers (#1740). Nothing in the token build pipeline reads this
 * file yet — it is the input those three consume.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { hexToOklch, oklchToHex, mixOklch } from './lib/oklch.mjs';
import { contrastRatio } from './lib/wcag.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const KITS_DIR = path.join(REPO_ROOT, 'design-tokens', 'brand-kits');
const OUTPUT_PATH = path.join(REPO_ROOT, 'design-tokens', 'color-ramps.generated.json');

/** The 11 numeric stops, lightest → darkest. Order is the emitted key order. */
export const STOPS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];

/** Legacy 6-step name → its pinned numeric stop. */
export const ANCHOR_STOPS = {
  lightest: '100',
  lighter: '300',
  light: '500',
  dark: '700',
  darker: '800',
  darkest: '950',
};

/**
 * Generated stop → the two stops it is the midpoint of.
 *
 * Insertion order is the evaluation order and it matters: `50` is derived from
 * `100`, so every anchor must already be placed — which it is, since all five
 * entries read anchors only, never other generated stops. Keeping it that way
 * means no generated value is ever derived from another generated value, so a
 * rounding error cannot compound down the ramp.
 */
const DERIVED_FROM = {
  200: ['100', '300'],
  400: ['300', '500'],
  600: ['500', '700'],
  900: ['800', '950'],
  50: ['100', 'white'],
};

/** Pure white in OKLCh, hue borrowed from the color it is mixed with. */
const whiteAt = (hue) => [1, 0, hue];

/**
 * Non-ramp entries in a family. `white`/`black` are absolute endpoints shared
 * by the whole system, not steps in grayscale's ladder — they keep their names
 * and are excluded from the numeric scale.
 */
const NON_RAMP_KEYS = new Set(['white', 'black']);

/** Read a Brand Kit's `primitives/value.color` map, or throw with the path. */
function readKitFamilies(kitPath) {
  const kit = JSON.parse(fs.readFileSync(kitPath, 'utf8'));
  const families = kit?.['primitives/value']?.color;
  if (!families || typeof families !== 'object') {
    throw new Error(`${path.relative(REPO_ROOT, kitPath)}: no primitives/value.color map`);
  }
  return families;
}

/**
 * Build one family's 11-step ramp.
 *
 * Returns `{ stops, skipped }` where `stops` maps stop → { hex, source,
 * legacyName?, from? } and `skipped` lists family keys that are neither an
 * anchor nor a known non-ramp endpoint (a family the kit shapes differently —
 * reported, never silently dropped).
 */
export function buildRamp(familyName, entries) {
  const stops = {};
  const skipped = [];

  for (const [name, entry] of Object.entries(entries)) {
    const value = entry?.$value;
    if (typeof value !== 'string' || !value.startsWith('#')) {
      // An alias (`{color.x.y}`) or a non-color entry. Anchors must be literal
      // hex — a family built on aliases has no value to interpolate.
      skipped.push({ name, reason: 'not a literal hex value' });
      continue;
    }
    if (NON_RAMP_KEYS.has(name)) continue;

    const stop = ANCHOR_STOPS[name];
    if (!stop) {
      skipped.push({ name, reason: 'not one of the six named steps' });
      continue;
    }
    stops[stop] = { hex: value.toLowerCase(), source: 'anchor', legacyName: name };
  }

  const missing = Object.entries(ANCHOR_STOPS)
    .filter(([, stop]) => !stops[stop])
    .map(([name]) => name);
  if (missing.length > 0) {
    throw new Error(
      `family "${familyName}": missing anchor(s) ${missing.join(', ')} — ` +
        `an 11-step ramp needs all six named steps to interpolate between`,
    );
  }

  for (const [stop, [loKey, hiKey]] of Object.entries(DERIVED_FROM)) {
    const lo = hexToOklch(stops[loKey].hex);
    const hi = hiKey === 'white' ? whiteAt(lo[2]) : hexToOklch(stops[hiKey].hex);
    stops[stop] = {
      hex: oklchToHex(mixOklch(lo, hi, 0.5)),
      source: 'generated',
      from: [loKey, hiKey],
    };
  }

  // The round-trip assertion behind "existing 6-step values are reproducible as
  // a subset". If this ever fires, the anchors were not preserved byte for byte
  // and every consumer of the 6-step names would shift on the alias swap.
  for (const [name, stop] of Object.entries(ANCHOR_STOPS)) {
    if (stops[stop].hex !== String(entries[name].$value).toLowerCase()) {
      throw new Error(
        `family "${familyName}": anchor ${name} did not round-trip ` +
          `(${entries[name].$value} → ${stops[stop].hex})`,
      );
    }
  }

  const ordered = {};
  for (const stop of STOPS) ordered[stop] = stops[stop];
  return { stops: ordered, skipped };
}

/** Build every kit's ramps. Returns the serializable payload + a skip log. */
export function buildAll() {
  const kitFiles = fs
    .readdirSync(KITS_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort();

  const payload = {};
  const skipLog = [];

  for (const file of kitFiles) {
    const kitName = path.basename(file, '.json');
    const families = readKitFamilies(path.join(KITS_DIR, file));
    const colors = {};

    for (const familyName of Object.keys(families).sort()) {
      const { stops, skipped } = buildRamp(familyName, families[familyName]);
      colors[familyName] = Object.fromEntries(
        Object.entries(stops).map(([stop, s]) => [
          stop,
          {
            $type: 'color',
            $value: s.hex,
            $extensions: {
              'com.brikdesigns.ramp':
                s.source === 'anchor'
                  ? { source: 'anchor', legacyName: s.legacyName }
                  : { source: 'generated', midpointOf: s.from },
            },
          },
        ]),
      );
      for (const s of skipped) skipLog.push({ kit: kitName, family: familyName, ...s });
    }

    payload[kitName] = { 'primitives/value': { color: colors } };
  }

  return { payload, skipLog };
}

function serialize(payload) {
  return `${JSON.stringify(
    {
      $description:
        'GENERATED by scripts/generate-color-ramps.mjs — do not hand-edit. ' +
        'Anchors are the six named steps in design-tokens/brand-kits/*.json, ' +
        'pinned byte-for-byte; the other five stops are OKLCh midpoints. ' +
        'See brik-bds#1737.',
      ...payload,
    },
    null,
    2,
  )}\n`;
}

function report(payload) {
  const lines = [];
  for (const [kitName, kit] of Object.entries(payload)) {
    lines.push(`\n${kitName}`);
    for (const [family, stops] of Object.entries(kit['primitives/value'].color)) {
      lines.push(`  ${family}`);
      for (const stop of STOPS) {
        const { $value: hex, $extensions: ext } = stops[stop];
        const kind = ext['com.brikdesigns.ramp'].source === 'anchor' ? 'anchor' : 'gen   ';
        const onWhite = contrastRatio(hex, '#ffffff').toFixed(2);
        const onBlack = contrastRatio(hex, '#000000').toFixed(2);
        const L = hexToOklch(hex)[0].toFixed(3);
        lines.push(
          `    ${stop.padStart(3)}  ${hex}  ${kind}  L ${L}  ` +
            `white ${onWhite.padStart(5)}:1  black ${onBlack.padStart(5)}:1`,
        );
      }
    }
  }
  return lines.join('\n');
}

function main() {
  const args = process.argv.slice(2);
  const check = args.includes('--check');
  const wantReport = args.includes('--report');

  const { payload, skipLog } = buildAll();
  const next = serialize(payload);

  for (const s of skipLog) {
    process.stderr.write(
      `note: skipped ${s.kit}/${s.family}.${s.name} — ${s.reason}\n`,
    );
  }

  if (wantReport) {
    // Read-only: `--report` inspects, it never writes. Regenerating as a side
    // effect of asking for a table is the kind of surprise that turns an
    // "let me look at the ramp" into an unreviewed committed diff.
    process.stdout.write(`${report(payload)}\n`);
    if (!check) return;
  }

  if (check) {
    const current = fs.existsSync(OUTPUT_PATH) ? fs.readFileSync(OUTPUT_PATH, 'utf8') : null;
    if (current !== next) {
      process.stderr.write(
        `✗ ${path.relative(REPO_ROOT, OUTPUT_PATH)} is stale.\n` +
          `  Run: npm run gen:color-ramps\n`,
      );
      process.exit(1);
    }
    process.stdout.write(
      `✓ ${path.relative(REPO_ROOT, OUTPUT_PATH)} is in sync with design-tokens/brand-kits/.\n`,
    );
    return;
  }

  fs.writeFileSync(OUTPUT_PATH, next);
  const families = Object.values(payload).reduce(
    (n, kit) => n + Object.keys(kit['primitives/value'].color).length,
    0,
  );
  process.stdout.write(
    `✓ wrote ${path.relative(REPO_ROOT, OUTPUT_PATH)} — ` +
      `${families} families × ${STOPS.length} stops\n`,
  );
}

// Guarded: the invariant tests import buildAll() directly, and an unguarded
// main() would rewrite the committed file on every test run. pathToFileURL —
// not string concatenation — because a repo path containing a space or a `#`
// would not compare equal to import.meta.url.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
