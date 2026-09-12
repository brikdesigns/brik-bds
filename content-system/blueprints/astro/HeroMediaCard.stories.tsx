import type { Meta, StoryObj } from '@storybook/react-vite';

import { AstroFrame } from './_AstroFrame';
import './__generated__/Hero.css';
import html from './__generated__/HeroMediaCard.html?raw';

/**
 * `HeroMediaCard.astro` on the canonical rail (ADR-037), pre-rendered by
 * `scripts/render-astro-blueprints.mjs`. Presentational, non-interactive
 * `bds-hero__media-card` root composed inside `Hero.astro`'s
 * `with-pricing-card` layout (brik-bds#2312) — not a dispatched blueprint.
 * Styled by `Hero.css` (ADR-040 mirror coverage), the same stylesheet the
 * `Blueprints/astro-hero` stories import. React twin: `Blueprints/hero media card`.
 */
const meta: Meta<typeof AstroFrame> = {
  title: 'Blueprints/astro-hero-media-card',
  component: AstroFrame,
  tags: ['surface-web'],
  argTypes: {
    html: { control: false, description: 'Pre-rendered Astro markup. Generated, not authored.' },
  },
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof AstroFrame>;

/** @summary Populated card — image + price + composed CTA link */
export const Default: Story = { render: () => <AstroFrame html={html} /> };
