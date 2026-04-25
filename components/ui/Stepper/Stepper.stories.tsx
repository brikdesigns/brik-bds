import React from 'react';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stepper } from './Stepper';

/* ─── Layout Helpers (story-only) ─────────────────────────────── */

const SectionLabel = ({ children }: { children: string }) => (
  <div style={{
    fontFamily: 'var(--font-family-label)',
    fontSize: 'var(--body-xs)', // bds-lint-ignore
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: 'var(--gap-md)',
    color: 'var(--text-muted)',
  }}>
    {children}
  </div>
);

const Stack = ({ children, gap = 'var(--gap-xl)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap, alignItems: 'center' }}>{children}</div>
);

const Row = ({ children, gap = 'var(--gap-xl)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap, alignItems: 'center' }}>{children}</div>
);

/* ─── Meta ────────────────────────────────────────────── */

const meta: Meta<typeof Stepper> = {
  title: 'Components/Control/stepper',
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
   1. PLAYGROUND — Args-based, use Controls panel to explore
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive playground for prop tweaking */
export const Playground: Story = {
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
   2. VARIANTS — Sizes, bounds, disabled
   ═══════════════════════════════════════════════════════════════ */

/** @summary All variants side by side */
export const Variants: Story = {
  args: { value: 1, onChange: () => {} },
  render: () => {
    function StepperVariants() {
      const [sm, setSm] = useState(3);
      const [md, setMd] = useState(5);
      const [lg, setLg] = useState(7);
      const [bounded, setBounded] = useState(1);

      return (
        <Stack>
          <div>
            <SectionLabel>Sizes</SectionLabel>
            <Row>
              <Stepper value={sm} onChange={setSm} size="sm" min={0} max={10} />
              <Stepper value={md} onChange={setMd} size="md" min={0} max={10} />
              <Stepper value={lg} onChange={setLg} size="lg" min={0} max={10} />
            </Row>
          </div>

          <div>
            <SectionLabel>With bounds (1-5)</SectionLabel>
            <Stepper value={bounded} onChange={setBounded} min={1} max={5} />
          </div>

          <div>
            <SectionLabel>Disabled</SectionLabel>
            <Stepper value={3} onChange={() => {}} disabled />
          </div>
        </Stack>
      );
    }
    return <StepperVariants />;
  },
};

/* ═══════════════════════════════════════════════════════════════
   3. PATTERNS — Quantity selector + custom step
   ═══════════════════════════════════════════════════════════════ */

/** @summary Common usage patterns */
export const Patterns: Story = {
  args: { value: 1, onChange: () => {} },
  render: () => {
    function StepperPatterns() {
      const [qty, setQty] = useState(1);
      const [budget, setBudget] = useState(50);

      return (
        <Stack>
          <div>
            <SectionLabel>Quantity selector</SectionLabel>
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
          </div>

          <div>
            <SectionLabel>Budget (step: $10)</SectionLabel>
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
          </div>
        </Stack>
      );
    }
    return <StepperPatterns />;
  },
};
