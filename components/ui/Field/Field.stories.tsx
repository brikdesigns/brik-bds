import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field } from './Field';
import { Tag } from '../Tag';
import { EmptyState } from '../EmptyState';

/**
 * Field — labeled value primitive for read-mode sheets and form layouts. Supports
 * stacked or inline layout and a customizable empty-state slot.
 * @summary Labeled value primitive
 */
const meta: Meta<typeof Field> = {
  title: 'Components/Form/field',
  component: Field,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ width: '360px', padding: 'var(--padding-lg)', background: 'var(--surface-primary)' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    label: { control: 'text' },
    layout: { control: 'select', options: ['stacked', 'inline'] },
    empty: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Field>;

const Stack = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>{children}</div>
);

/** Args-driven sandbox.
 *  @summary Live playground with all controls */
export const Playground: Story = {
  args: { label: 'Status', children: 'Active', layout: 'stacked' },
};

/* ─── Layout axis ────────────────────────────────────────────── */

/** Stacked layout (default) — label above value. Most common shape.
 *  @summary Stacked layout */
export const Stacked: Story = {
  args: { label: 'Status', children: 'Active', layout: 'stacked' },
};

/** Inline layout — label and value on the same row. Use for compact stat tiles
 *  or read-mode rows where space is constrained.
 *  @summary Inline layout */
export const Inline: Story = {
  args: { label: 'Status', children: 'Active', layout: 'inline' },
};

/* ─── Empty states ───────────────────────────────────────────── */

/** Default empty state — Field renders the standard empty marker when there's no value.
 *  @summary Default empty state */
export const Empty: Story = {
  args: { label: 'Notes' },
};

/** Custom empty string — `empty` prop overrides the default empty marker.
 *  @summary Custom empty string */
export const CustomEmpty: Story = {
  args: { label: 'Custom empty', empty: 'No owner assigned' },
};

/** Section-level empty override — `empty` accepts any ReactNode. Use to embed
 *  an EmptyState component when an entire section is empty.
 *  @summary EmptyState as the empty slot */
export const EmptyWithComponent: Story = {
  args: {
    label: 'Contacts',
    empty: (
      <EmptyState
        title="No contacts yet"
        description="Add a contact to associate people with this company."
      />
    ),
  },
  decorators: [
    (Story) => (
      <div style={{ width: '480px', padding: 'var(--padding-lg)', background: 'var(--surface-primary)' }}>
        <Story />
      </div>
    ),
  ],
};

/* ─── Value-type recipes ─────────────────────────────────────── */

/** Tag-list value — Field's children slot accepts any ReactNode. Common pattern
 *  for service/category fields.
 *  @summary Tag list as the field value */
export const ValueAsTagList: Story = {
  render: () => (
    <Field label="Services">
      <div style={{ display: 'flex', gap: 'var(--gap-xs)', flexWrap: 'wrap' }}>
        <Tag size="sm">Cosmetic</Tag>
        <Tag size="sm">General</Tag>
        <Tag size="sm">Implants</Tag>
      </div>
    </Field>
  ),
};

/** Linked URL value — anchor as the value, with brand color and external indicator.
 *  @summary Anchor URL as the field value */
export const ValueAsLink: Story = {
  render: () => (
    <Field label="Website">
      <a
        href="https://birdwelldentist.com"
        target="_blank"
        rel="noreferrer"
        style={{ color: 'var(--text-brand-primary)', textDecoration: 'none' }}
      >
        birdwelldentist.com ↗
      </a>
    </Field>
  ),
};

/** Multi-field stacked layout — multiple Fields composed in a Stack. The
 *  canonical read-mode-sheet shape.
 *  @summary Multiple fields stacked */
export const MultiFieldStack: Story = {
  decorators: [
    (Story) => (
      <div style={{ width: '480px', padding: 'var(--padding-lg)', background: 'var(--surface-primary)' }}>
        <Story />
      </div>
    ),
  ],
  render: () => (
    <Stack>
      <Field label="Entity name">Birdwell & Mutlak, LLC</Field>
      <Field label="Owner">Nick Stanerson</Field>
      <Field label="Practice location">Thompson Station, TN</Field>
      <Field label="Insurance accepted" />
      <Field label="Parent organization" empty="Independent" />
    </Stack>
  ),
};
