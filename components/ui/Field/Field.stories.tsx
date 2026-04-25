import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field } from './Field';
import { Tag } from '../Tag';
import { EmptyState } from '../EmptyState';

const meta: Meta<typeof Field> = {
  title: 'Components/Form/field',
  component: Field,
  parameters: { layout: 'padded' },
  argTypes: {
    label: { control: 'text' },
    layout: { control: 'select', options: ['stacked', 'inline'] },
    empty: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Field>;

/* ─── Story helpers ──────────────────────────────────────────── */

const Frame = ({ width = '360px', children }: { width?: string; children: React.ReactNode }) => (
  <div style={{ width, padding: 'var(--padding-lg)', background: 'var(--surface-primary)' }}>
    {children}
  </div>
);

const Stack = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>{children}</div>
);

/* ─── 1. Playground ──────────────────────────────────────────── */

export const Playground: Story = {
  args: {
    label: 'Status',
    children: 'Active',
    layout: 'stacked',
  },
  render: (args) => (
    <Frame>
      <Field {...args} />
    </Frame>
  ),
};

/* ─── 2. Variants ────────────────────────────────────────────── */

export const Variants: Story = {
  render: () => (
    <Frame>
      <Stack>
        <Field label="Status">Active</Field>
        <Field label="Owner">Nick Stanerson</Field>
        <Field label="Industry">Design & Engineering</Field>
        <Field label="Last updated">2 days ago</Field>
      </Stack>
    </Frame>
  ),
};

/* ─── 3. Inline layout ──────────────────────────────────────── */

export const InlineLayout: Story = {
  render: () => (
    <Frame>
      <Stack>
        <Field layout="inline" label="Status">Active</Field>
        <Field layout="inline" label="Scraped">8</Field>
        <Field layout="inline" label="Failed">12</Field>
        <Field layout="inline" label="Last updated">2 days ago</Field>
      </Stack>
    </Frame>
  ),
};

/* ─── 4. Empty states ────────────────────────────────────────── */

export const EmptyStates: Story = {
  render: () => (
    <Frame>
      <Stack>
        <Field label="Status">Active</Field>
        <Field label="Notes" />
        <Field label="Tags">{null}</Field>
        <Field label="Custom empty" empty="No owner assigned" />
      </Stack>
    </Frame>
  ),
};

/* ─── 5. Section-level empty override ────────────────────────── */

export const SectionLevelEmpty: Story = {
  render: () => (
    <Frame width="480px">
      <Field
        label="Contacts"
        empty={
          <EmptyState
            title="No contacts yet"
            description="Add a contact to associate people with this company."
          />
        }
      />
    </Frame>
  ),
};

/* ─── 6. Value types — text, tags, URL, list ────────────────── */

export const ValueTypes: Story = {
  render: () => (
    <Frame>
      <Stack>
        <Field label="Name">Birdwell & Mutlak Dentistry</Field>

        <Field label="Services">
          <div style={{ display: 'flex', gap: 'var(--gap-xs)', flexWrap: 'wrap' }}>
            <Tag size="sm">Cosmetic</Tag>
            <Tag size="sm">General</Tag>
            <Tag size="sm">Implants</Tag>
          </div>
        </Field>

        <Field label="Website">
          <a href="https://birdwelldentist.com" target="_blank" rel="noreferrer"
             style={{ color: 'var(--text-brand-primary)', textDecoration: 'none' }}>
            birdwelldentist.com ↗
          </a>
        </Field>

        <Field label="Anti-messages">
          <ul style={{ margin: 0, paddingLeft: 'var(--padding-lg)' }}>
            <li>No price-first positioning</li>
            <li>No corporate-clinic language</li>
            <li>Avoid dental-industry jargon</li>
          </ul>
        </Field>
      </Stack>
    </Frame>
  ),
};

/* ─── 7. Patterns — multi-field row ─────────────────────────── */

export const Patterns: Story = {
  render: () => (
    <Frame width="480px">
      <Stack>
        <Field label="Entity name">Birdwell & Mutlak, LLC</Field>
        <Field label="Owner">Nick Stanerson</Field>
        <Field label="Practice location">Thompson Station, TN</Field>
        <Field label="Insurance accepted" />
        <Field label="Parent organization" empty="Independent" />
      </Stack>
    </Frame>
  ),
};
