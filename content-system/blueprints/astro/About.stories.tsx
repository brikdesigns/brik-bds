import type { Meta, StoryObj } from '@storybook/react-vite';

import { AstroFrame } from './_AstroFrame';
import './__generated__/About.css';
import html from './__generated__/About.html?raw';

/**
 * `About.astro` on the canonical rail (ADR-037), pre-rendered by
 * `scripts/render-astro-blueprints.mjs`. The React twin is `Blueprints/about`.
 */
const meta: Meta<typeof AstroFrame> = {
  title: 'Blueprints/astro-about',
  component: AstroFrame,
  tags: ['surface-web'],
  argTypes: {
    html: { control: false, description: 'Pre-rendered Astro markup. Generated, not authored.' },
  },
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof AstroFrame>;

/** @summary Default — story-led brand introduction with a pull-quote. */
export const Default: Story = { render: () => <AstroFrame html={html} /> };
