import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { AddableEntryList, type AddableEntry } from './AddableEntryList';

// ── Dental service vocabulary (inline — component is vocabulary-agnostic) ─────
// Matches the values exposed by @brikdesigns/bds/content-system via
// getIndustryServices('dental'). The portal wires those getters in;
// stories keep them inline so the component stays independent.
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

// ── Shared helpers ────────────────────────────────────────────────────────────

const SectionLabel = ({ children }: { children: string }) => (
  <div
    style={{
      fontFamily: 'var(--font-family-label)',
      fontSize: 'var(--body-xs)', // bds-lint-ignore
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      marginBottom: 'var(--gap-md)',
      color: 'var(--text-muted)',
    }}
  >
    {children}
  </div>
);

const Stack = ({ children, gap = 'var(--gap-xl)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap }}>{children}</div>
);

// ── Storybook meta ────────────────────────────────────────────────────────────

const meta: Meta<typeof AddableEntryList> = {
  title: 'Components/Form/addable-entry-list',
  component: AddableEntryList,
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    label: { control: 'text' },
    addLabel: { control: 'text' },
    primaryPlaceholder: { control: 'text' },
    secondaryPlaceholder: { control: 'text' },
    primaryLabel: { control: 'text' },
    secondaryLabel: { control: 'text' },
    helperText: { control: 'text' },
    emptyLabel: { control: 'text' },
    disabled: { control: 'boolean' },
    allowDuplicates: { control: 'boolean' },
    maxItems: { control: 'number' },
    secondaryRows: { control: 'number' },
    primaryStrict: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof AddableEntryList>;

// ── Controlled wrapper ────────────────────────────────────────────────────────

const Controlled = (args: React.ComponentProps<typeof AddableEntryList>) => {
  const [entries, setEntries] = useState<AddableEntry[]>(args.entries ?? []);
  return (
    <div style={{ width: 480 }}>
      <AddableEntryList
        {...args}
        entries={entries}
        onChange={(next) => {
          setEntries(next);
          args.onChange?.(next);
        }}
      />
    </div>
  );
};

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * Default playground — Competitors (no suggestions). Identical to today's
 * consumer usage. Primary is a plain text input. Regression baseline.
 */
export const Playground: Story = {
  args: {
    label: 'Competitors',
    primaryLabel: 'URL',
    primaryPlaceholder: 'https://competitor.com',
    secondaryLabel: 'Notes',
    secondaryPlaceholder: 'Competitive positioning, strengths, relevance...',
    addLabel: 'Add Competitor',
    removeLabel: 'Remove competitor',
    entries: [
      { primary: 'https://acme.com', secondary: 'Direct competitor — stronger brand, weaker product pipeline.' },
      { primary: 'https://widgets.io', secondary: 'Adjacent market; watch for vertical expansion.' },
    ],
    size: 'md',
    onChange: fn(),
  },
  render: (args) => <Controlled {...args} />,
};

/**
 * Primary with suggestions — dental services vocabulary.
 * Type "cr" to see "Crowns" appear. Enter commits and moves focus to description.
 */
export const PrimaryWithSuggestions: Story = {
  name: 'Primary With Suggestions',
  args: {
    label: 'Services',
    primaryLabel: 'Service Name',
    primaryPlaceholder: 'Search or add a service…',
    secondaryLabel: 'Description',
    secondaryPlaceholder: 'Brief description of this service for the website',
    addLabel: 'Add Service',
    removeLabel: 'Remove service',
    emptyLabel: 'No services added yet.',
    primarySuggestions: DENTAL_SERVICES,
    entries: [
      { primary: 'Dental Implants', secondary: 'Permanent tooth replacement with a natural look and feel.' },
    ],
    onChange: fn(),
  },
  render: (args) => <Controlled {...args} />,
};

/**
 * Primary strict — only listed services can be added.
 * Typing a non-matching string shows the strict hint and blocks commit.
 */
export const PrimaryStrictWithSuggestions: Story = {
  name: 'Primary Strict With Suggestions',
  args: {
    label: 'Services',
    primaryLabel: 'Service Name',
    primaryPlaceholder: 'Search services…',
    secondaryLabel: 'Description',
    secondaryPlaceholder: 'Brief description',
    addLabel: 'Add Service',
    removeLabel: 'Remove service',
    primarySuggestions: DENTAL_SERVICES,
    primaryStrict: true,
    entries: [],
    onChange: fn(),
  },
  render: (args) => <Controlled {...args} />,
};

/**
 * No suggestions (regression) — no primarySuggestions passed.
 * Render must be identical to today's Competitors / Reference Sites usage.
 */
export const NoSuggestions: Story = {
  name: 'No Suggestions (Regression)',
  args: {
    label: 'Reference Sites',
    primaryLabel: 'URL',
    primaryPlaceholder: 'https://example.com',
    secondaryLabel: 'Notes',
    secondaryPlaceholder: 'Why this site is a reference',
    addLabel: 'Add Reference',
    removeLabel: 'Remove reference',
    emptyLabel: 'No reference sites added yet.',
    entries: [],
    onChange: fn(),
  },
  render: (args) => <Controlled {...args} />,
};

export const Empty: Story = {
  args: {
    label: 'Reference Sites',
    primaryLabel: 'URL',
    primaryPlaceholder: 'https://example.com',
    secondaryLabel: 'Notes',
    secondaryPlaceholder: 'Why this site is a reference',
    addLabel: 'Add Reference',
    removeLabel: 'Remove reference',
    emptyLabel: 'No reference sites added yet.',
    entries: [],
    onChange: fn(),
  },
  render: (args) => <Controlled {...args} />,
};

export const PrimaryOnly: Story = {
  name: 'Secondary Optional',
  args: {
    label: 'Line Items',
    primaryLabel: 'Item',
    secondaryLabel: 'Description',
    primaryPlaceholder: 'e.g. Logo design',
    secondaryPlaceholder: 'Optional description',
    addLabel: 'Add Line Item',
    removeLabel: 'Remove line item',
    entries: [
      { primary: 'Logo design', secondary: '' },
      { primary: 'Brand guidelines', secondary: '12-page PDF including color, typography, and voice.' },
    ],
    onChange: fn(),
  },
  render: (args) => <Controlled {...args} />,
};

export const Variants: Story = {
  render: () => (
    <div style={{ width: 520 }}>
      <Stack>
        <div>
          <SectionLabel>Sizes</SectionLabel>
          <Stack gap="var(--gap-lg)">
            <Controlled
              label="Small"
              size="sm"
              primaryLabel="URL"
              secondaryLabel="Notes"
              primaryPlaceholder="https://example.com"
              secondaryPlaceholder="Notes"
              addLabel="Add"
              removeLabel="Remove entry"
              entries={[{ primary: 'https://acme.com', secondary: 'Direct competitor' }]}
              onChange={() => {}}
            />
            <Controlled
              label="Medium (default)"
              size="md"
              primaryLabel="URL"
              secondaryLabel="Notes"
              primaryPlaceholder="https://example.com"
              secondaryPlaceholder="Notes"
              addLabel="Add"
              removeLabel="Remove entry"
              entries={[
                { primary: 'https://acme.com', secondary: 'Direct competitor' },
                { primary: 'https://widgets.io', secondary: 'Adjacent market' },
              ]}
              onChange={() => {}}
            />
            <Controlled
              label="Large"
              size="lg"
              primaryLabel="URL"
              secondaryLabel="Notes"
              primaryPlaceholder="https://example.com"
              secondaryPlaceholder="Notes"
              addLabel="Add"
              removeLabel="Remove entry"
              entries={[{ primary: 'https://acme.com', secondary: 'Direct competitor' }]}
              onChange={() => {}}
            />
          </Stack>
        </div>

        <div>
          <SectionLabel>States</SectionLabel>
          <Stack gap="var(--gap-lg)">
            <Controlled
              label="Empty"
              emptyLabel="No competitors added yet."
              addLabel="Add Competitor"
              entries={[]}
              onChange={() => {}}
            />
            <Controlled
              label="With helper text"
              helperText="Escape cancels the form; Save keeps it open for rapid entry."
              primaryLabel="URL"
              secondaryLabel="Notes"
              addLabel="Add Competitor"
              removeLabel="Remove competitor"
              entries={[{ primary: 'https://acme.com', secondary: 'Direct competitor' }]}
              onChange={() => {}}
            />
            <Controlled
              label="Disabled"
              disabled
              addLabel="Add Competitor"
              removeLabel="Remove competitor"
              entries={[
                { primary: 'https://acme.com', secondary: 'Direct competitor' },
                { primary: 'https://widgets.io', secondary: 'Adjacent market' },
              ]}
              onChange={() => {}}
            />
            <Controlled
              label="Max 3 entries"
              maxItems={3}
              addLabel="Add"
              removeLabel="Remove entry"
              helperText="Add button hides when limit is reached."
              entries={[
                { primary: 'A', secondary: 'First' },
                { primary: 'B', secondary: 'Second' },
                { primary: 'C', secondary: 'Third' },
              ]}
              onChange={() => {}}
            />
          </Stack>
        </div>

        <div>
          <SectionLabel>Suggestion Modes</SectionLabel>
          <Stack gap="var(--gap-lg)">
            <Controlled
              label="With Suggestions (free-form allowed)"
              primaryLabel="Service Name"
              secondaryLabel="Description"
              primaryPlaceholder="Search or add a service…"
              secondaryPlaceholder="Brief description"
              addLabel="Add Service"
              removeLabel="Remove service"
              primarySuggestions={DENTAL_SERVICES}
              entries={[
                { primary: 'Crowns', secondary: 'Porcelain or ceramic caps to restore damaged teeth.' },
              ]}
              onChange={() => {}}
            />
            <Controlled
              label="With Suggestions (strict)"
              primaryLabel="Service Name"
              secondaryLabel="Description"
              primaryPlaceholder="Search services…"
              secondaryPlaceholder="Brief description"
              addLabel="Add Service"
              removeLabel="Remove service"
              primarySuggestions={DENTAL_SERVICES}
              primaryStrict
              entries={[]}
              onChange={() => {}}
            />
          </Stack>
        </div>
      </Stack>
    </div>
  ),
};

// ── Interaction stories ───────────────────────────────────────────────────────

export const AddAnEntry: Story = {
  name: 'Interaction — add an entry (no suggestions)',
  args: {
    label: 'Competitors',
    primaryLabel: 'URL',
    primaryPlaceholder: 'https://competitor.com',
    secondaryLabel: 'Notes',
    secondaryPlaceholder: 'Competitive positioning',
    addLabel: 'Add Competitor',
    removeLabel: 'Remove competitor',
    entries: [{ primary: 'https://acme.com', secondary: 'Direct competitor' }],
    onChange: fn(),
  },
  render: (args) => <Controlled {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const addButton = canvas.getByRole('button', { name: /add competitor/i });
    await userEvent.click(addButton);

    const urlInput = await canvas.findByLabelText('URL');
    await userEvent.type(urlInput, 'https://newrival.com');

    const notesInput = await canvas.findByLabelText('Notes');
    await userEvent.type(notesInput, 'Newly funded, aggressive go-to-market');

    await userEvent.click(canvas.getByRole('button', { name: /^add$/i }));

    await expect(args.onChange).toHaveBeenCalledWith([
      { primary: 'https://acme.com', secondary: 'Direct competitor' },
      { primary: 'https://newrival.com', secondary: 'Newly funded, aggressive go-to-market' },
    ]);
  },
};

export const RemoveAnEntry: Story = {
  name: 'Interaction — remove an entry',
  args: {
    label: 'Competitors',
    addLabel: 'Add Competitor',
    removeLabel: 'Remove competitor',
    entries: [
      { primary: 'https://acme.com', secondary: 'Direct competitor' },
      { primary: 'https://widgets.io', secondary: 'Adjacent market' },
      { primary: 'https://rival.co', secondary: 'Emerging threat' },
    ],
    onChange: fn(),
  },
  render: (args) => <Controlled {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const removeButtons = canvas.getAllByRole('button', { name: /remove competitor/i });
    await userEvent.click(removeButtons[1]);
    await expect(args.onChange).toHaveBeenCalledWith([
      { primary: 'https://acme.com', secondary: 'Direct competitor' },
      { primary: 'https://rival.co', secondary: 'Emerging threat' },
    ]);
  },
};

export const DuplicateBlocked: Story = {
  name: 'Interaction — duplicates blocked (case-insensitive)',
  args: {
    label: 'Competitors',
    primaryLabel: 'URL',
    secondaryLabel: 'Notes',
    addLabel: 'Add Competitor',
    removeLabel: 'Remove competitor',
    entries: [{ primary: 'https://acme.com', secondary: 'Direct competitor' }],
    onChange: fn(),
  },
  render: (args) => <Controlled {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /add competitor/i }));

    const urlInput = await canvas.findByLabelText('URL');
    await userEvent.type(urlInput, 'HTTPS://ACME.COM');

    await userEvent.click(canvas.getByRole('button', { name: /^add$/i }));
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

/**
 * Keyboard flow — Arrow + Enter in primary commits suggestion and moves focus
 * to the secondary textarea. This is the core two-field keyboard UX for Services.
 */
export const KeyboardFlowSuggestion: Story = {
  name: 'Interaction — keyboard: Arrow + Enter commits suggestion, focuses secondary',
  args: {
    label: 'Services',
    primaryLabel: 'Service Name',
    secondaryLabel: 'Description',
    primaryPlaceholder: 'Search or add a service…',
    secondaryPlaceholder: 'Brief description',
    addLabel: 'Add Service',
    removeLabel: 'Remove service',
    primarySuggestions: DENTAL_SERVICES,
    entries: [],
    onChange: fn(),
  },
  render: (args) => <Controlled {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Open the form
    await userEvent.click(canvas.getByRole('button', { name: /add service/i }));

    // Primary combobox should be present
    const primary = canvas.getByRole('combobox');
    await userEvent.type(primary, 'cr');

    // Dropdown should appear with "Crowns"
    const option = await canvas.findByRole('option', { name: 'Crowns' });
    await expect(option).toBeInTheDocument();

    // ArrowDown highlights Crowns, Enter commits it
    await userEvent.keyboard('{ArrowDown}{Enter}');

    // Primary input should now show "Crowns"
    await expect(primary).toHaveValue('Crowns');

    // Secondary textarea should have received focus
    const secondary = canvas.getByLabelText('Description');
    await expect(secondary).toHaveFocus();

    // Complete the entry
    await userEvent.type(secondary, 'Porcelain caps to restore damaged teeth');
    await userEvent.click(canvas.getByRole('button', { name: /^add$/i }));

    await expect(args.onChange).toHaveBeenCalledWith([
      { primary: 'Crowns', secondary: 'Porcelain caps to restore damaged teeth' },
    ]);
  },
};

/**
 * Strict mode — typing a non-matching string blocks commit.
 */
export const StrictRejectsFreeForm: Story = {
  name: 'Interaction — strict mode rejects free-form entry',
  args: {
    label: 'Services',
    primaryLabel: 'Service Name',
    secondaryLabel: 'Description',
    primaryPlaceholder: 'Search services…',
    secondaryPlaceholder: 'Brief description',
    addLabel: 'Add Service',
    removeLabel: 'Remove service',
    primarySuggestions: DENTAL_SERVICES,
    primaryStrict: true,
    entries: [],
    onChange: fn(),
  },
  render: (args) => <Controlled {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: /add service/i }));

    const primary = canvas.getByRole('combobox');
    // Type something that is not in the suggestions list — strict hint appears
    await userEvent.type(primary, 'Custom Free-Form Service');

    // Strict hint should be visible
    await expect(canvas.getByText(/only suggestions can be added/i)).toBeInTheDocument();

    // Press Enter — should be rejected
    await userEvent.keyboard('{Enter}');
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

