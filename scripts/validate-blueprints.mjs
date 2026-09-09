#!/usr/bin/env node

/**
 * Blueprint Library Validator
 *
 * Loads `blueprints/blueprint-library.json` (the shipped inventory) and
 * `blueprints/blueprint-roadmap.json` (designed-but-unbuilt candidates) and
 * validates both against the locked vocabularies declared in
 * `content-system/blueprints/vocabularies.ts`. Exits non-zero on any issue so
 * the pre-commit and CI gates can catch drift before a bad package ships to
 * consumers.
 *
 * The inline vocabularies below mirror the TypeScript exports — duplicated
 * deliberately so this script has zero build dependencies and runs before
 * `dist/` is populated. When vocabularies change, update both places.
 *
 * Usage:
 *   node scripts/validate-blueprints.mjs
 *   npm run validate:blueprints
 *   node scripts/validate-blueprints.mjs --root <dir>   # tests only
 *
 * `--root` repoints every input at a throwaway tree so the gate's own tests can
 * plant a violation and assert the exit code, without touching real blueprint
 * data. Same seam as `scripts/lint-disabled-fade.mjs` (#1697), and what lets
 * #2313 AC 2 be a committed test rather than a one-off manual demonstration.
 */

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const rootFlag = process.argv.indexOf('--root');
if (rootFlag !== -1 && !process.argv[rootFlag + 1]) {
  console.error('validate-blueprints: --root needs a directory argument.');
  process.exit(2);
}
const ROOT = rootFlag === -1 ? resolve(__dirname, '..') : resolve(process.argv[rootFlag + 1]);

const libraryPath = resolve(ROOT, 'blueprints', 'blueprint-library.json');
const roadmapPath = resolve(ROOT, 'blueprints', 'blueprint-roadmap.json');
const astroDir = resolve(ROOT, 'content-system', 'blueprints', 'astro');
const reactDir = resolve(ROOT, 'content-system', 'blueprints', 'react');
const dispatcherPath = resolve(astroDir, 'BlueprintDispatcher.astro');
const reactDispatcherPath = resolve(reactDir, 'BlueprintDispatcher.tsx');
const typesPath = resolve(astroDir, 'types.ts');

const MOOD_VALUES = new Set([
  'bold', 'minimal', 'warm', 'corporate', 'playful', 'luxury',
  'trustworthy', 'energetic', 'professional', 'modern', 'approachable',
]);

const INDUSTRY_TAG_VALUES = new Set([
  'universal', 'healthcare', 'real_estate', 'legal', 'finance', 'saas',
  'ecommerce', 'beauty', 'salon', 'hospitality', 'restaurant', 'luxury',
  'corporate', 'dental', 'veterinary',
]);

const SECTION_TYPE_VALUES = new Set([
  'hero', 'nav', 'services', 'features', 'stats', 'testimonials',
  'cta', 'gallery', 'team', 'faq', 'content_block',
]);

const PATTERN_TYPE_VALUES = new Set([
  'carousel', 'scroll-reveal', 'hover-card', 'parallax', 'counter',
  'accordion', 'lightbox',
]);

const BLUEPRINT_TIER_VALUES = new Set(['internal', 'template']);

const PROJECTION_FIELDS = ['personality', 'visual_style', 'industry_slugs', 'is_universal'];

