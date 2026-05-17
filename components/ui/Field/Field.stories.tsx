import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field } from './Field';
import { Tag } from '../Tag';
import { EmptyState } from '../EmptyState';

/**
 * Field — read-mode label + value pair for Sheet body rows.
 * @summary Read-mode label + value pair for Sheet body rows
 */
const meta: Meta<typeof Field> = {
  title: 'Blocks/field',
  component: Field,
  tags: ['surface-shared'],
  parameters: { layout: 'padded' },
  argTypes: {
    label: { control: 'text' },
    children: { control: 'text' },
    layout: { control: 'select', options: ['stacked', 'inline'] },
    tier: { control: 'select', options: ['standard', 'compact'] },
    empty: { control: 'text' },
    helper: { control: 'text' },
    helperTone: { control: 'select', options: ['neutral', 'error'] },
  },
};

export default meta;
type Story = StoryObj<typeof Field>;

const Frame = ({ width = '360px', children }: { width?: string; children: React.ReactNode }) => (
  <div style={{ width, padding: 'var(--padding-lg)', background: 'var(--surface-primary)' }}>
    {children}
  </div>
);

/** @summary Canonical Field — flip Controls to explore layout + empty fallbacks */
export const Default: Story = {
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

/** @summary EmptyState composed into the `empty` slot for section-level empties */
export const WithCompositeEmpty: Story = {
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

/** @summary `tier="compact"` replaces SheetFieldLabel + SheetFieldValue pairs */
export const CompactTier: Story = {
  render: () => (
    <Frame>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>
        <Field label="Status" tier="compact">Active</Field>
        <Field label="Notes" tier="compact" empty="—">
          Multi-line value that wraps across lines is preserved correctly.
        </Field>
        <Field label="Phone" tier="compact" helper="Primary contact number">
          (555) 867-5309
        </Field>
        <Field label="Insurance" tier="compact" helper="Required field" helperTone="error" />
      </div>
    </Frame>
  ),
};

/** @summary `children` accepts text, Tag groups, anchors, or bullet lists */
export const WithRichValue: Story = {
  render: () => (
    <Frame>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>
        <Field label="Name">Birdwell & Mutlak Dentistry</Field>

        <Field label="Services">
          <div style={{ display: 'flex', gap: 'var(--gap-xs)', flexWrap: 'wrap' }}>
            <Tag size="sm">Cosmetic</Tag>
            <Tag size="sm">General</Tag>
            <Tag size="sm">Implants</Tag>
          </div>
        </Field>

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

        <Field label="Anti-messages">
          <ul style={{ margin: 0, paddingLeft: 'var(--padding-lg)' }}>
            <li>No price-first positioning</li>
            <li>No corporate-clinic language</li>
            <li>Avoid dental-industry jargon</li>
          </ul>
        </Field>
      </div>
    </Frame>
  ),
};
