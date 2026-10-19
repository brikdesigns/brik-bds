/**
 * React rail parity with the Astro rail (brik-bds#2352, AC1 + AC2).
 *
 * Since #2302 the Astro rail is one component per BLOCK with the layout as a
 * prop, and `BlueprintDispatcher.astro` maps key → (block, layout). This pins
 * the React rail to the same shape, and pins its rendered markup:
 *
 *   1. Every blueprint key, dispatched through `<BlueprintDispatcher>`, renders
 *      the committed golden markup in `__golden__/`. The goldens were captured
 *      from the per-key adapters this collapse deleted, so a green run proves
 *      the collapse changed no DOM, class or attribute.
 *   2. Each generic block, called directly with `section` + `layout` (the same
 *      props the dispatcher passes), renders the SAME markup as the dispatcher
 *      — so the layout branch lives in the block, not in a per-key wrapper.
 *      (These never write a golden: only the dispatcher tests may, so a broken
 *      block cannot overwrite the baseline it is compared to.)
 *
 * JSX is avoided to keep this a `.test.ts` file (the `content-system` vitest
 * project's include glob is `**\/*.test.ts`).
 */
import { describe, it, expect } from 'vitest';
import { createElement, type ComponentType } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import type {
  BlueprintProps,
  BlueprintSection,
  ClientFacts,
  KnownBlueprintKey,
} from '../astro/types';
import { WIRED_BLUEPRINT_KEYS } from '../astro/types';
import { About } from './About';
import { BlueprintDispatcher } from './BlueprintDispatcher';
import { CalloutPanel } from './CalloutPanel';
import { CardGrid } from './CardGrid';
import { Cta } from './Cta';
import { Features } from './Features';
import { Hero } from './Hero';
import { baseClientFacts, baseTheme } from './_fixtures';

/* ─── Fixtures ─────────────────────────────────────────────────── */

const section = (
  blueprintKey: KnownBlueprintKey,
  sectionKey: string,
  rest: Partial<BlueprintSection>,
): BlueprintSection => ({
  sectionKey,
  sectionType: 'content_block',
  heading: 'A clear, compelling headline',
  subheading: 'Eyebrow',
  body: 'Supporting copy that sets the type rhythm.',
  cta: { label: 'Learn more', url: '#go' },
  items: [],
  visualNotes: {
    blueprintKey,
    moodKeywords: [],
    layoutBlueprint: blueprintKey,
    imageOpportunity: null,
    illustrationOpportunity: null,
  },
  ...rest,
});

const facts = (rest: Partial<ClientFacts> = {}): ClientFacts => ({
  ...baseClientFacts,
  phone: '(555) 123-4567',
  email: 'hello@acme.test',
  heroImageUrl: '/hero.jpg',
  ...rest,
});

const serviceItems: BlueprintSection['items'] = [
  { title: 'With image', description: 'Has an image, a category and options.', href: '/a', imageUrl: '/a.jpg', imageAlt: 'A', category: 'marketing', hasOptions: true },
  { title: 'Category only', description: 'No image, so the ServiceTag icon fills the media frame.', href: '/b', category: 'brand' },
  { title: 'Bare', description: '' },
];

interface Case {
  /** Golden file name under `__golden__/`. */
  name: string;
  key: KnownBlueprintKey;
  section: BlueprintSection;
  clientFacts: ClientFacts;
  /** Set for the keys that collapse into a generic block; the direct call. */
  direct?: { block: ComponentType<any>; props: Record<string, unknown> };
}

