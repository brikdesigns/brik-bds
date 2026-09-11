import type { Meta, StoryObj } from '@storybook/react-vite';

import { AstroFrame } from './_AstroFrame';
import './__generated__/StatsDarkBar.css';
import html from './__generated__/StatsDarkBar.html?raw';

/**
 * `StatsDarkBar.astro` on the canonical rail (ADR-037), pre-rendered by
 * `scripts/render-astro-blueprints.mjs`. The React twin is `Blueprints/stats-dark-bar`.
 */
const meta: Meta<typeof AstroFrame> = {
  title: 'Blueprints/astro-stats-dark-bar',
  component: AstroFrame,
  tags: ['surface-web'],
  argTypes: {
    html: { control: false, description: 'Pre-rendered Astro markup. Generated, not authored.' },
  },
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof AstroFrame>;

/** @summary Default — four-figure stat bar on an inverse surface. */
export const Default: Story = { render: () => <AstroFrame html={html} /> };
