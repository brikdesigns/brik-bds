import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from './Checkbox';

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

const Row = ({ children, gap = 'var(--padding-sm)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', gap, flexWrap: 'wrap', alignItems: 'center' }}>{children}</div>
);

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Form/checkbox',
  component: Checkbox,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
  argTypes: {
    label: { control: 'text' },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND — Args-based, use Controls panel to explore
   ═══════════════════════════════════════════════════════════════ */

export const Playground: Story = {
  args: {
    label: 'Accept terms and conditions',
  },
};

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS — States grid
   ═══════════════════════════════════════════════════════════════ */

export const Variants: Story = {
  render: () => (
    <Stack>
      <div>
        <SectionLabel>States</SectionLabel>
        <Stack gap="var(--gap-md)">
          <Checkbox label="Unchecked" />
          <Checkbox label="Checked" defaultChecked />
          <Checkbox label="Disabled" disabled />
          <Checkbox label="Disabled checked" disabled defaultChecked />
        </Stack>
      </div>

      <div>
        <SectionLabel>Group</SectionLabel>
        <Stack gap="var(--gap-md)">
          <Checkbox label="Hero section" />
          <Checkbox label="1-Column layout" />
          <Checkbox label="2-Column layout" defaultChecked />
          <Checkbox label="3-Column layout" />
          <Checkbox label="CTA section" defaultChecked />
          <Checkbox label="Navigation bar" />
        </Stack>
      </div>
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   3. PATTERNS — Real-world compositions
   ═══════════════════════════════════════════════════════════════ */

export const Patterns: Story = {
  render: () => (
    <Stack gap="var(--gap-huge)">
      {/* Settings panel */}
      <div style={{
        maxWidth: '360px',
        padding: 'var(--padding-lg)',
        border: 'var(--border-width-md) solid var(--border-secondary)',
        borderRadius: 'var(--border-radius-lg)',
      }}>
        <SectionLabel>Notification preferences</SectionLabel>
        <Stack gap="var(--gap-md)">
          <Checkbox label="Email notifications" defaultChecked />
          <Checkbox label="Push notifications" defaultChecked />
          <Checkbox label="SMS alerts" />
          <Checkbox label="Weekly digest" defaultChecked />
        </Stack>
      </div>

      {/* Terms acceptance */}
      <div>
        <SectionLabel>Terms acceptance</SectionLabel>
        <Row gap="var(--gap-lg)">
          <Checkbox label="I agree to the Terms of Service" />
        </Row>
      </div>
    </Stack>
  ),
};
