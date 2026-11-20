import type { Meta, StoryObj } from '@storybook/react-vite';

import { AstroFrame } from './_AstroFrame';
import './__generated__/TestimonialsCardGrid.css';
import html from './__generated__/TestimonialsCardGrid.html?raw';

/**
 * `TestimonialsCardGrid.astro` on the canonical rail (ADR-037), pre-rendered by
 * `scripts/render-astro-blueprints.mjs`. Astro-only block: no React twin (`rails: ["astro"]`, brik-bds#3190).
 */
const meta: Meta<typeof AstroFrame> = {
  title: 'Blueprints/astro-testimonials-card-grid',
  component: AstroFrame,
  tags: ['surface-web'],
  argTypes: {
    html: { control: false, description: 'Pre-rendered Astro markup. Generated, not authored.' },
  },
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof AstroFrame>;

/** @summary Default — testimonial quote cards in a responsive grid. */
export const Default: Story = { render: () => <AstroFrame html={html} /> };
