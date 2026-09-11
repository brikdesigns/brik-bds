import type { Meta, StoryObj } from '@storybook/react-vite';

import { AstroFrame } from './_AstroFrame';
import './__generated__/TestimonialsFeaturedLarge.css';
import html from './__generated__/TestimonialsFeaturedLarge.html?raw';

/**
 * `TestimonialsFeaturedLarge.astro` on the canonical rail (ADR-037), pre-rendered by
 * `scripts/render-astro-blueprints.mjs`. The React twin is `Blueprints/testimonials-featured-large`.
 */
const meta: Meta<typeof AstroFrame> = {
  title: 'Blueprints/astro-testimonials-featured-large',
  component: AstroFrame,
  tags: ['surface-web'],
  argTypes: {
    html: { control: false, description: 'Pre-rendered Astro markup. Generated, not authored.' },
  },
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof AstroFrame>;

/** @summary Default — single featured testimonial at large scale. */
export const Default: Story = { render: () => <AstroFrame html={html} /> };
