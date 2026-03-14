import type { Meta, StoryObj } from '@storybook/react-vite';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faTag } from '@fortawesome/free-solid-svg-icons';
import { Chip } from './Chip';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof Chip> = {
  title: 'Components/Indicator/chip',
  component: Chip,
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
      options: ['dark', 'light'],
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
    icon: <FontAwesomeIcon icon={faFilter} />,
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
          <Chip label="Secondary Dark" variant="secondary" appearance="dark" icon={<FontAwesomeIcon icon={faFilter} />} showDropdown />
          <Chip label="Secondary Light" variant="secondary" appearance="light" icon={<FontAwesomeIcon icon={faFilter} />} showDropdown />
          <Chip label="Primary Dark" variant="primary" appearance="dark" icon={<FontAwesomeIcon icon={faFilter} />} showDropdown />
          <Chip label="Primary Light" variant="primary" appearance="light" icon={<FontAwesomeIcon icon={faFilter} />} showDropdown />
        </Row>
      </div>
      <div>
        <SectionLabel>Sizes</SectionLabel>
        <Row>
          <Chip label="Small" size="sm" icon={<FontAwesomeIcon icon={faFilter} />} showDropdown />
          <Chip label="Medium" size="md" icon={<FontAwesomeIcon icon={faFilter} />} showDropdown />
          <Chip label="Large" size="lg" icon={<FontAwesomeIcon icon={faFilter} />} showDropdown />
        </Row>
      </div>
      <div>
        <SectionLabel>States</SectionLabel>
        <Row>
          <Chip label="Default" icon={<FontAwesomeIcon icon={faFilter} />} showDropdown />
          <Chip label="Removable" icon={<FontAwesomeIcon icon={faTag} />} onRemove={() => {}} />
          <Chip label="Disabled" icon={<FontAwesomeIcon icon={faFilter} />} showDropdown disabled />
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
          <Chip label="Status: Active" variant="primary" appearance="light" onRemove={() => {}} />
          <Chip label="Category: Design" onRemove={() => {}} />
          <Chip label="Date: This week" onRemove={() => {}} />
        </Row>
      </div>
      <div>
        <SectionLabel>Filter dropdown</SectionLabel>
        <Row>
          <Chip label="All statuses" icon={<FontAwesomeIcon icon={faFilter} />} showDropdown onChipClick={() => {}} />
          <Chip label="Category" icon={<FontAwesomeIcon icon={faFilter} />} showDropdown onChipClick={() => {}} />
        </Row>
      </div>
    </Stack>
  ),
};
