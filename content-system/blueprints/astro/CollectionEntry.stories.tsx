import type { Meta, StoryObj } from '@storybook/react-vite';

import { AstroFrame } from './_AstroFrame';
import './__generated__/CollectionEntry.css';
import html from './__generated__/CollectionEntry.html?raw';

/**
 * `CollectionEntry.astro` on the canonical rail (ADR-037), pre-rendered by
 * `scripts/render-astro-blueprints.mjs`. Astro-only block: no React twin (`rails: ["astro"]`, brik-bds#872).
 */
const meta: Meta<typeof AstroFrame> = {
  title: 'Blueprints/astro-collection-entry',
  component: AstroFrame,
  tags: ['surface-web'],
  argTypes: {
    html: { control: false, description: 'Pre-rendered Astro markup. Generated, not authored.' },
  },
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof AstroFrame>;

/** @summary Default — long-form article with headings and a list. */
export const Default: Story = { render: () => <AstroFrame html={html} /> };
