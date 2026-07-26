import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '@iconify/react';
import { expect, fn, userEvent } from 'storybook/test';
import { Chip } from './Chip';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof Chip> = {
  title: 'Components/chip',
  component: Chip,
  tags: ['surface-shared'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Chip label text.',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size token. Default `md`.',
    },
    variant: {
      control: 'select',
      options: ['primary', 'secondary'],
      description:
        'Hierarchy — `secondary` (default, neutral) or `primary` (emphasized/selected). ' +
        'Pure color axis, no semantic difference between values.',
    },
    icon: {
      control: false,
      description: 'Optional leading icon element.',
    },
    avatar: {
      control: false,
      description: 'Optional avatar element rendered before the label.',
    },
    showDropdown: {
      control: 'boolean',
      description: 'Show trailing dropdown caret.',
    },
    onRemove: {
      action: 'removed',
      description: 'Removable chip — pass a handler to show the trailing remove button.',
    },
    onChipClick: {
      action: 'clicked',
      description: 'Click handler for the chip body.',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state — blocks click/remove and mutes appearance.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Chip>;

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — args-driven sandbox. Hierarchy (variant), size,
   dropdown/remove affordances, and disabled state are pure
   axes with no semantic difference between values — Controls
   (ADR-010 Q2), not standalone stories.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive Chip — hierarchy, size, affordances via Controls */
export const Default: Story = {
  args: {
    label: 'Chip',
    icon: <Icon icon="ph:funnel" />,
    showDropdown: true,
  },
};

/* ═══════════════════════════════════════════════════════════════
   INTERACTION TEST — play-only, hidden from MCP discovery
   ═══════════════════════════════════════════════════════════════ */

/**
 * A clickable chip (`onChipClick`) is a hand-rolled `role="button"` div whose
 * `onKeyDown` fires the handler on Enter/Space — no native button, so the
 * keyboard path lives entirely in that handler. Assert it so it can't silently
 * regress (WCAG 2.1.1).
 * @summary Enter on a clickable chip fires onChipClick
 */
export const InteractionTestKeyboardActivation: Story = {
  tags: ['!manifest'],
  args: {
    label: 'Filter',
    onChipClick: fn(),
  },
  play: async ({ args, canvas }) => {
    const chip = canvas.getByRole('button', { name: 'Filter' });
    chip.focus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onChipClick).toHaveBeenCalled();
  },
};
