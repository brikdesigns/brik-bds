import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '@iconify/react';
import { Tag } from './Tag';
import { Badge } from '../Badge/Badge';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof Tag> = {
  title: 'Components/Indicator/tag',
  component: Tag,
  tags: ['surface-shared'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
    },
    appearance: {
      control: 'select',
      options: ['solid', 'subtle'],
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

/** @summary Interactive playground for prop tweaking */
export const Playground: Story = {
  args: { children: 'Tag', size: 'md' },
};

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS — Sizes, icons, states in one view
   ═══════════════════════════════════════════════════════════════ */

/** @summary All variants side by side */
export const Variants: Story = {
  render: () => (
    <Stack>
      <div>
        <SectionLabel>Sizes</SectionLabel>
        <Row>
          <Tag size="xs" icon={<Icon icon="ph:tag" />} />
          <Tag size="sm">Small</Tag>
          <Tag size="md">Medium</Tag>
          <Tag size="lg">Large</Tag>
        </Row>
      </div>
      <div>
        <SectionLabel>Appearance</SectionLabel>
        <Row>
          <Tag appearance="solid">Solid (default)</Tag>
          <Tag appearance="subtle">Subtle</Tag>
          <Tag appearance="solid" icon={<Icon icon="ph:tag" />}>Solid + icon</Tag>
          <Tag appearance="subtle" icon={<Icon icon="ph:tag" />}>Subtle + icon</Tag>
        </Row>
      </div>
      <div>
        <SectionLabel>With icons</SectionLabel>
        <Row>
          <Tag size="lg" icon={<Icon icon="ph:certificate" />}>Left icon</Tag>
          <Tag size="lg" trailingIcon={<Icon icon="ph:x-circle" />}>Right icon</Tag>
          <Tag size="lg" icon={<Icon icon="ph:certificate" />} trailingIcon={<Icon icon="ph:x-circle" />}>Both</Tag>
        </Row>
      </div>
      <div>
        <SectionLabel>Icons across sizes</SectionLabel>
        {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
          <div key={size} style={{ display: 'flex', gap: 'var(--gap-md)', alignItems: 'center', marginBottom: 'var(--gap-md)' }}>
            {size === 'xs' ? (
              <Tag size={size} icon={<Icon icon="ph:certificate" />} />
            ) : (
              <Tag size={size} icon={<Icon icon="ph:certificate" />} trailingIcon={<Icon icon="ph:x-circle" />}>Tag</Tag>
            )}
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
   3. ALIGNMENT — Side-by-side with Badge at every size
   ═══════════════════════════════════════════════════════════════ */

/** @summary Alignment options */
export const Alignment: Story = {
  name: 'Badge + Tag alignment',
  render: () => (
    <Stack>
      <SectionLabel>Badge and Tag share the same height at every size tier</SectionLabel>
      {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
        <Row key={size}>
          <span style={{ fontFamily: 'var(--font-family-label)', fontSize: 'var(--body-xs)', color: 'var(--text-muted)', width: '24px' }}>{size}</span>
          {size === 'xs' ? (
            <>
              <Badge size="xs" status="positive" icon={<Icon icon="ph:star" />} />
              <Tag size="xs" icon={<Icon icon="ph:tag" />} />
            </>
          ) : (
            <>
              <Badge size={size} status="positive" icon={<Icon icon="ph:star" />}>Active</Badge>
              <Tag size={size} icon={<Icon icon="ph:tag" />}>Category</Tag>
            </>
          )}
        </Row>
      ))}
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   4. PATTERNS — Real-world usage
   ═══════════════════════════════════════════════════════════════ */

/** @summary Common usage patterns */
export const Patterns: Story = {
  name: 'Patterns',
  render: () => (
    <Stack>
      <div>
        <SectionLabel>Category labels</SectionLabel>
        <Row>
          <Tag icon={<Icon icon="ph:tag" />}>Development</Tag>
          <Tag icon={<Icon icon="ph:circle" />}>Marketing</Tag>
          <Tag icon={<Icon icon="ph:star" />}>Featured</Tag>
          <Tag trailingIcon={<Icon icon="ph:arrow-square-out" />}>External</Tag>
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
