import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Icon } from '@iconify/react';
import { FilterButton, type FilterButtonOption } from './FilterButton';

/* ─── Sample data ─────────────────────────────────────────────── */

const categoryOptions: FilterButtonOption[] = [
  { id: 'brand', label: 'Brand design', icon: <Icon icon="ph:crown" /> },
  { id: 'marketing', label: 'Marketing design', icon: <Icon icon="ph:megaphone" /> },
  { id: 'product', label: 'Product design', icon: <Icon icon="ph:device-mobile" /> },
  { id: 'service', label: 'Back office design', icon: <Icon icon="ph:gear" /> },
  { id: 'information', label: 'Information design', icon: <Icon icon="ph:chalkboard-teacher" /> },
  { id: 'templates', label: 'Templates', icon: <Icon icon="ph:copy" /> },
];

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof FilterButton> = {
  title: 'Components/filter-button',
  component: FilterButton,
  tags: ['surface-product'],
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div style={{ minHeight: 280 }}><Story /></div>],
  argTypes: {
    label: {
      control: 'text',
      description: 'Default label shown on the trigger button when no option is selected. When a value is selected, the matching option label replaces this.',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Trigger button size — matches the Button scale (sm=32px, md=40px, lg=48px). Default `md`.',
    },
    options: {
      control: false,
      description: 'Array of `FilterButtonOption` ({ id, label, icon? }). Set in code — Storybook Controls cannot render a complex array editor usefully.',
    },
    value: {
      control: false,
      description: 'Controlled selected option id. Pair with `onChange`. Story uses internal `useState` for canvas interactivity.',
    },
    disabled: {
      control: 'boolean',
      description: 'Locks the trigger, blocks dropdown open, applies muted styling.',
    },
    onChange: {
      action: 'changed',
      description: 'Called with the new id when a selection is made, or `undefined` when the user clicks the active option to clear.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof FilterButton>;

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — single canonical story per ADR-010 §components without
   a variant axis. Render wraps with useState because FilterButton's
   selection lifecycle is interactive (open dropdown → pick → trigger
   label updates → click active to clear). args.onChange still fires
   for the Actions panel log.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Dropdown filter trigger with active-state pill */
export const Default: Story = {
  args: {
    label: 'Category',
    options: categoryOptions,
    size: 'md',
    disabled: false,
    onChange: fn(),
  },
  render: (args) => {
    const [value, setValue] = useState<string | undefined>(undefined);
    return (
      <FilterButton
        {...args}
        value={value}
        onChange={(v) => {
          setValue(v);
          args.onChange?.(v);
        }}
      />
    );
  },
};
