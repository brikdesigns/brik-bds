import type { Meta, StoryObj } from '@storybook/react-vite';

import { AstroFrame } from './_AstroFrame';
import './__generated__/Features.css';
import html from './__generated__/Features.html?raw';
import alternatingSplit from './__generated__/Features--alternating-split.html?raw';
import alternatingSplitImages from './__generated__/Features--alternating-split-images.html?raw';
import alternatingSplitMediaStart from './__generated__/Features--alternating-split-media-start.html?raw';

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

/** @summary Alternating split — no images, placeholder media */
export const AlternatingSplit: Story = { render: () => <AstroFrame html={alternatingSplit} /> };

/** @summary Alternating split, with images — sides swapped on even rows */
export const AlternatingSplitImages: Story = { render: () => <AstroFrame html={alternatingSplitImages} /> };

/** @summary Alternating split — media-start */
export const AlternatingSplitMediaStart: Story = { render: () => <AstroFrame html={alternatingSplitMediaStart} /> };
