#!/usr/bin/env node

/**
 * BDS Blueprint Naming Lint
 *
 * Enforces the rules in
 * `docs-site/content/docs/primitives/naming-conventions.mdx` against the
 * blueprints in `content-system/blueprints/{react,astro}/`. Catches the
 * five drift patterns that agents introduced in the first generation of
 * blueprints:
 *
 *   1. Banned BEM slot suffixes (`__eyebrow`, `__headline`, `__heading`,
 *      `__hero-title`, `__page-heading`, `__body`) — translate to canon
 *      (`__subtitle`, `__title`, `__description`).
 *   2. Banned/invented `variant` axis values — must be `primary` or
 *      `secondary`.
 *   3. Hand-rolled markup that duplicates a BDS primitive
 *      (`<blockquote>` instead of CardTestimonial, hardcoded
 *      `aspect-ratio` instead of Frame).
 *   4. Unstable `aria-labelledby` ids that bake the layout name into the
 *      a11y plumbing (`id="bp-{layout}-${key}-h"`).
 *   5. Blueprint .tsx files that import zero BDS components — almost
 *      always hand-rolled drift.
 *
 * Usage:
 *   node scripts/lint-blueprint-naming.mjs              # scan all blueprints
 *   node scripts/lint-blueprint-naming.mjs --files a b  # scan specific files
 *   node scripts/lint-blueprint-naming.mjs --errors-only
 *
 * Exit codes:
 *   0 = no errors
 *   1 = errors found
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const BLUEPRINTS_DIR = path.join(REPO_ROOT, 'content-system', 'blueprints');

// ── CLI args ──────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const errorsOnly = args.includes('--errors-only');
const fileFlagIdx = args.indexOf('--files');
const explicitFiles =
  fileFlagIdx >= 0 ? args.slice(fileFlagIdx + 1).filter((a) => !a.startsWith('--')) : null;

// ── Rules ─────────────────────────────────────────────────────────────────

// BEM slot suffixes that violate canon. Map → correct canon name.
const BANNED_SUFFIXES = {
  '__eyebrow': '__subtitle',
  '__headline': '__title',
  '__heading': '__title',
  '__hero-title': '__title',
  '__page-heading': '__title',
  '__body': '__description',
};

// `variant` axis is hierarchy — only these values are valid.
const VALID_VARIANTS = new Set(['primary', 'secondary']);

// BEM blocks where `__heading` is grandfathered (rename tracked separately).
// Blueprints are NOT on this list — they must use `__title`.
const HEADING_EXCEPTIONS = [/\bbds-sheet-section__heading\b/];

// Files that legitimately reinvent markup or have no BDS-primitive use
// case (registry / fallback / fixtures).
const SKIP_FILES = new Set([
  'BlueprintFallback.tsx',
  'BlueprintFallback.css',
  'BlueprintDispatcher.tsx',
  'BlueprintDispatcher.astro',
  '_fixtures.ts',
]);

// ── Helpers ───────────────────────────────────────────────────────────────

function listBlueprintFiles() {
  const out = [];
  for (const subdir of ['react', 'astro']) {
    const dir = path.join(BLUEPRINTS_DIR, subdir);
    if (!fs.existsSync(dir)) continue;
    for (const name of fs.readdirSync(dir)) {
      if (SKIP_FILES.has(name)) continue;
      if (!/\.(tsx|astro|css)$/.test(name)) continue;
      out.push(path.join(dir, name));
    }
  }
  return out;
}

function readLines(file) {
  return fs.readFileSync(file, 'utf8').split('\n');
}

function relPath(file) {
  return path.relative(REPO_ROOT, file);
}

/**
 * Returns true if the line falls inside any exception substring (e.g. the
 * `bds-sheet-section__heading` grandfathered case).
 */
function lineIsExempt(line, suffix) {
  if (suffix !== '__heading') return false;
  return HEADING_EXCEPTIONS.some((re) => re.test(line));
}

// ── Checks ────────────────────────────────────────────────────────────────

function checkBannedSuffixes(file, errors) {
  const lines = readLines(file);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const [suffix, replacement] of Object.entries(BANNED_SUFFIXES)) {
      // Match the suffix when it follows a word-character (i.e. attached to
      // a BEM block, not a stray hyphen pattern). Word-boundary anchoring
      // keeps us from matching `__body` inside `__body-text-color`.
      const re = new RegExp(`\\w${suffix.replace(/[-]/g, '\\-')}(?![a-zA-Z-])`, 'g');
      if (re.test(line) && !lineIsExempt(line, suffix)) {
        errors.push({
          file,
          line: i + 1,
          severity: 'error',
          rule: 'banned-suffix',
          message: `\`${suffix}\` is a banned BEM slot — use \`${replacement}\` (see naming-conventions.mdx#title-vs-heading)`,
          snippet: line.trim().slice(0, 120),
        });
      }
    }
  }
}

function checkVariantValues(file, errors) {
  if (!file.endsWith('.tsx') && !file.endsWith('.astro')) return;
  const lines = readLines(file);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Match `variant="foo"` literals only (skip dynamic `variant={...}`).
    const m = line.match(/\bvariant=["']([^"']+)["']/);
    if (m && !VALID_VARIANTS.has(m[1])) {
      errors.push({
        file,
        line: i + 1,
        severity: 'error',
        rule: 'invented-variant',
        message: `\`variant="${m[1]}"\` is not a canon value — must be \`primary\` or \`secondary\` (see naming-conventions.mdx#axes)`,
        snippet: line.trim().slice(0, 120),
      });
    }
  }
}

