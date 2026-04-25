import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { AddableTextList } from './AddableTextList';

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

const meta: Meta<typeof AddableTextList> = {
  title: 'Components/Addables/addable-text-list',
  component: AddableTextList,
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
    allowDuplicates: { control: 'boolean' },
    maxItems: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof AddableTextList>;

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

/** @summary Interactive playground for prop tweaking */
export const Playground: Story = {
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

/** @summary Empty state */
export const Empty: Story = {
  args: {
    label: 'Back-Office Tools',
    placeholder: 'e.g. QuickBooks',
    addLabel: 'Add Tool',
    emptyLabel: 'No tools added yet.',
    values: [],
    onChange: fn(),
  },
  render: (args) => <Controlled {...args} />,
};

/** @summary Add an entry */
export const AddAnEntry: Story = {
  name: 'Interaction — add an entry',
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

/** @summary Remove an entry */
export const RemoveAnEntry: Story = {
  name: 'Interaction — remove an entry',
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

/** @summary Duplicate blocked */
export const DuplicateBlocked: Story = {
  name: 'Interaction — duplicates blocked (case-insensitive)',
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

/** @summary Anti pattern structured content */
export const AntiPatternStructuredContent: Story = {
  name: 'Anti-pattern — structured content in tags',
  parameters: {
    docs: {
      description: {
        story:
          'Do not do this. When values contain title + description pairs (separators `—`, `:`, newlines), each row collapses into a single unreadable tag. ' +
          'Open the browser console — the component warns on any value matching the structured-content pattern and points at AddableEntryList. ' +
          'This story exists to make the wrong choice visible, not to endorse it.',
      },
    },
  },
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

/** @summary All variants side by side */
export const Variants: Story = {
  render: () => (
    <div style={{ width: 480 }}>
      <Stack>
        <div>
          <SectionLabel>Sizes</SectionLabel>
          <Stack gap="var(--gap-lg)">
            <Controlled
              label="Small"
              size="sm"
              placeholder="Enter service"
              values={['Cleaning']}
              onChange={() => {}}
            />
            <Controlled
              label="Medium (default)"
              size="md"
              placeholder="Enter service"
              values={['Cleaning', 'Whitening']}
              onChange={() => {}}
            />
            <Controlled
              label="Large"
              size="lg"
              placeholder="Enter service"
              values={['Cleaning']}
              onChange={() => {}}
            />
          </Stack>
        </div>

        <div>
          <SectionLabel>States</SectionLabel>
          <Stack gap="var(--gap-lg)">
            <Controlled
              label="Empty"
              emptyLabel="No services added yet."
              placeholder="Enter service"
              values={[]}
              onChange={() => {}}
            />
            <Controlled
              label="With helper text"
              helperText="Press Enter to add; Escape to cancel."
              placeholder="Enter service"
              values={['Cleaning']}
              onChange={() => {}}
            />
            <Controlled
              label="Disabled"
              disabled
              values={['Cleaning', 'Whitening']}
              onChange={() => {}}
            />
            <Controlled
              label="Max 3 items"
              maxItems={3}
              values={['A', 'B', 'C']}
              onChange={() => {}}
              helperText="Add button hides when limit is reached."
            />
          </Stack>
        </div>
      </Stack>
    </div>
  ),
};
