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
  title: 'Components/Addables/addable-entry-list',
  component: AddableEntryList,
  tags: ['surface-product'],
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    primaryInputType: { control: 'select', options: ['text', 'url'] },
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
    <div style={{ width: 520 }}>
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
 * Default playground — Competitors. URL primary + notes, inline-editable rows.
 * Each entry renders with its own TextInput + TextArea + Remove button; the
 * Add button appends a new empty row.
 */
export const Playground: Story = {
  args: {
    label: 'Competitors',
    primaryInputType: 'url',
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
 * Read mode — URL primary renders as a clickable anchor; secondary renders
 * with `--body-md`. Titles use `--label-md`. No remove buttons, no Add.
 */
export const ReadModeUrl: Story = {
  name: 'Read mode — URL primary',
  args: {
    label: 'Competitors',
    primaryInputType: 'url',
    disabled: true,
    entries: [
      { primary: 'https://carr.us', secondary: "Healthcare-specific but less boutique — clients don't work directly with leadership" },
      { primary: 'https://hbre.com', secondary: 'Nashville-based, healthcare-focused, well-respected firm — Brandon (new team member) came from there' },
      { primary: 'https://www.sagemontre.com', secondary: 'Boutique-ish firm with medical office building listings, good healthy competition — used as photography style reference (sagemontre.com/team)' },
    ],
    onChange: fn(),
  },
  render: (args) => <Controlled {...args} />,
};

/**
 * Read mode — text primary (not a link). Primary uses `--label-md`; secondary
 * uses `--body-md`.
 */
export const ReadModeText: Story = {
  name: 'Read mode — text primary',
  args: {
    label: 'Line Items',
    primaryInputType: 'text',
    disabled: true,
    entries: [
      { primary: 'Logo design', secondary: 'Primary mark + lockup + responsive variants.' },
      { primary: 'Brand guidelines', secondary: '12-page PDF including color, typography, and voice.' },
    ],
    onChange: fn(),
  },
  render: (args) => <Controlled {...args} />,
};

/**
 * Text primary (inline-editable). Same UX as Playground but with a plain
 * text input instead of a URL input.
 */
export const InlineEditText: Story = {
  name: 'Inline edit — text primary',
  args: {
    label: 'Line Items',
    primaryInputType: 'text',
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

/**
 * Primary with suggestions — dental services vocabulary.
 * Type "cr" to see "Crowns" appear. Enter commits and moves focus to description.
 *
 * Suggestion mode preserves the reveal-form flow (existing entries render as
 * read-only cards; Add opens a staging form).
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

export const Empty: Story = {
  args: {
    label: 'Reference Sites',
    primaryInputType: 'url',
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

export const WithEmptyDescriptionLabel: Story = {
  name: 'Empty description fallback (read mode)',
  parameters: {
    docs: {
      description: {
        story:
          'When `emptyDescriptionLabel` is provided, read-mode entries with no secondary show a muted italic placeholder instead of collapsing to a bare title. ' +
          'Matches the "title + body with fallback" pattern used by service catalog views.',
      },
    },
  },
  args: {
    label: 'Services',
    disabled: true,
    emptyDescriptionLabel: 'No description set',
    entries: [
      { primary: 'Cleanings including periodontal care (gum care) and oral cancer screenings', secondary: '' },
      {
        primary: 'Cosmetic dentistry',
        secondary: 'Veneers, whitening, bonding — focused on aesthetic outcomes, not function.',
      },
    ],
    onChange: fn(),
  },
  render: (args) => <Controlled {...args} />,
};

export const Variants: Story = {
  render: () => (
    <div style={{ width: 560 }}>
      <Stack>
        <div>
          <SectionLabel>Modes</SectionLabel>
          <Stack gap="var(--gap-lg)">
            <Controlled
              label="Edit mode — URL primary"
              primaryInputType="url"
              primaryLabel="URL"
              secondaryLabel="Notes"
              primaryPlaceholder="https://example.com"
              secondaryPlaceholder="Why this site is a reference"
              addLabel="Add Reference"
              removeLabel="Remove reference"
              entries={[{ primary: 'https://acme.com', secondary: 'Direct competitor' }]}
              onChange={() => {}}
            />
            <Controlled
              label="Read mode — URL primary"
              primaryInputType="url"
              disabled
              entries={[
                { primary: 'https://acme.com', secondary: 'Direct competitor — stronger brand.' },
                { primary: 'https://widgets.io', secondary: 'Adjacent market; watch for expansion.' },
              ]}
              onChange={() => {}}
            />
            <Controlled
              label="Read mode — text primary"
              disabled
              entries={[
                { primary: 'Logo design', secondary: 'Primary mark + lockup' },
                { primary: 'Brand guidelines', secondary: '12-page PDF' },
              ]}
              onChange={() => {}}
            />
          </Stack>
        </div>

        <div>
          <SectionLabel>Sizes (edit mode)</SectionLabel>
          <Stack gap="var(--gap-lg)">
            <Controlled
              label="Small"
              size="sm"
              primaryInputType="url"
              primaryLabel="URL"
              secondaryLabel="Notes"
              addLabel="Add"
              removeLabel="Remove entry"
              entries={[{ primary: 'https://acme.com', secondary: 'Direct competitor' }]}
              onChange={() => {}}
            />
            <Controlled
              label="Medium (default)"
              size="md"
              primaryInputType="url"
              primaryLabel="URL"
              secondaryLabel="Notes"
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
              primaryInputType="url"
              primaryLabel="URL"
              secondaryLabel="Notes"
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
              helperText="Each row saves in place; Add appends a new entry."
              primaryInputType="url"
              primaryLabel="URL"
              secondaryLabel="Notes"
              addLabel="Add Competitor"
              removeLabel="Remove competitor"
              entries={[{ primary: 'https://acme.com', secondary: 'Direct competitor' }]}
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
          <SectionLabel>Suggestion Modes (reveal-form preserved)</SectionLabel>
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

/**
 * Plain mode — clicking Add appends an empty row; onChange fires with the
 * appended entry. Typing into a field patches that row via onChange.
 */
export const AddAndEditRow: Story = {
  name: 'Interaction — add appends empty row',
  args: {
    label: 'Competitors',
    primaryInputType: 'url',
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

    await expect(args.onChange).toHaveBeenCalledWith([
      { primary: 'https://acme.com', secondary: 'Direct competitor' },
      { primary: '', secondary: '' },
    ]);
  },
};

export const RemoveAnEntry: Story = {
  name: 'Interaction — remove an entry (plain mode)',
  args: {
    label: 'Competitors',
    primaryInputType: 'url',
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

/**
 * Read mode — URL primary renders as an anchor pointing to the URL.
 */
export const ReadModeUrlIsAnchor: Story = {
  name: 'Interaction — read mode URL primary is an anchor',
  args: {
    label: 'Competitors',
    primaryInputType: 'url',
    disabled: true,
    entries: [
      { primary: 'https://acme.com', secondary: 'Direct competitor' },
    ],
    onChange: fn(),
  },
  render: (args) => <Controlled {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: /https:\/\/acme\.com/i });
    await expect(link).toHaveAttribute('href', 'https://acme.com');
    await expect(link).toHaveAttribute('target', '_blank');
  },
};

// ── Suggestion mode interactions (preserved) ──────────────────────────────────

/**
 * Keyboard flow — Arrow + Enter in primary commits suggestion and moves focus
 * to the secondary textarea. This is the core two-field keyboard UX for Services.
 */
export const KeyboardFlowSuggestion: Story = {
  name: 'Interaction — suggestion keyboard: Arrow + Enter commits, focuses secondary',
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
    await userEvent.type(primary, 'cr');

    const option = await canvas.findByRole('option', { name: 'Crowns' });
    await expect(option).toBeInTheDocument();

    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(primary).toHaveValue('Crowns');

    const secondary = canvas.getByLabelText('Description');
    await expect(secondary).toHaveFocus();

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
    await userEvent.type(primary, 'Custom Free-Form Service');

    await expect(canvas.getByText(/only suggestions can be added/i)).toBeInTheDocument();

    await userEvent.keyboard('{Enter}');
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

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

    await expect(primary).toHaveValue('Crowns');

    const secondary = canvas.getByLabelText('Description');
    await expect(secondary).toHaveFocus();
  },
};

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

    await canvas.findByRole('listbox');

    await userEvent.keyboard('{Escape}');
    await expect(canvas.queryByRole('listbox')).toBeNull();

    await expect(primary).toBeInTheDocument();
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
