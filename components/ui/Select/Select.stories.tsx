import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within, fn } from 'storybook/test';
import { Icon } from '@iconify/react';
import { Select } from './Select';

/**
 * Select — single-select dropdown rendered as a native `<select>` element.
 * Supports flat options, grouped options, helper/error states, and three sizes.
 * For richer multi-select use `MultiSelect`.
 * @summary Native single-select dropdown
 */
const meta: Meta<typeof Select> = {
  title: 'Components/Form/select',
  component: Select,
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div style={{ width: 360 }}><Story /></div>],
  argTypes: {
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    fullWidth: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

const basicOptions = [
  { label: 'First choice', value: 'first' },
  { label: 'Second choice', value: 'second' },
  { label: 'Third choice', value: 'third' },
];

const groupedOptions = [
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

/** Args-driven sandbox. Includes a select-option interaction test.
 *  @summary Live playground with interaction test */
export const Playground: Story = {
  args: {
    placeholder: 'Select one...',
    options: basicOptions,
    label: 'Choice',
    size: 'md',
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByRole('combobox');
    await expect(select).toBeVisible();
    await userEvent.selectOptions(select, 'second');
    await expect(args.onChange).toHaveBeenCalled();
    await expect(select).toHaveValue('second');
  },
};

/* ─── Sizes ──────────────────────────────────────────────────── */

/** Small (sm).
 *  @summary Small size */
export const Small: Story = {
  args: { size: 'sm', placeholder: 'Small', options: basicOptions, icon: <Icon icon="ph:tag" /> },
};

/** Medium (md) — default size.
 *  @summary Medium size (default) */
export const Medium: Story = {
  args: { size: 'md', placeholder: 'Medium', options: basicOptions, icon: <Icon icon="ph:tag" /> },
};

/** Large (lg).
 *  @summary Large size */
export const Large: Story = {
  args: { size: 'lg', placeholder: 'Large', options: basicOptions, icon: <Icon icon="ph:tag" /> },
};

/* ─── States ─────────────────────────────────────────────────── */

/** With label and leading icon — common form-field shape.
 *  @summary Select with label and icon */
export const WithLabelAndIcon: Story = {
  args: {
    label: 'Company',
    placeholder: 'Select company...',
    options: [
      { label: 'Acme Corp', value: 'acme' },
      { label: 'Globex Inc', value: 'globex' },
      { label: 'Initech', value: 'initech' },
    ],
    icon: <Icon icon="ph:buildings" />,
  },
};

/** With default value — pre-selected option.
 *  @summary Select with default value */
export const WithDefaultValue: Story = {
  args: { placeholder: 'Select one...', options: basicOptions, defaultValue: 'second' },
};

/** Error state — `error` overrides the helper line.
 *  @summary Select with error */
export const WithError: Story = {
  args: {
    label: 'Region',
    placeholder: 'Select region...',
    options: [
      { label: 'North America', value: 'na' },
      { label: 'Europe', value: 'eu' },
      { label: 'Asia Pacific', value: 'apac' },
    ],
    error: 'Please select a region',
    icon: <Icon icon="ph:globe" />,
  },
};

/** Disabled — non-interactive.
 *  @summary Disabled select */
export const Disabled: Story = {
  args: { placeholder: 'Select one...', options: basicOptions, disabled: true },
};

/* ─── Content shapes ─────────────────────────────────────────── */

/** Option groups — group options under headers using `{ label, options[] }`.
 *  @summary Select with option groups */
export const OptionGroups: Story = {
  args: {
    label: 'Location',
    placeholder: 'Select a city...',
    options: groupedOptions,
    icon: <Icon icon="ph:globe" />,
  },
};
