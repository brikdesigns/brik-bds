import type { Meta, StoryObj } from '@storybook/react-vite';

import { AstroFrame } from './_AstroFrame';
import './__generated__/Hero.css';
import split from './__generated__/Hero.split.html?raw';
import interiorMinimal from './__generated__/Hero.interior-minimal.html?raw';
import withPricingCard from './__generated__/Hero.with-pricing-card.html?raw';

/**
 * `Hero.astro` on the canonical rail (ADR-037), pre-rendered by
 * `scripts/render-astro-blueprints.mjs`. The React twin is `Blueprints/hero`.
 *
 * Render-mode by necessity (ADR-010 Q4): the subject is server-rendered markup,
 * which no arg can express. Section content is fixed to the React twin's fixture
 * so the two entries differ only by rail.
 */
const meta: Meta<typeof AstroFrame> = {
  title: 'Blueprints/astro-hero',
  component: AstroFrame,
  tags: ['surface-web'],
  argTypes: {
    html: { control: false, description: 'Pre-rendered Astro markup. Generated, not authored.' },
  },
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof AstroFrame>;

/** @summary Split — the default hero layout, content beside photography. */
export const Default: Story = { render: () => <AstroFrame html={split} /> };

/** @summary Interior-minimal — headline + lead only, for interior pages. */
export const InteriorMinimal: Story = { render: () => <AstroFrame html={interiorMinimal} /> };

/** @summary With-pricing-card — service hero with a price overlay. */
export const WithPricingCard: Story = { render: () => <AstroFrame html={withPricingCard} /> };