const KEY_PATTERN = /^[a-z][a-z0-9_]*$/;
const SEMVER_PATTERN = /^\d+\.\d+\.\d+/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function validateBlueprint(bp, issues) {
  const push = (field, message) => issues.push({ key: bp.key ?? '<unknown>', field, message });

  if (!bp.key || !KEY_PATTERN.test(bp.key)) {
    push('key', `Invalid key "${bp.key}" — must be snake_case lowercase.`);
  }
  if (!bp.name || !bp.name.trim()) push('name', 'Name is required.');
  if (!SECTION_TYPE_VALUES.has(bp.section_type)) {
    push('section_type', `Unknown section_type "${bp.section_type}".`);
  }

  if (!Array.isArray(bp.moods) || bp.moods.length === 0) {
    push('moods', 'At least one mood is required.');
  } else {
    for (const m of bp.moods) {
      if (!MOOD_VALUES.has(m)) push('moods', `Unknown mood "${m}".`);
    }
  }

  if (!Array.isArray(bp.industries) || bp.industries.length === 0) {
    push('industries', 'At least one industry tag is required.');
  } else {
    for (const i of bp.industries) {
      if (!INDUSTRY_TAG_VALUES.has(i)) push('industries', `Unknown industry tag "${i}".`);
    }
  }

  const hasLayout = bp.layout_spec && bp.layout_spec.trim();
  const hasPattern = bp.pattern_spec && bp.pattern_spec.trim();
  if (!hasLayout && !hasPattern) {
    push('layout_spec', 'Must have either layout_spec or pattern_spec — a blueprint with neither describes nothing.');
  }

  if (bp.pattern_type !== undefined && !PATTERN_TYPE_VALUES.has(bp.pattern_type)) {
    push('pattern_type', `Unknown pattern_type "${bp.pattern_type}".`);
  }

  if (!BLUEPRINT_TIER_VALUES.has(bp.tier)) {
    push('tier', `Unknown tier "${bp.tier}".`);
  }

  if (typeof bp.is_active !== 'boolean') {
    push('is_active', `Expected boolean, got ${typeof bp.is_active}.`);
  }

  if (!SEMVER_PATTERN.test(bp.version ?? '')) {
    push('version', `Invalid semver "${bp.version}".`);
  }
  if (!ISO_DATE_PATTERN.test(bp.last_reviewed ?? '')) {
    push('last_reviewed', `Invalid ISO date "${bp.last_reviewed}".`);
  }

  // required_facts — see docs/BLUEPRINTS-ASTRO-PACKAGE.md §2.4.
  // Must be present (empty array if none) so the scaffold-task
  // preflight has an unambiguous contract for every blueprint.
  if (!Array.isArray(bp.required_facts)) {
    push(
      'required_facts',
      'Must be an array of snake_case client-fact identifiers (empty array if none required).',
    );
  } else {
    for (const f of bp.required_facts) {
      if (typeof f !== 'string' || !KEY_PATTERN.test(f)) {
        push('required_facts', `Invalid required_fact "${f}" — must be snake_case lowercase.`);
      }
    }
  }

  for (const field of PROJECTION_FIELDS) {
    if (bp[field] !== undefined) {
      push(field, `Projection field "${field}" is derived — remove from source JSON.`);
    }
  }
}

function validateLibrary(library) {
  const issues = [];

  if (!SEMVER_PATTERN.test(library.version ?? '')) {
    issues.push({ key: '<library>', field: 'version', message: `Invalid semver "${library.version}".` });
  }
  if (!ISO_DATE_PATTERN.test(library.last_reviewed ?? '')) {
    issues.push({ key: '<library>', field: 'last_reviewed', message: `Invalid ISO date "${library.last_reviewed}".` });
  }
  if (!['quarterly', 'biannual', 'annual'].includes(library.review_cadence)) {
    issues.push({ key: '<library>', field: 'review_cadence', message: `Invalid review_cadence "${library.review_cadence}".` });
  }
  if (!Array.isArray(library.blueprints)) {
    issues.push({ key: '<library>', field: 'blueprints', message: 'blueprints must be an array.' });
    return issues;
  }

  const seen = new Set();
  for (const bp of library.blueprints) {
    if (bp.key && seen.has(bp.key)) {
      issues.push({ key: bp.key, field: 'key', message: `Duplicate key "${bp.key}".` });
    }
    if (bp.key) seen.add(bp.key);
    validateBlueprint(bp, issues);
  }

  return issues;
}

/**
 * Extract the BLUEPRINT_REGISTRY key set from BlueprintDispatcher.astro.
 * The registry is a `const BLUEPRINT_REGISTRY = { key: Component, ... } as const`
 * object; we read the `key:` identifiers from that block.
 */
function extractRegistryKeys(source) {
  const block = source.match(/const BLUEPRINT_REGISTRY\s*=\s*\{([\s\S]*?)\}\s*as const/);
  if (!block) return null;
  return block[1]
    .split('\n')
    .map((line) => line.match(/^\s*([a-z][a-z0-9_]*)\s*:/))
    .filter(Boolean)
    .map((m) => m[1]);
}

/**
 * Extract the BLUEPRINT_REGISTRY key set from the React
 * BlueprintDispatcher.tsx. The React registry is a
 * `const BLUEPRINT_REGISTRY: Partial<Record<...>> = { key: Component, ... };`
 * object (no `as const`); we read the `key:` identifiers from that block.
 */
