import React from 'react';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Slider } from './Slider';

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
  <div style={{ display: 'flex', flexDirection: 'column', gap }}>{children}</div>
);

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof Slider> = {
  title: 'Components/Control/slider',
  component: Slider,
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    showValue: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND — Args-based, use Controls panel to explore
   ═══════════════════════════════════════════════════════════════ */

export const Playground: Story = {
  render: (args) => {
    const [value, setValue] = useState(50);
    return (
      <div style={{ width: 320 }}>
        <Slider {...args} value={value} onChange={setValue} />
      </div>
    );
  },
  args: {
    label: 'Volume',
    showValue: true,
    min: 0,
    max: 100,
    size: 'md',
  },
};

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS — Sizes, custom range, disabled
   ═══════════════════════════════════════════════════════════════ */

export const Variants: Story = {
  render: () => {
    function SizeDemo() {
      const [sm, setSm] = useState(30);
      const [md, setMd] = useState(50);
      const [lg, setLg] = useState(70);
      return (
        <div>
          <SectionLabel>Sizes</SectionLabel>
          <div style={{ width: 320 }}>
            <Stack gap="var(--gap-lg)">
              <Slider label="Small" size="sm" value={sm} onChange={setSm} showValue />
              <Slider label="Medium" size="md" value={md} onChange={setMd} showValue />
              <Slider label="Large" size="lg" value={lg} onChange={setLg} showValue />
            </Stack>
          </div>
        </div>
      );
    }

    function CustomRangeDemo() {
      const [value, setValue] = useState(25);
      return (
        <div>
          <SectionLabel>Custom range (10–200, step 5)</SectionLabel>
          <div style={{ width: 320 }}>
            <Slider label="Price range" value={value} onChange={setValue} min={10} max={200} step={5} showValue />
          </div>
        </div>
      );
    }

    return (
      <Stack>
        <SizeDemo />
        <CustomRangeDemo />
        <div>
          <SectionLabel>Disabled</SectionLabel>
          <div style={{ width: 320 }}>
            <Slider label="Disabled" value={40} disabled showValue />
          </div>
        </div>
      </Stack>
    );
  },
};

/* ═══════════════════════════════════════════════════════════════
   3. PATTERNS — Real-world usage
   ═══════════════════════════════════════════════════════════════ */

export const Patterns: Story = {
  render: () => {
    function AudioSettings() {
      const [volume, setVolume] = useState(75);
      const [bass, setBass] = useState(50);
      const [treble, setTreble] = useState(60);

      return (
        <div>
          <SectionLabel>Audio settings</SectionLabel>
          <div style={{ width: 300 }}>
            <Stack gap="var(--gap-lg)">
              <Slider label="Volume" size="md" value={volume} onChange={setVolume} showValue />
              <Slider label="Bass" size="sm" value={bass} onChange={setBass} showValue />
              <Slider label="Treble" size="sm" value={treble} onChange={setTreble} showValue />
            </Stack>
          </div>
        </div>
      );
    }

    function BudgetFilter() {
      const [budget, setBudget] = useState(500);
      return (
        <div>
          <SectionLabel>Budget filter</SectionLabel>
          <div style={{ width: 280 }}>
            <Slider
              label="Max budget"
              size="md"
              value={budget}
              onChange={setBudget}
              min={100}
              max={5000}
              step={100}
              showValue
            />
          </div>
        </div>
      );
    }

    return (
      <Stack>
        <AudioSettings />
        <BudgetFilter />
      </Stack>
    );
  },
};
