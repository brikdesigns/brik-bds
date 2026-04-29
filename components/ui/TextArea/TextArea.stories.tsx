import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextArea } from './TextArea';

/**
 * TextArea — multi-line text input with label, helper, error, and configurable
 * resize behavior. Three sizes match TextInput.
 * @summary Multi-line text input
 */
const meta = {
  title: 'Components/Form/text-area',
  component: TextArea,
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 360 }}><Story /></div>],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    label: { control: 'text' },
    placeholder: { control: 'text' },
    helperText: { control: 'text' },
    error: { control: 'text' },
    rows: { control: 'number' },
    fullWidth: { control: 'boolean' },
    disabled: { control: 'boolean' },
    resize: { control: 'select', options: ['none', 'both', 'horizontal', 'vertical'] },
  },
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Args-driven sandbox.
 *  @summary Live playground with all controls */
export const Playground: Story = {
  args: { label: 'Notes', placeholder: 'Enter your text here...', rows: 4, size: 'md', fullWidth: true },
};

/* ─── Sizes ──────────────────────────────────────────────────── */

/** Small (sm) — compact textarea.
 *  @summary Small size */
export const Small: Story = {
  args: { size: 'sm', label: 'Small', placeholder: 'sm variant...', rows: 3, fullWidth: true },
};

/** Medium (md) — default size.
 *  @summary Medium size (default) */
export const Medium: Story = {
  args: { size: 'md', label: 'Medium', placeholder: 'md variant...', rows: 3, fullWidth: true },
};

/** Large (lg) — prominent textareas.
 *  @summary Large size */
export const Large: Story = {
  args: { size: 'lg', label: 'Large', placeholder: 'lg variant...', rows: 3, fullWidth: true },
};

/* ─── States ─────────────────────────────────────────────────── */

/** With prefilled value.
 *  @summary Textarea with default value */
export const WithValue: Story = {
  args: { label: 'With value', defaultValue: 'This is some default text that appears in the textarea.', rows: 3, fullWidth: true },
};

/** Helper text under the field.
 *  @summary Textarea with helper text */
export const WithHelperText: Story = {
  args: { label: 'Description', placeholder: 'Describe your needs...', helperText: 'Maximum 500 characters', rows: 3, fullWidth: true },
};

/** Error state — `error` overrides the helper line.
 *  @summary Textarea with error */
export const WithError: Story = {
  args: { label: 'Required', placeholder: 'Required field', error: 'This field is required', rows: 3, fullWidth: true },
};

/** Disabled — non-editable.
 *  @summary Disabled textarea */
export const Disabled: Story = {
  args: { label: 'Disabled', placeholder: 'This field is disabled', disabled: true, rows: 3, fullWidth: true },
};

/* ─── Resize axis ────────────────────────────────────────────── */

/** Vertical resize (default) — most common.
 *  @summary Vertical resize */
export const ResizeVertical: Story = {
  args: { label: 'Vertical (default)', placeholder: 'Resize vertically...', rows: 3, resize: 'vertical', fullWidth: true },
};

/** No resize — locked dimensions.
 *  @summary Locked size */
export const ResizeNone: Story = {
  args: { label: 'None', placeholder: 'Cannot be resized', rows: 3, resize: 'none', fullWidth: true },
};

/** Both directions — horizontal + vertical resize.
 *  @summary Both directions */
export const ResizeBoth: Story = {
  args: { label: 'Both', placeholder: 'Resize in any direction', rows: 3, resize: 'both', fullWidth: true },
};
