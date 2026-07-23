import type { Meta, StoryObj } from '@storybook/react-vite';
import type { JSX } from 'react';

import { Features } from './Features';

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
  --background-brand-primary: var(--color-yellow-light);
  --text-brand-primary: var(--color-yellow-dark);
}
[data-service-line='marketing'] {
  --background-brand-primary: var(--color-green-light);
  --text-brand-primary: var(--color-green-dark);
}
[data-service-line='information'] {
  --background-brand-primary: var(--color-blue-light);
  --text-brand-primary: var(--color-blue-dark);
}
[data-service-line='product'] {
  --background-brand-primary: var(--color-purple-light);
  --text-brand-primary: var(--color-purple-dark);
}
[data-service-line='service'] {
  --background-brand-primary: var(--color-orange-light);
  --text-brand-primary: var(--color-orange-dark);
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
 * Distinct meaningful state from `Default`: the row-wrap behavior at the
 * desktop breakpoint is the layout property worth verifying. Per-card content
 * variants (missing image, audience accent) are exercised by the leaf `Card`
 * / `ServiceTag` stories, not duplicated here.
 *
 * @summary Six cards force the grid to a second row
 */
export const Wrapped: Story = {
  args: {
    sectionKey: 'features-wrapped',
    title: 'Featured capabilities',
    body: 'A short section subheading that frames the cards below — typically a cross-sell or capability roll-up.',
    items: [
      ...items,
      {
        title: 'Capability six',
        description:
          'A two-line card description that sets the type rhythm without competing with the title.',
        href: '#',
        serviceLine: 'brand' as const,
      },
    ],
  },
};
