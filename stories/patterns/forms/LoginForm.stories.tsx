import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Icon } from '@iconify/react';
import { TextInput } from '../../../components/ui/TextInput';
import { PasswordInput } from '../../../components/ui/PasswordInput';
import { Button } from '../../../components/ui/Button';
import { TextLink } from '../../../components/ui/TextLink';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta = {
  title: 'Patterns/Forms/login-form',
  tags: ['surface-shared'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj;

/* ═══════════════════════════════════════════════════════════════
   Multi-primitive form composition: TextInput (email) + PasswordInput
   + Button + TextLink (forgot-password). Lives in Patterns/Forms/ per
   ADR-010 amendment §1.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Login form — email + password + sign-in + forgot-pwd link */
export const Default: Story = {
  args: { onSubmit: fn() },
  render: (args) => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        (args as { onSubmit?: (e: React.FormEvent) => void }).onSubmit?.(e);
      }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--gap-lg)',
        width: 400,
        padding: 'var(--padding-xl)',
        background: 'var(--surface-primary)',
        border: 'var(--border-width-sm) solid var(--border-secondary)',
        borderRadius: 'var(--border-radius-lg)',
      }}
    >
      <TextInput
        label="Email"
        type="email"
        name="email"
        autoComplete="username"
        placeholder="you@example.com"
        iconBefore={<Icon icon="ph:envelope" />}
        fullWidth
      />
      <PasswordInput
        label="Password"
        name="password"
        autoComplete="current-password"
        placeholder="Enter password"
        fullWidth
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <TextLink href="#forgot">Forgot password?</TextLink>
      </div>
      <Button type="submit" variant="primary" fullWidth>Sign in</Button>
    </form>
  ),
};
