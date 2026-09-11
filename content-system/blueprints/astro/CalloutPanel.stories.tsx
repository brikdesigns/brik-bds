import type { Meta, StoryObj } from '@storybook/react-vite';

import { AstroFrame } from './_AstroFrame';
import './__generated__/CalloutPanel.css';
import html from './__generated__/CalloutPanel.html?raw';

/**
 * `CalloutPanel.astro` on the canonical rail (ADR-037), pre-rendered by
 * `scripts/render-astro-blueprints.mjs`. The React twin is `Blueprints/callout_panel`.
 */
const meta: Meta<typeof AstroFrame> = {
  title: 'Blueprints/astro-callout-panel',
  component: AstroFrame,
  tags: ['surface-web'],
  argTypes: {
    html: { control: false, description: 'Pre-rendered Astro markup. Generated, not authored.' },
  },
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof AstroFrame>;

/** @summary Default — split callout panel framing a support offering. */
export const Default: Story = { render: () => <AstroFrame html={html} /> };
