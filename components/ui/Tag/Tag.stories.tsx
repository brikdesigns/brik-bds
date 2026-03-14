import type { Meta, StoryObj } from '@storybook/react-vite';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faArrowUpRightFromSquare, faTag, faCircle, faCertificate, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { Tag } from './Tag';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof Tag> = {
  title: 'Components/Indicator/tag',
  component: Tag,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    disabled: { control: 'boolean' },
    onRemove: { action: 'removed' },
  },
};

export default meta;
type Story = StoryObj<typeof Tag>;

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
  <div style={{ display: 'flex', gap: 'var(--gap-md)', flexWrap: 'wrap', alignItems: 'center' }}>{children}</div>
);

const Stack = ({ children, gap = 'var(--gap-xl)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap }}>{children}</div>
);

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND — Args-based, use Controls panel to explore
   ═══════════════════════════════════════════════════════════════ */

export const Playground: Story = {
  args: { children: 'Tag', size: 'md' },
};

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS — Sizes, icons, states in one view
   ═══════════════════════════════════════════════════════════════ */

export const Variants: Story = {
  render: () => (
    <Stack>
      <div>
        <SectionLabel>Sizes</SectionLabel>
        <Row>
          <Tag size="sm">Small</Tag>
          <Tag size="md">Medium</Tag>
          <Tag size="lg">Large</Tag>
        </Row>
      </div>
      <div>
        <SectionLabel>With icons</SectionLabel>
        <Row>
          <Tag size="lg" icon={<FontAwesomeIcon icon={faCertificate} />}>Left icon</Tag>
          <Tag size="lg" trailingIcon={<FontAwesomeIcon icon={faCircleXmark} />}>Right icon</Tag>
          <Tag size="lg" icon={<FontAwesomeIcon icon={faCertificate} />} trailingIcon={<FontAwesomeIcon icon={faCircleXmark} />}>Both</Tag>
        </Row>
      </div>
      <div>
        <SectionLabel>Icons across sizes</SectionLabel>
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <div key={size} style={{ display: 'flex', gap: 'var(--gap-md)', alignItems: 'center', marginBottom: 'var(--gap-md)' }}>
            <Tag size={size} icon={<FontAwesomeIcon icon={faCertificate} />} trailingIcon={<FontAwesomeIcon icon={faCircleXmark} />}>Tag</Tag>
          </div>
        ))}
      </div>
      <div>
        <SectionLabel>States</SectionLabel>
        <Row>
          <Tag>Default</Tag>
          <Tag onRemove={() => {}}>Removable</Tag>
          <Tag disabled>Disabled</Tag>
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
        <SectionLabel>Category labels</SectionLabel>
        <Row>
          <Tag icon={<FontAwesomeIcon icon={faTag} />}>Development</Tag>
          <Tag icon={<FontAwesomeIcon icon={faCircle} />}>Marketing</Tag>
          <Tag icon={<FontAwesomeIcon icon={faStar} />}>Featured</Tag>
          <Tag trailingIcon={<FontAwesomeIcon icon={faArrowUpRightFromSquare} />}>External</Tag>
        </Row>
      </div>
      <div>
        <SectionLabel>Filter chips</SectionLabel>
        <Row>
          <Tag onRemove={() => {}}>Design</Tag>
          <Tag onRemove={() => {}}>React</Tag>
          <Tag onRemove={() => {}}>Webflow</Tag>
        </Row>
      </div>
    </Stack>
  ),
};
