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

/* ═══════════════════════════════════════════════════════════════
   ORIENTATION axis — Vertical / Horizontal group layouts per ADR-010
   §components without a variant axis (orientation differs → story
   per orientation). Render-only because the layout difference can't
   be expressed as a prop on a single Checkbox.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Vertical group — checkboxes stacked top-to-bottom */
export const Vertical: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}>
      <Checkbox label="Email notifications" defaultChecked />
      <Checkbox label="Push notifications" defaultChecked />
      <Checkbox label="SMS alerts" />
      <Checkbox label="Weekly digest" defaultChecked />
    </div>
  ),
};

/** @summary Horizontal group — checkboxes inline */
export const Horizontal: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'row', gap: 'var(--gap-xl)', flexWrap: 'wrap' }}>
      <Checkbox label="News" defaultChecked />
      <Checkbox label="Updates" />
      <Checkbox label="Promotions" />
    </div>
  ),
};
