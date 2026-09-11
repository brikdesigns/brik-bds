import type { Meta, StoryObj } from '@storybook/react-vite';

import { AstroFrame } from './_AstroFrame';
import './__generated__/Cta.css';
import defaultLayout from './__generated__/Cta--default.html?raw';
import splitLayout from './__generated__/Cta--split.html?raw';

/**
 * `Cta.astro` on the canonical rail (ADR-037), pre-rendered by
 * `scripts/render-astro-blueprints.mjs`. The React twin is `Blueprints/cta`.
 */
const meta: Meta<typeof AstroFrame> = {
  title: 'Blueprints/astro-cta',
  component: AstroFrame,
  tags: ['surface-web'],
  argTypes: {
    html: { control: false, description: 'Pre-rendered Astro markup. Generated, not authored.' },
  },
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof AstroFrame>;

/** @summary Default — centred closing prompt on an inverse surface. */
export const Default: Story = { render: () => <AstroFrame html={defaultLayout} /> };

/** @summary Split — CTA beside direct contact details. */
export const Split: Story = { render: () => <AstroFrame html={splitLayout} /> };
