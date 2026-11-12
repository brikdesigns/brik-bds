import React from 'react';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Stepper } from './Stepper';

/* ─── Layout Helpers (story-only) ─────────────────────────────── */

const Stack = ({ children, gap = 'var(--bds-gap-xl)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap, alignItems: 'center' }}>{children}</div>
);

/* ─── Meta ────────────────────────────────────────────── */

const meta: Meta<typeof Stepper> = {
  title: 'Components/stepper',
  component: Stepper,
  tags: ['surface-product'],
  parameters: { layout: 'centered' },
  argTypes: {
    value: { control: false, description: 'Current value.' },
    onChange: { control: false, description: 'Change handler.' },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
  },
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ═══════════════════════════════════════════════════════════════
   1. DEFAULT — Args-based, use Controls panel to explore
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive playground for prop tweaking */
export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState(1);
    return <Stepper {...args} value={value} onChange={setValue} />;
  },
  args: {
    min: 0,
    max: 10,
    size: 'md',
    value: 1,
    onChange: () => {},
  },
};

/* `size` is a Control on Default — the size scale lives in Stepper.mdx as a
   docs-local demo (#1489). */

/* ═══════════════════════════════════════════════════════════════
   2. QUANTITY SELECTOR — real-world composition (value + live readout).
      Custom `step` is a Control on Default (#2145).
   ═══════════════════════════════════════════════════════════════ */

/** @summary Quantity selector with live item count */
export const QuantitySelector: Story = {
  args: { value: 1, onChange: () => {} },
  render: () => {
    function Demo() {
      const [qty, setQty] = useState(1);
      return (
        <Stack gap="var(--bds-gap-md)">
          <Stepper value={qty} onChange={setQty} min={1} max={99} size="lg" />
          <span style={{
            fontFamily: 'var(--bds-font-family-body)',
            fontSize: 'var(--bds-body-sm)',
            color: 'var(--bds-text-secondary)',
          }}>
            {qty} {qty === 1 ? 'item' : 'items'} in cart
          </span>
        </Stack>
      );
    }
    return <Demo />;
  },
};

/**
 * Guards the spinbutton contract: value semantics, arrow/page/home/end keys
 * clamped to [min, max], and the two buttons still work (#1375).
 *
 * @summary Verifies spinbutton role, aria-value*, and keyboard stepping
 */
export const InteractionTestSpinbutton: Story = {
  tags: ['!manifest', 'interaction-test'],
  render: (args) => {
    const [value, setValue] = useState(5);
    return <Stepper {...args} value={value} onChange={setValue} />;
  },
  args: { min: 0, max: 20, step: 1, value: 5, onChange: () => {} },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const spin = canvas.getByRole('spinbutton');
    await expect(spin).toHaveAttribute('aria-valuenow', '5');
    await expect(spin).toHaveAttribute('aria-valuemin', '0');
    await expect(spin).toHaveAttribute('aria-valuemax', '20');
    spin.focus();
    await userEvent.keyboard('{ArrowUp}');
    await expect(spin).toHaveAttribute('aria-valuenow', '6');
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    await expect(spin).toHaveAttribute('aria-valuenow', '4');
    await userEvent.keyboard('{PageUp}');
    await expect(spin).toHaveAttribute('aria-valuenow', '14');
    await userEvent.keyboard('{PageUp}');
    await expect(spin).toHaveAttribute('aria-valuenow', '20');
    await userEvent.keyboard('{Home}');
    await expect(spin).toHaveAttribute('aria-valuenow', '0');
    await userEvent.keyboard('{ArrowDown}');
    await expect(spin).toHaveAttribute('aria-valuenow', '0');
    await userEvent.keyboard('{End}');
    await expect(spin).toHaveAttribute('aria-valuenow', '20');
    await userEvent.click(canvas.getByRole('button', { name: 'Decrease' }));
    await expect(spin).toHaveAttribute('aria-valuenow', '19');
  },
};

/**
 * Disabled stepper: spinbutton is not focusable, keys do nothing, and an
 * unbounded `max` omits `aria-valuemax`.
 *
 * @summary Verifies disabled and unbounded-max behavior
 */
export const InteractionTestSpinbuttonDisabled: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: { min: 0, value: 3, disabled: true, onChange: () => { throw new Error('onChange must not fire while disabled'); } },
  play: async ({ canvasElement }) => {
    const spin = within(canvasElement).getByRole('spinbutton');
    await expect(spin).toHaveAttribute('aria-disabled', 'true');
    await expect(spin).not.toHaveAttribute('aria-valuemax');
    spin.focus();
    await userEvent.keyboard('{ArrowUp}{End}');
    await expect(spin).toHaveAttribute('aria-valuenow', '3');
  },
};
