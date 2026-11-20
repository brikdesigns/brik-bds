import type { Meta, StoryObj } from '@storybook/react-vite';
import type { JSX } from 'react';

import type { BlueprintProps } from '../astro/types';
import { Features } from './Features';
import { baseClientFacts, baseTheme, placeholderImage } from './_fixtures';
import fadeSquare from '../../../components/ui/AnimatedIcon/_examples/fade-square.json';

/* ─── Demo data-service-line cascade ────────────────────────────────────
 *
 * BDS ships the scope-binding pattern but not audience-specific values
 * — those live in each consumer's globals.css. Storybook needs the
 * binding present somewhere so cards visualize in distinct brand
 * colors. This `<style>` block is a representative example of what a
 * consumer site would declare for its audience verticals.
 */
const serviceLineCascadeStyles = `
[data-service-line='brand'] {
  --bds-background-brand-primary: var(--bds-color-yellow-500);
  --bds-text-brand-primary: var(--bds-color-yellow-700);
}
[data-service-line='marketing'] {
  --bds-background-brand-primary: var(--bds-color-green-500);
  --bds-text-brand-primary: var(--bds-color-green-700);
}
[data-service-line='information'] {
  --bds-background-brand-primary: var(--bds-color-blue-500);
  --bds-text-brand-primary: var(--bds-color-blue-700);
}
[data-service-line='product'] {
  --bds-background-brand-primary: var(--bds-color-purple-500);
  --bds-text-brand-primary: var(--bds-color-purple-700);
}
[data-service-line='service'] {
  --bds-background-brand-primary: var(--bds-color-orange-500);
  --bds-text-brand-primary: var(--bds-color-orange-700);
}
`;

const items = [
  {
    title: 'Capability one',
    description:
      'A two-line card description that sets the type rhythm without competing with the title.',
    href: '#',
    serviceLine: 'brand' as const,
  },
  {
    title: 'Capability two',
    description:
      'A two-line card description that sets the type rhythm without competing with the title.',
    href: '#',
    serviceLine: 'marketing' as const,
  },
  {
    title: 'Capability three',
    description:
      'A two-line card description that sets the type rhythm without competing with the title.',
    href: '#',
    serviceLine: 'information' as const,
  },
  {
    title: 'Capability four',
    description:
      'A two-line card description that sets the type rhythm without competing with the title.',
    href: '#',
    serviceLine: 'product' as const,
  },
  {
    title: 'Capability five',
    description:
      'A two-line card description that sets the type rhythm without competing with the title.',
    href: '#',
    serviceLine: 'service' as const,
  },
];

const withAudienceCascade = (Story: () => JSX.Element) => (
  <>
    <style dangerouslySetInnerHTML={{ __html: serviceLineCascadeStyles }} />
    <Story />
  </>
);

