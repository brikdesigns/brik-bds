import type { Meta, StoryObj } from '@storybook/react-vite';
import { PasswordInput } from './PasswordInput';

/**
 * PasswordInput — masked text input with built-in show/hide toggle. Use for
 * login, signup, and account-settings password fields. For other text inputs
 * with a leading icon, use `TextInput` directly.
 * @summary Masked text input with show/hide toggle
 */
const meta: Meta<typeof PasswordInput> = {
  title: 'Components/Form/password-input',
  component: PasswordInput,
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    label: { control: 'text' },
    placeholder: { control: 'text' },
    helperText: { control: 'text' },
    error: { control: 'text' },
    fullWidth: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof PasswordInput>;

/** Args-driven sandbox.
 *  @summary Live playground with all controls */
export const Playground: Story = {
  args: { label: 'Password', placeholder: 'Enter password', fullWidth: true },
};

/* ─── Sizes ──────────────────────────────────────────────────── */

/** Small (sm).
 *  @summary Small size */
export const Small: Story = {
  args: { size: 'sm', label: 'Small', placeholder: 'Enter password', fullWidth: true },
};

/** Medium (md) — default size.
 *  @summary Medium size (default) */
export const Medium: Story = {
  args: { size: 'md', label: 'Medium', placeholder: 'Enter password', fullWidth: true },
};

/** Large (lg).
 *  @summary Large size */
export const Large: Story = {
  args: { size: 'lg', label: 'Large', placeholder: 'Enter password', fullWidth: true },
};

/* ─── States ─────────────────────────────────────────────────── */

/** With helper text — typically used for password strength rules.
 *  @summary With helper text */
export const WithHelperText: Story = {
  args: {
    label: 'New password',
    placeholder: 'Enter password',
    helperText: 'Must be at least 8 characters',
    fullWidth: true,
  },
};

/** Error state.
 *  @summary With error */
export const WithError: Story = {
  args: { label: 'Password', placeholder: 'Enter password', error: 'Password is required', fullWidth: true },
};

/** Disabled.
 *  @summary Disabled */
export const Disabled: Story = {
  args: { label: 'Disabled', placeholder: 'Cannot edit', disabled: true, fullWidth: true },
};
