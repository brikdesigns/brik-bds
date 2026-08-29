import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field } from './Field';
import { Tag } from '../Tag';
import { EmptyState } from '../EmptyState';

/**
 * Field — read-mode label + value pair for Sheet body rows.
 * @summary Read-mode label + value pair for Sheet body rows
 */
const meta: Meta<typeof Field> = {
  title: 'Components/field',
  component: Field,
  tags: ['surface-shared'],
  parameters: { layout: 'padded' },
  argTypes: {
    label: { control: 'text' },
    children: { control: 'text' },
    orientation: { control: 'select', options: ['vertical', 'horizontal'] },
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

/**
 * Flip Controls to explore orientation + empty fallbacks.
 * @summary Canonical Field label + value pair
 */
export const Default: Story = {
  args: {
    label: 'Status',
    children: 'Active',
    orientation: 'vertical',
  },
  render: (args) => (
    <Frame>
      <Field {...args} />
    </Frame>
  ),
};

/**
 * EmptyState composed into the `empty` slot for section-level empties.
 * @summary EmptyState composed into `empty` slot
 */
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

/**
 * bds-lint-ignore — the repeat varies the *content type* of `children` (text /
 * Tag / anchor / list), which is not a prop scale a Control can express (#1502).
 * @summary `children` accepts text, Tags, anchors, or lists
 */
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
