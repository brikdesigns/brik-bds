import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { FieldGrid } from './FieldGrid';
import { Field } from '../Field';

/**
 * FieldGrid — equal-column grid for laying out Fields side by side.
 * @summary Equal-column grid for laying out Fields side by side
 */
const meta: Meta<typeof FieldGrid> = {
  title: 'Components/field-grid',
  component: FieldGrid,
  tags: ['surface-product'],
  parameters: { layout: 'padded' },
  argTypes: {
    columns: { control: 'select', options: [2, 3, 4] },
    gap: { control: 'select', options: ['md', 'lg', 'xl'] },
  },
};

export default meta;
type Story = StoryObj<typeof FieldGrid>;

const Frame = ({ width = '540px', children }: { width?: string; children: React.ReactNode }) => (
  <div style={{ width, padding: 'var(--bds-padding-lg)', background: 'var(--bds-surface-primary)' }}>
    {children}
  </div>
);

/** @summary Canonical FieldGrid — flip Controls to change columns + gap */
export const Default: Story = {
  args: {
    columns: 2,
    gap: 'xl',
  },
  render: (args) => (
    <Frame>
      <FieldGrid {...args}>
        <Field label="Owner">Nick Stanerson</Field>
        <Field label="Status">Active</Field>
        <Field label="Industry">Design & Engineering</Field>
        <Field label="Location">Thompson Station, TN</Field>
      </FieldGrid>
    </Frame>
  ),
};

/**
 * `columns` is a maximum: a 4-column grid shows 4 columns at 720px and wider,
 * 3 from 480px, 2 below. Drag the container's bottom-right corner to resize it
 * and watch the grid follow the container, not the viewport.
 * @summary 4-column grid that steps 4 → 3 → 2 as its container narrows
 */
export const Responsive: Story = {
  args: {
    columns: 4,
    gap: 'lg',
  },
  render: (args) => (
    <div
      style={{
        width: '880px',
        minWidth: '240px',
        resize: 'horizontal',
        overflow: 'auto',
        padding: 'var(--bds-padding-lg)',
        background: 'var(--bds-surface-primary)',
        border: 'var(--bds-border-width-md) solid var(--bds-border-muted)',
      }}
    >
      <FieldGrid {...args}>
        <Field label="Owner">Nick Stanerson</Field>
        <Field label="Status">Active</Field>
        <Field label="Industry">Design & Engineering</Field>
        <Field label="Location">Thompson Station, TN</Field>
        <Field label="Plan">Growth</Field>
        <Field label="Term">12 months</Field>
        <Field label="Renewal">Jan 1, 2027</Field>
        <Field label="Billing">Monthly</Field>
      </FieldGrid>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const cells = canvasElement.querySelector('.bds-field-grid__cells') as HTMLElement;
    // 880px minus the frame padding stays past the 720px threshold in every spacing mode.
    await expect(getComputedStyle(cells).gridTemplateColumns.trim().split(/\s+/)).toHaveLength(4);
  },
};

/**
 * `span="full"` takes a Field across every column at every width — for a long
 * value (address, notes) that should not share a row. Other Fields keep one cell.
 * @summary Field span="full" mixed with single-cell Fields
 */
export const FullSpan: Story = {
  args: {
    columns: 3,
    gap: 'lg',
  },
  render: (args) => (
    <Frame width="640px">
      <FieldGrid {...args}>
        <Field label="Owner">Nick Stanerson</Field>
        <Field label="Status">Active</Field>
        <Field label="Industry">Design & Engineering</Field>
        <Field label="Address" span="full">
          1234 Franklin Pike Circle, Suite 200, Thompson Station, TN 37179
        </Field>
        <Field label="Plan">Growth</Field>
        <Field label="Term">12 months</Field>
        <Field label="Renewal">Jan 1, 2027</Field>
      </FieldGrid>
    </Frame>
  ),
  play: async ({ canvasElement }) => {
    const full = canvasElement.querySelector('.bds-field--span-full') as HTMLElement;
    await expect(getComputedStyle(full).gridColumn).toBe('1 / -1');
  },
};
