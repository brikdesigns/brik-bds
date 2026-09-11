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
        // Pinned on purpose — do NOT delete as redundant (#2381). The tarball's
        // React peers are `>=18.0.0` (unbounded), so without these npm floats
        // them to whatever is newest at run time. On 2026-09-10 that resolved
        // react-dom@19.3.0 → scheduler@^0.28.0, which the step-6 install cannot
        // satisfy from a cached packument predating that release, and the gate
        // failed ETARGET on a two-line CSS change. Range matches this repo's own
        // devDependencies (package.json react/react-dom ^18.3.0), so the scratch
        // project resolves the same tree BDS builds against. No scratch page
        // imports a React blueprint — this gate renders the Astro rail — so
        // pinning removes a resolution axis it never meant to test.
        react: '^18.3.0',
        'react-dom': '^18.3.0',
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
import type { HeroLayout, CtaLayout, CardGridLayout } from '@brikdesigns/bds/blueprints-astro';
import {
  Hero,
  Cta,
  About,
  CardGrid,
  StatsDarkBar,
  TestimonialsFeaturedLarge,
  SiteHeader,
} from '@brikdesigns/bds/blueprints-astro';

// The layout unions are part of the published surface since #2302 — a
// consumer types its own layout choice against them, so a broken export
// must fail this scratch build rather than surface at the client site.
const splitHero: HeroLayout = 'split';
const twoColList: CardGridLayout = 'two-column-list';
const splitCta: CtaLayout = 'split';

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
    blueprintKey: 'hero_split',
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
    blueprintKey: 'stats_bar',
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
    blueprintKey: 'two_column_detail',
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
    blueprintKey: 'story_split',
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
    blueprintKey: 'cta_centered',
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
    <SiteHeader
      archetype={theme.navigationArchetype}
      brandName={clientFacts.brandName}
      phone={clientFacts.phone}
      navItems={[
        { label: 'Services', href: '/services' },
        { label: 'About', href: '/about' },
        { label: 'Contact', href: '/contact' },
      ]}
      primaryCta={{ label: 'Book a call', href: '/contact' }}
      currentPath="/services"
      servicesMegaMenu={{
        triggerLabel: 'Services',
        columns: 4,
        categories: [
          {
            heading: 'Cosmetic',
            items: [
              { label: 'Veneers', href: '/services/veneers', note: 'Custom-crafted' },
              { label: 'Whitening', href: '/services/whitening', note: 'In-office + take-home' },
            ],
          },
          {
            heading: 'Restorative',
            items: [
              { label: 'Crowns', href: '/services/crowns', note: 'Full-mouth rehab' },
            ],
          },
          {
            heading: 'Comfort',
            items: [
              { label: 'Sedation', href: '/services/sedation', note: 'Nitrous available' },
            ],
          },
        ],
        featured: {
          eyebrow: 'New patient?',
          heading: 'Meet the doctor you choose',
          body: 'Both doctors are accepting new patients.',
          ctaLabel: 'Request your first visit',
          ctaHref: '/contact',
        },
      }}
    />
    <main>
      <Hero layout={splitHero} blueprintKey="hero_split" {...heroSplitProps} />
      <StatsDarkBar {...statsProps} />
      <CardGrid layout={twoColList} {...servicesProps} />
      <About blueprintKey="story_split" {...aboutProps} />
      <TestimonialsFeaturedLarge {...testimonialsProps} />
      <Cta layout={splitCta} blueprintKey="cta_split_contact" {...ctaSplitProps} />
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
import { Hero, Cta, SiteHeader } from '@brikdesigns/bds/blueprints-astro';

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
  section: mk('cta', 'cta_centered', {
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
    <SiteHeader
      archetype="utility-first"
      brandName="Verify Scratch"
      phone="+1 (615) 555-0100"
      navItems={[
        { label: 'Communities', href: '/communities' },
        { label: 'Amenities', href: '/amenities' },
        { label: 'Rates', href: '/rates' },
        { label: 'About', href: '/about' },
        { label: 'Contact', href: '/contact' },
      ]}
      primaryCta={{ label: 'Find a Site', href: '/find-a-site' }}
      currentPath="/communities"
      scrollBehavior="sticky-solid"
      mobileDrawer="slide-left-panel"
      servicesMegaMenu={{
        triggerLabel: 'Communities',
        columns: 3,
        categories: [
          { heading: 'RV Parks', items: [
            { label: 'All RV parks', href: '/rv-parks' },
            { label: 'Seasonal sites', href: '/rv-parks/seasonal', note: 'Weekly + monthly' },
          ] },
          { heading: 'Mobile Home', items: [
            { label: 'All communities', href: '/mhc' },
            { label: 'Homes for sale', href: '/mhc/homes-for-sale' },
          ] },
          { heading: 'Vacation Rentals', items: [
            { label: 'Cabins', href: '/vacation-rentals/cabins' },
          ] },
        ],
        featured: {
          eyebrow: 'New here?',
          heading: 'Find your site in under a minute',
          body: "Tell us the dates + site type.",
          ctaLabel: 'Check availability',
          ctaHref: '/find-a-site',
        },
      }}
    />
    <main>
      <Hero layout="interior-minimal" blueprintKey="hero_interior_minimal" {...heroInteriorProps} />
      <Cta layout="default" blueprintKey="cta_centered" {...ctaDarkProps} />
    </main>
  </body>
</html>
`,
);

// Archetype fixtures — one page per remaining nav archetype implemented in
// #2373 (service-centric / portfolio-minimal / calm-flat). One header per
// page because <SiteHeader> emits hardcoded element ids (drawer, mega
// panel); two on a page would trip axe's duplicate-id rule. Each page adds
// a <main><h1> so the doc has a landmark + heading for the axe scan.
const ARCHETYPE_FIXTURES = [
  {
    slug: 'service-centric',
    // The mega-menu is the product — 2-column flyout + featured
    // practitioner card, always-solid surface.
    props: `archetype="service-centric"
      brandName="Verify Scratch"
      phone="+1 (615) 555-0100"
      navItems={[
        { label: 'Practice Areas', href: '/practice-areas' },
        { label: 'Attorneys', href: '/attorneys' },
        { label: 'Results', href: '/results' },
        { label: 'About', href: '/about' },
        { label: 'Contact', href: '/contact' },
      ]}
      primaryCta={{ label: 'Free Consultation', href: '/contact' }}
      currentPath="/practice-areas"
      scrollBehavior="sticky-solid"
      mobileDrawer="fullscreen-overlay"
      servicesMegaMenu={{
        triggerLabel: 'Practice Areas',
        columns: 2,
        categories: [
          { heading: 'Litigation', items: [
            { label: 'Personal Injury', href: '/practice-areas/personal-injury' },
            { label: 'Medical Malpractice', href: '/practice-areas/med-mal', note: 'Trial-ready' },
          ] },
          { heading: 'Advisory', items: [
            { label: 'Estate Planning', href: '/practice-areas/estate' },
            { label: 'Business Law', href: '/practice-areas/business' },
          ] },
        ],
        featured: {
          eyebrow: 'Meet the team',
          heading: 'Speak with a partner today',
          body: 'Every matter is led by a named attorney.',
          ctaLabel: 'Our attorneys',
          ctaHref: '/attorneys',
        },
      }}`,
  },
  {
    slug: 'portfolio-minimal',
    // No dropdowns (no servicesMegaMenu), wide tracking, transparent at
    // top, reveal-on-scroll. Minimal utility cluster (ghost CTA).
    props: `archetype="portfolio-minimal"
      brandName="Verify Scratch"
      navItems={[
        { label: 'Work', href: '/work' },
        { label: 'About', href: '/about' },
        { label: 'Journal', href: '/journal' },
        { label: 'Contact', href: '/contact' },
      ]}
      primaryCta={{ label: 'Inquire', href: '/contact' }}
      currentPath="/work"
      scrollBehavior="reveal-on-scroll"
      mobileDrawer="fullscreen-overlay"`,
  },
  {
    slug: 'calm-flat',
    // No dropdowns, low-contrast muted surface, always solid, single CTA.
    props: `archetype="calm-flat"
      brandName="Verify Scratch"
      navItems={[
        { label: 'Services', href: '/services' },
        { label: 'Approach', href: '/approach' },
        { label: 'Contact', href: '/contact' },
      ]}
      primaryCta={{ label: 'Book Session', href: '/book' }}
      currentPath="/services"
      scrollBehavior="sticky-solid"
      mobileDrawer="fullscreen-overlay"`,
  },
];

for (const fixture of ARCHETYPE_FIXTURES) {
  writeFileSync(
    join(scratch, `src/pages/${fixture.slug}.astro`),
    `---
import { SiteHeader } from '@brikdesigns/bds/blueprints-astro';
---
<html lang="en">
  <head>
    <title>BDS ${fixture.slug} verify</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <SiteHeader
      ${fixture.props}
    />
    <main>
      <h1>${fixture.slug}</h1>
    </main>
  </body>
</html>
`,
  );
}

// Dispatcher page fixture — exercises <BlueprintDispatcher> end-to-end.
// Includes 8 known sections (covering every v0.1 component) + 1
// UNKNOWN section with blueprintKey='hero_centered_gradient' (valid
// library key but no Astro component yet). The unknown falls through
// to BlueprintFallback which emits the data-blueprint-unknown-key
// attribute that CI greps for.
//
// Important: the 8 known sections include two hero blueprints. On a
// dispatcher page we accept the resulting 2× h1 situation — this is
// a test fixture proving the DISPATCHER resolves keys, not a proof
// of real-site composition. The "exactly one h1" contract applies to
// real scaffolded pages, which the scaffold task enforces via pack
// compositions (each pack's home/interior picks exactly one hero).
writeFileSync(
  join(scratch, 'src/pages/dispatched.astro'),
  `---
import type { BlueprintSection, ClientFacts, ResolvedTheme, KnownBlueprintKey } from '@brikdesigns/bds/blueprints-astro';
import { BlueprintDispatcher } from '@brikdesigns/bds/blueprints-astro';

const theme: ResolvedTheme = {
  themeMode: 'dark',
  atmosphere: 'editorial-luxury',
  navigationArchetype: 'editorial-transparent',
  footerArchetype: 'four_col_directory',
};

const clientFacts: ClientFacts = {
  brandName: 'Dispatcher Proving',
  tagline: null,
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

function sec(blueprintKey: string, overrides: Partial<BlueprintSection> & { sectionKey: string }): BlueprintSection {
  return {
    sectionKey: overrides.sectionKey,
    sectionType: overrides.sectionType ?? 'content_block',
    heading: overrides.heading ?? null,
    subheading: overrides.subheading ?? null,
    body: overrides.body ?? null,
    items: overrides.items ?? [],
    cta: overrides.cta ?? null,
    visualNotes: {
      blueprintKey: blueprintKey as KnownBlueprintKey,
      moodKeywords: [],
      layoutBlueprint: 'test',
      imageOpportunity: null,
      animationSuggestion: null,
      illustrationOpportunity: null,
    },
  };
}

const sections: BlueprintSection[] = [
  sec('hero_interior_minimal', { sectionKey: 'd_hero', sectionType: 'hero', heading: 'Dispatcher proving', body: 'Reads visualNotes.blueprintKey per section.' }),
  sec('stats_bar', { sectionKey: 'd_stats', sectionType: 'stats', items: [
    { title: '8', description: 'Blueprints shipped' },
    { title: '25', description: 'Library total' },
  ] }),
  sec('two_column_detail', { sectionKey: 'd_services', sectionType: 'services', heading: 'What\\'s in v0.1', items: [
    { title: 'Hero split 60/40', description: 'Text left, image right.' },
    { title: 'Stats dark bar', description: 'Proof points on dark.' },
  ] }),
  sec('story_split', { sectionKey: 'd_about', sectionType: 'features', heading: 'How it works', body: 'Single prop shape; registry-driven dispatch.', items: [] }),
  sec('testimonials_featured_large', { sectionKey: 'd_test', sectionType: 'testimonials', items: [
    { title: 'Scaffold task · soon', description: 'When the portal scaffold runs, it emits <BlueprintDispatcher sections={...} /> on every page.' },
  ] }),
  sec('cta_split_contact', { sectionKey: 'd_cta_split', sectionType: 'cta', heading: 'Reach out', body: 'Split CTA exercising phone + email.', cta: { label: 'Contact', url: '/contact' } }),
  // Unknown key — falls through to BlueprintFallback.
  sec('hero_centered_gradient' as KnownBlueprintKey, { sectionKey: 'd_unknown', sectionType: 'hero', heading: 'Not shipped yet' }),
  sec('cta_centered', { sectionKey: 'd_cta_dark', sectionType: 'cta', heading: 'End of proof', cta: { label: 'Home', url: '/' } }),
];
---
<html lang="en">
  <head>
    <title>BDS dispatcher verify</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <main>
      <BlueprintDispatcher sections={sections} clientFacts={clientFacts} theme={theme} />
    </main>
  </body>
</html>
`,
);

// ── 5b. Derive the dispatcher's expected markers ──────────────────
//
// This used to be a hard-coded list of seven `data-blueprint-key` values
// ("all 7 known sections rendered"). #2010 de-wired `stats_bar` from
// BLUEPRINT_REGISTRY and the literal was never updated, so the assertion
// became unpassable and this script has been red on `main` ever since —
// unnoticed, because it runs nowhere (brik-bds#2313).
//
// Derived instead: read WIRED_BLUEPRINT_KEYS, and for each fixture section
// expect either its rendered marker (wired) or the fallback's
// data-blueprint-unknown-key (not wired). A future de-wiring then flips this
// assertion by itself rather than rotting.

/** Keys the dispatcher fixture feeds, in `sections` order. Guarded below. */
const DISPATCH_FIXTURE_KEYS = [
  'hero_interior_minimal',
  'stats_bar',
  'two_column_detail',
  'story_split',
  'testimonials_featured_large',
  'cta_split_contact',
  'hero_centered_gradient',
  'cta_centered',
];

/**
 * Keys whose rendered marker is not the key itself. `<CardGrid>` emits one
 * block-level `card_grid` marker for both the layouts it serves, so the
 * two-column key resolves to the grid's marker.
 *
 * Shrank to one entry in #2303: `services_3col_card_grid` → `card_grid` and
 * `support_plan_callout_split` → `callout_split` were overrides only because
 * the key and the block disagreed. Renaming the keys to the block they render
 * made both identities, so they are no longer mapped here.
 */
const MARKER_OVERRIDES = {
  two_column_detail: 'card_grid',
};

const wiredKeysSrc = readFileSync(
  join(BDS_ROOT, 'content-system/blueprints/astro/types.ts'),
  'utf8',
);
const wiredMatch = wiredKeysSrc.match(
  /export const WIRED_BLUEPRINT_KEYS\s*=\s*\[([\s\S]*?)\]\s*as const/,
);
if (!wiredMatch) {
  log.fail('Could not parse WIRED_BLUEPRINT_KEYS from astro/types.ts');
  process.exit(1);
}
const WIRED = new Set([...wiredMatch[1].matchAll(/'([a-z0-9_]+)'/g)].map((m) => m[1]));

const dispatchedPageSrc = readFileSync(
  join(scratch, 'src/pages/dispatched.astro'),
  'utf8',
);

const expectedMarkers = DISPATCH_FIXTURE_KEYS.filter((k) => WIRED.has(k)).map(
  (k) => MARKER_OVERRIDES[k] ?? k,
);
const expectedUnknowns = DISPATCH_FIXTURE_KEYS.filter((k) => !WIRED.has(k));

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
log.step('Asserting rendered HTML markers (home + interior + dispatched + archetypes)');
const homeHtmlPath = resolve(scratch, 'dist/index.html');
const interiorHtmlPath = resolve(scratch, 'dist/interior/index.html');
const dispatchedHtmlPath = resolve(scratch, 'dist/dispatched/index.html');
const homeHtml = readFileSync(homeHtmlPath, 'utf8');
const interiorHtml = readFileSync(interiorHtmlPath, 'utf8');
const dispatchedHtml = readFileSync(dispatchedHtmlPath, 'utf8');

// Per-archetype rendered HTML (#2373) — one page each.
const archetypeHtmlPaths = Object.fromEntries(
  ARCHETYPE_FIXTURES.map((f) => [
    f.slug,
    resolve(scratch, `dist/${f.slug}/index.html`),
  ]),
);
const scHtml = readFileSync(archetypeHtmlPaths['service-centric'], 'utf8');
const pmHtml = readFileSync(archetypeHtmlPaths['portfolio-minimal'], 'utf8');
const cfHtml = readFileSync(archetypeHtmlPaths['calm-flat'], 'utf8');

const assertions = [
  // Every shipped blueprint's marker present across direct-import pages
  { name: 'hero_split marker (home)',         pass: homeHtml.includes('data-blueprint-key="hero_split"') },
  { name: 'stats_bar marker (home)',           pass: homeHtml.includes('data-blueprint-key="stats_bar"') },
  // `two_column_detail` dispatches through the @deprecated
  // ServicesDetailTwoColumn adapter, which delegates to <CardGrid> (brik-bds#580).
  // The rendered marker is therefore CardGrid's `card_grid`, not the legacy key;
  // the section content itself is covered by the 'services items rendered' probe.
  { name: 'two_column_detail → card_grid marker (home)',pass: homeHtml.includes('data-blueprint-key="card_grid"') },
  { name: 'story_split marker (home)',        pass: homeHtml.includes('data-blueprint-key="story_split"') },
  { name: 'testimonials_featured_large marker (home)',pass: homeHtml.includes('data-blueprint-key="testimonials_featured_large"') },
  { name: 'cta_split_contact marker (home)',        pass: homeHtml.includes('data-blueprint-key="cta_split_contact"') },
  { name: 'hero_interior_minimal marker (interior)',pass: interiorHtml.includes('data-blueprint-key="hero_interior_minimal"') },
  { name: 'cta_centered marker (interior)',    pass: interiorHtml.includes('data-blueprint-key="cta_centered"') },

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
  { name: 'cta_centered CTA rendered',         pass: interiorHtml.includes('Book a call') },

  // SiteHeader assertions (home)
  { name: 'SiteHeader archetype marker',            pass: homeHtml.includes('data-nav-archetype="editorial-transparent"') },
  { name: 'SiteHeader brand text rendered',         pass: homeHtml.includes('>Verify Scratch<') },
  { name: 'SiteHeader nav landmark present',        pass: /<nav[^>]*\bbp-site-header__nav\b[^>]*aria-label="Primary"/.test(homeHtml) || /<nav[^>]*aria-label="Primary"[^>]*\bbp-site-header__nav\b/.test(homeHtml) },
  { name: 'SiteHeader aria-current on active link', pass: homeHtml.includes('aria-current="page"') && homeHtml.includes('href="/services"') },
  { name: 'SiteHeader phone tel: link',             pass: homeHtml.includes('class="bp-site-header__phone"') && homeHtml.includes('tel:+16155550100') },
  { name: 'SiteHeader hamburger button',            pass: homeHtml.includes('aria-expanded="false"') && homeHtml.includes('aria-controls="bp-site-header-drawer"') },
  { name: 'SiteHeader mega-menu trigger disclosure', pass: /class="[^"]*bp-site-header__mega-trigger[^"]*"[^>]*aria-controls="bp-site-header-mega-services"[^>]*aria-haspopup="true"/.test(homeHtml) || (homeHtml.includes('bp-site-header__mega-trigger') && homeHtml.includes('aria-controls="bp-site-header-mega-services"') && homeHtml.includes('aria-haspopup="true"')) },
  { name: 'SiteHeader mega-menu 4-col grid',         pass: homeHtml.includes('--bds-site-header-mega-columns: 4') && homeHtml.includes('bp-site-header__mega-columns') },
  { name: 'SiteHeader mega-menu category + note',    pass: homeHtml.includes('bp-site-header__mega-heading') && homeHtml.includes('bp-site-header__mega-item-note') && homeHtml.includes('href="/services/veneers"') },
  { name: 'SiteHeader mega-menu featured card',      pass: homeHtml.includes('bp-site-header__mega-featured') && homeHtml.includes('Request your first visit') },

  // SiteHeader utility-first archetype (interior page)
  { name: 'SiteHeader utility-first implemented',    pass: interiorHtml.includes('data-nav-archetype="utility-first"') && !interiorHtml.includes('data-unimplemented-archetype="utility-first"') },
  { name: 'SiteHeader utility-first behavior hooks',  pass: interiorHtml.includes('data-scroll-behavior="sticky-solid"') && interiorHtml.includes('data-drawer-pattern="slide-left-panel"') },
  { name: 'SiteHeader utility-first 3-col mega',      pass: interiorHtml.includes('--bds-site-header-mega-columns: 3') && interiorHtml.includes('href="/rv-parks/seasonal"') },
  { name: 'SiteHeader slide-left drawer + scrim',     pass: interiorHtml.includes('bp-site-header__scrim') && interiorHtml.includes('bp-site-header__drawer-close') },

  // SiteHeader remaining archetypes implemented distinctly (#2373) — each
  // renders its own marker and drops the data-unimplemented-archetype fallback.
  { name: 'SiteHeader editorial-transparent not unimplemented', pass: homeHtml.includes('data-nav-archetype="editorial-transparent"') && !homeHtml.includes('data-unimplemented-archetype') },
  { name: 'SiteHeader service-centric implemented',   pass: scHtml.includes('data-nav-archetype="service-centric"') && !scHtml.includes('data-unimplemented-archetype') },
  { name: 'SiteHeader service-centric 2-col mega + featured', pass: scHtml.includes('--bds-site-header-mega-columns: 2') && scHtml.includes('bp-site-header__mega-featured') && scHtml.includes('href="/practice-areas/med-mal"') },
  { name: 'SiteHeader portfolio-minimal implemented', pass: pmHtml.includes('data-nav-archetype="portfolio-minimal"') && !pmHtml.includes('data-unimplemented-archetype') },
  { name: 'SiteHeader portfolio-minimal reveal-on-scroll + no dropdowns', pass: pmHtml.includes('data-scroll-behavior="reveal-on-scroll"') && !pmHtml.includes('bp-site-header__mega-trigger') },
  { name: 'SiteHeader calm-flat implemented',         pass: cfHtml.includes('data-nav-archetype="calm-flat"') && !cfHtml.includes('data-unimplemented-archetype') },
  { name: 'SiteHeader calm-flat sticky-solid + no dropdowns', pass: cfHtml.includes('data-scroll-behavior="sticky-solid"') && !cfHtml.includes('bp-site-header__mega-trigger') && cfHtml.includes('bp-site-header__cta') },

  // Dispatcher assertions (dispatched page)
  // Guard: the JS-side fixture key list must match the template it describes,
  // or the derived assertions below silently stop covering a section.
  { name: `dispatcher: fixture key list matches the template (${DISPATCH_FIXTURE_KEYS.length} keys)`, pass:
      DISPATCH_FIXTURE_KEYS.every((k) => dispatchedPageSrc.includes(`sec('${k}'`)) &&
      [...dispatchedPageSrc.matchAll(/sec\('([a-z0-9_]+)'/g)].length === DISPATCH_FIXTURE_KEYS.length
  },
  { name: `dispatcher: every wired fixture section rendered (${expectedMarkers.length} of ${DISPATCH_FIXTURE_KEYS.length})`, pass:
      expectedMarkers.every((m) => dispatchedHtml.includes(`data-blueprint-key="${m}"`))
  },
  { name: `dispatcher: unwired fixture keys fall through to fallback (${expectedUnknowns.join(', ') || 'none'})`, pass:
      dispatchedHtml.includes('data-blueprint-key="__fallback__"') &&
      expectedUnknowns.every((k) => dispatchedHtml.includes(`data-blueprint-unknown-key="${k}"`))
  },
  { name: 'dispatcher: fallback stub text visible', pass:
      dispatchedHtml.includes('Blueprint not yet shipped')
  },

  // Section shell (#1439 / ADR-021) — the package's only global stylesheet.
  // Astro emits scoped <style> per component; the shell is the one file that
  // must arrive UNSCOPED and reach the page. Asserting the class in markup is
  // not enough — if the frontmatter CSS import silently failed to bundle, the
  // markup would still be correct and every section would lose its rhythm and
  // container width. So we assert the emitted CSS too.
  { name: 'shell: bds-blueprint-section composed on section roots', pass:
      /class="[^"]*\bbds-blueprint-section\b[^"]*"/.test(homeHtml) &&
      /class="[^"]*\bbds-blueprint-section__container\b[^"]*"/.test(homeHtml)
  },
  { name: 'shell: global stylesheet emitted and linked', pass: (() => {
      const hrefs = [...homeHtml.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)].map((m) => m[1]);
      const inline = [...homeHtml.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1]);
      const linked = hrefs.map((h) => {
        try { return readFileSync(resolve(scratch, 'dist', h.replace(/^\//, '')), 'utf8'); }
        catch { return ''; }
      });
      return [...linked, ...inline].some((css) => css.includes('.bds-blueprint-section'));
    })()
  },
  { name: 'shell: rules are unscoped (no Astro data-astro-cid on the class)', pass: (() => {
      const hrefs = [...homeHtml.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)].map((m) => m[1]);
      const inline = [...homeHtml.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1]);
      const all = [...hrefs.map((h) => {
        try { return readFileSync(resolve(scratch, 'dist', h.replace(/^\//, '')), 'utf8'); }
        catch { return ''; }
      }), ...inline].join('\n');
      // Every `.bds-blueprint-section…` selector must be free of Astro's
      // per-component scope attribute — otherwise it is not actually shared.
      const scoped = all.match(/\.bds-blueprint-section[a-z_-]*\[data-astro-cid-[^\]]+\]/g);
      return all.includes('.bds-blueprint-section') && scoped === null;
    })()
  },
  { name: 'shell: rules stay inside @layer bds-components', pass: (() => {
      // The safety property behind shipping global CSS to consumer sites: the
      // shell is LAYERED, so any unlayered rule in a client repo outranks it.
      // If a build step ever strips the @layer wrapper, that guarantee is gone
      // and the package starts winning cascades it has no business winning.
      const hrefs = [...homeHtml.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)].map((m) => m[1]);
      const inline = [...homeHtml.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1]);
      const sources = [...hrefs.map((h) => {
        try { return readFileSync(resolve(scratch, 'dist', h.replace(/^\//, '')), 'utf8'); }
        catch { return ''; }
      }), ...inline];
      const carriers = sources.filter((css) => css.includes('.bds-blueprint-section'));
      return carriers.length > 0 && carriers.every((css) => /@layer\s+bds-components/.test(css));
    })()
  },
  { name: 'shell: sr-only utility replaced the duplicated bp-* headings', pass:
      homeHtml.includes('class="bds-visually-hidden"') &&
      !homeHtml.includes('__sr-heading')
  },

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
    { label: 'home',       path: homeHtmlPath },
    { label: 'interior',   path: interiorHtmlPath },
    { label: 'dispatched', path: dispatchedHtmlPath },
    ...ARCHETYPE_FIXTURES.map((f) => ({
      label: f.slug,
      path: archetypeHtmlPaths[f.slug],
    })),
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
  // Types (source) — the barrel's runtime `export { WIRED_BLUEPRINT_KEYS }
  // from './types'` and every .astro's `import type … from './types'` resolve
  // this co-located source file, NOT the dist copy. Omitting it from `files`
  // breaks consumer `astro build` at "Could not resolve './types'" (#1428).
  'content-system/blueprints/astro/types.ts',
  // Shared section shell (source, global CSS) — every family blueprint
  // side-effect-imports `../section-shell.css` from its frontmatter. Omitting
  // it from `files` breaks consumer `astro build` at "Failed to resolve
  // import" and silently drops section rhythm + container width (#1439,
  // ADR-021).
  'content-system/blueprints/section-shell.css',
  // Blocks (source, .astro) — one file per block since #2302; the layout a
  // block renders in is a prop, so there is no per-layout file to ship.
  'content-system/blueprints/astro/Hero.astro',
  'content-system/blueprints/astro/Cta.astro',
  'content-system/blueprints/astro/About.astro',
  'content-system/blueprints/astro/Features.astro',
  'content-system/blueprints/astro/CardGrid.astro',
  'content-system/blueprints/astro/CalloutPanel.astro',
  'content-system/blueprints/astro/StatsDarkBar.astro',
  'content-system/blueprints/astro/TestimonialsFeaturedLarge.astro',
  // Dispatch surface (PR #7)
  'content-system/blueprints/astro/BlueprintDispatcher.astro',
  'content-system/blueprints/astro/BlueprintFallback.astro',
  'content-system/blueprints/astro/SiteHeader.astro',
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