function extractReactRegistryKeys(source) {
  const block = source.match(/const BLUEPRINT_REGISTRY\b[\s\S]*?=\s*\{([\s\S]*?)\n\}/);
  if (!block) return null;
  return block[1]
    .split('\n')
    .map((line) => line.match(/^\s*([a-z][a-z0-9_]*)\s*:/))
    .filter(Boolean)
    .map((m) => m[1]);
}

/**
 * Extract the WIRED_BLUEPRINT_KEYS array literal from types.ts.
 */
function extractWiredKeys(source) {
  const block = source.match(/export const WIRED_BLUEPRINT_KEYS\s*=\s*\[([\s\S]*?)\]\s*as const/);
  if (!block) return null;
  return [...block[1].matchAll(/'([a-z][a-z0-9_]*)'/g)].map((m) => m[1]);
}

/**
 * Gate: the dispatcher's wired registry, the exported WIRED_BLUEPRINT_KEYS
 * list, and library.json's active keys must agree. Prevents the
 * implemented-set from drifting across the three places it's encoded.
 */
function validateRegistrySync(library, dispatcherSrc, typesSrc) {
  const issues = [];
  const push = (field, message) => issues.push({ key: '<registry-sync>', field, message });

  const registryKeys = extractRegistryKeys(dispatcherSrc);
  const wiredKeys = extractWiredKeys(typesSrc);

  if (!registryKeys) {
    push('BLUEPRINT_REGISTRY', 'Could not parse BLUEPRINT_REGISTRY in BlueprintDispatcher.astro.');
    return issues;
  }
  if (!wiredKeys) {
    push('WIRED_BLUEPRINT_KEYS', 'Could not parse WIRED_BLUEPRINT_KEYS in astro/types.ts.');
    return issues;
  }

  const registrySet = new Set(registryKeys);
  const wiredSet = new Set(wiredKeys);
  const activeSet = new Set(
    (library.blueprints ?? []).filter((b) => b.is_active === true).map((b) => b.key),
  );

  for (const k of registrySet) {
    if (!wiredSet.has(k)) push('WIRED_BLUEPRINT_KEYS', `Registry key "${k}" is missing from WIRED_BLUEPRINT_KEYS.`);
  }
  for (const k of wiredSet) {
    if (!registrySet.has(k)) push('BLUEPRINT_REGISTRY', `WIRED_BLUEPRINT_KEYS key "${k}" has no registry entry.`);
    if (!activeSet.has(k)) push('is_active', `Wired key "${k}" is not an active blueprint in library.json.`);
  }

  // The third direction (#2313). The two loops above walk registry → wired and
  // wired → {registry, active}; nothing walked `activeSet`, so a key that was
  // `is_active: true` and absent from BOTH runtime sets was invisible to this
  // gate. `npm run validate` was green with 18 keys in exactly that state, and
  // `is_active` is the seed filter for the portal's content-generator
  // vocabulary — so the generator was offered blueprints that render
  // `<BlueprintFallback>` and nothing objected (#2308).
  //
  // Landable only because #2308 emptied the violation set to 0 and #2317
  // re-wired the last straggler (`stats_bar`, #2012). The rule ships
  // without an allowlist on purpose: ADR-006 §157 is the precedent against
  // shipping a rule alongside the exemptions that make it pass.
  for (const k of activeSet) {
    if (!registrySet.has(k) && !wiredSet.has(k)) {
      push(
        'is_active',
        `Active key "${k}" dispatches on neither rail — no BLUEPRINT_REGISTRY entry and not in ` +
          'WIRED_BLUEPRINT_KEYS. `is_active: true` means renderable, and consumers read it that way ' +
          '(the portal builds `blueprintKeySchema` from it). Either wire it on the canonical Astro ' +
          'rail (ADR-037) or move it to blueprints/blueprint-roadmap.json.',
      );
    }
  }

  return issues;
}

/**
 * Gate: the Astro and React BlueprintDispatcher registries must expose the
 * SAME key set. The two dispatchers are hand-maintained twins (brik-bds#2010);
 * a key wired in one runtime but not the other renders a real section in one
 * consumer and silently falls through to `<BlueprintFallback>` in the other —
 * the exact drift that shipped `stats_bar` + `testimonials_featured_large`
 * to Astro only. This gate fails the build the moment the sets diverge.
 */
