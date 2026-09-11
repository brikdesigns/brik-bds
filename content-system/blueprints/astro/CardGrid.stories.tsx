import type { Meta, StoryObj } from '@storybook/react-vite';

import { AstroFrame } from './_AstroFrame';
import './__generated__/CardGrid.css';
import cardGrid from './__generated__/CardGrid.card-grid.html?raw';
import twoColumnList from './__generated__/CardGrid.two-column-list.html?raw';

/**
 * `CardGrid.astro` on the canonical rail (ADR-037), pre-rendered by
 * `scripts/render-astro-blueprints.mjs`. The React twin is `Blueprints/card_grid`.
 */
const meta: Meta<typeof AstroFrame> = {
  title: 'Blueprints/astro-card-grid',
  component: AstroFrame,
  tags: ['surface-web'],
  argTypes: {
    html: { control: false, description: 'Pre-rendered Astro markup. Generated, not authored.' },
  },
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof AstroFrame>;

/** @summary Card-grid — three image-led service cards. */
export const Default: Story = { render: () => <AstroFrame html={cardGrid} /> };

/** @summary Two-column-list — dense text catalog, no imagery. */
export const TwoColumnList: Story = { render: () => <AstroFrame html={twoColumnList} /> };
