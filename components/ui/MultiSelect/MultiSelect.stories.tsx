import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '@iconify/react';
import { MultiSelect } from './MultiSelect';

/**
 * MultiSelect — multi-select dropdown with chip-style display of selected values.
 * Each option supports an optional leading icon. Three sizes match Select.
 * @summary Multi-select with chip display
 */
const meta: Meta<typeof MultiSelect> = {
  title: 'Components/Form/multi-select',
  component: MultiSelect,
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div style={{ maxWidth: 480 }}><Story /></div>],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    label: { control: 'text' },
    placeholder: { control: 'text' },
    helperText: { control: 'text' },
    error: { control: 'text' },
    disabled: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof MultiSelect>;

const serviceOptions = [
  { label: 'Brand Design', value: 'brand', icon: <Icon icon="ph:paint-brush" /> },
  { label: 'Marketing', value: 'marketing', icon: <Icon icon="ph:megaphone" /> },
  { label: 'Information Design', value: 'information', icon: <Icon icon="ph:info" /> },
  { label: 'Product Design', value: 'product', icon: <Icon icon="ph:cube" /> },
  { label: 'Service Design', value: 'service', icon: <Icon icon="ph:gear" /> },
];

/** Args-driven sandbox.
 *  @summary Live playground with all controls */
export const Playground: Story = {
  args: {
    label: 'Service lines',
    placeholder: 'Select service lines...',
    options: serviceOptions,
  },
};

/* ─── Sizes ──────────────────────────────────────────────────── */

/** Small (sm).
 *  @summary Small size */
export const Small: Story = {
  args: { size: 'sm', label: 'Small', placeholder: 'Select...', options: serviceOptions, value: ['brand'] },
};

/** Medium (md) — default size.
 *  @summary Medium size (default) */
export const Medium: Story = {
  args: { size: 'md', label: 'Medium', placeholder: 'Select...', options: serviceOptions, value: ['brand', 'marketing'] },
};

/** Large (lg).
 *  @summary Large size */
export const Large: Story = {
  args: { size: 'lg', label: 'Large', placeholder: 'Select...', options: serviceOptions, value: ['brand', 'marketing', 'product'] },
};

/* ─── States ─────────────────────────────────────────────────── */

/** With pre-selected values — chips render for each selected option.
 *  @summary Pre-selected values */
export const WithSelection: Story = {
  args: {
    label: 'Service lines',
    placeholder: 'Select...',
    options: serviceOptions,
    value: ['brand', 'marketing'],
  },
};

/** Helper text under the field.
 *  @summary With helper text */
export const WithHelperText: Story = {
  args: {
    label: 'Service lines',
    placeholder: 'Select...',
    options: serviceOptions,
    helperText: 'Choose all services that apply',
  },
};

/** Error state — `error` overrides the helper line.
 *  @summary With error */
export const WithError: Story = {
  args: {
    label: 'Required',
    placeholder: 'Select at least one...',
    options: serviceOptions,
    value: [],
    error: 'Please select at least one service',
  },
};

/** Disabled — non-interactive.
 *  @summary Disabled multi-select */
export const Disabled: Story = {
  args: { label: 'Disabled', placeholder: 'Select...', options: serviceOptions, value: ['brand', 'marketing'], disabled: true },
};

/* ─── Interactive ────────────────────────────────────────────── */

/** Live editing — `useState` drives the selected values. Render is required for
 *  the controlled-state demo.
 *  @summary Interactive multi-select */
export const Interactive: Story = {
  args: { options: serviceOptions, label: 'Service lines' },
  render: () => {
    const Demo = () => {
      const [values, setValues] = useState<string[]>(['brand']);
      return (
        <MultiSelect
          label="Service lines"
          placeholder="Select service lines..."
          options={serviceOptions}
          value={values}
          onChange={setValues}
          helperText={`${values.length} selected`}
        />
      );
    };
    return <Demo />;
  },
};
