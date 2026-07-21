import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { SegmentedControl } from './SegmentedControl';

/** Interactive wrapper — manages selected value state */
function InteractiveSegmentedControl({
  items,
  size,
  fullWidth,
  disabled,
  defaultValue,
}: {
  items: { label: string; value?: string; disabled?: boolean }[];
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  defaultValue?: string;
}) {
  const firstValue = items[0]?.value ?? items[0]?.label ?? '';
  const [value, setValue] = useState(defaultValue ?? firstValue);

  return (
    <SegmentedControl
      items={items}
      value={value}
      onChange={setValue}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled}
    />
  );
}

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof SegmentedControl> = {
  title: 'Components/segmented-control',
  component: SegmentedControl,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
  argTypes: {
    items: {
      control: 'object',
      description: 'Segments in order. Each item is `{ label, value?, disabled? }`.',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: '`sm` — compact toolbars, dense UI. `md` — default for forms and panels. `lg` — prominent page-level toggles.',
    },
    fullWidth: { control: 'boolean', description: 'Stretches the control to fill its container width.' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof SegmentedControl>;

/* ═══════════════════════════════════════════════════════════════
   1. DEFAULT — args-driven sandbox. Controls work.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive playground for prop tweaking */
export const Default: Story = {
  args: {
    items: [
      { label: 'Grid', value: 'grid' },
      { label: 'List', value: 'list' },
    ],
    value: 'grid',
    size: 'md',
  },
};

/* ═══════════════════════════════════════════════════════════════
   2. PATTERNS — Q4 irreducible: clicking a segment updates the
      selected value, which args alone can't express
   ═══════════════════════════════════════════════════════════════ */

/** @summary Clicking a segment updates the selected view */
export const WithControlledSelection: Story = {
  render: () => (
    <InteractiveSegmentedControl
      items={[
        { label: 'Grid', value: 'grid' },
        { label: 'List', value: 'list' },
      ]}
      size="sm"
    />
  ),
};

/* ═══════════════════════════════════════════════════════════════
   3. INTERACTION TESTS — play-only, hidden from MCP discovery
   ═══════════════════════════════════════════════════════════════ */

/**
 * Roving tabindex contract (#993): only the selected radio is in the
 * tab order; arrows/Home/End move selection within a single tab stop.
 * @summary Verifies roving-tabindex keyboard navigation
 */
export const InteractionTestKeyboardNavigation: Story = {
  tags: ['!manifest'],
  render: () => (
    <InteractiveSegmentedControl
      items={[
        { label: 'Active', value: 'active' },
        { label: 'Archived', value: 'archived' },
        { label: 'All', value: 'all' },
      ]}
      defaultValue="active"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const active = canvas.getByRole('radio', { name: 'Active' });
    const archived = canvas.getByRole('radio', { name: 'Archived' });
    const all = canvas.getByRole('radio', { name: 'All' });

    // Roving tabindex: only the selected radio is in the tab order.
    await expect(active).toHaveAttribute('tabindex', '0');
    await expect(archived).toHaveAttribute('tabindex', '-1');

    // ArrowRight moves selection + focus to the next radio.
    active.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(archived).toHaveAttribute('aria-checked', 'true');
    await expect(archived).toHaveFocus();

    // End jumps to the last radio; Home back to the first.
    await userEvent.keyboard('{End}');
    await expect(all).toHaveAttribute('aria-checked', 'true');
    await userEvent.keyboard('{Home}');
    await expect(active).toHaveAttribute('aria-checked', 'true');

    // ArrowLeft wraps from the first radio to the last.
    await userEvent.keyboard('{ArrowLeft}');
    await expect(all).toHaveAttribute('aria-checked', 'true');
  },
};
