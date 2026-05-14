import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Icon } from '@iconify/react';
import { TextInput } from './TextInput';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof TextInput> = {
  title: 'Components/Form/text-input',
  component: TextInput,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 360 }}><Story /></div>],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size token (sm=32px, md=40px, lg=48px). Default `md`.',
    },
    label: {
      control: 'text',
      description: 'Optional label rendered above the field. Auto-wires `htmlFor`/`id`.',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text shown when the field is empty.',
    },
    helperText: {
      control: 'text',
      description: 'Hint text under the field. Hidden when `error` is present.',
    },
    error: {
      control: 'text',
      description: 'Error message. Triggers `aria-invalid` and replaces `helperText`.',
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
      description:
        'HTML input type. `email` / `password` and any explicit `autoComplete` value suppress 1Password / LastPass prompts.',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Stretch to fill container width.',
    },
    disabled: {
      control: 'boolean',
      description: 'Locks the field — non-interactive, muted appearance.',
    },
    iconBefore: {
      control: false,
      description: 'Optional leading icon node (e.g. `<Icon icon="ph:envelope" />`).',
    },
    iconAfter: {
      control: false,
      description: 'Optional trailing icon node.',
    },
    onChange: {
      action: 'changed',
      description: 'Native change handler.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof TextInput>;

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — single canonical story per ADR-010 §components without
   a variant axis. All variation (size, type, error, disabled,
   icons, helper text) is exposed via Controls.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Themed text input with label/helper/error */
export const Default: Story = {
  args: {
    label: 'Email address',
    placeholder: 'you@example.com',
    type: 'email',
    size: 'md',
    fullWidth: true,
    iconBefore: <Icon icon="ph:envelope" />,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');

    await expect(input).toBeVisible();
    await userEvent.clear(input);
    await userEvent.type(input, 'test@example.com');
    await expect(input).toHaveValue('test@example.com');
  },
};

/* ═══════════════════════════════════════════════════════════════
   PARKED Q4 — multi-primitive Form compositions. Relocates to
   `Patterns/Forms/` in Batch A wrap-up per ADR-010 amendment
   2026-05-14 (#618).
   ═══════════════════════════════════════════════════════════════ */

/** @summary Contact-form composition (relocates to Patterns/Forms) */
export const ContactForm: Story = {
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => <div style={{ width: 360, maxWidth: '100%' }}><Story /></div>,
  ],
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>
      <TextInput label="First name" placeholder="John" fullWidth />
      <TextInput label="Last name" placeholder="Doe" fullWidth />
      <TextInput
        label="Email"
        type="email"
        placeholder="john@example.com"
        iconBefore={<Icon icon="ph:envelope" />}
        fullWidth
      />
      <TextInput
        label="Phone"
        type="tel"
        placeholder="(555) 123-4567"
        helperText="We'll only contact you about your order"
        fullWidth
      />
    </div>
  ),
};

/** @summary Login-form pair (relocates to Patterns/Forms) */
export const LoginForm: Story = {
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => <div style={{ width: 320, maxWidth: '100%' }}><Story /></div>,
  ],
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>
      <TextInput
        label="Email"
        type="email"
        name="email"
        autoComplete="username"
        placeholder="you@example.com"
        iconBefore={<Icon icon="ph:envelope" />}
        fullWidth
      />
      <TextInput
        label="Password"
        type="password"
        name="password"
        autoComplete="current-password"
        placeholder="••••••••"
        iconBefore={<Icon icon="ph:lock" />}
        fullWidth
      />
    </div>
  ),
};
