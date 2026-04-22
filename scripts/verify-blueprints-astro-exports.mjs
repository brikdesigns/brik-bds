#!/usr/bin/env node
/**
 * verify-blueprints-astro-exports.mjs
 *
 * Proves that `@brikdesigns/bds/blueprints-astro` resolves correctly in
 * a real Astro 5 consumer, AS INSTALLED FROM A PACKED TARBALL of this
 * repo — i.e. exactly what a client site will see after
 * `npm install @brikdesigns/bds`. Also exercises shipped blueprint
 * components end-to-end (render + axe-core a11y scan).
 *
 * Runs on BDS pre-push and on-demand. If this script ever fails, the
 * package exports shape or a shipped blueprint is broken and no further
 * blueprint PRs should land until the failure is resolved. See
 * docs/BLUEPRINTS-ASTRO-PACKAGE.md §2.7 + §2.5 for the rationale.
 *
 * Flow:
 *   1. npm run build:lib  — emit dist/ (types compile; barrel ships source)
 *   2. npm pack           — tarball matching a real publish
 *   3. mkdtemp            — isolated scratch project
 *   4. init Astro 5       — package.json + tsconfig + astro.config
 *   5. write fixture      — imports every type + renders shipped blueprints
 *   6. npm install        — tarball + astro + @astrojs/check
 *   7. astro check        — type + import resolver
 *   8. astro build        — full SSR render to dist/
 *   9. assertions         — rendered HTML has expected markers,
 *                            no data-content-needed when facts provided
 *  10. axe-core a11y      — Playwright + axe against the built HTML,
 *                            fail on any WCAG 2.1 AA violation
 *  11. tarball sanity     — required source/dist files present
 *  12. cleanup            — on success; preserve on failure
 */

import { execSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync, readFileSync } from 'node:fs';
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
log.step('Building dist/ (types compile; .astro barrel ships source)');
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
      scripts: { check: 'astro check', build: 'astro build' },
    },
    null,
    2,
  ),
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
    2,
  ),
);

writeFileSync(
  join(scratch, 'astro.config.mjs'),
  `import { defineConfig } from 'astro/config';\nexport default defineConfig({});\n`,
);

mkdirSync(join(scratch, 'src/pages'), { recursive: true });
writeFileSync(join(scratch, 'src/env.d.ts'), `/// <reference path="../.astro/types.d.ts" />\n`);

// ── 5. Fixture — types probe + shipped blueprints render ──────────
// Populated `heroImageUrl` so HeroSplit6040 renders the image, not
// the `data-content-needed` stub. Assertions below confirm the
// rendered HTML reflects that.
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
import { HeroSplit6040 } from '@brikdesigns/bds/blueprints-astro';

const mode: ResolvedThemeMode = 'dark';
const atm: ResolvedAtmosphere = 'editorial-luxury';
const nav: ResolvedNavArchetype = 'editorial-transparent';
const foot: ResolvedFooterArchetype = 'four_col_directory';
const key: KnownBlueprintKey = 'hero_split_60_40';

const theme: ResolvedTheme = {
  themeMode: mode,
  atmosphere: atm,
  navigationArchetype: nav,
  footerArchetype: foot,
};

const clientFacts: ClientFacts = {
  brandName: 'Verify Scratch',
  tagline: 'Proving the Astro exports resolve',
  valueProposition: null,
  services: [],
  phone: null,
  email: null,
  address: null,
  hours: [],
  heroImageUrl: 'https://example.com/hero.webp',
  logoUrl: null,
  logoVariants: {},
};

const section: BlueprintSection = {
  sectionKey: 'home_hero',
  sectionType: 'hero',
  heading: 'Built to excel, driven to exceed',
  subheading: 'Proving ground',
  body: 'A single-paragraph lead that fits inside 55ch and validates the lead rendering path without actually meaning anything.',
  items: [],
  cta: { label: 'Start the conversation', url: '/contact' },
  visualNotes: {
    blueprintKey: key,
    moodKeywords: ['professional', 'luxury'],
    layoutBlueprint: 'test',
    imageOpportunity: null,
    animationSuggestion: null,
    illustrationOpportunity: null,
  },
};

const props: BlueprintProps = { section, clientFacts, theme };
---
<html lang="en">
  <head>
    <title>BDS exports verify</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <main>
      <HeroSplit6040 {...props} />
      <!-- Probe for the type-level types as well by reading props at runtime: -->
      <p data-probe="section-key">{props.section.sectionKey}</p>
      <p data-probe="brand">{props.clientFacts.brandName}</p>
      <p data-probe="atmosphere">{props.theme.atmosphere}</p>
    </main>
  </body>