const CASES: Case[] = [
  {
    name: 'hero_split',
    key: 'hero_split',
    section: section('hero_split', 'hero', {}),
    clientFacts: facts(),
    direct: { block: Hero, props: { layout: 'split', blueprintKey: 'hero_split' } },
  },
  {
    name: 'hero_split-missing-image',
    key: 'hero_split',
    section: section('hero_split', 'hero-missing', {}),
    clientFacts: facts({ heroImageUrl: null }),
    direct: { block: Hero, props: { layout: 'split', blueprintKey: 'hero_split' } },
  },
  {
    name: 'hero_interior_minimal',
    key: 'hero_interior_minimal',
    section: section('hero_interior_minimal', 'interior', { cta: null }),
    clientFacts: facts(),
    direct: { block: Hero, props: { layout: 'interior-minimal', blueprintKey: 'hero_interior_minimal' } },
  },
  {
    name: 'card_grid',
    key: 'card_grid',
    section: section('card_grid', 'grid', { items: serviceItems }),
    clientFacts: facts(),
    direct: { block: CardGrid, props: { layout: 'card-grid' } },
  },
  {
    name: 'two_column_detail',
    key: 'two_column_detail',
    section: section('two_column_detail', 'two-col', { items: serviceItems }),
    clientFacts: facts(),
    direct: { block: CardGrid, props: { layout: 'two-column-list' } },
  },
  {
    name: 'callout_split',
    key: 'callout_split',
    section: section('callout_split', 'callout', {
      items: [{ title: 'Monthly Support Plan', description: 'What the cadence covers.' }],
    }),
    clientFacts: facts(),
    direct: { block: CalloutPanel, props: {} },
  },
  {
    name: 'callout_split-no-plan',
    key: 'callout_split',
    section: section('callout_split', 'callout-bare', { cta: null }),
    clientFacts: facts(),
    direct: { block: CalloutPanel, props: {} },
  },
  {
    name: 'feature_grid',
    key: 'feature_grid',
    section: section('feature_grid', 'features', {
      items: [
        { title: 'Image', description: 'With an image.', href: '/a', imageUrl: '/a.jpg', imageAlt: 'A' },
        { title: 'Service line', description: 'ServiceTag fallback.', serviceLine: 'marketing' },
        { title: 'Audience alias', description: 'Deprecated alias.', audience: 'brand' },
        { title: 'Blank', description: '' },
      ],
    }),
    clientFacts: facts(),
    direct: { block: Features, props: { blueprintKey: 'feature_grid' } },
  },
  {
    name: 'story_split',
    key: 'story_split',
    section: section('story_split', 'about', {
      items: [{ title: 'Sample Quote, Role', description: 'A short pull-quote.' }],
    }),
    clientFacts: facts(),
    direct: { block: About, props: { blueprintKey: 'story_split' } },
  },
  {
    name: 'story_split-narrative-only',
    key: 'story_split',
    section: section('story_split', 'about-narrative', {}),
    clientFacts: facts(),
    direct: { block: About, props: { blueprintKey: 'story_split' } },
  },
  {
    name: 'cta_centered',
    key: 'cta_centered',
    section: section('cta_centered', 'cta', {}),
    clientFacts: facts(),
    direct: { block: Cta, props: { layout: 'default', blueprintKey: 'cta_centered' } },
  },
  {
    name: 'cta_centered-no-body',
    key: 'cta_centered',
    section: section('cta_centered', 'cta-bare', { body: null, cta: null }),
    clientFacts: facts(),
    direct: { block: Cta, props: { layout: 'default', blueprintKey: 'cta_centered' } },
  },
  {
    name: 'cta_split_contact',
    key: 'cta_split_contact',
    section: section('cta_split_contact', 'cta-split', {}),
    clientFacts: facts(),
    direct: { block: Cta, props: { layout: 'split', blueprintKey: 'cta_split_contact' } },
  },
  {
    name: 'cta_split_contact-missing-facts',
    key: 'cta_split_contact',
    section: section('cta_split_contact', 'cta-split-missing', {}),
    clientFacts: facts({ phone: null, email: null }),
    direct: { block: Cta, props: { layout: 'split', blueprintKey: 'cta_split_contact' } },
  },
  // Keys that are NOT collapsed — pinned through the dispatcher only, so the
  // registry rewrite cannot move them.
  {
    name: 'hero_split_image_card_overlay',
    key: 'hero_split_image_card_overlay',
    section: section('hero_split_image_card_overlay', 'overlay', {
      breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Services' }],
      serviceLine: 'marketing',
      priceCard: {
        imageUrl: '/card.jpg',
        priceLabel: 'Starting at',
        price: '$99/mo',
        cta: { label: 'Get started', url: '#start' },
      },
    }),
    clientFacts: facts(),
  },
  {
    name: 'stats_bar',
    key: 'stats_bar',
    section: section('stats_bar', 'stats', {
      items: [
        { title: '120+', description: 'Projects' },
        { title: '15', description: 'Years' },
      ],
    }),
    clientFacts: facts(),
  },
  {
    name: 'testimonials_featured_large',
    key: 'testimonials_featured_large',
    section: section('testimonials_featured_large', 'testimonial', {
      items: [{ title: 'Sample Name', description: 'A featured quote.' }],
    }),
    clientFacts: facts(),
  },
  {
    name: 'logo_wall',
    key: 'logo_wall',
    section: section('logo_wall', 'logos', {
      items: [
        { title: 'Acme', description: '', imageUrl: '/acme.svg' },
        { title: 'Globex', description: '', imageUrl: '/globex.svg' },
      ],
    }),
    clientFacts: facts(),
  },
];

const golden = (name: string) => `./__golden__/${name}.golden`;
const dispatch = (c: Case) =>
  renderToStaticMarkup(
    createElement(BlueprintDispatcher, {
      sections: [c.section],
      clientFacts: c.clientFacts,
      theme: baseTheme,
    }),
  );

/* ─── Tests ────────────────────────────────────────────────────── */

describe('BlueprintDispatcher (React) — key → (block, layout), markup pinned (#2352)', () => {
  it('covers every wired blueprint key', () => {
    const covered = new Set(CASES.map((c) => c.key));
    expect([...WIRED_BLUEPRINT_KEYS].filter((k) => !covered.has(k))).toEqual([]);
  });

  for (const c of CASES) {
    it(`dispatches ${c.name} to its golden markup`, async () => {
      await expect(dispatch(c)).toMatchFileSnapshot(golden(c.name));
    });
  }

  it('renders the fallback for an unknown key', () => {
    const html = renderToStaticMarkup(
      createElement(BlueprintDispatcher, {
        sections: [{ ...CASES[0].section, visualNotes: null }],
        clientFacts: facts(),
        theme: baseTheme,
      }),
    );
    expect(html).toContain('data-blueprint-unknown-key');
  });
});

describe('generic blocks render a section directly via `layout` (#2352)', () => {
  for (const c of CASES.filter((x) => x.direct)) {
    const { block, props } = c.direct!;
    it(`${c.name}: <${block.displayName ?? block.name} ${JSON.stringify(props)}> renders what the dispatcher renders`, () => {
      const blueprintProps: BlueprintProps = {
        section: c.section,
        clientFacts: c.clientFacts,
        theme: baseTheme,
      };
      const html = renderToStaticMarkup(createElement(block, { ...blueprintProps, ...props }));
      expect(html).toBe(dispatch(c));
    });
  }
});
