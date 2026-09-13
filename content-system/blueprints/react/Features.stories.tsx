import type { Meta, StoryObj } from '@storybook/react-vite';
import type { JSX } from 'react';

import { Features } from './Features';
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
  --background-brand-primary: var(--color-yellow-500);
  --text-brand-primary: var(--color-yellow-700);
}
[data-service-line='marketing'] {
  --background-brand-primary: var(--color-green-500);
  --text-brand-primary: var(--color-green-700);
}
[data-service-line='information'] {
  --background-brand-primary: var(--color-blue-500);
  --text-brand-primary: var(--color-blue-700);
}
[data-service-line='product'] {
  --background-brand-primary: var(--color-purple-500);
  --text-brand-primary: var(--color-purple-700);
}
[data-service-line='service'] {
  --background-brand-primary: var(--color-orange-500);
  --text-brand-primary: var(--color-orange-700);
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
    contentMotion: { control: 'inline-radio', options: ['none', 'animated-svg'], description: 'Content-motion axis (ADR-039 §Decision 2, #2533). `animated-svg` animates each card icon via the Lottie `AnimatedIcon` primitive (from `items[].animationUrl`), React rail only; the Astro twin renders the static `imageUrl` poster. `none` (default) is static.' },
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The `bds-features` feature-grid section primitive (brik-bds#1197) — the Phase D consolidation of the features family, retiring the ADR-008-banned `bp-features-branded-dark` (`--dark` = theme, `--branded` = appearance, `3col` = count). Single-member family, so no layout modifier: the block is the responsive grid. The dark surface is the `--bds-features-bg` default, not a class name. Each card emits `data-service-line` to re-bind `--background-brand-primary` per the BDS scope-binding pattern; stories include a representative cascade block. Card title uses bold weight + 18px, description 16px regular — the AA-clearing posture for white-on-saturated-brand backgrounds (BDS contrast burndown #40).',
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
