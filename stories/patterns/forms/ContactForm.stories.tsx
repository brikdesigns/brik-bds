import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Icon } from '@iconify/react';
import { TextInput } from '../../../components/ui/TextInput';
import { TextArea } from '../../../components/ui/TextArea';
import { Button } from '../../../components/ui/Button';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta = {
  title: 'Containers/contact-form',
  tags: ['surface-shared'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj;

/* ═══════════════════════════════════════════════════════════════
   Multi-primitive form composition: TextInput × 3 + TextArea + Button.
   Lives in Patterns/Forms/ per ADR-010 amendment §1 (compositions
   combining multiple distinct primitives don't live on the primitive's
   stories file).
   ═══════════════════════════════════════════════════════════════ */

/** @summary Contact form — name, email, message + send button */
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
        width: 480,
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
        placeholder="jane@example.com"
        iconBefore={<Icon icon="ph:envelope" />}
        autoComplete="email"
        fullWidth
      />
      <TextArea
        label="Message"
        placeholder="How can we help?"
        rows={4}
        fullWidth
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--gap-md)' }}>
        <Button type="submit" variant="primary">Send message</Button>
      </div>
    </form>
  ),
};
