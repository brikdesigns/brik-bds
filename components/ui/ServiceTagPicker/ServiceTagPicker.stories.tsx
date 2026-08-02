import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { ServiceTagPicker } from './ServiceTagPicker';
import type { ServiceLine } from '../ServiceTag/service-config';

/** Interactive wrapper — manages the selected category. */
function InteractiveServiceTagPicker({
  defaultValue = 'brand',
  size,
  disabled,
  categories,
}: {
  defaultValue?: ServiceLine;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  categories?: readonly ServiceLine[];
}) {
  const [value, setValue] = useState<ServiceLine>(defaultValue);
  return (
    <ServiceTagPicker
      value={value}
      onChange={setValue}
      size={size}
      disabled={disabled}
      categories={categories}
    />
  );
}

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof ServiceTagPicker> = {
  title: 'Components/service-tag-picker',
  component: ServiceTagPicker,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
  argTypes: {
    value: {
      control: 'select',
      options: ['brand', 'marketing', 'information', 'product', 'back-office'],
      description: 'Currently selected service category.',
    },
    onChange: {
      control: false,
      description: 'Selection change handler, called with the chosen category.',
    },
    categories: {
      control: false,
      description: 'Categories to offer, in order. Defaults to all canonical service lines (`SERVICE_LINES`).',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the rendered ServiceTag pills. Default `md`.',
    },
    disabled: { control: 'boolean', description: 'Disable the whole group.' },
    ariaLabel: {
      control: 'text',
      description: 'Accessible name for the radiogroup. Default "Service category".',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ServiceTagPicker>;

/* ═══════════════════════════════════════════════════════════════
   1. DEFAULT — args-driven sandbox. Controls work.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive playground for prop tweaking */
export const Default: Story = {
  args: {
    value: 'brand',
    size: 'md',
  },
};

/* ═══════════════════════════════════════════════════════════════
   2. PATTERNS — Q4 irreducible: clicking a pill updates the
      selected category, which args alone can't express
   ═══════════════════════════════════════════════════════════════ */

/** @summary Clicking a pill updates the selected category */
export const WithControlledSelection: Story = {
  render: () => <InteractiveServiceTagPicker defaultValue="marketing" />,
};

/* ═══════════════════════════════════════════════════════════════
   3. INTERACTION TESTS — play-only, hidden from MCP discovery
   ═══════════════════════════════════════════════════════════════ */

/**
 * Native radiogroup contract: options expose `role="radio"`, clicking selects,
 * and arrow keys move selection (browser-native, no custom handler).
 * @summary Verifies radio selection + keyboard navigation
 */
export const InteractionTestSelection: Story = {
  tags: ['!manifest', 'interaction-test'],
  render: () => <InteractiveServiceTagPicker defaultValue="brand" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const brand = canvas.getByRole('radio', { name: 'Brand' });
    const marketing = canvas.getByRole('radio', { name: 'Marketing' });

    await expect(brand).toBeChecked();

    // Clicking a pill selects its category.
    await userEvent.click(marketing);
    await expect(marketing).toBeChecked();
    await expect(brand).not.toBeChecked();

    // Arrow keys move selection natively within the group.
    await userEvent.keyboard('{ArrowRight}');
    const information = canvas.getByRole('radio', { name: 'Information' });
    await expect(information).toBeChecked();
  },
};
