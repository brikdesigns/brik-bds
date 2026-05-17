import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { SearchInput } from './SearchInput';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof SearchInput> = {
  title: 'Components/search-input',
  component: SearchInput,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 360 }}><Story /></div>],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size token (sm=32px, md=40px, lg=48px). Matches TextInput scale. Default `md`.',
    },
    label: {
      control: 'text',
      description: 'Optional label rendered above the field. Auto-wires `htmlFor`/`id`.',
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
    fullWidth: {
      control: 'boolean',
      description: 'Stretch to fill container width.',
    },
    disabled: {
      control: 'boolean',
      description: 'Locks the field — non-interactive, muted appearance.',
    },
    onClear: {
      action: 'cleared',
      description:
        'Called when the clear button is clicked. In controlled mode, use this to reset `value`.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — single canonical story per ADR-010 §components without
   a variant axis. All variation (size, error, disabled, helper) is
   exposed via Controls. The clear button is internal to the component.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Search field with magnifying glass icon and clear button */
export const Default: Story = {
  args: {
    label: 'Search',
    placeholder: 'Search...',
    size: 'md',
    fullWidth: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Search') as HTMLInputElement;

    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute('type', 'search');

    // Clear button is hidden when the field is empty
    await expect(canvas.queryByRole('button', { name: 'Clear search' })).toBeNull();

    // Typing reveals the clear button
    await userEvent.type(input, 'React components');
    await expect(canvas.getByRole('button', { name: 'Clear search' })).toBeInTheDocument();

    // Clicking clear empties the field and hides the button
    await userEvent.click(canvas.getByRole('button', { name: 'Clear search' }));
    await expect(input).toHaveValue('');
    await expect(canvas.queryByRole('button', { name: 'Clear search' })).toBeNull();

    // Blur to avoid stale focus styling in the post-play snapshot
    input.blur();
  },
};
