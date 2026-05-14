import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within, fn } from 'storybook/test';
import { Select, type SelectOption, type SelectOptionGroup } from './Select';

/* ─── Sample data ─────────────────────────────────────────────── */

const flatOptions: SelectOption[] = [
  { label: 'First choice', value: 'first' },
  { label: 'Second choice', value: 'second' },
  { label: 'Third choice', value: 'third' },
];

// Grouped options exported as a named constant so consumers reading the
// stories file can copy-paste it into their own code as a reference shape
// for the `<optgroup>`-rendered form of the `options` prop.
export const sampleGroupedOptions: SelectOptionGroup[] = [
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

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof Select> = {
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
      description: 'Optional leading icon node (ReactNode). Set in code; Storybook Controls cannot render JSX. Example: `<Icon icon="ph:tag" />`.',
    },
    options: {
      control: false,
      description: 'Array of `SelectOption` (flat) or `SelectOptionGroup` (renders as `<optgroup>`). Mix freely. Set in code — see `sampleGroupedOptions` in the stories file for a reference grouped shape.',
    },
    onChange: {
      action: 'changed',
      description: 'Native change handler — receives the change event.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — single canonical story per ADR-010 §components without
   a variant axis. All variation (size, error, disabled, helper,
   fullWidth) is exposed via Controls. Slot props (icon, options)
   are documented but set in code — see argType descriptions.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Themed native select with label/helper/error */
export const Default: Story = {
  args: {
    label: 'Choice',
    placeholder: 'Select one...',
    size: 'md',
    fullWidth: true,
    options: flatOptions,
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByRole('combobox');

    await expect(select).toBeVisible();
    await userEvent.selectOptions(select, 'second');
    await expect(select).toHaveValue('second');
    await expect(args.onChange).toHaveBeenCalled();
  },
};
