import type { Meta, StoryObj } from '@storybook/react-vite';

import { AstroFrame } from './_AstroFrame';
import './__generated__/StatsDarkBar.css';
import html from './__generated__/StatsDarkBar.html?raw';
import countUpHtml from './__generated__/StatsDarkBar--count-up.html?raw';

/**
 * `StatsDarkBar.astro` on the canonical rail (ADR-037), pre-rendered by
 * `scripts/render-astro-blueprints.mjs`. The React twin is `Blueprints/stats-dark-bar`.
 * The first block to adopt the content-motion axis `count-up` (ADR-039 §Decision 2, #2529).
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

/** @summary Count-up — stats count up into view (Astro rail). */
export const CountUp: Story = { render: () => <AstroFrame html={countUpHtml} /> };
