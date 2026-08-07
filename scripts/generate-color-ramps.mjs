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
 *   node scripts/generate-color-ramps.mjs --apply    # write the ramps INTO the Brand Kits (#1739)
 *
 * `--apply` is the #1739 step that makes the scale real: it moves each family's
 * literal values onto the numeric stops and turns the six legacy names into
 * `{color.<family>.<stop>}` aliases, which Style Dictionary emits as `var()`.
 * It is idempotent — re-running against an applied kit is a no-op, because
 * `resolveAnchor` follows the aliases back to the stops.
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

/**
 * Resolve one legacy anchor to a literal lowercase hex, or null.
 *
 * Accepts both shapes the Brand Kit can be in, which is what makes `--apply`
 * idempotent:
 *
 *   before --apply:  "light": { "$value": "#e35335" }
 *   after  --apply:  "light": { "$value": "{color.poppy.500}" }
 *
 * Without this the generator would break the moment its own output was applied
 * — the anchors it reads would all be aliases, every family would report
 * "missing anchor(s)", and `--check` would fail on a correct tree.
 *
 * Only same-family numeric-stop references resolve. A cross-family alias is
 * deliberately NOT followed: an anchor that points at another family's ramp is
 * a modelling error, not a value, and silently resolving it would generate a
 * ramp with no relationship to the family it is named for.
 */
function resolveAnchor(familyName, entries, name) {
  const raw = entries[name]?.$value;
  if (typeof raw !== 'string') return null;
  if (raw.startsWith('#')) return raw.toLowerCase();

  const alias = raw.match(/^\{color\.([\w-]+)\.(\d+)\}$/);
  if (!alias) return null;
  const [, aliasFamily, stop] = alias;
  if (aliasFamily !== familyName) return null;

  const target = entries[stop]?.$value;
  if (typeof target !== 'string' || !target.startsWith('#')) return null;
  return target.toLowerCase();
}

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
    if (NON_RAMP_KEYS.has(name)) continue;
    if (STOPS.includes(name)) continue; // an already-applied numeric stop

    const stop = ANCHOR_STOPS[name];
    if (!stop) {
      skipped.push({ name, reason: 'not one of the six named steps' });
      continue;
    }

    const hex = resolveAnchor(familyName, entries, name);
    if (!hex) {
      skipped.push({ name, reason: 'not a literal hex value or a numeric-stop alias' });
      continue;
    }
    stops[stop] = { hex, source: 'anchor', legacyName: name };
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
    const source = resolveAnchor(familyName, entries, name);
    if (stops[stop].hex !== source) {
      throw new Error(
        `family "${familyName}": anchor ${name} did not round-trip ` +
          `(${source} → ${stops[stop].hex})`,
      );
    }
  }

  // Once --apply has run, the Brand Kit carries the numeric stops as literals
  // and the generated file is a second copy of them. Nothing else compares the
  // two: this generator derives its output from the ANCHORS, so an edit to a
  // non-anchor stop in the kit (say poppy 600) would leave both files
  // internally consistent and silently disagreeing. Check it here.
  for (const stop of STOPS) {
    const applied = entries[stop]?.$value;
    if (typeof applied !== 'string') continue;
    if (applied.toLowerCase() !== stops[stop].hex) {
      throw new Error(
        `family "${familyName}": Brand Kit stop ${stop} is ${applied}, but the ramp ` +
          `generates ${stops[stop].hex}. The kit's numeric stops are written by ` +
          `--apply; re-run it rather than editing them.`,
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

/**
 * Rewrite the Brand Kits so the numeric stops carry the literal values and the
 * six legacy names become aliases onto them (brik-bds#1739).
 *
 *   "500":   { "$type": "color", "$value": "#e35335" }
 *   "light": { "$type": "color", "$value": "{color.poppy.500}" }
 *
 * Style Dictionary emits a `{…}` reference as `var(--…)`, so
 * `--color-poppy-light: var(--color-poppy-500)` — one value per color, and
 * every one of the 606 existing call sites keeps resolving. The alternative
 * (both names emitting literal hex) leaves the same color with two sources of
 * truth that drift apart on the next retune.
 *
 * `$description` moves to the numeric stop, because it describes the COLOR;
 * the alias gets a deprecation note instead, which Style Dictionary carries
 * through as the CSS comment a reader sees at the call site.
 *
 * Idempotent: re-running against an already-applied kit produces the identical
 * file, because `resolveAnchor` follows the aliases back to the stops.
 */
export function applyToKits() {
  const kitFiles = fs
    .readdirSync(KITS_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort();

  const changed = [];

  for (const file of kitFiles) {
    const kitPath = path.join(KITS_DIR, file);
    const kit = JSON.parse(fs.readFileSync(kitPath, 'utf8'));
    const families = kit['primitives/value'].color;
    const before = JSON.stringify(kit);

    for (const familyName of Object.keys(families)) {
      const entries = families[familyName];
      const { stops } = buildRamp(familyName, entries);

      const next = {};

      // Absolute endpoints first, unchanged — white and black are shared by the
      // whole system, not steps in any family's ladder.
      for (const key of Object.keys(entries)) {
        if (NON_RAMP_KEYS.has(key)) next[key] = entries[key];
      }

      // Numeric stops carry the values.
      for (const stop of STOPS) {
        const { hex, source, legacyName } = stops[stop];
        const carried = source === 'anchor' ? entries[legacyName] : undefined;
        next[stop] = {
          $extensions: carried?.$extensions ?? entries[stop]?.$extensions ?? {
            'com.figma.scopes': ['ALL_SCOPES'],
          },
          $type: 'color',
          $value: hex,
          ...(carried?.$description ? { $description: carried.$description } : {}),
        };
      }

      // Legacy names become aliases onto their pinned stop.
      for (const [legacyName, stop] of Object.entries(ANCHOR_STOPS)) {
        next[legacyName] = {
          $extensions: entries[legacyName]?.$extensions ?? {
            'com.figma.scopes': ['ALL_SCOPES'],
          },
          $type: 'color',
          $value: `{color.${familyName}.${stop}}`,
          $description: `DEPRECATED — use color.${familyName}.${stop} (brik-bds#1739)`,
        };
      }

      families[familyName] = next;
    }

    const after = `${JSON.stringify(kit, null, 2)}\n`;
    if (before !== JSON.stringify(JSON.parse(after))) {
      changed.push(path.relative(REPO_ROOT, kitPath));
    }
    fs.writeFileSync(kitPath, after);
  }

  return changed;
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
  const apply = args.includes('--apply');

  if (apply) {
    const changed = applyToKits();
    process.stdout.write(
      changed.length > 0
        ? `✓ applied ramps to ${changed.join(', ')}\n` +
            `  Next: npm run merge:tokens-studio && npm run build:sd-figma\n`
        : '✓ Brand Kits already carry the applied ramps — no change.\n',
    );
    // Fall through so the generated file is rewritten from the new kit state;
    // they must agree or `--check` fails on the very tree --apply produced.
  }

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
