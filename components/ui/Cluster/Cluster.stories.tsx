import type { Meta, StoryObj } from '@storybook/react-vite';
import { Cluster } from './Cluster';

const meta: Meta<typeof Cluster> = {
  title: 'Components/Layout/cluster',
  component: Cluster,
  tags: ['surface-shared'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Wrapping inline-flex container — for tag lists, breadcrumbs, action-button rows, badge groups, filter pills. Always wraps; spacing is uniform regardless of how rows fall.',
      },
    },
  },
  argTypes: {
    gap: { control: 'select', options: ['none', 'tiny', 'xs', 'sm', 'md', 'lg', 'xl'] },
    align: { control: 'select', options: ['start', 'center', 'end', 'baseline'] },
    justify: { control: 'select', options: [undefined, 'start', 'center', 'end', 'between'] },
  },
};

export default meta;
type Story = StoryObj<typeof Cluster>;

const Pill = ({ children }: { children: React.ReactNode }) => (
  <span
    style={{
      padding: '4px 12px',
      background: 'var(--surface-secondary)',
      border: '1px solid var(--border-secondary)',
      borderRadius: '9999px',
      fontFamily: 'var(--font-family-label)',
      fontSize: 'var(--label-sm)', // bds-lint-ignore
      color: 'var(--text-primary)',
      whiteSpace: 'nowrap' as const,
    }}
  >
    {children}
  </span>
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      fontFamily: 'var(--font-family-label)',
      fontSize: 'var(--body-xs)', // bds-lint-ignore
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      color: 'var(--text-muted)',
      marginBottom: 'var(--gap-sm)',
    }}
  >
    {children}
  </div>
);

/** @summary Interactive playground */
export const Playground: Story = {
  args: { gap: 'sm', align: 'center' },
  render: (args) => (
    <Cluster {...args}>
      <Pill>brand</Pill>
      <Pill>marketing</Pill>
      <Pill>information</Pill>
      <Pill>product</Pill>
      <Pill>back-office</Pill>
    </Cluster>
  ),
};

/** @summary Tag list — most common Cluster use case */
export const TagList: Story = {
  render: () => (
    <Cluster gap="xs">
      <Pill>brand</Pill>
      <Pill>marketing</Pill>
      <Pill>information</Pill>
      <Pill>product</Pill>
      <Pill>back-office</Pill>
      <Pill>+ 3 more</Pill>
    </Cluster>
  ),
};

/** @summary Wrapping behavior — narrow width forces multiple rows with consistent gap */
export const Wrapping: Story = {
  render: () => (
    <div style={{ maxWidth: 320, padding: 'var(--padding-md)', background: 'var(--surface-secondary)' }}>
      <SectionLabel>320px container</SectionLabel>
      <Cluster gap="sm">
        <Pill>logo design</Pill>
        <Pill>brand guidelines</Pill>
        <Pill>letterhead stationary</Pill>
        <Pill>business card</Pill>
        <Pill>email signature</Pill>
        <Pill>online business listings</Pill>
      </Cluster>
    </div>
  ),
};

/** @summary Action button row — Cluster + justify="end" */
export const ActionRow: Story = {
  render: () => (
    <div style={{ padding: 'var(--padding-md)', borderTop: '1px solid var(--border-secondary)', maxWidth: 480 }}>
      <Cluster gap="sm" justify="end">
        <Pill>Cancel</Pill>
        <Pill>Save draft</Pill>
        <Pill>Publish</Pill>
      </Cluster>
    </div>
  ),
};

/** @summary Gap scale */
export const GapScale: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>
      {(['tiny', 'xs', 'sm', 'md', 'lg', 'xl'] as const).map((g) => (
        <div key={g}>
          <SectionLabel>gap=&quot;{g}&quot;</SectionLabel>
          <Cluster gap={g}>
            <Pill>one</Pill>
            <Pill>two</Pill>
            <Pill>three</Pill>
            <Pill>four</Pill>
          </Cluster>
        </div>
      ))}
    </div>
  ),
};
