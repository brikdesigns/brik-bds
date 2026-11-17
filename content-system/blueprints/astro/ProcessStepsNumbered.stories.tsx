import type { Meta, StoryObj } from '@storybook/react-vite';

import { AstroFrame } from './_AstroFrame';
import './__generated__/ProcessStepsNumbered.css';
import html from './__generated__/ProcessStepsNumbered.html?raw';
import threeSteps from './__generated__/ProcessStepsNumbered--steps-3.html?raw';
import fiveSteps from './__generated__/ProcessStepsNumbered--steps-5.html?raw';

/**
 * `ProcessStepsNumbered.astro` on the canonical rail (ADR-037), pre-rendered by
 * `scripts/render-astro-blueprints.mjs`. Astro-only block: no React twin (`rails: ["astro"]`, brik-bds#3191).
 * The step count is the number of `section.items`; the stories render 3, 4 and 5 steps.
 */
const meta: Meta<typeof AstroFrame> = {
  title: 'Blueprints/astro-process-steps-numbered',
  component: AstroFrame,
  tags: ['surface-web'],
  argTypes: {
    html: { control: false, description: 'Pre-rendered Astro markup. Generated, not authored.' },
  },
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof AstroFrame>;

/** @summary Default — four numbered steps. */
export const Default: Story = { render: () => <AstroFrame html={html} /> };

/** @summary Three steps — one desktop row of three */
export const ThreeSteps: Story = { render: () => <AstroFrame html={threeSteps} /> };

/** @summary Five steps — one desktop row of five */
export const FiveSteps: Story = { render: () => <AstroFrame html={fiveSteps} /> };
