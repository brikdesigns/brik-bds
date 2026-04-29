import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '@iconify/react';
import { Tag } from './Tag';
import { Badge } from '../Badge/Badge';

/**
 * Tag — categorization label. Indicator-family — non-interactive by design.
 * Sizing scale shared with Badge for side-by-side alignment.
 * @summary Categorization label with size and appearance variants
 */
const meta: Meta<typeof Tag> = {
  title: 'Components/Indicator/tag',
  component: Tag,
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg'] },
    appearance: { control: 'select', options: ['solid', 'subtle'] },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Tag>;

const sizes = ['xs', 'sm', 'md', 'lg'] as const;
const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: 'var(--gap-md)', flexWrap: 'wrap', alignItems: 'center' }}>{children}</div>
);

/** Args-driven sandbox.
 *  @summary Live playground with all controls */
export const Playground: Story = {
  args: { children: 'Tag', size: 'md' },
};

/* ─── Appearance axis ────────────────────────────────────────── */

/** Solid appearance (default).
 *  @summary Solid tag */
export const Solid: Story = {
  args: { children: 'Solid', appearance: 'solid' },
};

/** Subtle appearance — pastel fill.
 *  @summary Subtle tag */
export const Subtle: Story = {
  args: { children: 'Subtle', appearance: 'subtle' },
};

/* ─── Size axis ──────────────────────────────────────────────── */

/** All four sizes side-by-side. xs is icon-only.
 *  @summary All sizes rendered together */
export const Sizes: Story = {
  render: () => (
    <Row>
      {sizes.map((size) => (
        size === 'xs'
          ? <Tag key={size} size="xs" icon={<Icon icon="ph:tag" />} />
          : <Tag key={size} size={size}>{size}</Tag>
      ))}
    </Row>
  ),
};

/* ─── Content shapes ─────────────────────────────────────────── */

/** Leading icon — common for category indicators with semantic icons.
 *  @summary Tag with leading icon */
export const WithLeadingIcon: Story = {
  args: { children: 'Featured', icon: <Icon icon="ph:star" /> },
};

/** Trailing icon — for "external" or "new tab" indicators.
 *  @summary Tag with trailing icon */
export const WithTrailingIcon: Story = {
  args: { children: 'External', trailingIcon: <Icon icon="ph:arrow-square-out" /> },
};

/** Removable — passes `onRemove` to render the dismiss X. **Note:** the
 *  preferred component for removable pills is `Chip`. Tag's `onRemove` prop
 *  is `@deprecated` and slated for removal once consumer migrations land.
 *  @summary Removable tag (deprecated — use Chip) */
export const Removable: Story = {
  args: { children: 'Design', onRemove: () => {} },
};

/** Disabled.
 *  @summary Disabled tag */
export const Disabled: Story = {
  args: { children: 'Disabled', disabled: true },
};

/* ─── Cross-component contract ───────────────────────────────── */

/** Tag and Badge share heights at every size tier — this story enforces the
 *  contract. If either drifts, this regresses.
 *  @summary Badge/Tag height alignment contract */
export const AlignedWithBadge: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}>
      {sizes.map((size) => (
        <div key={size} style={{ display: 'flex', gap: 'var(--gap-md)', alignItems: 'center' }}>
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
        </div>
      ))}
    </div>
  ),
};
