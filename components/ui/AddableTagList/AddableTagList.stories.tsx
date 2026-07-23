import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { AddableTagList } from './AddableTagList';

// ── Suggestion seeds ──────────────────────────────────────────────────────────

const DENTAL_SERVICES = [
  'Preventive Care / Cleaning',
  'Deep Cleaning (Scaling & Root Planing)',
  'Fillings (Composite)',
  'Crowns',
  'Bridges',
  'Root Canal Therapy',
  'Teeth Whitening',
  'Porcelain Veneers',
  'Dental Bonding',
  'Invisalign / Clear Aligners',
  'Dental Implants',
  'Tooth Extractions',
  'Wisdom Tooth Removal',
  'Pediatric Dentistry',
  'Sedation Dentistry',
  'Emergency Dental Care',
];

const DENTAL_INSURANCE = [
  'Delta Dental',
  'Blue Cross Blue Shield',
  'Cigna Dental',
  'Aetna Dental',
  'MetLife Dental',
  'Guardian Dental',
  'Humana Dental',
  'United Concordia',
];

// ── Meta ──────────────────────────────────────────────────────────────────────

/**
 * AddableTagList — reveal-on-click tag list with optional suggestion combobox.
 *
 * Without `suggestions`: plain text input, Enter commits.
 * With `suggestions`: combobox with filtered dropdown.
 * Replaces `AddableTextList` and `AddableComboList`. See ADR-003.
 *
 * @summary Reveal-on-click tag list with optional suggestion combobox
 */
const meta: Meta<typeof AddableTagList> = {
  title: 'Containers/addable-tag-list',
  component: AddableTagList,
  tags: ['surface-product'],
  parameters: { layout: 'centered' },
  argTypes: {
    values: { control: false, description: 'Current list of tag values.' },
    onChange: { control: false, description: 'Called with the updated values on add / remove.' },
    suggestions: {
      control: 'object',
      description: 'Optional suggestion set — switches to combobox mode. See `WithSuggestions`.',
    },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    label: { control: 'text' },
    addLabel: { control: 'text' },
    removeLabel: { control: 'text' },
    placeholder: { control: 'text' },
    helperText: { control: 'text' },
    emptyLabel: { control: 'text' },
    disabled: {
      control: 'boolean',
      description: 'Read-only chip rendering — no input or remove controls.',
    },
    strict: {
      control: 'boolean',
      description: 'Only meaningful with `suggestions` — rejects free-form entries.',
    },
    allowDuplicates: { control: 'boolean' },
    maxItems: { control: 'number' },
    className: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof AddableTagList>;

// ── Controlled wrapper — hook-driven state machine args can't express (Q4) ────

const Controlled = (args: React.ComponentProps<typeof AddableTagList>) => {
  const [values, setValues] = useState<string[]>(args.values ?? []);
  return (
    <div style={{ width: 420 }}>
      <AddableTagList
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

/** @summary Plain mode — no suggestions, free-form text entry */
export const Default: Story = {
  args: {
    label: 'Anti-messages',
    values: [],
    placeholder: 'e.g. No price-first positioning',
    addLabel: 'Add',
    emptyLabel: 'No messages added yet.',
    onChange: fn(),
  },
  render: (args) => <Controlled {...args} />,
};

/**
 * Combobox mode — typing filters `suggestions`; free-form entries still
 * commit unless `strict` is set.
 * @summary Suggestion-backed combobox with free-form fallback
 */
export const WithSuggestions: Story = {
  args: {
    label: 'Services Offered',
    suggestions: DENTAL_SERVICES,
    values: [],
    placeholder: 'Search or add a service…',
    addLabel: 'Add Service',
    emptyLabel: 'No services added yet.',
    onChange: fn(),
  },
  render: (args) => <Controlled {...args} />,
};

// ── Interaction tests — play-only, hidden from MCP discovery (Q5) ─────────────

/**
 * Plain mode — typing a value and pressing Enter commits it.
 * @summary Play-function interaction test
 */
export const InteractionTestPlainEnterCommits: Story = {
  tags: ['!manifest'],
  args: { label: 'Tags', values: [], addLabel: 'Add', onChange: fn() },
  render: (args) => <Controlled {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /add/i }));
    const input = canvas.getByRole('textbox');
    await userEvent.type(input, 'My tag{Enter}');
    await waitFor(() => expect(args.onChange).toHaveBeenCalledWith(['My tag']));
  },
};

/**
 * Combobox mode — selecting an option from the dropdown commits it.
 * @summary Play-function interaction test
 */
export const InteractionTestSelectFromDropdown: Story = {
  tags: ['!manifest'],
  args: {
    label: 'Services', suggestions: DENTAL_SERVICES, values: [],
    placeholder: 'Search…', addLabel: 'Add Service', onChange: fn(),
  },
  render: (args) => <Controlled {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /add service/i }));
    const input = canvas.getByRole('combobox');
    await userEvent.type(input, 'Crown');
    const option = await canvas.findByRole('option', { name: 'Crowns' }, { timeout: 3000 });
    await userEvent.click(option);
    await waitFor(() => expect(args.onChange).toHaveBeenCalledWith(['Crowns']));
  },
};

/**
 * Strict mode rejects a free-form entry that doesn't match a suggestion.
 * @summary Play-function interaction test
 */
export const InteractionTestStrictRejectsFreeForm: Story = {
  tags: ['!manifest'],
  args: {
    label: 'Insurance', suggestions: DENTAL_INSURANCE, values: [],
    strict: true, placeholder: 'Search…', addLabel: 'Add', onChange: fn(),
  },
  render: (args) => <Controlled {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /add/i }));
    const input = canvas.getByRole('combobox');
    await userEvent.type(input, 'Random Insurer{Enter}');
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
