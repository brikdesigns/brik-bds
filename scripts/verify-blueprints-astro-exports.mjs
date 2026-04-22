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

// ── 5. Fixture — types probe + all shipped blueprints rendered ────
// Composes a realistic small-business home page: hero → stats →
// services → about → testimonials → CTA, plus an interior-style
// hero + dark CTA below to cover every v0.1 blueprint. clientFacts
// populated so required_facts (hero_image_url, phone, email) all
// resolve — no data-content-needed stubs expected.
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
import {
  HeroSplit6040,
  HeroInteriorMinimal,
  StatsDarkBar,
  ServicesDetailTwoColumn,
  AboutStorySplit,
  TestimonialsFeaturedLarge,
  CtaSplitContact,
  CtaDarkCentered,
} from '@brikdesigns/bds/blueprints-astro';

const mode: ResolvedThemeMode = 'dark';
const atm: ResolvedAtmosphere = 'editorial-luxury';
const nav: ResolvedNavArchetype = 'editorial-transparent';
const foot: ResolvedFooterArchetype = 'four_col_directory';

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
  phone: '+1-615-555-0100',
  email: 'hello@example.com',
  address: null,
  hours: [],
  heroImageUrl: 'https://example.com/hero.webp',
  logoUrl: null,
  logoVariants: {},
};

function makeSection(overrides: Partial<BlueprintSection> & { sectionKey: string; sectionType: string; blueprintKey: KnownBlueprintKey }): BlueprintSection {
  const { blueprintKey, sectionKey, sectionType, ...rest } = overrides;
  return {
    sectionKey,
    sectionType,
    heading: null,
    subheading: null,
    body: null,
    items: [],
    cta: null,
    visualNotes: {
      blueprintKey,
      moodKeywords: ['professional'],
      layoutBlueprint: 'test',
      imageOpportunity: null,
      animationSuggestion: null,
      illustrationOpportunity: null,
    },
    ...rest,
  };
}

const heroSplitProps: BlueprintProps = {
  theme, clientFacts,
  section: makeSection({
    sectionKey: 'home_hero',
    sectionType: 'hero',
    blueprintKey: 'hero_split_60_40',
    heading: 'Built to excel, driven to exceed',
    subheading: 'Proving ground',
    body: 'A single-paragraph lead that fits inside 55ch and validates the lead rendering path.',
    cta: { label: 'Start the conversation', url: '/contact' },
  }),
};

const statsProps: BlueprintProps = {
  theme, clientFacts,
  section: makeSection({
    sectionKey: 'home_stats',
    sectionType: 'stats',
    blueprintKey: 'stats_dark_bar',
    heading: 'By the numbers',
    items: [
      { title: '22+ years', description: 'Experience' },
      { title: '3 verticals', description: 'Healthcare · Land · Commercial' },
      { title: 'Nationwide', description: 'Reach' },
    ],
  }),
};

const servicesProps: BlueprintProps = {
  theme, clientFacts,
  section: makeSection({
    sectionKey: 'home_services',
    sectionType: 'services',
    blueprintKey: 'services_detail_two_column',
    heading: 'How we work with you',
    subheading: 'Three specialties',
    body: 'Purpose-built teams for each line of business.',
    items: [
      { title: 'Healthcare real estate', description: 'Dental, veterinary, optometry — specialty brokerage with deep vertical expertise.' },
      { title: 'Commercial real estate', description: 'Office, medical office buildings, mixed-use.' },
      { title: 'Land', description: 'Residential, agricultural, hunting properties.' },
      { title: 'Buyer representation', description: 'Partner-direct engagement from tour through closing.' },
    ],
  }),
};

const aboutProps: BlueprintProps = {
  theme, clientFacts,
  section: makeSection({
    sectionKey: 'home_about',
    sectionType: 'features',
    blueprintKey: 'about_story_split',
    heading: 'Boutique by design',
    subheading: 'Our approach',
    body: 'Partner-direct from day one — we built the firm so clients never get handed off to a junior agent mid-transaction.',
    items: [
      { title: 'Managing partner', description: 'Every client works directly with a partner, not a team.' },
    ],
  }),
};

const testimonialsProps: BlueprintProps = {
  theme, clientFacts,
  section: makeSection({
    sectionKey: 'home_testimonials',
    sectionType: 'testimonials',
    blueprintKey: 'testimonials_featured_large',
    heading: 'Client voices',
    items: [
      { title: 'Dr. Reference · Dental Practice', description: 'They understood our practice before we finished describing it. That alone saved us six months.' },
    ],
  }),
};

