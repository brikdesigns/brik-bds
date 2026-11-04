import type { Meta, StoryObj } from '@storybook/react-vite';

import { AstroFrame } from './_AstroFrame';
import './__generated__/CollectionIndex.css';
import html from './__generated__/CollectionIndex.html?raw';

/**
 * `CollectionIndex.astro` on the canonical rail (ADR-037), pre-rendered by
 * `scripts/render-astro-blueprints.mjs`. Astro-only block: no React twin (`rails: ["astro"]`, brik-bds#872).
 */
const meta: Meta<typeof AstroFrame> = {
  title: 'Blueprints/astro-collection-index',
  component: AstroFrame,
  tags: ['surface-web'],
  argTypes: {
    html: { control: false, description: 'Pre-rendered Astro markup. Generated, not authored.' },
  },
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof AstroFrame>;

/** @summary Default — card grid of entries with image and excerpt. */
export const Default: Story = { render: () => <AstroFrame html={html} /> };
