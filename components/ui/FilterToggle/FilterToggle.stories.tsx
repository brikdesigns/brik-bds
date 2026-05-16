import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
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