</html>
`,
);

// ── 6. Install ────────────────────────────────────────────────────
log.step('Installing scratch deps (astro@5 + packed BDS tarball)');
run('npm install --no-audit --no-fund --prefer-offline', { cwd: scratch });
log.ok('install complete');

// ── 7. Check resolver via astro check ─────────────────────────────
log.step('Running astro check (type + import resolver)');
try {
  run('npx astro check', { cwd: scratch });
  log.ok('astro check passed');
} catch {
  log.fail('astro check FAILED — exports do not resolve correctly');
  log.info(`Scratch project preserved for inspection: ${scratch}`);
  log.info(`Tarball preserved for inspection:         ${tarballPath}`);
  process.exit(1);
}

// ── 8. Build ──────────────────────────────────────────────────────
log.step('Running astro build (SSR render to dist/)');
try {
  run('npx astro build', { cwd: scratch });
  log.ok('astro build passed');
} catch {
  log.fail('astro build FAILED');
  log.info(`Scratch project preserved for inspection: ${scratch}`);
  process.exit(1);
}

// ── 9. Rendered-HTML assertions ──────────────────────────────────
log.step('Asserting rendered HTML markers');
const builtHtmlPath = resolve(scratch, 'dist/index.html');
const html = readFileSync(builtHtmlPath, 'utf8');

const assertions = [
  {
    name: 'blueprint key marker present',
    pass: html.includes('data-blueprint-key="hero_split_60_40"'),
  },
  {
    name: 'headline text rendered',
    pass: html.includes('Built to excel, driven to exceed'),
  },
  {
    name: 'eyebrow rendered',
    pass: html.includes('Proving ground'),
  },
  {
    name: 'hero image src rendered',
    pass: html.includes('src="https://example.com/hero.webp"'),
  },
  {
    name: 'NO data-content-needed stub (facts provided)',
    pass: !html.includes('data-content-needed='),
  },
  {
    name: 'h1 aria-labelledby wiring present',
    pass: html.includes('aria-labelledby=') && html.includes('id="bp-hero-split-home_hero-h"'),
  },
  {
    name: 'CTA link rendered',
    pass: html.includes('href="/contact"') && html.includes('Start the conversation'),
  },
];

let failed = 0;
for (const a of assertions) {
  if (a.pass) log.info(`  ✓ ${a.name}`);
  else {
    log.fail(`  ${a.name}`);
    failed++;
  }
}
if (failed > 0) {
  log.fail(`${failed} HTML assertion(s) failed`);
  log.info(`Scratch project preserved for inspection: ${scratch}`);
  process.exit(1);
}
log.ok('All HTML markers present');

// ── 10. axe-core a11y scan ────────────────────────────────────────
log.step('Running axe-core a11y scan (WCAG 2.1 AA)');
try {
  const { chromium } = await import('playwright');
  const AxeBuilder = (await import('@axe-core/playwright')).default;

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(`file://${builtHtmlPath}`);
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  await context.close();
  await browser.close();

  if (results.violations.length > 0) {
    log.fail(`${results.violations.length} a11y violation(s):`);
    for (const v of results.violations) {
      log.info(`  [${v.impact}] ${v.id} — ${v.help}`);
      for (const node of v.nodes) {
        log.info(`     ${node.target.join(' ')}`);
      }
    }
    log.info(`Scratch project preserved for inspection: ${scratch}`);
    process.exit(1);
  }

  log.ok(`axe-core clean: ${results.passes.length} rules passed, 0 violations`);
} catch (err) {
  log.fail(`axe-core scan failed to run: ${err.message ?? err}`);
  log.info(`Scratch project preserved for inspection: ${scratch}`);
  process.exit(1);
}

// ── 11. Tarball sanity — required files present ──────────────────
log.step('Verifying tarball contents include expected paths');
const installedPkg = resolve(scratch, 'node_modules/@brikdesigns/bds');
const expectedFiles = [
  // Types (compiled)
  'dist/content-system/blueprints/astro/types.js',
  'dist/content-system/blueprints/astro/types.d.ts',
  // Barrel (source — excluded from tsc compile)
  'content-system/blueprints/astro/index.ts',
  // Component (source, .astro)
  'content-system/blueprints/astro/HeroSplit6040.astro',
];

let allPresent = true;
for (const rel of expectedFiles) {
  const abs = join(installedPkg, rel);
  try {
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

// ── 12. Cleanup ───────────────────────────────────────────────────
log.step('Cleaning up');
rmSync(scratch, { recursive: true, force: true });
rmSync(tarballPath, { force: true });
log.ok('Scratch project + tarball removed');

console.log('\n\x1b[1;32m═══════════════════════════════════════\x1b[0m');
console.log('\x1b[1;32m  blueprints-astro verified (exports + render + a11y)\x1b[0m');
console.log('\x1b[1;32m═══════════════════════════════════════\x1b[0m');