/**
 * Click-to-select from dropdown (non-keyboard path).
 */
export const ClickSelectFromDropdown: Story = {
  name: 'Interaction — click to select suggestion from dropdown',
  args: {
    label: 'Services',
    primaryLabel: 'Service Name',
    secondaryLabel: 'Description',
    primaryPlaceholder: 'Search or add a service…',
    secondaryPlaceholder: 'Brief description',
    addLabel: 'Add Service',
    removeLabel: 'Remove service',
    primarySuggestions: DENTAL_SERVICES,
    entries: [],
    onChange: fn(),
  },
  render: (args) => <Controlled {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: /add service/i }));

    const primary = canvas.getByRole('combobox');
    await userEvent.type(primary, 'Crown');

    const option = await canvas.findByRole('option', { name: 'Crowns' });
    await userEvent.click(option);

    // Primary should be set to the suggestion
    await expect(primary).toHaveValue('Crowns');

    // Secondary should have focus
    const secondary = canvas.getByLabelText('Description');
    await expect(secondary).toHaveFocus();
  },
};

/**
 * Escape closes dropdown without committing or cancelling the form.
 */
export const EscapeClosesDropdown: Story = {
  name: 'Interaction — Escape closes dropdown, keeps form open',
  args: {
    label: 'Services',
    primaryLabel: 'Service Name',
    secondaryLabel: 'Description',
    primaryPlaceholder: 'Search or add a service…',
    secondaryPlaceholder: 'Brief description',
    addLabel: 'Add Service',
    removeLabel: 'Remove service',
    primarySuggestions: DENTAL_SERVICES,
    entries: [],
    onChange: fn(),
  },
  render: (args) => <Controlled {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: /add service/i }));

    const primary = canvas.getByRole('combobox');
    await userEvent.type(primary, 'Crown');

    // Dropdown opens
    await canvas.findByRole('listbox');

    // Escape closes the dropdown but keeps the form open
    await userEvent.keyboard('{Escape}');
    await expect(canvas.queryByRole('listbox')).toBeNull();

    // Primary input still visible — form is still open
    await expect(primary).toBeInTheDocument();

    // No commit
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