function checkUnstableIds(file, errors) {
  if (!file.endsWith('.tsx') && !file.endsWith('.astro')) return;
  const lines = readLines(file);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Catches three drift shapes:
    //   1. const headingId = `bp-{layout}-${...}-h`
    //   2. id="bp-{layout}-${...}-h"
    //   3. id={`bp-{layout}-${...}-h`}
    // The signature is `bp-` layout name + an interpolation + `-h` suffix.
    const hasBpId =
      /`bp-[a-z0-9-]+-\$\{[^`]*\}-h`/.test(line) ||
      /\bid=["']bp-[a-z0-9-]+-[^"']*-h["']/.test(line);
    if (hasBpId) {
      errors.push({
        file,
        line: i + 1,
        severity: 'error',
        rule: 'unstable-id',
        message:
          'id bakes layout name + `-h` shape suffix — generate from BEM role + content key (see naming-conventions.mdx#stable-ids-and-aria-labelledby)',
        snippet: line.trim().slice(0, 120),
      });
    }
  }
}

function checkBlueprintComposition(file, errors) {
  if (!file.endsWith('.tsx')) return;
  if (!file.includes(path.sep + 'react' + path.sep)) return;
  if (path.basename(file).endsWith('.stories.tsx')) return;
  if (SKIP_FILES.has(path.basename(file))) return;

  const text = fs.readFileSync(file, 'utf8');

  // Hand-rolled pull-quote markup
  if (/<blockquote\b/.test(text)) {
    const lineNo = text.split('\n').findIndex((l) => /<blockquote\b/.test(l)) + 1;
    errors.push({
      file,
      line: lineNo,
      severity: 'error',
      rule: 'reinvented-primitive',
      message:
        'Hand-rolled `<blockquote>` duplicates `CardTestimonial` — import from `components/ui/CardTestimonial` instead (see naming-conventions.mdx#pull-quotes-callouts-and-banners)',
      snippet: '',
    });
  }

  // Blueprint imports nothing from the BDS components barrel — strong drift
  // signal. Matches both the barrel (`../../../components`) and the
  // per-component path (`../../../components/ui/Card`).
  const importsBds = /from\s+['"][^'"]*\/components(\/[^'"]*)?['"]/.test(text);
  if (!importsBds) {
    errors.push({
      file,
      line: 1,
      severity: 'warn',
      rule: 'zero-primitive-imports',
      message:
        'Blueprint imports zero from `components/ui/*` — likely hand-rolling markup that belongs in a primitive',
      snippet: '',
    });
  }
}

function checkHardcodedAspectRatio(file, errors) {
  if (!file.endsWith('.css')) return;
  const lines = readLines(file);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // `aspect-ratio: 4 / 3;` (literal numeric ratio, not a custom property)
    if (/^\s*aspect-ratio\s*:\s*\d/.test(line)) {
      errors.push({
        file,
        line: i + 1,
        severity: 'error',
        rule: 'hardcoded-aspect-ratio',
        message:
          'Hardcoded `aspect-ratio` in blueprint CSS — use `<Frame customRatio="..." />` or a preset (see naming-conventions.mdx#blueprints)',
        snippet: line.trim().slice(0, 120),
      });
    }
  }
}

// ── Run ───────────────────────────────────────────────────────────────────

const files = explicitFiles
  ? explicitFiles
      .map((f) => path.resolve(REPO_ROOT, f))
      .filter((f) => fs.existsSync(f) && f.includes(`${path.sep}content-system${path.sep}blueprints${path.sep}`))
  : listBlueprintFiles();

const findings = [];
for (const file of files) {
  if (SKIP_FILES.has(path.basename(file))) continue;
  checkBannedSuffixes(file, findings);
  checkVariantValues(file, findings);
  checkUnstableIds(file, findings);
  checkBlueprintComposition(file, findings);
  checkHardcodedAspectRatio(file, findings);
}

const errors = findings.filter((f) => f.severity === 'error');
const warnings = findings.filter((f) => f.severity === 'warn');

function printGroup(title, group) {
  if (group.length === 0) return;
  console.log(`\n${title}\n`);
  for (const f of group) {
    console.log(`  ${relPath(f.file)}:${f.line}  [${f.rule}]`);
    console.log(`    ${f.message}`);
    if (f.snippet) console.log(`    │ ${f.snippet}`);
  }
}

printGroup(`✗ Blueprint naming errors (${errors.length})`, errors);
if (!errorsOnly) {
  printGroup(`⚠ Blueprint naming warnings (${warnings.length})`, warnings);
}

if (errors.length > 0) {
  console.log(
    `\n  ${errors.length} error${errors.length === 1 ? '' : 's'} — see docs-site/content/docs/primitives/naming-conventions.mdx`,
  );
  process.exit(1);
}

if (warnings.length === 0 && errors.length === 0) {
  console.log(`✓ Blueprint naming clean (${files.length} files scanned)`);
}
