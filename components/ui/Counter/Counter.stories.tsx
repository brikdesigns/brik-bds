import type { Meta, StoryObj } from '@storybook/react-vite';
import { Counter } from './Counter';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof Counter> = {
  title: 'Components/counter',
  component: Counter,
  tags: ['surface-shared'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    count: {
      control: { type: 'number', min: 0, max: 999 },
      description: 'Numeric count to display.',
    },
    status: {
      control: 'select',
      options: ['success', 'error', 'warning', 'neutral', 'progress', 'brand'],
      description: 'Status color — pure color axis, no semantic difference between values.',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size token. Default `sm`.',
    },
    max: {
      control: { type: 'number', min: 1, max: 999 },
      description: 'Max count — displays `{max}+` when `count` exceeds it.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Counter>;

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — args-driven sandbox. Status, size, and max overflow
   are pure color/dimension axes with no semantic difference
   between values — Controls (ADR-010 Q2), not standalone stories.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive Counter — status, size, max via Controls */
export const Default: Story = {
  args: {
    count: 5,
    status: 'success',
    size: 'sm',
  },
};
