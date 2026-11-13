import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Icon } from '../Icon';
import { Building, File, User } from '../../icons';
import {
  SearchOverlay,
  SearchOverlayTrigger,
  type SearchOverlayGroup,
  type SearchOverlayProps,
  type SearchOverlayScope,
} from './SearchOverlay';

/* ─── Fixtures ────────────────────────────────────────────────── */

const companyIcon = <Icon icon={Building} />;
const contactIcon = <Icon icon={User} />;
const invoiceIcon = <Icon icon={File} />;

const recents: SearchOverlayGroup = {
  id: 'recent',
  label: 'Recent',
  results: [
    { id: 'c-1', title: 'Acme Dental', trail: 'Companies', icon: companyIcon },
    { id: 'p-1', title: 'Jordan Rivera', trail: 'Contacts / Acme Dental', icon: contactIcon },
    { id: 'i-1', title: 'INV-2041', trail: 'Invoices / Acme Dental', icon: invoiceIcon },
  ],
};

const groups: SearchOverlayGroup[] = [
  {
    id: 'companies',
    label: 'Companies',
    count: 2,
    results: [
      { id: 'c-1', title: 'Acme Dental', trail: 'Companies', icon: companyIcon },
      { id: 'c-2', title: 'Acme Orthodontics', trail: 'Companies', icon: companyIcon },
    ],
  },
  {
    id: 'contacts',
    label: 'Contacts',
    count: 1,
    results: [
      { id: 'p-1', title: 'Jordan Rivera', trail: 'Contacts / Acme Dental', icon: contactIcon },
    ],
  },
];

const scopes: SearchOverlayScope[] = [
  { id: 'companies', label: 'Companies' },
  { id: 'contacts', label: 'Contacts' },
  { id: 'invoices', label: 'Invoices' },
];

/** Controlled wrapper so the canvas stays interactive; args seed it. */
function Harness(args: SearchOverlayProps) {
  const [query, setQuery] = useState(args.query);
  const [activeScope, setActiveScope] = useState(args.activeScope);
  return (
    <SearchOverlay
      {...args}
      query={query}
      onQueryChange={(value) => {
        setQuery(value);
        args.onQueryChange(value);
      }}
      activeScope={activeScope}
      onScopeChange={(id) => {
        setActiveScope(id);
        args.onScopeChange?.(id);
      }}
    />
  );
}

const baseArgs = {
  isOpen: true,
  onClose: fn(),
  onSelect: fn(),
  onQueryChange: fn(),
  onScopeChange: fn(),
  query: '',
  groups: [],
  recents,
  'aria-label': 'Search',
} satisfies SearchOverlayProps;

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof SearchOverlay> = {
  title: 'Components/search-overlay',
  component: SearchOverlay,
  tags: ['surface-product'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    isOpen: { control: 'boolean', description: 'Whether the overlay is open.' },
    onClose: { action: 'closed', description: 'Called on Esc, backdrop click, or after a result opens. Closing resets the query (ADR-049 § 3).' },
    query: { control: 'text', description: 'Current query (controlled). Under 2 characters the overlay shows `recents` instead of results (ADR-049 § 4).' },
    onQueryChange: { action: 'query-changed', description: 'Called 250 ms after the last keystroke, and with `""` on clear or close.' },
    groups: { control: 'object', description: 'Result groups the consumer fetched: `{ id, label, count?, results }`. Rows carry `icon`, `title`, `trail`.' },
    recents: { control: 'object', description: 'One consumer-supplied group shown before any search runs.' },
    scopes: { control: 'object', description: 'Scope chips. A scope id narrows the visible groups to the group with the same id.' },
    activeScope: { control: 'text', description: 'Id of the selected scope; `undefined` means all.' },
    onScopeChange: { action: 'scope-changed', description: 'Called with the scope id, or `undefined` for "All".' },
    loading: { control: 'boolean', description: 'A search is in flight.' },
    zeroAction: { control: false, description: 'Replaces the default next step on a zero-result state.' },
    onSelect: { action: 'selected', description: 'Called when a row is opened. `newTab` is true for Cmd/Ctrl+Enter or a modifier-click.' },
    'aria-label': { control: 'text', description: 'Accessible name for the dialog and the search landmark.' },
  },
  render: (args) => <Harness {...args} />,
};

