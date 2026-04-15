import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { EmailInput } from './EmailInput';
import { PasswordInput } from '../PasswordInput/PasswordInput';

/* --- Layout Helpers (story-only) --- */

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

/* --- Meta --- */

const meta: Meta<typeof EmailInput> = {
  title: 'Components/Input/email-input',
  component: EmailInput,
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
type Story = StoryObj<typeof EmailInput>;

/* ===================================================================
   1. PLAYGROUND
   =================================================================== */

export const Playground: Story = {
  args: {
    label: 'Email',
    placeholder: 'you@example.com',
  },
};

/* ===================================================================
   2. VARIANTS — Sizes, states
   =================================================================== */

export const Variants: Story = {
  decorators: [(Story) => <div style={{ width: 400 }}><Story /></div>],
  render: () => (
    <Stack>
      <div>
        <SectionLabel>Sizes</SectionLabel>
        <Stack gap="var(--gap-lg)">
          <EmailInput size="sm" label="Small" placeholder="you@example.com" fullWidth />
          <EmailInput size="md" label="Medium" placeholder="you@example.com" fullWidth />
          <EmailInput size="lg" label="Large" placeholder="you@example.com" fullWidth />
        </Stack>
      </div>

      <div>
        <SectionLabel>States</SectionLabel>
        <Stack gap="var(--gap-lg)">
          <EmailInput label="With helper text" placeholder="you@example.com" helperText="We'll never share your email" fullWidth />
          <EmailInput label="With error" placeholder="you@example.com" error="Invalid email address" fullWidth />
          <EmailInput label="Disabled" placeholder="cannot edit" disabled fullWidth />
        </Stack>
      </div>
    </Stack>
  ),
};

/* ===================================================================
   3. PATTERNS — Login form pairing
   =================================================================== */

export const Patterns: Story = {
  decorators: [(Story) => <div style={{ width: 400 }}><Story /></div>],
  render: () => (
    <Stack>
      <div>
        <SectionLabel>Login form</SectionLabel>
        <Stack gap="var(--gap-lg)">
          <EmailInput label="Email" placeholder="you@example.com" autoComplete="email" fullWidth />
          <PasswordInput label="Password" placeholder="Enter password" autoComplete="current-password" fullWidth />
        </Stack>
      </div>

      <div>
        <SectionLabel>Newsletter signup</SectionLabel>
        <EmailInput label="Email address" placeholder="Enter your email" fullWidth />
      </div>
    </Stack>
  ),
};
