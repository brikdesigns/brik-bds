import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tag } from './Tag';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof Tag> = {
  title: 'Components/tag',
  component: Tag,
  tags: ['surface-shared'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    children: {
      control: 'text',
      description: 'Tag label content (optional for xs/icon-only size).',
    },
    icon: {
      control: false,
      description: 'Optional leading icon (left) — required for xs size.',
    },
    trailingIcon: {
      control: false,
      description: 'Optional trailing icon (right).',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
    },
    appearance: {
      control: 'select',
      options: ['solid', 'subtle', 'outline'],
      description: 'Fill: `solid` (saturated fill, default), `subtle` (pale `-light` fill, dark-ink label), or `outline` (transparent + border). Same three words as Badge.',
    },
    color: {
      control: 'select',
      options: ['neutral', 'blue', 'green', 'orange', 'purple', 'yellow', 'red'],
      description: 'Category color: `neutral` (default) or an accent hue shared with Avatar. Status colors are a Badge `tone`.',
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

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — args-driven sandbox. Controls work.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive playground for prop tweaking */
export const Default: Story = {
  args: { children: 'Tag', size: 'md' },
};

/* `appearance`, `color`, `size`, and `density` are Controls on Default — the
   side-by-side comparisons live in Tag.mdx as docs-local demos (#1489). */
