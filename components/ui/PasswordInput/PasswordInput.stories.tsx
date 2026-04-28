import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { PasswordInput } from './PasswordInput';

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

/* ─── Meta ────────────────────────────────────────────── */

const meta: Meta<typeof PasswordInput> = {
  title: 'Components/Input/password-input',
  component: PasswordInput,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    label: { control: 'text' },
    placeholder: { control: 'text' },
    helperText: { control: 'text' },
    error: { control: 'text' },
    fullWidth: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof PasswordInput>;

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND — Args-based, use Controls panel to explore
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive playground for prop tweaking */
export const Playground: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter password',
  },
};

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS — Sizes, states
   ═══════════════════════════════════════════════════════════════ */

/** @summary All variants side by side */
export const Variants: Story = {
  decorators: [(Story) => <div style={{ width: 400 }}><Story /></div>],
  render: () => (
    <Stack>
      <div>
        <SectionLabel>Sizes</SectionLabel>
        <Stack gap="var(--gap-lg)">
          <PasswordInput size="sm" label="Small" placeholder="Enter password" fullWidth />
          <PasswordInput size="md" label="Medium" placeholder="Enter password" fullWidth />
          <PasswordInput size="lg" label="Large" placeholder="Enter password" fullWidth />
        </Stack>
      </div>

      <div>
        <SectionLabel>States</SectionLabel>
        <Stack gap="var(--gap-lg)">
          <PasswordInput label="With helper text" placeholder="Enter password" helperText="Must be at least 8 characters" fullWidth />
          <PasswordInput label="With error" placeholder="Enter password" error="Password is required" fullWidth />
          <PasswordInput label="Disabled" placeholder="Cannot edit" disabled fullWidth />
        </Stack>
      </div>
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   3. PATTERNS — Login form
   ═══════════════════════════════════════════════════════════════ */

/** @summary Common usage patterns */
export const Patterns: Story = {
  decorators: [(Story) => <div style={{ width: 400 }}><Story /></div>],
  render: () => (
    <Stack>
      <div>
        <SectionLabel>Change password form</SectionLabel>
        <Stack gap="var(--gap-lg)">
          <PasswordInput label="Current password" name="current-password" autoComplete="current-password" placeholder="Enter current password" fullWidth />
          <PasswordInput label="New password" name="new-password" autoComplete="new-password" placeholder="Enter new password" helperText="Must be at least 8 characters" fullWidth />
          <PasswordInput label="Confirm password" name="confirm-password" autoComplete="new-password" placeholder="Re-enter new password" fullWidth />
        </Stack>
      </div>
    </Stack>
  ),
};
