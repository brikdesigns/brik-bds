import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Icon } from '@iconify/react';
import {
  MultiSelect,
  type MultiSelectOption,
  type MultiSelectOptionGroup,
} from './MultiSelect';

/* ─── Sample data ─────────────────────────────────────────────── */

const serviceOptions: MultiSelectOption[] = [
  { label: 'Brand Design', value: 'brand', icon: <Icon icon="ph:paint-brush" /> },
  { label: 'Marketing', value: 'marketing', icon: <Icon icon="ph:megaphone" /> },
  { label: 'Information Design', value: 'information', icon: <Icon icon="ph:info" /> },
  { label: 'Product Design', value: 'product', icon: <Icon icon="ph:cube" /> },
  { label: 'Service Design', value: 'service', icon: <Icon icon="ph:gear" /> },
];

// Offerings grouped under their service line — renders one <optgroup> per group.
const groupedOfferings: MultiSelectOptionGroup[] = [
  {
    label: 'Brand',
    options: [
      { label: 'Logo & identity', value: 'logo', icon: <Icon icon="ph:paint-brush" /> },
      { label: 'Brand guidelines', value: 'guidelines', icon: <Icon icon="ph:book-open" /> },
    ],
  },
  {
    label: 'Marketing',
    options: [
      { label: 'Campaign design', value: 'campaign', icon: <Icon icon="ph:megaphone" /> },
      { label: 'Social templates', value: 'social', icon: <Icon icon="ph:share-network" /> },
    ],
  },
  {
    label: 'Product',
    options: [
      { label: 'UI design', value: 'ui', icon: <Icon icon="ph:cube" /> },
      { label: 'Design system', value: 'design-system', icon: <Icon icon="ph:stack" /> },
    ],
  },
];

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof MultiSelect> = {
  title: 'Components/multi-select',
  component: MultiSelect,
  tags: ['surface-shared'],
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div style={{ width: 420 }}><Story /></div>],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size token (sm=32px, md=40px, lg=48px). Matches Select / TextInput scale. Default `md`.',
    },
    label: {
      control: 'text',
      description: 'Optional label rendered above the dropdown. Forwarded to the internal Select.',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text shown in the dropdown when more options are available.',
    },
    helperText: {
      control: 'text',
      description: 'Hint text under the dropdown. Hidden when `error` is present.',
    },
    error: {
      control: 'text',
      description: 'Error message. Triggers `aria-invalid` on the internal Select.',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Stretch wrapper to its container width. Default `true`.',
    },
    disabled: {
      control: 'boolean',
      description: 'Locks the dropdown and disables Tag remove buttons.',
    },
    tagSize: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Tag size for selected items. Defaults to matching the `size` prop.',
    },
    options: {
      control: false,
      description: 'Array of `MultiSelectOption` ({ label, value, icon? }) or `MultiSelectOptionGroup` ({ label, options }) — entries with an `options` key render as a labelled `<optgroup>`. Mix freely. Set in code; Storybook Controls cannot render a complex array editor usefully.',
    },
    value: {
      control: false,
      description: 'Controlled selected values (array of `value` strings). Pair with `onChange`. Use `defaultValue` for uncontrolled.',
    },
    defaultValue: {
      control: false,
      description: 'Initial selected values for uncontrolled use.',
    },
    onChange: {
      action: 'changed',
      description: 'Called with the full updated array of selected values whenever the selection changes.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof MultiSelect>;

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — single canonical story per ADR-010 §components without
   a variant axis. All variation (size, tagSize, error, disabled,
   helper text, fullWidth) is exposed via Controls. Slot props
   (options, value, defaultValue) are documented but set in code.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Multi-select dropdown with removable Tag chips */
export const Default: Story = {
  args: {
    label: 'Service lines',
    placeholder: 'Select service lines...',
    helperText: 'Choose all services that apply',
    size: 'md',
    fullWidth: true,
    options: serviceOptions,
    defaultValue: ['brand', 'marketing'],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByRole('combobox');
    await expect(select).toBeVisible();
    // Pre-selected Tag chips render below the Select — check the first one is visible.
    await expect(canvas.getByText('Brand Design')).toBeVisible();
    await expect(canvas.getByText('Marketing')).toBeVisible();
  },
};

/** Options segmented under service-line headers — the dropdown renders one
 *  `<optgroup>` per group; selecting from any group adds a chip as usual.
 *  @summary Grouped options under service-line headers */
export const Grouped: Story = {
  args: {
    label: 'Offerings',
    placeholder: 'Select offerings...',
    helperText: 'Grouped by service line',
    size: 'md',
    fullWidth: true,
    options: groupedOfferings,
    defaultValue: ['logo'],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByRole('combobox');
    await expect(select).toBeVisible();
    // <optgroup> labels render as group elements within the native select.
    await expect(canvas.getByRole('group', { name: 'Marketing' })).toBeInTheDocument();
    // Pre-selected option renders as a chip below.
    await expect(canvas.getByText('Logo & identity')).toBeVisible();
  },
};
