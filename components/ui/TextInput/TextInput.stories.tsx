import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Icon } from '@iconify/react';
import { TextInput } from './TextInput';

/**
 * TextInput — single-line text input with label, helper, error, optional
 * leading/trailing icons, and three sizes. Renders as `<input>` with the
 * configured `type` (text/email/password/number/tel/url/search).
 * @summary Single-line text input
 */
const meta: Meta<typeof TextInput> = {
  title: 'Components/Form/text-input',
  component: TextInput,
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 360 }}><Story /></div>],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    label: { control: 'text' },
    placeholder: { control: 'text' },
    helperText: { control: 'text' },
    error: { control: 'text' },
    fullWidth: { control: 'boolean' },
    disabled: { control: 'boolean' },
    type: { control: 'select', options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'] },
  },
};

export default meta;
type Story = StoryObj<typeof TextInput>;

/** Args-driven sandbox. Includes a typing interaction test.
 *  @summary Live playground with interaction test */
export const Playground: Story = {
  args: {
    label: 'Email address',
    placeholder: 'you@example.com',
    type: 'email',
    size: 'md',
    fullWidth: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');
    await expect(input).toBeVisible();
    await userEvent.clear(input);
    await userEvent.type(input, 'test@example.com');
    await expect(input).toHaveValue('test@example.com');
  },
};

/* ─── Sizes ──────────────────────────────────────────────────── */

/** Small (sm) — 14px text, dense form rows.
 *  @summary Small size */
export const Small: Story = {
  args: { size: 'sm', label: 'Small (sm)', placeholder: '14px text', fullWidth: true },
};

/** Medium (md) — 16px text, default form size.
 *  @summary Medium size (default) */
export const Medium: Story = {
  args: { size: 'md', label: 'Medium (md)', placeholder: '16px text — default', fullWidth: true },
};

/** Large (lg) — 18px text, prominent inputs.
 *  @summary Large size */
export const Large: Story = {
  args: { size: 'lg', label: 'Large (lg)', placeholder: '18px text', fullWidth: true },
};

/* ─── States ─────────────────────────────────────────────────── */

/** With helper text — clarifies expected input format.
 *  @summary Input with helper text */
export const WithHelperText: Story = {
  args: { label: 'Password', placeholder: 'Enter password', helperText: 'Must be at least 8 characters', type: 'password', fullWidth: true },
};

/** Error state — `error` overrides the helper line.
 *  @summary Input with error */
export const WithError: Story = {
  args: { label: 'Email', placeholder: 'you@example.com', error: 'Please enter a valid email', defaultValue: 'invalid-email', fullWidth: true },
};

/** Disabled — non-editable.
 *  @summary Disabled input */
export const Disabled: Story = {
  args: { label: 'Disabled', placeholder: 'Cannot edit', disabled: true, fullWidth: true },
};

/* ─── Content shapes ─────────────────────────────────────────── */

/** Leading icon — common for email/search/identity inputs.
 *  @summary Input with leading icon */
export const WithIconBefore: Story = {
  args: { label: 'Email', placeholder: 'you@example.com', iconBefore: <Icon icon="ph:envelope" />, fullWidth: true },
};

/** Trailing icon — useful for inputs that resolve to a person/entity.
 *  @summary Input with trailing icon */
export const WithIconAfter: Story = {
  args: { label: 'Username', placeholder: 'Enter name', iconAfter: <Icon icon="ph:user" />, fullWidth: true },
};

/** Search input — `type="search"` adds the native clear affordance.
 *  @summary Search input */
export const Search: Story = {
  args: { label: 'Search', type: 'search', defaultValue: 'bds component', iconBefore: <Icon icon="ph:magnifying-glass" />, fullWidth: true },
};
