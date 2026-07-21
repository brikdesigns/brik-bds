import React from 'react';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stepper } from './Stepper';

/* ─── Layout Helpers (story-only) ─────────────────────────────── */

const Stack = ({ children, gap = 'var(--gap-xl)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap, alignItems: 'center' }}>{children}</div>
);

const Row = ({ children, gap = 'var(--gap-xl)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap, alignItems: 'center' }}>{children}</div>
);

/* ─── Meta ────────────────────────────────────────────── */

const meta: Meta<typeof Stepper> = {
  title: 'Components/stepper',
  component: Stepper,
  tags: ['surface-product'],
  parameters: { layout: 'centered' },
  argTypes: {
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

/* ═══════════════════════════════════════════════════════════════
   2. SIZES — axis-only gallery (sm / md / lg)
   ═══════════════════════════════════════════════════════════════ */

/** @summary All three sizes side by side */
export const Sizes: Story = {
  args: { value: 1, onChange: () => {} },
  render: () => (
    <Row>
      <Stepper value={3} onChange={() => {}} size="sm" min={0} max={10} />
      <Stepper value={5} onChange={() => {}} size="md" min={0} max={10} />
      <Stepper value={7} onChange={() => {}} size="lg" min={0} max={10} />
    </Row>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   3. QUANTITY SELECTOR — real-world composition (default step)
   ═══════════════════════════════════════════════════════════════ */

/** @summary Quantity selector with live item count */
export const QuantitySelector: Story = {
  args: { value: 1, onChange: () => {} },
  render: () => {
    function Demo() {
      const [qty, setQty] = useState(1);
      return (
        <Stack gap="var(--gap-md)">
          <Stepper value={qty} onChange={setQty} min={1} max={99} size="lg" />
          <span style={{
            fontFamily: 'var(--font-family-body)',
            fontSize: 'var(--body-sm)',
            color: 'var(--text-secondary)',
          }}>
            {qty} {qty === 1 ? 'item' : 'items'} in cart
          </span>
        </Stack>
      );
    }
    return <Demo />;
  },
};

/* ═══════════════════════════════════════════════════════════════
   4. BUDGET CONTROL — real-world composition (custom step)
   ═══════════════════════════════════════════════════════════════ */

/** @summary Budget control with a custom $10 step */
export const BudgetControl: Story = {
  args: { value: 1, onChange: () => {} },
  render: () => {
    function Demo() {
      const [budget, setBudget] = useState(50);
      return (
        <Stack gap="var(--gap-md)">
          <Stepper value={budget} onChange={setBudget} step={10} min={0} max={500} size="md" />
          <span style={{
            fontFamily: 'var(--font-family-body)',
            fontSize: 'var(--body-sm)',
            color: 'var(--text-secondary)',
          }}>
            ${budget}
          </span>
        </Stack>
      );
    }
    return <Demo />;
  },
};
