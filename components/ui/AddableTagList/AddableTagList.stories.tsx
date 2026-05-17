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
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    label: { control: 'text' },
    addLabel: { control: 'text' },
    placeholder: { control: 'text' },
    helperText: { control: 'text' },
    emptyLabel: { control: 'text' },
    disabled: { control: 'boolean' },
    strict: { control: 'boolean' },
    allowDuplicates: { control: 'boolean' },
    maxItems: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof AddableTagList>;

// ── Controlled wrapper ────────────────────────────────────────────────────────

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
export const Plain: Story = {
  name: 'Default (plain)',
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

/** @summary Combobox mode — suggestion-backed, free-form fallback */
export const WithSuggestions: Story = {
  name: 'With Suggestions',
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

/** @summary Strict mode — only listed suggestions accepted */
export const StrictMode: Story = {
  name: 'Strict Mode',
  args: {
    label: 'Insurance Providers',
    suggestions: DENTAL_INSURANCE,
    values: ['Delta Dental'],
    placeholder: 'Search providers…',
    addLabel: 'Add Provider',
    strict: true,
    onChange: fn(),
  },
  render: (args) => <Controlled {...args} />,
};

/** @summary Disabled — read-only chip display */
export const Disabled: Story = {
  args: {
    label: 'Services Offered',
    suggestions: DENTAL_SERVICES,
    values: ['Dental Implants', 'Invisalign / Clear Aligners', 'Preventive Care / Cleaning'],
    disabled: true,
    onChange: fn(),
  },
  render: (args) => <Controlled {...args} />,
};

/**
 * Patterns — plain mode alongside suggestion-backed mode.
 * @summary Common usage patterns
 */
export const Patterns: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-xl)', width: 480 }}>
      <Controlled
        label="Anti-messages"
        values={['No price-first positioning']}
        placeholder="e.g. No price-first positioning"
        addLabel="Add"
        helperText="Things the brand should never say."
        onChange={() => {}}
      />
      <Controlled
        label="Services Offered"
        suggestions={DENTAL_SERVICES}
        values={['Preventive Care / Cleaning', 'Crowns']}
        placeholder="Search or add a service…"
        addLabel="Add Service"
        helperText="Pick from the catalog or add a custom service."
        onChange={() => {}}
      />
      <Controlled
        label="Insurance Networks"
        suggestions={DENTAL_INSURANCE}
        values={['Delta Dental', 'Blue Cross Blue Shield']}
        strict
        placeholder="Pick from the network list…"
        addLabel="Add Network"
        helperText="Strict — only accepted carriers from the catalog."
        onChange={() => {}}
      />
    </div>
  ),
};

// ── Interaction stories ───────────────────────────────────────────────────────

/** @summary Plain mode — Enter commits */
export const PlainEnterCommits: Story = {
  name: 'Interaction — plain Enter commits',
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

/** @summary Combobox — select from dropdown */
export const SelectFromDropdown: Story = {
  name: 'Interaction — select from dropdown',
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

/** @summary Strict rejects free form */
export const StrictRejectsFreeForm: Story = {
  name: 'Interaction — strict rejects free-form',
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
