import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import { DependentSelect, type DependentChildOption } from './DependentSelect';

/* ─── Sample data ─────────────────────────────────────────────── */

const serviceLines = [
  { label: 'Brand', value: 'brand' },
  { label: 'Marketing', value: 'marketing' },
  { label: 'Product', value: 'product' },
];

// Every service, each tagged with the line it belongs to.
const services: DependentChildOption[] = [
  { label: 'Logo & identity', value: 'logo', service_line_id: 'brand' },
  { label: 'Brand guidelines', value: 'guidelines', service_line_id: 'brand' },
  { label: 'Campaign design', value: 'campaign', service_line_id: 'marketing' },
  { label: 'Social templates', value: 'social', service_line_id: 'marketing' },
  { label: 'UI design', value: 'ui', service_line_id: 'product' },
  { label: 'Design system', value: 'design-system', service_line_id: 'product' },
];

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof DependentSelect> = {
  title: 'Components/dependent-select',
  component: DependentSelect,
  tags: ['surface-shared'],
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div style={{ width: 420 }}><Story /></div>],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size applied to both selects (sm=32px, md=40px, lg=48px). Default `md`.',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable both the parent and child selects.',
    },
    parent: {
      control: false,
      description: 'Parent (driving) select config: `{ label, options, value, onChange, placeholder }`. Keep controlled so the child filters on parent change. Set in code.',
    },
    child: {
      control: false,
      description: 'Child (dependent) select config: `{ label, options, parentKey, value, onChange, multiple? }`. `options` is the full set; each option carries the parent value under `parentKey`. Set in code.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof DependentSelect>;

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — multi-select child. Hook-driven (Q4): the cascade needs
   controlled parent + child state to demonstrate the filtering +
   cumulative-selection behavior args alone can't express.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Cascading service-line → services (multi child) */
export const Default: Story = {
  render: (args) => {
    function Cascade() {
      const [lineId, setLineId] = useState('');
      const [serviceIds, setServiceIds] = useState<string[]>([]);
      return (
        <DependentSelect
          {...args}
          parent={{
            label: 'Service line',
            placeholder: 'All service lines',
            options: serviceLines,
            value: lineId,
            onChange: setLineId,
          }}
          child={{
            label: 'Services',
            placeholder: 'Select services...',
            helperText: 'Filtered by the selected service line',
            options: services,
            parentKey: 'service_line_id',
            value: serviceIds,
            onChange: setServiceIds,
            multiple: true,
          }}
        />
      );
    }
    return <Cascade />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [parent, child] = canvas.getAllByRole('combobox');
    await expect(parent).toBeVisible();
    await expect(child).toBeVisible();

    // No parent selected → child offers every service.
    await expect(within(child).getByRole('option', { name: 'Campaign design' })).toBeInTheDocument();

    // Pick a parent line → child options narrow to that line.
    await userEvent.selectOptions(parent, 'brand');
    await waitFor(() =>
      expect(within(child).queryByRole('option', { name: 'Campaign design' })).not.toBeInTheDocument(),
    );
    await expect(within(child).getByRole('option', { name: 'Logo & identity' })).toBeInTheDocument();
  },
};

/* ═══════════════════════════════════════════════════════════════
   SINGLE CHILD — single-select child (the multiple={false} axis).
   ═══════════════════════════════════════════════════════════════ */

/** @summary Cascading parent → single child select */
export const SingleChild: Story = {
  render: (args) => {
    function Cascade() {
      const [lineId, setLineId] = useState('');
      const [serviceId, setServiceId] = useState('');
      return (
        <DependentSelect
          {...args}
          parent={{
            label: 'Service line',
            placeholder: 'All service lines',
            options: serviceLines,
            value: lineId,
            onChange: setLineId,
          }}
          child={{
            label: 'Service',
            placeholder: 'Select a service...',
            options: services,
            parentKey: 'service_line_id',
            value: serviceId,
            onChange: setServiceId,
          }}
        />
      );
    }
    return <Cascade />;
  },
};
