import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextInput } from './TextInput';
import { Icon } from '@iconify/react';

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

const Row = ({ children, gap = 'var(--padding-sm)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', gap, flexWrap: 'wrap', alignItems: 'flex-start' }}>{children}</div>
);

const Stack = ({ children, gap = 'var(--gap-xl)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap }}>{children}</div>
);

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof TextInput> = {
  title: 'Components/Form/text-input',
  component: TextInput,
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    label: { control: 'text' },
    placeholder: { control: 'text' },
    helperText: { control: 'text' },
    error: { control: 'text' },
    fullWidth: { control: 'boolean' },
    disabled: { control: 'boolean' },
    type: { control: 'select', options: ['text', 'email', 'password', 'number', 'tel', 'url'] },
  },
};

export default meta;
type Story = StoryObj<typeof TextInput>;

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND — Args-based, use Controls panel to explore
   ═══════════════════════════════════════════════════════════════ */

export const Playground: Story = {
  args: {
    label: 'Email address',
    placeholder: 'you@example.com',
    type: 'email',
    size: 'md',
  },
};

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS — Sizes, states, icons, and types
   ═══════════════════════════════════════════════════════════════ */

export const Variants: Story = {
  render: () => (
    <div style={{ width: 480 }}>
      <Stack>
        {/* Sizes */}
        <div>
          <SectionLabel>Sizes</SectionLabel>
          <Stack gap="var(--gap-lg)">
            <TextInput size="sm" label="Small (sm)" placeholder="14px text" fullWidth />
            <TextInput size="md" label="Medium (md)" placeholder="16px text — default" fullWidth />
            <TextInput size="lg" label="Large (lg)" placeholder="18px text" fullWidth />
          </Stack>
        </div>

        {/* States */}
        <div>
          <SectionLabel>States</SectionLabel>
          <Stack gap="var(--gap-lg)">
            <TextInput label="Default" placeholder="Enter text..." fullWidth />
            <TextInput label="Helper text" placeholder="Enter password" helperText="Must be at least 8 characters" type="password" fullWidth />
            <TextInput label="Error" placeholder="you@example.com" error="Please enter a valid email" defaultValue="invalid-email" fullWidth />
            <TextInput label="Disabled" placeholder="Cannot edit" disabled fullWidth />
          </Stack>
        </div>

        {/* With icons */}
        <div>
          <SectionLabel>With icons</SectionLabel>
          <Stack gap="var(--gap-lg)">
            <TextInput label="Icon before" placeholder="you@example.com" iconBefore={<Icon icon="ph:envelope" />} fullWidth />
            <TextInput label="Icon after" placeholder="Enter name" iconAfter={<Icon icon="ph:user" />} fullWidth />
          </Stack>
        </div>

        {/* Input types */}
        <div>
          <SectionLabel>Input types</SectionLabel>
          <Stack gap="var(--gap-lg)">
            <TextInput label="Text" type="text" placeholder="Plain text" fullWidth />
            <TextInput label="Email" type="email" placeholder="email@example.com" fullWidth />
            <TextInput label="Password" type="password" placeholder="••••••••" fullWidth />
            <TextInput label="Number" type="number" placeholder="0" fullWidth />
          </Stack>
        </div>
      </Stack>
    </div>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   3. PATTERNS — Real-world form layouts
   ═══════════════════════════════════════════════════════════════ */

export const Patterns: Story = {
  render: () => (
    <Row gap="var(--padding-xl)">
      {/* Contact form */}
      <div style={{ width: 350 }}>
        <SectionLabel>Contact form</SectionLabel>
        <Stack gap="var(--gap-lg)">
          <TextInput label="First name" placeholder="John" fullWidth />
          <TextInput label="Last name" placeholder="Doe" fullWidth />
          <TextInput label="Email" type="email" placeholder="john@example.com" iconBefore={<Icon icon="ph:envelope" />} fullWidth />
          <TextInput label="Phone" type="tel" placeholder="(555) 123-4567" helperText="We'll only contact you about your order" fullWidth />
        </Stack>
      </div>

      {/* Login form */}
      <div style={{ width: 320 }}>
        <SectionLabel>Login form</SectionLabel>
        <Stack gap="var(--gap-lg)">
          <TextInput label="Email" type="email" placeholder="you@example.com" iconBefore={<Icon icon="ph:envelope" />} fullWidth />
          <TextInput label="Password" type="password" placeholder="••••••••" iconBefore={<Icon icon="ph:lock" />} fullWidth />
        </Stack>
      </div>
    </Row>
  ),
};
