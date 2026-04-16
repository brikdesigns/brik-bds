import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { AddableEntryList, type AddableEntry } from './AddableEntryList';

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
  },
};

export default meta;
type Story = StoryObj<typeof AddableEntryList>;

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

export const AddAnEntry: Story = {
  name: 'Interaction — add an entry',
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

export const PrimaryOnly: Story = {
  name: 'Secondary optional',
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
      </Stack>
    </div>
  ),
};
