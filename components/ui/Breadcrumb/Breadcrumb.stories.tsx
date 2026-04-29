import type { Meta, StoryObj } from '@storybook/react-vite';
import { Breadcrumb } from './Breadcrumb';

/**
 * Breadcrumb — page-position navigation. Items render as links except the last
 * (current page), which renders as plain text. Two separator styles.
 * @summary Page-position breadcrumb navigation
 */
const meta: Meta<typeof Breadcrumb> = {
  title: 'Components/Navigation/breadcrumb',
  component: Breadcrumb,
  parameters: { layout: 'padded' },
  argTypes: {
    separator: { control: 'select', options: ['slash', 'chevron'] },
  },
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

/** Args-driven sandbox.
 *  @summary Live playground with all controls */
export const Playground: Story = {
  args: {
    items: [
      { label: 'Home', href: '#' },
      { label: 'Products', href: '#' },
      { label: 'Design System' },
    ],
    separator: 'slash',
  },
};

/* ─── Separator axis ─────────────────────────────────────────── */

/** Slash separator (default).
 *  @summary Slash separator */
export const SlashSeparator: Story = {
  args: {
    separator: 'slash',
    items: [
      { label: 'Home', href: '#' },
      { label: 'Products', href: '#' },
      { label: 'Design System' },
    ],
  },
};

/** Chevron separator.
 *  @summary Chevron separator */
export const ChevronSeparator: Story = {
  args: {
    separator: 'chevron',
    items: [
      { label: 'Home', href: '#' },
      { label: 'Products', href: '#' },
      { label: 'Design System' },
    ],
  },
};

/* ─── Depth shapes ───────────────────────────────────────────── */

/** Deep nesting — five-level breadcrumb. Confirms wrap behavior at narrow widths.
 *  @summary Deep-nesting breadcrumb */
export const DeepNesting: Story = {
  args: {
    items: [
      { label: 'Home', href: '#' },
      { label: 'Products', href: '#' },
      { label: 'Design System', href: '#' },
      { label: 'Components', href: '#' },
      { label: 'Breadcrumb' },
    ],
  },
};

/** Single item — current page only. The breadcrumb still renders for layout
 *  consistency.
 *  @summary Single-item breadcrumb */
export const SingleItem: Story = {
  args: { items: [{ label: 'Dashboard' }] },
};

/* ─── Surface contexts ───────────────────────────────────────── */

/** On dark background — confirms text contrast on a brand-primary surface.
 *  @summary Breadcrumb on brand surface */
export const OnDarkSurface: Story = {
  decorators: [
    (Story) => (
      <div style={{ backgroundColor: 'var(--background-brand-primary)', padding: 'var(--padding-xl)', borderRadius: 'var(--border-radius-md)' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    items: [
      { label: 'Show All', href: '#' },
      { label: 'Product', href: '#' },
      { label: 'Design System' },
    ],
  },
};
