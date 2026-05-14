import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within, fn } from 'storybook/test';
import { Icon } from '@iconify/react';
import { Select, type SelectProps, type SelectOption, type SelectOptionGroup } from './Select';

/* ─── Sample data ─────────────────────────────────────────────── */

const flatOptions: SelectOption[] = [
  { label: 'First choice', value: 'first' },
  { label: 'Second choice', value: 'second' },
  { label: 'Third choice', value: 'third' },
];

const groupedOptions: SelectOptionGroup[] = [
  {
    label: 'United States',
    options: [
      { label: 'New York', value: 'ny' },
      { label: 'San Francisco', value: 'sf' },
      { label: 'Chicago', value: 'chi' },
    ],
  },
  {
    label: 'Europe',
    options: [
      { label: 'London', value: 'lon' },
      { label: 'Paris', value: 'par' },
      { label: 'Berlin', value: 'ber' },
    ],
  },
];

/* ─── Story-only args ─────────────────────────────────────────── */

/**
 * Default story extends SelectProps with two story-only flags so the
 * Controls panel can swap the leading icon and the options shape
 * (flat vs grouped) without requiring the viewer to edit JSON arrays.
 * Excluded from the MDX `<ArgTypes>` block.
 */
type DefaultArgs = SelectProps & {
  showLeadingIcon?: boolean;
  showOptionGroups?: boolean;
};

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<DefaultArgs> = {
  title: 'Components/Form/select',
  component: Select,
  tags: ['surface-shared'],
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div style={{ width: 360 }}><Story /></div>],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size token (sm=32px, md=40px, lg=48px). Default `md`.',
    },
    label: {
      control: 'text',
      description: 'Optional label rendered above the select. Auto-wires `htmlFor`/`id`.',
    },
    placeholder: {
      control: 'text',
      description: 'Empty-value option text shown when no selection has been made.',
    },
    helperText: {
      control: 'text',
      description: 'Hint text under the select. Hidden when `error` is present.',
    },
    error: {
      control: 'text',
      description: 'Error message. Triggers `aria-invalid` and replaces `helperText`.',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Stretch wrapper to its container width. Default `true`.',
    },
    disabled: {
      control: 'boolean',
      description: 'Locks the select — non-interactive, muted appearance.',
    },
    icon: {
      control: false,
      description: 'Optional leading icon node. Use `showLeadingIcon` Control in Storybook to toggle a sample tag icon.',
    },
    options: {
      control: false,
      description: 'Array of `SelectOption` (flat) or `SelectOptionGroup` (renders as `<optgroup>`). Mix freely. Use `showOptionGroups` Control in Storybook to swap sample data.',
    },
    onChange: {
      action: 'changed',
      description: 'Native change handler — receives the change event.',
    },
    showLeadingIcon: {
      control: 'boolean',
      description: 'Story-only — toggle a sample tag icon as `icon`.',
      table: { category: 'Story-only' },
    },
    showOptionGroups: {
      control: 'boolean',
      description: 'Story-only — swap `options` between a flat list and `<optgroup>`-rendered groups.',
      table: { category: 'Story-only' },
    },
  },
};

export default meta;
type Story = StoryObj<DefaultArgs>;

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — single canonical story per ADR-010 §components without
   a variant axis. All variation (size, icon, options shape, error,
   disabled, helper text) is exposed via Controls.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Themed native select with label/helper/error */
export const Default: Story = {
  args: {
    label: 'Choice',
    placeholder: 'Select one...',
    size: 'md',
    fullWidth: true,
    options: flatOptions,
    showLeadingIcon: false,
    showOptionGroups: false,
    onChange: fn(),
  },
  render: ({ showLeadingIcon, showOptionGroups, options, ...args }) => (
    <Select
      {...args}
      icon={showLeadingIcon ? <Icon icon="ph:tag" /> : undefined}
      options={showOptionGroups ? groupedOptions : options}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByRole('combobox');

    await expect(select).toBeVisible();
    await userEvent.selectOptions(select, 'second');
    await expect(select).toHaveValue('second');
    await expect(args.onChange).toHaveBeenCalled();
  },
};
