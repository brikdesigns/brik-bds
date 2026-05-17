import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { NumberInput } from './NumberInput';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof NumberInput> = {
  title: 'Components/number-input',
  component: NumberInput,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 240 }}><Story /></div>],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size token (sm=32px, md=40px, lg=48px). Default `md`.',
    },
    label: {
      control: 'text',
      description: 'Optional label rendered above the field.',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text shown when the field is empty.',
    },
    helperText: {
      control: 'text',
      description: 'Hint text under the field. Hidden when `error` is present.',
    },
    error: {
      control: 'text',
      description: 'Error message. Triggers `aria-invalid` and replaces `helperText`.',
    },
    min: {
      control: 'number',
      description: 'Minimum allowed value.',
    },
    max: {
      control: 'number',
      description: 'Maximum allowed value.',
    },
    step: {
      control: 'number',
      description: 'Increment / decrement amount. Default `1`.',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Stretch to fill container width.',
    },
    disabled: {
      control: 'boolean',
      description: 'Locks the field and steppers — non-interactive, muted appearance.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — single canonical story per ADR-010 §components without
   a variant axis. All variation (size, min/max/step, error, disabled)
   is exposed via Controls. The stepper buttons are internal.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Numeric input with increment / decrement stepper buttons */
export const Default: Story = {
  args: {
    label: 'Quantity',
    defaultValue: 1,
    min: 0,
    max: 99,
    step: 1,
    size: 'md',
    fullWidth: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Quantity') as HTMLInputElement;

    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute('type', 'number');

    // Increment via stepper
    await userEvent.click(canvas.getByRole('button', { name: 'Increment' }));
    await expect(input).toHaveValue(2);

    // Decrement via stepper
    await userEvent.click(canvas.getByRole('button', { name: 'Decrement' }));
    await expect(input).toHaveValue(1);

    // Blur to avoid stale focus styling in post-play snapshot
    input.blur();
  },
};
