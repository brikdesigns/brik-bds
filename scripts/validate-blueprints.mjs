#!/usr/bin/env node

/**
 * Blueprint Library Validator
 *
 * Loads `blueprints/blueprint-library.json` and validates it against the
 * locked vocabularies declared in `content-system/blueprints/vocabularies.ts`.
 * Exits non-zero on any issue so the pre-commit and CI gates can catch
 * drift before a bad package ships to consumers.
 *
 * The inline vocabularies below mirror the TypeScript exports — duplicated
 * deliberately so this script has zero build dependencies and runs before
 * `dist/` is populated. When vocabularies change, update both places.
 *
 * Usage:
 *   node scripts/validate-blueprints.mjs
 *   npm run validate:blueprints
 */

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const libraryPath = resolve(__dirname, '..', 'blueprints', 'blueprint-library.json');

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

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const DIM = '\x1b[2m';
const NC = '\x1b[0m';

try {
  const raw = await readFile(libraryPath, 'utf8');
  const library = JSON.parse(raw);
  const issues = validateLibrary(library);

  if (issues.length === 0) {
    console.log(`${GREEN}✓${NC} blueprint-library.json valid ${DIM}(${library.blueprints.length} blueprints, v${library.version})${NC}`);
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
