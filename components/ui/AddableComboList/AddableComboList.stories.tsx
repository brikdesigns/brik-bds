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

/**
 * @deprecated Use `<AddableTagList suggestions={...} />` instead (ADR-003).
 * Kept for existing consumers during the migration window — see
 * AddableTagList.stories.tsx for the canonical replacement.
 */
const meta: Meta<typeof AddableComboList> = {
  title: 'Containers/addable-combo-list',
  component: AddableComboList,
  tags: ['surface-product', '!manifest'],
  parameters: { layout: 'centered' },
  argTypes: {
    values: { control: false, description: 'Current selected values (rendered as Tag chips).' },
    onChange: { control: false, description: 'Called with the next values on add / remove.' },
    suggestions: { control: 'object', description: 'Suggestion set filtered by the typed query.' },
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
    strict: { control: 'boolean' },
    maxEntries: { control: 'number' },
    className: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof AddableComboList>;

// ── Controlled wrapper — hook-driven state machine args can't express (Q4) ────

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
 *
 * @summary Interactive playground for prop tweaking
 */
export const Default: Story = {
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
 *
 * @summary Starting template with existing selections
 */
export const PrePopulated: Story = {
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
 *
 * @summary Catalog-only picks, no free-form entries
 */
export const StrictMode: Story = {
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

// ── Interaction tests — play-only, hidden from MCP discovery (Q5) ─────────────

/**
 * Selecting an option from the dropdown commits it.
 * @summary Play-function interaction test
 */
export const InteractionTestSelectFromDropdown: Story = {
  tags: ['!manifest'],
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

/**
 * Typing a value with no matching suggestion and pressing Enter commits it
 * as a free-form entry.
 * @summary Play-function interaction test
 */
export const InteractionTestFreeFormEntry: Story = {
  tags: ['!manifest'],
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

/**
 * Arrow + Enter highlights and commits a suggestion.
 * @summary Play-function interaction test
 */
export const InteractionTestKeyboardNavigation: Story = {
  tags: ['!manifest'],
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

/**
 * Escape closes the dropdown without committing.
 * @summary Play-function interaction test
 */
export const InteractionTestEscapeClosesDropdown: Story = {
  tags: ['!manifest'],
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

/**
 * Backspace on an empty input removes the last committed tag.
 * @summary Play-function interaction test
 */
export const InteractionTestBackspaceRemovesLastTag: Story = {
  tags: ['!manifest'],
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

/**
 * Strict mode rejects a free-form entry that doesn't match a suggestion.
 * @summary Play-function interaction test
 */
export const InteractionTestStrictRejectsFreeForm: Story = {
  tags: ['!manifest'],
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

/**
 * A duplicate (case-insensitive) entry is rejected and never reaches onChange.
 * @summary Play-function interaction test
 */
export const InteractionTestDuplicateRejected: Story = {
  tags: ['!manifest'],
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
