import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Checkbox } from './Checkbox';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof Checkbox> = {
  title: 'Components/checkbox',
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
   SINGLE — args-driven canonical instance. `checked` and `disabled`
   are Q2 states exposed via Controls.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Single checkbox with adjacent label */
export const Single: Story = {
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

    // Round-trip the state so the post-play canvas matches the initial
    // unchecked state. Blur to remove stale focus styling.
    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();

    await userEvent.click(checkbox);
    await expect(checkbox).not.toBeChecked();

    checkbox.blur();
  },
};
