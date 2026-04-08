import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within, fn } from 'storybook/test';
import { Switch } from './Switch';

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

const meta: Meta<typeof Switch> = {
  title: 'Components/Control/switch',
  component: Switch,
  parameters: { layout: 'padded' },
  argTypes: {
    label: { control: 'text' },
    size: { control: 'radio', options: ['lg', 'md', 'sm'] },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND — Args-based, use Controls panel to explore
   ═══════════════════════════════════════════════════════════════ */

export const Playground: Story = {
  args: {
    label: 'Enable feature',
    size: 'lg',
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('switch');

    await expect(toggle).toBeVisible();
    await expect(toggle).not.toBeChecked();
    await userEvent.click(toggle);
    await expect(args.onChange).toHaveBeenCalledTimes(1);
  },
};

/** Interaction test: disabled switch blocks toggle */
export const InteractionTest: Story = {
  args: { label: 'Locked setting', size: 'lg', disabled: true, onChange: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('switch');

    await expect(toggle).toBeDisabled();
    await userEvent.click(toggle);
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS — Sizes, states, and controlled behavior
   ═══════════════════════════════════════════════════════════════ */

export const Variants: Story = {
  render: () => (
    <Stack gap="var(--gap-huge)">
      <div>
        <SectionLabel>Sizes — unchecked</SectionLabel>
        <Stack gap="var(--gap-lg)">
          <Switch size="lg" label="Large (56x32)" />
          <Switch size="md" label="Medium (32x18)" />
          <Switch size="sm" label="Small (28x16)" />
        </Stack>
      </div>

      <div>
        <SectionLabel>Sizes — checked</SectionLabel>
        <Stack gap="var(--gap-lg)">
          <Switch size="lg" label="Large" defaultChecked />
          <Switch size="md" label="Medium" defaultChecked />
          <Switch size="sm" label="Small" defaultChecked />
        </Stack>
      </div>

      <div>
        <SectionLabel>States</SectionLabel>
        <Stack gap="var(--gap-lg)">
          <Switch label="Default" />
          <Switch label="Checked" defaultChecked />
          <Switch label="Disabled" disabled />
          <Switch label="Disabled checked" disabled defaultChecked />
          <Switch defaultChecked />
        </Stack>
      </div>
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   3. PATTERNS — Real-world compositions
   ═══════════════════════════════════════════════════════════════ */

export const Patterns: Story = {
  render: () => {
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [analytics, setAnalytics] = useState(true);

    return (
      <Stack gap="var(--gap-huge)">
        {/* Settings panel */}
        <div style={{
          width: '320px',
          padding: 'var(--padding-lg)',
          backgroundColor: 'var(--background-primary)',
          border: 'var(--border-width-md) solid var(--border-secondary)',
          borderRadius: 'var(--border-radius-lg)',
        }}>
          <SectionLabel>Preferences</SectionLabel>
          <Stack gap="var(--gap-lg)">
            <Switch
              label="Email notifications"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
            />
            <Switch
              label="Dark mode"
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
            />
            <Switch
              label="Analytics tracking"
              checked={analytics}
              onChange={(e) => setAnalytics(e.target.checked)}
            />
          </Stack>
        </div>

        {/* Compact editor settings */}
        <div style={{
          width: '240px',
          padding: 'var(--padding-md)',
          backgroundColor: 'var(--background-primary)',
          border: 'var(--border-width-md) solid var(--border-secondary)',
          borderRadius: 'var(--border-radius-lg)',
        }}>
          <SectionLabel>Editor settings</SectionLabel>
          <Stack gap="var(--gap-md)">
            <Switch size="sm" label="Auto-save" />
            <Switch size="sm" label="Spell check" defaultChecked />
            <Switch size="sm" label="Line numbers" defaultChecked />
          </Stack>
        </div>
      </Stack>
    );
  },
};
