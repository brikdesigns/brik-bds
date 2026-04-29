import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '@iconify/react';
import { Chip } from './Chip';

/**
 * Chip — interactive pill for filters, removable selections, and dropdown
 * triggers. Action-family sibling to the Tag/Badge indicators.
 * @summary Interactive filter/removable pill
 */
const meta: Meta<typeof Chip> = {
  title: 'Components/Indicator/chip',
  component: Chip,
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    variant: { control: 'select', options: ['primary', 'secondary'] },
    appearance: { control: 'select', options: ['solid', 'outline'] },
    showDropdown: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Chip>;

const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: 'var(--gap-lg)', flexWrap: 'wrap', alignItems: 'center' }}>{children}</div>
);

/** Args-driven sandbox.
 *  @summary Live playground with all controls */
export const Playground: Story = {
  args: {
    label: 'Chip',
    icon: <Icon icon="ph:funnel" />,
    showDropdown: true,
  },
};

/* ─── Variant axis ───────────────────────────────────────────── */

/** Secondary variant — neutral surface, default for filter chips.
 *  @summary Secondary chip (default) */
export const Secondary: Story = {
  args: { label: 'Status', variant: 'secondary', icon: <Icon icon="ph:funnel" />, showDropdown: true },
};

/** Primary variant — brand-colored, used when the chip is the focal action in a row.
 *  @summary Primary chip */
export const Primary: Story = {
  args: { label: 'Status', variant: 'primary', icon: <Icon icon="ph:funnel" />, showDropdown: true },
};

/* ─── Appearance axis ────────────────────────────────────────── */

/** Solid appearance (default) — filled background.
 *  @summary Solid appearance */
export const Solid: Story = {
  args: { label: 'Status', appearance: 'solid', icon: <Icon icon="ph:funnel" />, showDropdown: true },
};

/** Outline appearance — bordered, transparent background. Use against busy surfaces.
 *  @summary Outline appearance */
export const Outline: Story = {
  args: { label: 'Status', appearance: 'outline', icon: <Icon icon="ph:funnel" />, showDropdown: true },
};

/* ─── Size axis ──────────────────────────────────────────────── */

/** All three sizes side-by-side. ADR-006 axis-gallery exception.
 *  @summary All sizes rendered together */
export const Sizes: Story = {
  render: () => (
    <Row>
      <Chip label="Small" size="sm" icon={<Icon icon="ph:funnel" />} showDropdown />
      <Chip label="Medium" size="md" icon={<Icon icon="ph:funnel" />} showDropdown />
      <Chip label="Large" size="lg" icon={<Icon icon="ph:funnel" />} showDropdown />
    </Row>
  ),
};

/* ─── Behavior shapes ────────────────────────────────────────── */

/** Removable — passes `onRemove` to render the dismiss X. The canonical use
 *  for active-filter pills.
 *  @summary Chip with dismiss button */
export const Removable: Story = {
  args: { label: 'Category: Design', icon: <Icon icon="ph:tag" />, onRemove: () => {} },
};

/** Disabled — interactive states suppressed. Visual only.
 *  @summary Disabled chip */
export const Disabled: Story = {
  args: { label: 'Status', icon: <Icon icon="ph:funnel" />, showDropdown: true, disabled: true },
};
