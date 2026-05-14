import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Checkbox } from './Checkbox';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Form/checkbox',
  component: Checkbox,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
  argTypes: {
    label: {
      control: 'text',
      description: 'Visible text rendered next to the checkbox. Clicking the label toggles the input.',
    },
    checked: {
      control: 'boolean',
      description: 'Controlled checked state. Pair with `onChange`. For uncontrolled use, set `defaultChecked` instead.',
    },
    defaultChecked: {
      control: 'boolean',
      description: 'Initial checked state for uncontrolled use.',
    },
    disabled: {
      control: 'boolean',
      description: 'Locks the input and applies muted styling.',
    },
    onChange: {
      action: 'changed',
      description: 'Called with the native change event when the checkbox toggles.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — single canonical story per ADR-010 §components without
   a variant axis. `checked` and `disabled` are Q2 states exposed
   via Controls; no per-state stories.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Themed checkbox with adjacent label */
export const Default: Story = {
  args: {
    label: 'Accept terms and conditions',
    defaultChecked: false,
    disabled: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByLabelText('Accept terms and conditions') as HTMLInputElement;

    await expect(checkbox).toBeVisible();
    await expect(checkbox).not.toBeChecked();

    // Click to check, click again to uncheck — round-trip the state so
    // the post-play canvas matches the unchecked initial state.
    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();

    await userEvent.click(checkbox);
    await expect(checkbox).not.toBeChecked();

    // Blur so the post-play canvas doesn't show stale focus styling.
    checkbox.blur();
  },
};
