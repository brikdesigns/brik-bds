import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from './Checkbox';

/**
 * Checkbox — boolean field with optional label. Use for multi-select form
 * options, terms acceptance, and feature toggles. For binary settings prefer `Switch`.
 * @summary Boolean field with optional label
 */
const meta: Meta<typeof Checkbox> = {
  title: 'Components/Form/checkbox',
  component: Checkbox,
  parameters: { layout: 'centered' },
  argTypes: {
    label: { control: 'text' },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

/** Args-driven sandbox.
 *  @summary Live playground with all controls */
export const Playground: Story = {
  args: { label: 'Accept terms and conditions' },
};

/* ─── States ─────────────────────────────────────────────────── */

/** Unchecked default state.
 *  @summary Unchecked checkbox */
export const Unchecked: Story = {
  args: { label: 'Unchecked' },
};

/** Checked state.
 *  @summary Checked checkbox */
export const Checked: Story = {
  args: { label: 'Checked', defaultChecked: true },
};

/** Disabled, unchecked.
 *  @summary Disabled checkbox */
export const Disabled: Story = {
  args: { label: 'Disabled', disabled: true },
};

/** Disabled, checked.
 *  @summary Disabled checked checkbox */
export const DisabledChecked: Story = {
  args: { label: 'Disabled checked', disabled: true, defaultChecked: true },
};
