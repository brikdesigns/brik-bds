import type { Meta, StoryObj } from '@storybook/react-vite';

import { AstroFrame } from './_AstroFrame';
import './__generated__/Features.css';
import html from './__generated__/Features.html?raw';

/**
 * `Features.astro` on the canonical rail (ADR-037), pre-rendered by
 * `scripts/render-astro-blueprints.mjs`. The React twin is `Blueprints/features`.
 */
const meta: Meta<typeof AstroFrame> = {
  title: 'Blueprints/astro-features',
  component: AstroFrame,
  tags: ['surface-web'],
  argTypes: {
    html: { control: false, description: 'Pre-rendered Astro markup. Generated, not authored.' },
  },
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof AstroFrame>;

/** @summary Default — three capability cards on a branded dark surface. */
export const Default: Story = { render: () => <AstroFrame html={html} /> };