const ctaSplitProps: BlueprintProps = {
  theme, clientFacts,
  section: makeSection({
    sectionKey: 'home_cta',
    sectionType: 'cta',
    blueprintKey: 'cta_split_contact',
    heading: 'Ready to talk?',
    body: 'Reach out directly — you\\'ll be speaking with a partner within one business day.',
    cta: { label: 'Schedule an intro call', url: '/contact' },
  }),
};

const heroInteriorProps: BlueprintProps = {
  theme, clientFacts,
  section: makeSection({
    sectionKey: 'services_hero',
    sectionType: 'hero',
    blueprintKey: 'hero_interior_minimal',
    heading: 'Services',
    subheading: 'What we do',
    body: 'Purpose-built representation across healthcare, commercial, and land.',
  }),
};

const ctaDarkProps: BlueprintProps = {
  theme, clientFacts,
  section: makeSection({
    sectionKey: 'services_cta',
    sectionType: 'cta',
    blueprintKey: 'cta_dark_centered',
    heading: 'Find your fit',
    body: 'Schedule a consultation with a partner.',
    cta: { label: 'Book a call', url: '/contact' },
  }),
};
---
<html lang="en">
  <head>
    <title>BDS exports verify</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <main>
      <HeroSplit6040 {...heroSplitProps} />
      <StatsDarkBar {...statsProps} />
      <ServicesDetailTwoColumn {...servicesProps} />
      <AboutStorySplit {...aboutProps} />
      <TestimonialsFeaturedLarge {...testimonialsProps} />
      <CtaSplitContact {...ctaSplitProps} />
    </main>
  </body>
</html>
`,
);

// Interior page fixture — covers the two v0.1 blueprints reserved
// for interior pages. Keeping hero blueprints on separate pages
// preserves the "exactly one h1 per page" contract.
writeFileSync(
  join(scratch, 'src/pages/interior.astro'),
  `---
import type { BlueprintSection, BlueprintProps, ClientFacts, ResolvedTheme, KnownBlueprintKey } from '@brikdesigns/bds/blueprints-astro';
import { HeroInteriorMinimal, CtaDarkCentered } from '@brikdesigns/bds/blueprints-astro';

const theme: ResolvedTheme = {
  themeMode: 'dark',
  atmosphere: 'editorial-luxury',
  navigationArchetype: 'editorial-transparent',
  footerArchetype: 'four_col_directory',
};
const clientFacts: ClientFacts = {
  brandName: 'Verify Scratch',
  tagline: null, valueProposition: null, services: [], phone: null,
  email: null, address: null, hours: [], heroImageUrl: null,
  logoUrl: null, logoVariants: {},
};

function mk(kind: 'hero' | 'cta', blueprintKey: KnownBlueprintKey, over: Partial<BlueprintSection>): BlueprintSection {
  return {
    sectionKey: over.sectionKey ?? kind,
    sectionType: kind,
    heading: null, subheading: null, body: null, items: [], cta: null,
    visualNotes: { blueprintKey, moodKeywords: [], layoutBlueprint: 'test',
      imageOpportunity: null, animationSuggestion: null, illustrationOpportunity: null },
    ...over,
  };
}

const heroInteriorProps: BlueprintProps = {
  theme, clientFacts,
  section: mk('hero', 'hero_interior_minimal', {
    sectionKey: 'services_hero',
    heading: 'Services',
    subheading: 'What we do',
    body: 'Purpose-built representation across healthcare, commercial, and land.',
  }),
};

const ctaDarkProps: BlueprintProps = {
  theme, clientFacts,
  section: mk('cta', 'cta_dark_centered', {
    sectionKey: 'services_cta',
    heading: 'Find your fit',
    body: 'Schedule a consultation with a partner.',
    cta: { label: 'Book a call', url: '/contact' },
  }),
};
---
<html lang="en">
  <head>
    <title>BDS interior verify</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <main>
      <HeroInteriorMinimal {...heroInteriorProps} />
      <CtaDarkCentered {...ctaDarkProps} />
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
log.step('Asserting rendered HTML markers (home + interior pages)');
const homeHtmlPath = resolve(scratch, 'dist/index.html');
const interiorHtmlPath = resolve(scratch, 'dist/interior/index.html');
const homeHtml = readFileSync(homeHtmlPath, 'utf8');
const interiorHtml = readFileSync(interiorHtmlPath, 'utf8');
const bothHtml = homeHtml + '\n' + interiorHtml;

