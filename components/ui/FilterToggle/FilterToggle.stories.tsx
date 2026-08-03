import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
// Same helper the contrast gate uses (scripts/validate-themes.js), so a story
// assertion and the token-level gate can never disagree on the arithmetic.
import { contrastRatio } from '../../../scripts/lib/wcag.mjs';
import { FilterToggle } from './FilterToggle';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof FilterToggle> = {
  title: 'Components/filter-toggle',
  component: FilterToggle,
  tags: ['surface-product'],
  parameters: { layout: 'padded' },
  argTypes: {
    label: {
      control: 'text',
      description: 'Button label. Stays the same in both active and inactive states.',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Pill size — matches the FilterButton / Button scale (sm=32px, md=40px, lg=48px). Default `md`.',
    },
    active: {
      control: 'boolean',
      description: 'Whether the filter is on. Seeds the in-story `useState`; click the pill in the canvas to flip it.',
    },
    disabled: {
      control: 'boolean',
      description: 'Locks the pill and applies muted styling. Click events are blocked.',
    },
    onToggle: {
      action: 'toggled',
      description: 'Called when the pill is clicked. Consumer flips the boolean externally — FilterToggle is fully controlled.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof FilterToggle>;

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — single canonical story per ADR-010 §components without
   a variant axis. Render wraps with useState so the canvas is
   interactive (FilterToggle is fully controlled, no internal state).
   args.onToggle still fires for Actions panel logging.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Binary on/off filter pill */
export const Default: Story = {
  args: {
    label: 'Show archived',
    active: false,
    disabled: false,
    size: 'md',
    onToggle: fn(),
  },
  render: (args) => {
    const [active, setActive] = useState(args.active);
    return (
      <FilterToggle
        {...args}
        active={active}
        onToggle={() => {
          setActive((prev) => !prev);
          args.onToggle?.();
        }}
      />
    );
  },
};

/**
 * @summary Disabled toggle keeps a legible label
 */
export const InteractionTestDisabledLabelLegible: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: {
    label: 'Show archived',
    active: false,
    disabled: true,
    size: 'md',
    onToggle: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: /Show archived/ });

    await expect(toggle).toBeDisabled();

    // FilterToggle repaints itself when disabled (FilterToggle.css:32-35 sets
    // --background-disabled + --text-disabled), the same treatment that rendered
    // an invisible label at 1:1 in Button (#1571) and FilterButton (#1503).
    // 3:1 rather than 4.5: WCAG 1.4.3 exempts inactive components, so the bar is
    // legibility. Token-level source of truth: tokens/contrast-pairings.json +
    // `npm run contrast-gate`. Whether this treatment should become the opacity
    // fade the other 21 components use is #1667.
    const style = getComputedStyle(toggle);

    await expect(
      contrastRatio(style.color, style.backgroundColor),
    ).toBeGreaterThanOrEqual(3);
  },
};
