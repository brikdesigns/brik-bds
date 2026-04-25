import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '@iconify/react';
import { Chip } from './Chip';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof Chip> = {
  title: 'Components/Indicator/chip',
  component: Chip,
  tags: ['surface-shared'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    variant: {
      control: 'select',
      options: ['primary', 'secondary'],
    },
    appearance: {
      control: 'select',
      options: ['solid', 'outline'],
    },
    showDropdown: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Chip>;

/* ─── Layout Helpers (story-only) ─────────────────────────────── */

const SectionLabel = ({ children }: { children: string }) => (
  <div style={{
    fontFamily: 'var(--font-family-label)',
    fontSize: 'var(--body-xs)', // bds-lint-ignore
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: 'var(--gap-md)',
    color: 'var(--text-muted)',
  }}>
    {children}
  </div>
);

const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: 'var(--gap-lg)', flexWrap: 'wrap', alignItems: 'center' }}>{children}</div>
);

const Stack = ({ children, gap = 'var(--gap-xl)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap }}>{children}</div>
);

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND — Args-based, use Controls panel to explore
   ═══════════════════════════════════════════════════════════════ */

export const Playground: Story = {
  args: {
    label: 'Chip',
    icon: <Icon icon="ph:funnel" />,
    showDropdown: true,
  },
};

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS — All combinations in one view
   ═══════════════════════════════════════════════════════════════ */

export const Variants: Story = {
  render: () => (
    <Stack>
      <div>
        <SectionLabel>Variant + Appearance</SectionLabel>
        <Row>
          <Chip label="Secondary Solid" variant="secondary" appearance="solid" icon={<Icon icon="ph:funnel" />} showDropdown />
          <Chip label="Secondary Outline" variant="secondary" appearance="outline" icon={<Icon icon="ph:funnel" />} showDropdown />
          <Chip label="Primary Solid" variant="primary" appearance="solid" icon={<Icon icon="ph:funnel" />} showDropdown />
          <Chip label="Primary Outline" variant="primary" appearance="outline" icon={<Icon icon="ph:funnel" />} showDropdown />
        </Row>
      </div>
      <div>
        <SectionLabel>Sizes</SectionLabel>
        <Row>
          <Chip label="Small" size="sm" icon={<Icon icon="ph:funnel" />} showDropdown />
          <Chip label="Medium" size="md" icon={<Icon icon="ph:funnel" />} showDropdown />
          <Chip label="Large" size="lg" icon={<Icon icon="ph:funnel" />} showDropdown />
        </Row>
      </div>
      <div>
        <SectionLabel>States</SectionLabel>
        <Row>
          <Chip label="Default" icon={<Icon icon="ph:funnel" />} showDropdown />
          <Chip label="Removable" icon={<Icon icon="ph:tag" />} onRemove={() => {}} />
          <Chip label="Disabled" icon={<Icon icon="ph:funnel" />} showDropdown disabled />
        </Row>
      </div>
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   3. PATTERNS — Real-world usage
   ═══════════════════════════════════════════════════════════════ */

export const Patterns: Story = {
  name: 'Patterns',
  render: () => (
    <Stack>
      <div>
        <SectionLabel>Active filters</SectionLabel>
        <Row>
          <Chip label="Status: Active" variant="primary" appearance="outline" onRemove={() => {}} />
          <Chip label="Category: Design" onRemove={() => {}} />
          <Chip label="Date: This week" onRemove={() => {}} />
        </Row>
      </div>
      <div>
        <SectionLabel>Filter dropdown</SectionLabel>
        <Row>
          <Chip label="All statuses" icon={<Icon icon="ph:funnel" />} showDropdown onChipClick={() => {}} />
          <Chip label="Category" icon={<Icon icon="ph:funnel" />} showDropdown onChipClick={() => {}} />
        </Row>
      </div>
    </Stack>
  ),
};
