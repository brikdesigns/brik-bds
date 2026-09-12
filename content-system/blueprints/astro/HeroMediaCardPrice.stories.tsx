import type { Meta, StoryObj } from '@storybook/react-vite';

import { AstroFrame } from './_AstroFrame';
import './__generated__/Hero.css';
import html from './__generated__/HeroMediaCardPrice.html?raw';

/**
 * `HeroMediaCardPrice.astro` on the canonical rail (ADR-037), pre-rendered by
 * `scripts/render-astro-blueprints.mjs`. Emits `.bds-hero__price` /
 * `__price-label` / `__price-value`, class-identical to the React twin
 * (brik-bds#2312) — presentational only, renders no `<button>`/`<a>` itself;
 * the CTA link here is caller-composed slot content. Styled by `Hero.css`
 * (ADR-040 mirror coverage). React twin: `Blueprints/hero media card price`.
 */
const meta: Meta<typeof AstroFrame> = {
  title: 'Blueprints/astro-hero-media-card-price',
  component: AstroFrame,
  tags: ['surface-web'],
  argTypes: {
    html: { control: false, description: 'Pre-rendered Astro markup. Generated, not authored.' },
  },
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof AstroFrame>;

/** @summary Label + value with a caller-composed CTA link */
export const Default: Story = { render: () => <AstroFrame html={html} /> };