const assertions = [
  // Every shipped blueprint's marker present (across both pages)
  { name: 'hero_split_60_40 marker (home)',         pass: homeHtml.includes('data-blueprint-key="hero_split_60_40"') },
  { name: 'stats_dark_bar marker (home)',           pass: homeHtml.includes('data-blueprint-key="stats_dark_bar"') },
  { name: 'services_detail_two_column marker (home)',pass: homeHtml.includes('data-blueprint-key="services_detail_two_column"') },
  { name: 'about_story_split marker (home)',        pass: homeHtml.includes('data-blueprint-key="about_story_split"') },
  { name: 'testimonials_featured_large marker (home)',pass: homeHtml.includes('data-blueprint-key="testimonials_featured_large"') },
  { name: 'cta_split_contact marker (home)',        pass: homeHtml.includes('data-blueprint-key="cta_split_contact"') },
  { name: 'hero_interior_minimal marker (interior)',pass: interiorHtml.includes('data-blueprint-key="hero_interior_minimal"') },
  { name: 'cta_dark_centered marker (interior)',    pass: interiorHtml.includes('data-blueprint-key="cta_dark_centered"') },

  // Content probes per blueprint
  { name: 'hero headline rendered',                 pass: homeHtml.includes('Built to excel, driven to exceed') },
  { name: 'hero image src rendered',                pass: homeHtml.includes('src="https://example.com/hero.webp"') },
  { name: 'stats items rendered',                   pass: homeHtml.includes('22+ years') && homeHtml.includes('3 verticals') },
  { name: 'services items rendered',                pass: homeHtml.includes('Healthcare real estate') && homeHtml.includes('Buyer representation') },
  { name: 'about story rendered',                   pass: homeHtml.includes('Boutique by design') && homeHtml.includes('Partner-direct from day one') },
  { name: 'testimonial quote rendered',             pass: homeHtml.includes('They understood our practice') },
  { name: 'cta_split_contact phone tel:',           pass: homeHtml.includes('href="tel:+16155550100"') },
  { name: 'cta_split_contact mailto:',              pass: homeHtml.includes('href="mailto:hello@example.com"') },
  { name: 'interior hero heading rendered',         pass: interiorHtml.includes('What we do') },
  { name: 'cta_dark_centered CTA rendered',         pass: interiorHtml.includes('Book a call') },

  // Cross-blueprint contract checks
  { name: 'home: no data-content-needed stubs (all facts provided)', pass: !homeHtml.includes('data-content-needed=') },
  { name: 'home: exactly one h1 (hero owns it)',    pass: (homeHtml.match(/<h1[\s>]/g) || []).length === 1 },
  { name: 'interior: exactly one h1 (hero owns it)',pass: (interiorHtml.match(/<h1[\s>]/g) || []).length === 1 },
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

  const pagesToScan = [
    { label: 'home',     path: homeHtmlPath },
    { label: 'interior', path: interiorHtmlPath },
  ];
  let totalPasses = 0;
  const allViolations = [];

  for (const p of pagesToScan) {
    await page.goto(`file://${p.path}`);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    totalPasses += results.passes.length;
    if (results.violations.length > 0) {
      allViolations.push({ page: p.label, violations: results.violations });
    }
  }

  await context.close();
  await browser.close();

  if (allViolations.length > 0) {
    log.fail(`a11y violations found:`);
    for (const { page: pg, violations } of allViolations) {
      log.info(`  page: ${pg}`);
      for (const v of violations) {
        log.info(`    [${v.impact}] ${v.id} — ${v.help}`);
        for (const node of v.nodes) {
          log.info(`       ${node.target.join(' ')}`);
        }
      }
    }
    log.info(`Scratch project preserved for inspection: ${scratch}`);
    process.exit(1);
  }

  log.ok(`axe-core clean: ${totalPasses} rule-checks passed across ${pagesToScan.length} pages, 0 violations`);
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
  // Components (source, .astro) — all 8 v0.1 shipped blueprints
  'content-system/blueprints/astro/HeroSplit6040.astro',
  'content-system/blueprints/astro/HeroInteriorMinimal.astro',
  'content-system/blueprints/astro/StatsDarkBar.astro',
  'content-system/blueprints/astro/ServicesDetailTwoColumn.astro',
  'content-system/blueprints/astro/AboutStorySplit.astro',
  'content-system/blueprints/astro/TestimonialsFeaturedLarge.astro',
  'content-system/blueprints/astro/CtaSplitContact.astro',
  'content-system/blueprints/astro/CtaDarkCentered.astro',
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
