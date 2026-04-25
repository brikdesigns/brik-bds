import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { AddableComboList } from './AddableComboList';

// ── Suggestion seeds (inline — component is vocabulary-agnostic) ──────────────
// These are the same values exposed by @brikdesigns/bds/content-system via
// getIndustryServices / getIndustryPaymentTypes / getIndustryInsuranceProviders.
// The portal wires those getters in; stories keep them inline so the component
// stays independent of the content-system entry point.

const DENTAL_SERVICES = [
  'Preventive Care / Cleaning',
  'Deep Cleaning (Scaling & Root Planing)',
  'Periodontal Maintenance',
  'Fillings (Composite)',
  'Fillings (Amalgam)',
  'Crowns',
  'Bridges',
  'Inlays & Onlays',
  'Dentures (Full & Partial)',
  'Root Canal Therapy',
  'Teeth Whitening',
  'Porcelain Veneers',
  'Dental Bonding',
  'Smile Makeover',
  'Invisalign / Clear Aligners',
  'Traditional Braces',
  'Dental Implants',
  'All-on-4 Implants',
  'Tooth Extractions',
  'Wisdom Tooth Removal',
  'Pediatric Dentistry',
  'Sedation Dentistry',
  'Emergency Dental Care',
  'TMJ / Bite Therapy',
  'Night Guards / Bruxism',
];

const DENTAL_PAYMENT_TYPES = [
  'CareCredit',
  'Sunbit',
  'LendingClub Patient Solutions',
  'Alphaeon Credit',
  'Cherry',
  'Dental Insurance (In-Network)',
  'Dental Insurance (Out-of-Network)',
  'HSA (Health Savings Account)',
  'FSA (Flexible Spending Account)',
  'In-House Membership Plan',
  'In-House Payment Plan',
  'Visa / Mastercard / Discover',
  'American Express',
  'Cash',
  'Check',
  'ACH / Bank Transfer',
  'Apple Pay',
  'Google Pay',
];

const DENTAL_INSURANCE = [
  'Delta Dental',
  'Blue Cross Blue Shield',
  'Cigna Dental',
  'Aetna Dental',
  'MetLife Dental',
  'United Concordia',
  'Humana Dental',
  'Guardian Dental',
  'Principal Financial',
  'Ameritas',
  'Sun Life Financial',
  'Anthem',
  'UnitedHealthcare Dental',
  'Assurant Dental',
  'Renaissance Dental',
  'TRICARE Dental',
  'Federal Employees Dental (FEDVIP)',
];

// ── Storybook meta ────────────────────────────────────────────────────────────

const meta: Meta<typeof AddableComboList> = {
  title: 'Displays/Form/addable-combo-list',
  component: AddableComboList,
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
    maxEntries: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof AddableComboList>;

// ── Controlled wrapper ────────────────────────────────────────────────────────

const Controlled = (args: React.ComponentProps<typeof AddableComboList>) => {
  const [values, setValues] = useState<string[]>(args.values ?? []);
  return (
    <div style={{ width: 420 }}>
      <AddableComboList
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

/**
 * Default — dental services vocabulary, no pre-selected values.
 * Click "Add" then type to filter, or press Enter for a free-form entry.
 */
export const Default: Story = {
  name: 'Default',
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

/**
 * Pre-populated — dental payment types with some values already selected.
 * Already-selected options are hidden from the dropdown.
 */
export const PrePopulated: Story = {
  name: 'Pre-Populated',
  args: {
    label: 'Payment Types Accepted',
    suggestions: DENTAL_PAYMENT_TYPES,
    values: ['CareCredit', 'Cash', 'HSA (Health Savings Account)'],
    placeholder: 'Search or add a payment type…',
    addLabel: 'Add Payment Type',
    onChange: fn(),
  },
  render: (args) => <Controlled {...args} />,
};

/**
 * Strict mode — insurance providers only.
 * Free-form entries are rejected; only listed providers can be added.
 */
export const StrictMode: Story = {
  name: 'Strict Mode',
  args: {
    label: 'Insurance Providers Accepted',
    suggestions: DENTAL_INSURANCE,
    values: ['Delta Dental'],
    placeholder: 'Search providers…',
    addLabel: 'Add Provider',
    strict: true,
    onChange: fn(),
  },
  render: (args) => <Controlled {...args} />,
};

/**
 * With helper text — shows the optional line beneath the list.
 */
export const WithHelperText: Story = {
  name: 'With Helper Text',
  args: {
    label: 'Services Offered',
    suggestions: DENTAL_SERVICES,
    values: ['Crowns', 'Teeth Whitening'],
    placeholder: 'Search or add a service…',
    addLabel: 'Add Service',
    helperText: 'Cleaning, implants, orthodontics, cosmetic…',
    onChange: fn(),
  },
  render: (args) => <Controlled {...args} />,
};

/**
 * Disabled — read-only chip rendering for view-mode sheets.
 * No input or remove controls are rendered.
 */
export const Disabled: Story = {
  name: 'Disabled',
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
 * MaxEntries hit — values at the cap; input is hidden.
 */
export const MaxEntriesHit: Story = {
  name: 'Max Entries Hit',
  args: {
    label: 'Top Services',
    suggestions: DENTAL_SERVICES,
    values: ['Crowns', 'Implants'],
    maxEntries: 2,
    helperText: 'Maximum 2 entries reached.',
    onChange: fn(),
  },
  render: (args) => <Controlled {...args} />,
};

// ── Interaction stories ───────────────────────────────────────────────────────

export const SelectFromDropdown: Story = {
  name: 'Interaction — select from dropdown',
  args: {
    label: 'Services Offered',
    suggestions: DENTAL_SERVICES,
    values: [],
    placeholder: 'Search…',
    addLabel: 'Add Service',
    onChange: fn(),
  },
  render: (args) => <Controlled {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Reveal the input
    await userEvent.click(canvas.getByRole('button', { name: /add service/i }));

    // Type to filter
    const input = canvas.getByRole('combobox');
    await userEvent.type(input, 'Crown');

    // Dropdown should appear with "Crowns" — generous timeout for filter debounce
    const option = await canvas.findByRole('option', { name: 'Crowns' }, { timeout: 3000 });
    await userEvent.click(option);

    // onChange fires after React commits — poll so we don't race the commit.
    await waitFor(() => expect(args.onChange).toHaveBeenCalledWith(['Crowns']));
  },
};

export const FreeFormEntry: Story = {
  name: 'Interaction — free-form entry',
  args: {
    label: 'Services Offered',
    suggestions: DENTAL_SERVICES,
    values: [],
    placeholder: 'Search…',
    addLabel: 'Add Service',
    onChange: fn(),
  },
  render: (args) => <Controlled {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: /add service/i }));

    const input = canvas.getByRole('combobox');
    await userEvent.type(input, 'Custom Service{Enter}');

    await waitFor(() => expect(args.onChange).toHaveBeenCalledWith(['Custom Service']));
  },
};

export const KeyboardNavigation: Story = {
  name: 'Interaction — keyboard navigation',
  args: {
    label: 'Services Offered',
    suggestions: DENTAL_SERVICES,
    values: [],
    placeholder: 'Search…',
    addLabel: 'Add Service',
    onChange: fn(),
  },
  render: (args) => <Controlled {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: /add service/i }));

    const input = canvas.getByRole('combobox');
    await userEvent.type(input, 'Crown');

    // Wait for the listbox before firing keyboard nav — otherwise ArrowDown
    // can fire before the first option is highlightable.
    await canvas.findByRole('listbox', {}, { timeout: 3000 });

    // ArrowDown to highlight first option, Enter to commit
    await userEvent.keyboard('{ArrowDown}{Enter}');

    await waitFor(() => expect(args.onChange).toHaveBeenCalledWith(['Crowns']));
  },
};

