import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Icon } from '@iconify/react';
import { TextInput } from '../../../components/ui/TextInput';
import { PasswordInput } from '../../../components/ui/PasswordInput';
import { Checkbox } from '../../../components/ui/Checkbox';
import { Button } from '../../../components/ui/Button';
import { TextLink } from '../../../components/ui/TextLink';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta = {
  title: 'Patterns/Forms/sign-up-form',
  tags: ['surface-shared'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj;

/* ═══════════════════════════════════════════════════════════════
   Multi-primitive form composition: TextInput × 2 + PasswordInput × 2
   + Checkbox + Button + TextLink. Six distinct primitive types.
   Lives in Patterns/Forms/ per ADR-010 amendment §1.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Sign-up form — name, email, password, confirm, terms */
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
        width: 440,
        padding: 'var(--padding-xl)',
        background: 'var(--surface-primary)',
        border: 'var(--border-width-sm) solid var(--border-secondary)',
        borderRadius: 'var(--border-radius-lg)',
      }}
    >
      <TextInput label="Full name" placeholder="Jane Doe" fullWidth />
      <TextInput
        label="Email"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="jane@example.com"
        iconBefore={<Icon icon="ph:envelope" />}
        fullWidth
      />
      <PasswordInput
        label="Password"
        name="new-password"
        autoComplete="new-password"
        placeholder="Create a password"
        helperText="Must be at least 8 characters"
        fullWidth
      />
      <PasswordInput
        label="Confirm password"
        name="confirm-password"
        autoComplete="new-password"
        placeholder="Re-enter password"
        fullWidth
      />
      <Checkbox
        label={
          <>
            I agree to the <TextLink href="#terms">Terms of Service</TextLink> and{' '}
            <TextLink href="#privacy">Privacy Policy</TextLink>
          </>
        }
      />
      <Button type="submit" variant="primary" fullWidth>Create account</Button>
    </form>
  ),
};