function validateRuntimeParity(astroDispatcherSrc, reactDispatcherSrc) {
  const issues = [];
  const push = (field, message) => issues.push({ key: '<runtime-parity>', field, message });

  const astroKeys = extractRegistryKeys(astroDispatcherSrc);
  const reactKeys = extractReactRegistryKeys(reactDispatcherSrc);

  if (!astroKeys) {
    push('astro/BlueprintDispatcher.astro', 'Could not parse BLUEPRINT_REGISTRY in the Astro dispatcher.');
    return issues;
  }
  if (!reactKeys) {
    push('react/BlueprintDispatcher.tsx', 'Could not parse BLUEPRINT_REGISTRY in the React dispatcher.');
    return issues;
  }

  const astroSet = new Set(astroKeys);
  const reactSet = new Set(reactKeys);

  for (const k of astroSet) {
    if (!reactSet.has(k)) push('react/BlueprintDispatcher.tsx', `Astro key "${k}" has no React registry entry — it renders in Astro but falls back in React.`);
  }
  for (const k of reactSet) {
    if (!astroSet.has(k)) push('astro/BlueprintDispatcher.astro', `React key "${k}" has no Astro registry entry — it renders in React but falls back in Astro.`);
  }

  return issues;
}

/**
 * Cadence in days. `review_cadence` is prose in the JSON, so the mapping
 * lives here rather than in the data.
 */
const CADENCE_DAYS = new Map([
  ['quarterly', 92],
  ['biannual', 183],
  ['annual', 366],
]);

/**
 * Gate: `review_cadence` must be a trigger, not a decoration (#2308 AC 6).
 *
 * `blueprint-library.json` declared `review_cadence: "quarterly"` and
 * `last_reviewed: "2026-04-18"` and then went five months unreviewed, during
 * which 18 of its 29 active keys silently became phantom. A cadence nothing
 * enforces is what produced that backlog, so the declaration now fails the
 * build once it lapses. Fix by doing the review and updating `last_reviewed`
 * — or by dropping `review_cadence`, which this gate treats as an explicit
 * choice rather than an omission.
 *
 * Budget: folded into the existing `validate:blueprints` step (already in
 * `npm run validate` and the pre-commit hook). No new workflow, no new
 * trigger, no added CI runtime.
 */
function validateReviewCadence(doc, label, today) {
  const issues = [];
  const push = (field, message) => issues.push({ key: `<${label}>`, field, message });

  if (doc.review_cadence === undefined) return issues; // dropped on purpose
  const window = CADENCE_DAYS.get(doc.review_cadence);
  if (window === undefined) {
    push(
      'review_cadence',
      `Unknown cadence "${doc.review_cadence}" — expected one of ${[...CADENCE_DAYS.keys()].join(', ')}, ` +
        'or drop the field if the review is not on a schedule.',
    );
    return issues;
  }

  if (!ISO_DATE_PATTERN.test(doc.last_reviewed ?? '')) {
    push('last_reviewed', `Expected an ISO date (YYYY-MM-DD), got "${doc.last_reviewed}".`);
    return issues;
  }

  const elapsed = Math.floor((today - Date.parse(doc.last_reviewed)) / 86_400_000);
  if (elapsed > window) {
    push(
      'last_reviewed',
      `Review is ${elapsed - window} day(s) overdue — last reviewed ${doc.last_reviewed}, ` +
        `cadence "${doc.review_cadence}" allows ${window} days. Re-triage the keys, then bump ` +
        '`last_reviewed`. See docs/adrs/ADR-037 and brik-bds#2308.',
    );
  }

  return issues;
}

/**
 * Gate: the roadmap must stay schema-distinct from the inventory (#2308 AC 1).
 *
 * `blueprint-roadmap.json` holds designed-but-unbuilt layouts. The whole point
 * of a separate file is that no consumer can read it as an available-key set,
 * so the shape is checked, not just the contents: `candidates` rather than
 * `blueprints`, and **no `is_active` field on any entry**. Re-introducing
 * `is_active` here would recreate the exact confusion #2308 removed — the flag
 * every consumer reads as "renderable" sitting on a key that renders nothing.
 *
 * A roadmap key must also never appear in the library, either registry, or
 * `WIRED_BLUEPRINT_KEYS`; a graduating candidate moves, it does not get copied.
 */
