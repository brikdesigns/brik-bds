import type { Meta, StoryObj } from '@storybook/react-vite';

import { AstroFrame } from './_AstroFrame';
import './__generated__/Narrative.css';
import html from './__generated__/Narrative.html?raw';
import mediaStart from './__generated__/Narrative--media-start.html?raw';
import vertical from './__generated__/Narrative--vertical.html?raw';

/**
 * `Narrative.astro` on the canonical rail (ADR-037), pre-rendered by
 * `scripts/render-astro-blueprints.mjs`. The React twin is `Blueprints/narrative`.
 */
const meta: Meta<typeof AstroFrame> = {
  title: 'Blueprints/astro-narrative',
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

/** @summary Media-start — pull-quote column first */
export const MediaStart: Story = { render: () => <AstroFrame html={mediaStart} /> };

/** @summary Vertical — narrative and pull-quote stacked */
export const Vertical: Story = { render: () => <AstroFrame html={vertical} /> };
