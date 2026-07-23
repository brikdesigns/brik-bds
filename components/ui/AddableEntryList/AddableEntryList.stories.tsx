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

// ── Storybook meta ────────────────────────────────────────────────────────────

/**
 * Inline-editable list of `{ primary, secondary }` entries with optional
 * suggestion-backed primary.
 * @summary Inline-editable list of primary/secondary entries
 */
const meta: Meta<typeof AddableEntryList> = {
  title: 'Containers/addable-entry-list',
  component: AddableEntryList,
  tags: ['surface-product'],
  parameters: { layout: 'centered' },
  argTypes: {
    entries: { control: false, description: 'Current list of `{ primary, secondary }` entries.' },
    onChange: { control: false, description: 'Called with the next entries array on add / edit / remove.' },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    primaryInputType: { control: 'select', options: ['text', 'url'] },
    label: { control: 'text' },
    addLabel: { control: 'text' },
    removeLabel: { control: 'text' },
    primaryPlaceholder: { control: 'text' },
    secondaryPlaceholder: { control: 'text' },
    primaryLabel: { control: 'text' },
    secondaryLabel: { control: 'text' },
    helperText: { control: 'text' },
    emptyLabel: { control: 'text' },
    emptyDescriptionLabel: {
      control: 'text',
      description: 'Read-mode fallback shown in place of `secondary` when it is empty.',
    },
    disabled: {
      control: 'boolean',
      description: 'Read-only rendering — token-backed typography, no inputs or remove; URL primaries render as anchors.',
    },
    allowDuplicates: { control: 'boolean' },
    maxItems: { control: 'number' },
    secondaryRows: { control: 'number' },
    primarySuggestions: {
      control: 'object',
      description: 'Suggestion set for the primary field — switches to combobox suggestion mode. See `WithSuggestions`.',
    },
    primaryStrict: {
      control: 'boolean',
      description: 'Only meaningful with `primarySuggestions` — rejects free-form primary values.',
    },
    className: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof AddableEntryList>;

// ── Controlled wrapper — hook-driven state machine args can't express (Q4) ────
// Every story needs local state to reflect add/edit/remove back into the
// canvas; the wrapper itself is the irreducible part, not a standalone story.

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
 * Plain inline-edit mode — Competitors. URL primary + notes, each entry
 * editable in place via TextInput + TextArea + Remove. The Add button
 * appends a new empty row. Flip `primaryInputType` via Controls to compare
 * URL vs. plain text.
 *
 * @summary Interactive playground for prop tweaking
 */
export const Default: Story = {
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
 * Suggestion mode (`primarySuggestions`) — preserves the reveal-form flow:
 * existing entries render as read-only cards; Add opens a staging form with
 * a combobox-backed primary. Type "cr" to see "Crowns" appear. Enter commits
 * and moves focus to the description textarea.
 *
 * @summary Suggestion-backed primary with free-form fallback
 */
export const WithSuggestions: Story = {
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

// ── Interaction tests — play-only, hidden from MCP discovery (Q5) ─────────────

/**
 * Plain mode — clicking Add appends an empty row; onChange fires with the
 * appended entry.
 * @summary Play-function interaction test
 */
export const InteractionTestAddAppendsRow: Story = {
  tags: ['!manifest'],
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

/**
 * Plain mode — removing an entry updates onChange with the remaining rows.
 * @summary Play-function interaction test
 */
export const InteractionTestRemoveEntry: Story = {
  tags: ['!manifest'],
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
 * @summary Play-function interaction test
 */
export const InteractionTestReadModeUrlAnchor: Story = {
  tags: ['!manifest'],
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

/**
 * Keyboard flow — Arrow + Enter in primary commits suggestion and moves
 * focus to the secondary textarea.
 * @summary Play-function interaction test
 */
export const InteractionTestSuggestionKeyboardFlow: Story = {
  tags: ['!manifest'],
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
 * @summary Play-function interaction test
 */
export const InteractionTestStrictRejectsFreeForm: Story = {
  tags: ['!manifest'],
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

/**
 * Clicking a suggestion in the dropdown commits it and moves focus to the
 * secondary textarea.
 * @summary Play-function interaction test
 */
export const InteractionTestClickSelectSuggestion: Story = {
  tags: ['!manifest'],
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

/**
 * Escape closes the dropdown but keeps the staging form open.
 * @summary Play-function interaction test
 */
export const InteractionTestEscapeClosesDropdown: Story = {
  tags: ['!manifest'],
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
