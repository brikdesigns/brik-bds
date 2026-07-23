import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '@iconify/react';
import { Tag } from './Tag';
import { Badge } from '../Badge/Badge';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof Tag> = {
  title: 'Components/tag',
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
      options: ['solid', 'subtle', 'muted'],
      description: 'Fill: `solid` (neutral filled background, default), `subtle` (transparent + hairline border), or `muted` (quiet neutral fill — low-emphasis category label).',
    },
    density: {
      control: 'select',
      options: ['comfortable', 'compact'],
      description: '`compact` tightens horizontal padding one token-step down for dense rows. Default `comfortable`.',
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
   DEFAULT — args-driven sandbox. Controls work.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive playground for prop tweaking */
export const Default: Story = {
  args: { children: 'Tag', size: 'md' },
};

/* ═══════════════════════════════════════════════════════════════
   APPEARANCE — axis-only gallery (solid / subtle / muted, side by side)
   ═══════════════════════════════════════════════════════════════ */

/**
 * Appearance axis — `solid` (neutral filled background, default), `subtle`
 * (transparent + hairline border), and `muted` (quiet neutral fill for a
 * low-emphasis category label). `muted` is a Tag-only value — for semantic
 * status (positive/warning/error) use `Badge` instead.
 *
 * @summary Solid, subtle, and muted appearances side-by-side
 */
export const Appearance: Story = {
  render: () => (
    <Row>
      <Tag appearance="solid">Solid</Tag>
      <Tag appearance="subtle">Subtle</Tag>
      <Tag appearance="muted">Muted</Tag>
    </Row>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   SIZES — axis-only gallery (four size tokens, side by side)
   ═══════════════════════════════════════════════════════════════ */

/**
 * Sizes axis — the four size tokens (xs / sm / md / lg). `xs` is icon-only
 * by design — it's too small for legible text.
 *
 * @summary All four sizes side-by-side
 */
export const Sizes: Story = {
  render: () => (
    <Row>
      <Tag size="xs" icon={<Icon icon="ph:tag" />} />
      <Tag size="sm">Small</Tag>
      <Tag size="md">Medium</Tag>
      <Tag size="lg">Large</Tag>
    </Row>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   DENSITY — axis-only gallery (comfortable vs compact, per size)
   ═══════════════════════════════════════════════════════════════ */

/**
 * Density axis — `comfortable` (default) vs `compact` at each text size.
 * Compact tightens horizontal padding one token-step down so more Tags fit
 * inline in a dense table row; height is unchanged.
 *
 * @summary Comfortable vs compact density across sizes
 */
export const Density: Story = {
  render: () => (
    <Stack gap="var(--gap-lg)">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Row key={size}>
          <span style={{ fontFamily: 'var(--font-family-label)', fontSize: 'var(--body-xs)', color: 'var(--text-muted)', width: '24px' }}>{size}</span>
          <Tag size={size} density="comfortable">Comfortable</Tag>
          <Tag size={size} density="compact">Compact</Tag>
        </Row>
      ))}
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   BADGE + TAG ALIGNMENT — Q4 irreducible: cross-component demo,
   args can't render two different components in one story.
   ═══════════════════════════════════════════════════════════════ */

/**
 * Badge and Tag share the same height at every size tier — useful when
 * mixing them inline.
 *
 * @summary Badge + Tag pixel-aligned at every size
 */
export const BadgeTagAlignment: Story = {
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
