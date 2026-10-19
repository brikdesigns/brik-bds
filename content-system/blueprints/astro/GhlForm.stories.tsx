import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { AstroFrame } from './_AstroFrame';
import html from './__generated__/GhlForm.html?raw';

/**
 * `GhlForm.astro` on the canonical rail (ADR-037), pre-rendered by
 * `scripts/render-astro-blueprints.mjs`. The React twin is `Forms/ghl-form`.
 * Styled by `components/ui/GhlForm/GhlForm.css`, imported by `_AstroFrame.tsx`.
 */
const meta: Meta<typeof AstroFrame> = {
  title: 'Blueprints/astro-ghl-form',
  component: AstroFrame,
  tags: ['surface-web'],
  argTypes: {
    html: { control: false, description: 'Pre-rendered Astro markup. Generated, not authored.' },
  },
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof AstroFrame>;

/** @summary Default — GHL form iframe with title and reserved height */
export const Default: Story = { render: () => <AstroFrame html={html} /> };

/**
 * The Astro-rendered iframe is a named frame.
 * @summary Astro iframe renders with a non-empty title
 */
export const InteractionTestIframeTitle: Story = {
  tags: ['!manifest', 'interaction-test'],
  render: () => <AstroFrame html={html} />,
  play: async ({ canvasElement }) => {
    const frame = canvasElement.querySelector('iframe');
    await expect(frame).not.toBeNull();
    const title = frame?.getAttribute('title') ?? '';
    await expect(title.trim()).not.toBe('');
    await expect(title).toBe('Contact Us');
  },
};
