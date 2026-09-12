import type { Meta, StoryObj } from '@storybook/react-vite';

import { AstroFrame } from './_AstroFrame';
import './__generated__/Hero.css';
import html from './__generated__/HeroMediaCardImage.html?raw';

/**
 * `HeroMediaCardImage.astro` on the canonical rail (ADR-037), pre-rendered by
 * `scripts/render-astro-blueprints.mjs`. Emits `.bds-hero__image-frame` /
 * `.bds-hero__image`, class-identical to the React twin (brik-bds#2312).
 * Styled by `Hero.css` (ADR-040 mirror coverage). React twin:
 * `Blueprints/hero media card image`.
 */
const meta: Meta<typeof AstroFrame> = {
  title: 'Blueprints/astro-hero-media-card-image',
  component: AstroFrame,
  tags: ['surface-web'],
  argTypes: {
    html: { control: false, description: 'Pre-rendered Astro markup. Generated, not authored.' },
  },
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof AstroFrame>;

/** @summary Default square image frame */
export const Default: Story = { render: () => <AstroFrame html={html} /> };
