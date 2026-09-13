import type { Meta, StoryObj } from '@storybook/react-vite';

import { AstroFrame } from './_AstroFrame';
import './__generated__/LogoWall.css';
import staticHtml from './__generated__/LogoWall--static.html?raw';
import marqueeHtml from './__generated__/LogoWall--marquee.html?raw';

/**
 * `LogoWall.astro` on the canonical rail (ADR-037), pre-rendered by
 * `scripts/render-astro-blueprints.mjs`. The React twin is `Blueprints/logo-wall`.
 * The first block to adopt the content-motion axis (ADR-039 §Decision 2, #2529).
 */
const meta: Meta<typeof AstroFrame> = {
  title: 'Blueprints/astro-logo-wall',
  component: AstroFrame,
  tags: ['surface-web'],
  argTypes: {
    html: { control: false, description: 'Pre-rendered Astro markup. Generated, not authored.' },
  },
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof AstroFrame>;

/** @summary Static logo row — `contentMotion: none`. */
export const Default: Story = { render: () => <AstroFrame html={staticHtml} /> };

/** @summary Marquee — logos scroll via the `_Marquee` partial. */
export const Marquee: Story = { render: () => <AstroFrame html={marqueeHtml} /> };