function validateRoadmap(roadmap, library, registryKeys, wiredKeys) {
  const issues = [];
  const push = (key, field, message) => issues.push({ key, field, message });

  if (roadmap.kind !== 'blueprint-roadmap') {
    push('<roadmap>', 'kind', `Expected kind "blueprint-roadmap", got "${roadmap.kind}".`);
  }
  if ('blueprints' in roadmap) {
    push('<roadmap>', 'blueprints', 'Roadmap entries live under `candidates`, never `blueprints` — the key name is the schema distinction.');
  }
  if (!Array.isArray(roadmap.candidates)) {
    push('<roadmap>', 'candidates', 'Expected an array of candidates.');
    return issues;
  }

  const libraryKeys = new Set((library.blueprints ?? []).map((b) => b.key));
  const dispatching = new Set([...(registryKeys ?? []), ...(wiredKeys ?? [])]);
  const seen = new Set();

  for (const c of roadmap.candidates) {
    const key = c.key ?? '<unknown>';

    if (!c.key || !KEY_PATTERN.test(c.key)) {
      push(key, 'key', `Invalid key "${c.key}" — must be snake_case lowercase.`);
    }
    if (seen.has(c.key)) push(key, 'key', 'Duplicate candidate key.');
    seen.add(c.key);

    if ('is_active' in c) {
      push(key, 'is_active', 'A roadmap candidate must not carry `is_active` — consumers read that flag as "renderable", and nothing here renders.');
    }
    if ('tier' in c) {
      push(key, 'tier', '`tier` is an inventory field; a candidate has no tier until it ships.');
    }
    if (c.disposition !== 'roadmap') {
      push(key, 'disposition', `Expected disposition "roadmap", got "${c.disposition}" — a built key belongs in blueprint-library.json, a retired one in neither file.`);
    }
    if (!c.name || !c.name.trim()) push(key, 'name', 'Name is required.');
    if (!SECTION_TYPE_VALUES.has(c.section_type)) {
      push(key, 'section_type', `Unknown section_type "${c.section_type}".`);
    }
    if (!c.layout_spec?.trim() && !c.pattern_spec?.trim()) {
      push(key, 'layout_spec', 'Must have either layout_spec or pattern_spec — a candidate with neither describes nothing.');
    }

    if (libraryKeys.has(c.key)) {
      push(key, 'key', 'Also present in blueprint-library.json — a graduating candidate moves, it is not copied.');
    }
    if (dispatching.has(c.key)) {
      push(key, 'key', 'Dispatches on a rail — it has shipped, so it belongs in blueprint-library.json, not the roadmap.');
    }
  }

  return issues;
}

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const DIM = '\x1b[2m';
const NC = '\x1b[0m';

try {
  const raw = await readFile(libraryPath, 'utf8');
  const library = JSON.parse(raw);
  const roadmap = JSON.parse(await readFile(roadmapPath, 'utf8'));
  const dispatcherSrc = await readFile(dispatcherPath, 'utf8');
  const reactDispatcherSrc = await readFile(reactDispatcherPath, 'utf8');
  const typesSrc = await readFile(typesPath, 'utf8');
  const today = Date.now();
  const issues = [
    ...validateLibrary(library),
    ...validateRegistrySync(library, dispatcherSrc, typesSrc),
    ...validateRuntimeParity(dispatcherSrc, reactDispatcherSrc),
    ...validateRoadmap(
      roadmap,
      library,
      extractRegistryKeys(dispatcherSrc),
      extractWiredKeys(typesSrc),
    ),
    ...validateReviewCadence(library, 'library-cadence', today),
    ...validateReviewCadence(roadmap, 'roadmap-cadence', today),
  ];

  if (issues.length === 0) {
    const wiredCount = (extractWiredKeys(typesSrc) ?? []).length;
    console.log(`${GREEN}✓${NC} blueprint-library.json valid ${DIM}(${library.blueprints.length} blueprints, ${wiredCount} wired, v${library.version})${NC}`);
    console.log(`${GREEN}✓${NC} blueprint-roadmap.json valid ${DIM}(${roadmap.candidates.length} candidates, v${roadmap.version})${NC}`);
    process.exit(0);
  }

  console.error(`${RED}✗${NC} blueprint-library.json has ${issues.length} issue${issues.length === 1 ? '' : 's'}:\n`);
  for (const { key, field, message } of issues) {
    console.error(`  ${RED}${key}${NC} ${DIM}${field}${NC}: ${message}`);
  }
  process.exit(1);
} catch (err) {
  console.error(`${RED}✗${NC} Failed to load ${libraryPath}:`);
  console.error(`  ${err.message}`);
  process.exit(1);
}