export const EscapeClosesDropdown: Story = {
  name: 'Interaction — Escape closes dropdown',
  args: {
    label: 'Services Offered',
    suggestions: DENTAL_SERVICES,
    values: [],
    placeholder: 'Search…',
    addLabel: 'Add Service',
    onChange: fn(),
  },
  render: (args) => <Controlled {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: /add service/i }));
    const input = canvas.getByRole('combobox');
    await userEvent.type(input, 'Crown');

    // Dropdown should be open
    await canvas.findByRole('listbox', {}, { timeout: 3000 });

    // Escape closes dropdown but keeps input open — poll for teardown.
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(canvas.queryByRole('listbox')).toBeNull());

    // onChange must not have been called
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const BackspaceRemovesLastTag: Story = {
  name: 'Interaction — Backspace on empty removes last tag',
  args: {
    label: 'Services Offered',
    suggestions: DENTAL_SERVICES,
    values: ['Crowns', 'Teeth Whitening'],
    placeholder: 'Search…',
    addLabel: 'Add Service',
    onChange: fn(),
  },
  render: (args) => <Controlled {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: /add service/i }));
    const input = canvas.getByRole('combobox');

    // Input is empty — Backspace should remove the last tag
    await userEvent.click(input);
    await userEvent.keyboard('{Backspace}');

    await waitFor(() => expect(args.onChange).toHaveBeenCalledWith(['Crowns']));
  },
};

export const StrictRejectsFreeForm: Story = {
  name: 'Interaction — strict mode rejects free-form',
  args: {
    label: 'Insurance Providers',
    suggestions: DENTAL_INSURANCE,
    values: [],
    placeholder: 'Search providers…',
    strict: true,
    addLabel: 'Add Provider',
    onChange: fn(),
  },
  render: (args) => <Controlled {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: /add provider/i }));
    const input = canvas.getByRole('combobox');
    await userEvent.type(input, 'Random Insurer{Enter}');

    // Yield a frame so any pending handler flushes before we assert non-call.
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const DuplicateFlash: Story = {
  name: 'Interaction — duplicate rejected',
  args: {
    label: 'Services Offered',
    suggestions: DENTAL_SERVICES,
    values: ['Crowns'],
    placeholder: 'Search…',
    addLabel: 'Add Service',
    onChange: fn(),
  },
  render: (args) => <Controlled {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: /add service/i }));
    const input = canvas.getByRole('combobox');

    // Type the same value (different case) and press Enter
    await userEvent.type(input, 'crowns{Enter}');

    // Yield a frame so any pending handler flushes before we assert non-call.
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
