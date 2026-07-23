import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { AddableTextList } from './AddableTextList';

/**
 * @deprecated Use `<AddableTagList />` instead (ADR-003).
 * Kept for existing consumers during the migration window — see
 * AddableTagList.stories.tsx for the canonical replacement.
 */
const meta: Meta<typeof AddableTextList> = {
  title: 'Containers/addable-text-list',
  component: AddableTextList,
  tags: ['surface-product', '!manifest'],
  parameters: { layout: 'centered' },
  argTypes: {
    values: { control: false, description: 'Current list of plain-text values (rendered as Tag chips).' },
    onChange: { control: false, description: 'Called with the next values on add / remove.' },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    label: { control: 'text' },
    addLabel: { control: 'text' },
    placeholder: { control: 'text' },
    helperText: { control: 'text' },
    emptyLabel: { control: 'text' },
    disabled: {
      control: 'boolean',
      description: 'Read-only chip rendering — no remove controls, reveal input hidden.',
    },
    allowDuplicates: { control: 'boolean' },
    maxItems: { control: 'number' },
    className: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof AddableTextList>;

// ── Controlled wrapper — hook-driven state machine args can't express (Q4) ────

const Controlled = (args: React.ComponentProps<typeof AddableTextList>) => {
  const [values, setValues] = useState<string[]>(args.values ?? []);
  return (
    <div style={{ width: 420 }}>
      <AddableTextList
        {...args}
        values={values}
        onChange={(next) => {
          setValues(next);
          args.onChange?.(next);
        }}
      />
    </div>
  );
};

// ── Stories ───────────────────────────────────────────────────────────────────

/** @summary Interactive playground for prop tweaking */
export const Default: Story = {
  args: {
    label: 'Services Offered',
    placeholder: 'e.g. Dental cleaning',
    addLabel: 'Add Service',
    values: ['Dental cleaning', 'Whitening'],
    size: 'md',
    onChange: fn(),
  },
  render: (args) => <Controlled {...args} />,
};

/**
 * Do not do this. When values contain title + description pairs (separators
 * `—`, `:`, newlines), each row collapses into a single unreadable tag. Open
 * the browser console — the component warns on any value matching the
 * structured-content pattern and points at `AddableEntryList`. This story
 * exists to make the wrong choice visible, not to endorse it.
 *
 * @summary Anti-pattern — structured content collapses into one tag
 */
export const StructuredContentWarning: Story = {
  args: {
    label: 'Services (WRONG — use AddableEntryList)',
    values: [
      'Molar endodontics — explicitly phased out, do not feature',
      'Cancellation policy: 24-hour window',
    ],
    onChange: fn(),
  },
  render: (args) => <Controlled {...args} />,
};

// ── Interaction tests — play-only, hidden from MCP discovery (Q5) ─────────────

/**
 * Typing a value and clicking Add appends it to the list.
 * @summary Play-function interaction test
 */
export const InteractionTestAddEntry: Story = {
  tags: ['!manifest'],
  args: {
    label: 'Payment Types',
    placeholder: 'e.g. Aetna',
    addLabel: 'Add Payment Type',
    values: ['Cash', 'Visa'],
    onChange: fn(),
  },
  render: (args) => <Controlled {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const addButton = canvas.getByRole('button', { name: /add payment type/i });
    await userEvent.click(addButton);

    const input = await canvas.findByLabelText(/add payment types/i);
    await userEvent.type(input, 'Medicare');

    await userEvent.click(canvas.getByRole('button', { name: /^add$/i }));

    await expect(args.onChange).toHaveBeenCalledWith(['Cash', 'Visa', 'Medicare']);
  },
};

/**
 * Clicking a tag's remove control updates onChange with the remaining values.
 * @summary Play-function interaction test
 */
export const InteractionTestRemoveEntry: Story = {
  tags: ['!manifest'],
  args: {
    label: 'Services Offered',
    values: ['Cleaning', 'Whitening', 'Braces'],
    onChange: fn(),
  },
  render: (args) => <Controlled {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const removeButtons = canvas.getAllByRole('button', { name: /remove/i });
    await userEvent.click(removeButtons[1]);
    await expect(args.onChange).toHaveBeenCalledWith(['Cleaning', 'Braces']);
  },
};

/**
 * A duplicate (case-insensitive) entry is rejected and never reaches onChange.
 * @summary Play-function interaction test
 */
export const InteractionTestDuplicateBlocked: Story = {
  tags: ['!manifest'],
  args: {
    label: 'Services Offered',
    values: ['Cleaning'],
    onChange: fn(),
  },
  render: (args) => <Controlled {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /add new/i }));
    const input = await canvas.findByLabelText(/add services offered/i);
    await userEvent.type(input, 'cleaning{Enter}');
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
