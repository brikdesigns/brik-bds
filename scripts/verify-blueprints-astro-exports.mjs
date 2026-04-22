#!/usr/bin/env node
/**
 * verify-blueprints-astro-exports.mjs
 *
 * Proves that `@brikdesigns/bds/blueprints-astro` resolves correctly in
 * a real Astro 5 consumer, AS INSTALLED FROM A PACKED TARBALL of this
 * repo — i.e. exactly what a client site will see after
 * `npm install @brikdesigns/bds`.
 *
 * Runs on BDS pre-push and on-demand. If this script ever fails, the
 * package exports shape is broken and NO BLUEPRINT COMPONENT SHOULD
 * LAND until the exports are fixed. See
 * docs/BLUEPRINTS-ASTRO-PACKAGE.md §2.7 for the rationale.
 *
 * Flow:
 *   1. npm run build:lib   — emit dist/ so the tarball has compiled files
 *   2. npm pack            — produce a tarball matching a real publish
 *   3. mkdtemp             — isolated scratch project
 *   4. init Astro 5 minimal — package.json + tsconfig + astro.config
 *   5. npm install         — tarball + astro
 *   6. write test fixture  — imports every exported type + verifies shape
 *   7. npx astro check     — Astro's native type + import resolver
 *   8. cleanup (on success; preserve on failure for inspection)
 */

import { execSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');
const BDS_ROOT = resolve(__dirname, '..');
const SCRATCH_PREFIX = 'bds-verify-blueprints-astro-';

const log = {
  step: (msg) => console.log(`\n\x1b[1;33m▸ ${msg}\x1b[0m`),
  ok: (msg) => console.log(`\x1b[0;32m✓ ${msg}\x1b[0m`),
  fail: (msg) => console.error(`\x1b[0;31m✗ ${msg}\x1b[0m`),
  info: (msg) => console.log(`  ${msg}`),
};

function run(cmd, opts = {}) {
  return execSync(cmd, { stdio: 'inherit', ...opts });
}

function runCapture(cmd, opts = {}) {
  return execSync(cmd, { encoding: 'utf8', ...opts });
}

// ── 1. Build dist ─────────────────────────────────────────────────
log.step('Building dist/ (ensures tarball has latest compiled output)');
run('npm run build:lib', { cwd: BDS_ROOT });
log.ok('build:lib complete');

// ── 2. Pack tarball ───────────────────────────────────────────────
log.step('Packing tarball');
const packOutput = runCapture('npm pack --pack-destination /tmp', { cwd: BDS_ROOT });
const tarballName = packOutput.trim().split('\n').pop().trim();
const tarballPath = `/tmp/${tarballName}`;
log.ok(`Tarball: ${tarballPath}`);

// ── 3. Scratch project ────────────────────────────────────────────
const scratch = mkdtempSync(join(tmpdir(), SCRATCH_PREFIX));
log.step(`Scratch project: ${scratch}`);

// ── 4. Init Astro 5 minimal ───────────────────────────────────────
writeFileSync(
  join(scratch, 'package.json'),
  JSON.stringify(
    {
      name: 'bds-verify-scratch',
      version: '0.0.0',
      type: 'module',
      private: true,
      dependencies: {
        astro: '^5.0.0',
        '@astrojs/check': '^0.9.0',
        typescript: '^5.5.0',
        '@brikdesigns/bds': `file:${tarballPath}`,
      },
      scripts: { check: 'astro check' },
    },
    null,
    2
  )
);

writeFileSync(
  join(scratch, 'tsconfig.json'),
  JSON.stringify(
    {
      extends: 'astro/tsconfigs/strict',
      compilerOptions: { jsx: 'preserve' },
      include: ['src/**/*.ts', 'src/**/*.astro', 'src/**/*.d.ts'],
    },
    null,
    2
  )
);

writeFileSync(
  join(scratch, 'astro.config.mjs'),
  `import { defineConfig } from 'astro/config';\nexport default defineConfig({});\n`
);

mkdirSync(join(scratch, 'src/pages'), { recursive: true });
mkdirSync(join(scratch, 'src/env.d.ts').replace(/\/src\/env\.d\.ts$/, '/src'), { recursive: true });
writeFileSync(join(scratch, 'src/env.d.ts'), `/// <reference path="../.astro/types.d.ts" />\n`);

// Test fixture — imports every type and constructs a structurally-valid value.
// If any type fails to resolve, tsc/astro-check surfaces it as an error.
writeFileSync(
  join(scratch, 'src/pages/index.astro'),
  `---
import type {
  KnownBlueprintKey,
  BlueprintSection,
  ClientFacts,
  ResolvedThemeMode,
  ResolvedAtmosphere,
  ResolvedNavArchetype,
  ResolvedFooterArchetype,
  ResolvedTheme,
  BlueprintProps,
} from '@brikdesigns/bds/blueprints-astro';

// Type-level checks — if any import above failed to resolve, these error.
const key: KnownBlueprintKey = 'hero_split_60_40';
const mode: ResolvedThemeMode = 'dark';
const atm: ResolvedAtmosphere = 'editorial-luxury';
const nav: ResolvedNavArchetype = 'editorial-transparent';
const foot: ResolvedFooterArchetype = 'four_col_directory';

const section: BlueprintSection = {
  sectionKey: 'home_hero',
  sectionType: 'hero',
  heading: 'Test heading',
  subheading: null,
  body: null,
  items: [],
  cta: null,
  visualNotes: {
    blueprintKey: key,
    moodKeywords: ['professional'],
    layoutBlueprint: 'test',
    imageOpportunity: null,
    animationSuggestion: null,
    illustrationOpportunity: null,
  },
};

const clientFacts: ClientFacts = {
  brandName: 'Test Brand',
  tagline: null,
  valueProposition: null,
  services: [],
  phone: null,
  email: null,
  address: null,
  hours: [],
  heroImageUrl: null,
  logoUrl: null,
  logoVariants: {},
};

const theme: ResolvedTheme = {
  themeMode: mode,
  atmosphere: atm,
  navigationArchetype: nav,
  footerArchetype: foot,
};

const props: BlueprintProps = { section, clientFacts, theme };
---
<html lang="en">
  <head><title>BDS exports verify</title></head>
  <body>
    <p>sectionKey: {props.section.sectionKey}</p>
    <p>brand: {props.clientFacts.brandName}</p>
    <p>atmosphere: {props.theme.atmosphere}</p>
  </body>
</html>
`
);

// ── 5. Install ────────────────────────────────────────────────────
log.step('Installing scratch deps (astro@5 + packed BDS tarball)');
run('npm install --no-audit --no-fund --prefer-offline', { cwd: scratch });
log.ok('install complete');

// ── 6. Check resolver via astro check ─────────────────────────────
log.step('Running astro check (type + import resolver)');
try {
  run('npx astro check', { cwd: scratch });
  log.ok('astro check passed');
} catch (err) {
  log.fail('astro check FAILED — exports do not resolve correctly');
  log.info(`Scratch project preserved for inspection: ${scratch}`);
  log.info(`Tarball preserved for inspection:         ${tarballPath}`);
  process.exit(1);
}

// ── 7. Verify files shipped ───────────────────────────────────────
log.step('Verifying tarball contents include expected paths');
const installedPkg = resolve(scratch, 'node_modules/@brikdesigns/bds');
const expectedFiles = [
  'dist/content-system/blueprints/astro/index.js',
  'dist/content-system/blueprints/astro/index.d.ts',
  'dist/content-system/blueprints/astro/types.js',
  'dist/content-system/blueprints/astro/types.d.ts',
];

let allPresent = true;
for (const rel of expectedFiles) {
  const abs = join(installedPkg, rel);
  try {
    readdirSync(resolve(abs, '..'));
    // readdirSync on parent confirms parent exists; explicit check:
    execSync(`test -f ${JSON.stringify(abs)}`, { stdio: 'ignore' });
    log.info(`  ✓ ${rel}`);
  } catch {
    log.fail(`  missing: ${rel}`);
    allPresent = false;
  }
}

if (!allPresent) {
  log.fail('Tarball is missing expected files — check package.json files[] glob');
  log.info(`Scratch project preserved for inspection: ${scratch}`);
  process.exit(1);
}

log.ok('All expected files present in installed package');

// ── 8. Cleanup ────────────────────────────────────────────────────
log.step('Cleaning up');
rmSync(scratch, { recursive: true, force: true });
rmSync(tarballPath, { force: true });
log.ok('Scratch project + tarball removed');

console.log('\n\x1b[1;32m═══════════════════════════════════════\x1b[0m');
console.log('\x1b[1;32m  blueprints-astro exports verified\x1b[0m');
console.log('\x1b[1;32m═══════════════════════════════════════\x1b[0m');
