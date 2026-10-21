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
export const Default: Story = {
  // no-visual: this story screenshots the LIVE third-party GHL form
  // (rvGeUFEFytjrjxr7XiDE) in a cross-origin iframe, so the pixels are GHL's,
  // not ours. The gate fails on it with bimodal diffs (~36052 px at ratio 0.06,
  // or 805 px at ratio 0.01) on main and on PRs alike, while PRs that don't
  // change it pass: runs 39509355495, 39504292951, 39502520088, 39494684381,
  // and main 2026-10-21T13:40Z. Regenerating the baseline cannot fix it.
  // brik-client-portal#5364.
  tags: ['no-visual'],
  render: () => <AstroFrame html={html} />,
};

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
