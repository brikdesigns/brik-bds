import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProgressCircle } from './ProgressCircle';

const meta: Meta<typeof ProgressCircle> = {
  title: 'Components/progress-circle',
  component: ProgressCircle,
  tags: ['surface-shared'],
  parameters: { layout: 'padded' },
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Progress value from 0 to 100. Ignored when `indeterminate` is true.',
    },
    size: {
      control: { type: 'inline-radio' },
      options: ['sm', 'md', 'lg'],
      description: 'Diameter preset — `sm` 64px, `md` 96px, `lg` 128px.',
    },
    status: {
      control: { type: 'inline-radio' },
      options: ['default', 'positive', 'warning', 'negative'],
      description: 'Fill color semantic — uses canonical status tokens.',
    },
    label: {
      control: 'text',
      description: 'Accessible label for screen readers.',
    },
    showValue: {
      control: false,
      description: 'Centered slot. Pass `true` to render `${value}%`, a ReactNode for custom content, or omit for none.',
    },
    indeterminate: {
      control: 'boolean',
      description: 'Animated continuous spin for unknown-duration progress.',
    },
    fillColor: {
      control: 'color',
      description: 'Override fill stroke color (escape hatch — defaults to status token).',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ProgressCircle>;

/* ─── Default ─────────────────────────────────────────────────── */

/** @summary Interactive circular progress — value/status via Controls */
export const Default: Story = {
  args: {
    value: 72,
    size: 'md',
    status: 'default',
    showValue: true,
    label: 'Onboarding completion',
    indeterminate: false,
  },
};

/* ─── Documented capability — arbitrary centered content (Q4) ─────
   `status` (semantic stroke color), `size`, `value`, `indeterminate` are
   Controls on Default — no per-status color-swap stories (ADR-010 Q2,
   matches Dot). Only the ReactNode centered-slot capability earns a story. */

/**
 * `showValue` accepts a ReactNode for arbitrary centered content — pair a
 * percentage with a sub-label instead of the plain `${value}%` default.
 *
 * @summary Custom ReactNode content in the centered slot
 */
export const CustomCenter: Story = {
  args: {
    value: 70,
    size: 'lg',
    label: 'Tasks complete',
    showValue: (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 'var(--heading-md)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>
          70%
        </div>
        <div style={{ fontSize: 'var(--body-sm)', color: 'var(--text-secondary)' }}>
          of 200
        </div>
      </div>
    ),
  },
};