const meta: Meta<typeof Features> = {
  title: 'Blueprints/features',
  component: Features,
  tags: ['surface-web'],
  decorators: [withAudienceCascade],
  argTypes: {
    sectionKey: { control: 'text', description: 'Unique section key — drives element ids.' },
    title: { control: 'text', description: 'Section heading.' },
    body: { control: 'text', description: 'One-line section subheading.' },
    items: { control: false, description: 'Feature cards `{ title, description, href, serviceLine }[]`; each emits `data-service-line` for brand-color re-binding.' },
    align: { control: 'inline-radio', options: ['center', 'left'], description: 'Section-header placement (structure axis, ADR-039). `center` default; `left` emits `bds-features--align-left`. Header only — the grid is unaffected.' },
    columns: { control: 'inline-radio', options: [undefined, 2, 3, 4], description: 'Widest-breakpoint column count (structure axis, ADR-039). Omitted → the default 1 → 2 → 3 ramp; set → `bds-features--cols-*`.' },
    layout: { control: 'inline-radio', options: ['grid', 'alternating-split', 'bento'], description: 'Structure axis (ADR-039, #3189, #3188). `bento` is the asymmetric card grid: first item featured (spans two rows from desktop), an item with `stat` is a stat cell; emits `bds-features--bento`. `grid` default is the card grid; `alternating-split` renders text + media rows with the sides swapped on even rows, and emits `bds-features--alternating-split`.' },
    mediaPosition: { control: 'inline-radio', options: ['end', 'start'], description: '`alternating-split` media-side start (structure axis, ADR-039). `end` default; `start` emits `data-media-position="start"` and puts the first row\'s media first. Ignored by `grid`.' },
    contentMotion: { control: 'inline-radio', options: ['none', 'animated-svg'], description: 'Content-motion axis (ADR-039 §Decision 2, #2533). `animated-svg` animates each card icon via the Lottie `AnimatedIcon` primitive (from `items[].animationUrl`), React rail only; the Astro twin renders the static `imageUrl` poster. `none` (default) is static.' },
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The `bds-features` feature-grid section primitive (brik-bds#1197) — the Phase D consolidation of the features family, retiring the ADR-008-banned `bp-features-branded-dark` (`--dark` = theme, `--branded` = appearance, `3col` = count). The default `grid` layout is the responsive grid; `layout="alternating-split"` (#3189) renders text + media rows instead, and `layout="bento"` (#3188) an asymmetric card grid. The dark surface is the `--bds-features-background` default, not a class name. Each card emits `data-service-line` to re-bind `--bds-background-brand-primary` per the BDS scope-binding pattern; stories include a representative cascade block. Card title uses bold weight + 18px, description 16px regular — the AA-clearing posture for white-on-saturated-brand backgrounds (BDS contrast burndown #40).',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Features>;

/* ─── Stories ──────────────────────────────────────────────────── */

/**
 * @summary Five audience-distinct cards, one per service-line
 */
export const Default: Story = {
  args: {
    sectionKey: 'features-default',
    title: 'Featured capabilities',
    body: 'A short section subheading that frames the cards below — typically a cross-sell or capability roll-up.',
    items,
  },
};

/**
 * Distinct meaningful state: `layout="alternating-split"` renders one row per
 * item — text on one side, media on the other — with the sides swapped on even
 * rows from the tablet rung up and stacked text-then-media below it. The first
 * item carries an image; the others have none, so they render the missing-media
 * placeholder. The Astro twin is `Blueprints/astro-features`.
 *
 * @summary Alternating split — text + media rows
 */
export const AlternatingSplit: Story = {
  args: {
    sectionKey: 'features-alternating-split',
    layout: 'alternating-split',
    subtitle: 'How it works',
    title: 'One story, told in rows',
    body: 'Each feature gets a row of its own, so the page can tell a longer story than a single split.',
    items: [
      {
        title: 'Start with a conversation',
        description: 'A short call to learn what you need before anything is planned or priced.',
        href: '#',
        imageUrl: placeholderImage(960, 720, '#eaf1fb', '#1f3d70', 'Feature 1'),
        imageAlt: 'Feature 1',
      },
      {
        title: 'See the plan in writing',
        description: 'You get a clear scope, a timeline and a fixed fee before any work begins.',
      },
      {
        title: 'Review as it comes together',
        description: 'Check in at each step, so what we deliver is what you pictured.',
        href: '#',
      },
    ],
  },
};

/**
 * Distinct meaningful state: `layout="bento"` renders an asymmetric card grid —
 * the first item is the featured cell (spanning two rows from the desktop rung
 * up), an item with `stat` is a stat cell, and a cell with no image renders the
 * missing-media placeholder. One column below the tablet rung. The Astro twin is
 * `Blueprints/astro-features`.
 *
 * @summary Bento — featured cell, media cells and a stat cell
 */
export const Bento: Story = {
  args: {
    sectionKey: 'features-bento',
    layout: 'bento',
    subtitle: 'What we do',
    title: 'One feature leads, the rest support it',
    body: 'A featured cell beside a few smaller ones, so the section can lead with its strongest point.',
    items: [
      {
        title: 'Start with a conversation',
        description: 'A short call to learn what you need before anything is planned or priced.',
        href: '#',
        imageUrl: placeholderImage(960, 720, '#eaf1fb', '#1f3d70', 'Feature 1'),
        imageAlt: 'Feature 1',
      },
      {
        title: 'See the plan in writing',
        description: 'A clear scope, timeline and fixed fee before any work begins.',
      },
      {
        title: 'Clients who would recommend us',
        description: 'Measured after every engagement.',
        stat: '98%',
      },
      {
        title: 'Review as it comes together',
        description: 'Check in at each step.',
        href: '#',
      },
    ],
  },
};

/**
 * Distinct meaningful state: `align="left"` flushes the section header to the
 * start (structure axis, ADR-039). The card grid is unaffected.
 *
 * @summary Align-left — flush-start section header
 */
export const AlignLeft: Story = {
  args: {
    ...Default.args,
    sectionKey: 'features-align-left',
    align: 'left',
  },
};

/**
 * Distinct meaningful state: `columns={4}` widens the grid to four columns at
 * the widest breakpoint (structure axis, ADR-039); the mobile/tablet ramp is
 * preserved. The five cards wrap 4 + 1.
 *
 * @summary Columns-4 — four-up grid at the widest breakpoint
 */
export const ColumnsFour: Story = {
  args: {
    ...Default.args,
    sectionKey: 'features-cols-4',
    columns: 4,
  },
};

/**
 * Distinct meaningful state: `contentMotion="animated-svg"` upgrades each card's
 * icon to an animated Lottie via the shared `BlockContentMotion` dispatch, from
 * `items[].animationUrl` (ADR-039 §Decision 2, #2533). React rail only — the
 * Astro twin renders each item's static `imageUrl` poster (the by-construction
 * reduced-motion state). `no-visual`: Lottie canvases animate via JS, which the
 * visual gate's CSS freeze can't pause into a stable screenshot (ADR-026, same
 * as the `AnimatedIcon` stories).
 *
 * @summary Animated-svg — each card icon animates via AnimatedIcon
 */
export const AnimatedSvg: Story = {
  tags: ['no-visual'],
  args: {
    sectionKey: 'features-animated-svg',
    title: 'Animated capabilities',
    body: 'Each card icon animates via the Lottie AnimatedIcon primitive — the content-motion axis value animated-svg.',
    contentMotion: 'animated-svg',
    items: items.map((item) => ({ ...item, animationUrl: fadeSquare })),
  },
};

/* ─── Dispatched (section-driven) ──────────────────────────────────
 *
 * The same block, driven by a `BlueprintSection` — `section.items` map onto the
 * feature cards. What `BlueprintDispatcher` renders for the `feature_grid` key
 * (#2352).
 */

const featuresSection: BlueprintProps['section'] = {
  sectionKey: 'features-branded-dark-default',
  sectionType: 'features',
  title: 'Featured capabilities',
  subtitle: null,
  body: 'A short section subheading that frames the cards below — typically a cross-sell or capability roll-up.',
  cta: null,
  visualNotes: {
    blueprintKey: 'feature_grid',
    moodKeywords: ['bold', 'modern'],
    layoutBlueprint: 'feature_grid',
    imageOpportunity: 'illustration per card',
    illustrationOpportunity: 'scene per card',
  },
  items: [
    {
      title: 'Capability one',
      description: 'A two-line card description that sets the type rhythm without competing with the title.',
      href: '#',
      serviceLine: 'brand',
    },
    {
      title: 'Capability two',
      description: 'A two-line card description that sets the type rhythm without competing with the title.',
      href: '#',
      serviceLine: 'marketing',
    },
    {
      title: 'Capability three',
      description: 'A two-line card description that sets the type rhythm without competing with the title.',
      href: '#',
      serviceLine: 'service',
    },
  ],
};

/** @summary Dispatched features — three service-line cards */
export const DispatchedDefault: Story = {
  args: {
    section: featuresSection,
    clientFacts: baseClientFacts,
    theme: { ...baseTheme, themeMode: 'dark' },
    blueprintKey: 'feature_grid',
  },
};

/**
 * Distinct from `DispatchedDefault` because the row-wrap behaviour at the
 * desktop breakpoint is the layout property worth verifying.
 *
 * @summary Dispatched features — fourth card wraps to row two
 */
export const DispatchedWrapped: Story = {
  args: {
    ...DispatchedDefault.args,
    section: {
      ...featuresSection,
      sectionKey: 'features-branded-dark-wrapped',
      items: [
        ...featuresSection.items,
        {
          title: 'Capability four',
          description: 'A two-line card description that sets the type rhythm without competing with the title.',
          href: '#',
          serviceLine: 'information',
        },
      ],
    },
  },
};
