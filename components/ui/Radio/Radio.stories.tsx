import React from 'react';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Radio } from './Radio';

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

const Row = ({ children, gap = 'var(--gap-lg)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap, alignItems: 'center' }}>{children}</div>
);

/* ─── Meta ────────────────────────────────────────────── */

const meta = {
  title: 'Components/Form/radio',
  component: Radio,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND — Args-based, use Controls panel to explore
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive playground for prop tweaking */
export const Playground: Story = {
  args: {
    label: 'Option 1',
    name: 'playground',
    value: 'option1',
  },
};

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS — States: default, checked, disabled
   ═══════════════════════════════════════════════════════════════ */

/** @summary All variants side by side */
export const Variants: Story = {
  args: { label: 'Option', name: 'variants', value: 'v' },
  render: () => (
    <Stack>
      <div>
        <SectionLabel>States</SectionLabel>
        <Stack gap="var(--gap-md)">
          <Radio name="states" value="default" label="Default" />
          <Radio name="states" value="checked" label="Checked" defaultChecked />
          <Radio name="states-disabled" value="disabled" label="Disabled" disabled />
          <Radio name="states-disabled-checked" value="disabled-checked" label="Disabled checked" disabled checked />
        </Stack>
      </div>

      <div>
        <SectionLabel>Horizontal group</SectionLabel>
        <Row gap="var(--gap-lg)">
          <Radio name="horizontal" value="a" label="Option A" defaultChecked />
          <Radio name="horizontal" value="b" label="Option B" />
          <Radio name="horizontal" value="c" label="Option C" />
        </Row>
      </div>
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   3. PATTERNS — Plan selection + theme selection
   ═══════════════════════════════════════════════════════════════ */

/** @summary Common usage patterns */
export const Patterns: Story = {
  args: { label: 'Option', name: 'patterns', value: 'p' },
  render: () => {
    function RadioPatterns() {
      const [plan, setPlan] = useState('pro');
      const [theme, setTheme] = useState('theme3');

      return (
        <Stack>
          <div>
            <SectionLabel>Plan selection</SectionLabel>
            <Stack gap="var(--gap-md)">
              {[
                { value: 'basic', label: 'Basic Plan - $9/month' },
                { value: 'pro', label: 'Pro Plan - $29/month' },
                { value: 'enterprise', label: 'Enterprise - Custom pricing' },
              ].map((opt) => (
                <Radio
                  key={opt.value}
                  name="plan"
                  value={opt.value}
                  label={opt.label}
                  checked={plan === opt.value}
                  onChange={(e) => setPlan(e.target.value)}
                />
              ))}
            </Stack>
          </div>

          <div>
            <SectionLabel>Theme selection</SectionLabel>
            <Stack gap="var(--gap-md)">
              {Array.from({ length: 8 }, (_, i) => `theme${i + 1}`).map((t) => (
                <Radio
                  key={t}
                  name="theme"
                  value={t}
                  label={`Theme ${t.replace('theme', '')}`}
                  checked={theme === t}
                  onChange={(e) => setTheme(e.target.value)}
                />
              ))}
            </Stack>
          </div>
        </Stack>
      );
    }
    return <RadioPatterns />;
  },
};