export default meta;
type Story = StoryObj<typeof SearchOverlay>;

/* ─── Stories ─────────────────────────────────────────────────── */

/** @summary Empty query with a Recent group */
export const Default: Story = { args: baseArgs };

/** @summary Grouped results with a result count */
export const Results: Story = { args: { ...baseArgs, query: 'acme', groups } };

/** @summary Zero results with a next step */
export const ZeroResults: Story = { args: { ...baseArgs, query: 'zzzz', groups: [] } };

/** @summary A search in flight */
export const Loading: Story = { args: { ...baseArgs, query: 'acme', loading: true } };

/** @summary Scope chips narrowing the groups */
export const WithScopes: Story = {
  args: { ...baseArgs, query: 'acme', groups, scopes, activeScope: 'contacts' },
};

/**
 * The trigger is a separate small export for an `AppBar` `actions` slot.
 * @summary Closed trigger with shortcut hint
 */
export const ClosedTrigger: Story = {
  args: baseArgs,
  render: (args) => {
    const [open, setOpen] = useState(false);
    return (
      <div style={{ padding: 'var(--bds-padding-lg)' }}>
        <SearchOverlayTrigger onClick={() => setOpen(true)} />
        <Harness {...args} isOpen={open} onClose={() => setOpen(false)} />
      </div>
    );
  },
};

/* ─── Interaction tests ───────────────────────────────────────── */

/** @summary Recents render before any search */
export const InteractionTestRecents: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: baseArgs,
  play: async () => {
    const screen = within(document.body);
    await expect(screen.getByRole('dialog', { name: 'Search' })).toBeInTheDocument();
    await expect(screen.getByRole('search', { name: 'Search' })).toBeInTheDocument();
    await expect(screen.getByText('Recent')).toBeInTheDocument();
    await expect(screen.getAllByRole('option')).toHaveLength(3);
  },
};

/** @summary Arrow keys move, Enter and Cmd+Enter open */
export const InteractionTestKeyboard: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: { ...baseArgs, onSelect: fn(), query: 'acme', groups },
  play: async ({ args }) => {
    const screen = within(document.body);
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    await expect(input).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{ArrowDown}');
    await expect(input).toHaveAttribute(
      'aria-activedescendant',
      screen.getAllByRole('option')[1].id,
    );
    await userEvent.keyboard('{Enter}');
    await expect(args.onSelect).toHaveBeenLastCalledWith(groups[0].results[1], { newTab: false });
    await userEvent.keyboard('{ArrowDown}{Meta>}{Enter}{/Meta}');
    await expect(args.onSelect).toHaveBeenLastCalledWith(groups[1].results[0], { newTab: true });
  },
};

/** @summary Count renders after every query, zero included */
export const InteractionTestZeroResults: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: { ...baseArgs, query: 'zzzz', groups: [] },
  play: async ({ args }) => {
    const screen = within(document.body);
    await expect(screen.getByRole('status')).toHaveTextContent('0 results');
    await userEvent.click(screen.getByRole('button', { name: 'Clear query' }));
    await expect(args.onQueryChange).toHaveBeenLastCalledWith('');
  },
};

/** @summary Count totals the visible groups */
export const InteractionTestCount: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: { ...baseArgs, query: 'acme', groups },
  play: async () => {
    await expect(within(document.body).getByRole('status')).toHaveTextContent('3 results');
  },
};

/** @summary A scope chip narrows the groups */
export const InteractionTestScope: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: { ...baseArgs, query: 'acme', groups, scopes },
  play: async ({ args }) => {
    const screen = within(document.body);
    await userEvent.click(screen.getByRole('button', { name: 'Contacts' }));
    await expect(args.onScopeChange).toHaveBeenLastCalledWith('contacts');
    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(1));
    await expect(screen.getByRole('status')).toHaveTextContent('1 result');
  },
};

/** @summary Esc closes the dialog */
export const InteractionTestEscape: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: { ...baseArgs, onClose: fn(), query: 'acme', groups },
  play: async ({ args }) => {
    const screen = within(document.body);
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(args.onClose).toHaveBeenCalled());
  },
};
