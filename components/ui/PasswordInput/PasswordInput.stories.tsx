import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { PasswordInput } from './PasswordInput';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof PasswordInput> = {
  title: 'Components/Input/password-input',
  component: PasswordInput,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 360 }}><Story /></div>],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size token (sm=32px, md=40px, lg=48px). Matches TextInput scale. Default `md`.',
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
      description: 'Hint text under the field (e.g. password requirements). Hidden when `error` is present.',
    },
    error: {
      control: 'text',
      description: 'Error message. Triggers `aria-invalid` and replaces `helperText`.',
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
      description: 'Optional leading icon node. Set in code; Storybook Controls cannot render JSX. Common pattern: `<Icon icon="ph:lock" />`.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof PasswordInput>;

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — single canonical story per ADR-010 §components without
   a variant axis. All variation (size, error, disabled, helper)
   is exposed via Controls. The show/hide toggle is internal to
   the component — no Control needed.
   ═══════════════════════════════════════════════════════════════ */

/** @summary TextInput with built-in show/hide password toggle */
export const Default: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter password',
    helperText: 'Must be at least 8 characters',
    size: 'md',
    fullWidth: true,
    autoComplete: 'current-password',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Password') as HTMLInputElement;

    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute('type', 'password');

    // Round-trip the visibility toggle: show → hide. The second click
    // returns the component to its canonical idle state (type=password,
    // "Show password" button visible) so the post-play snapshot matches
    // what viewers expect on initial render.
    await userEvent.click(canvas.getByRole('button', { name: 'Show password' }));
    await expect(input).toHaveAttribute('type', 'text');

    await userEvent.click(canvas.getByRole('button', { name: 'Hide password' }));
    await expect(input).toHaveAttribute('type', 'password');

    // Blur the toggle so the canvas doesn't show stale focus styling
    // after play completes. Without this, the trailing focus ring makes
    // the eye icon look pre-selected when viewers open the story.
    (canvas.getByRole('button', { name: 'Show password' }) as HTMLElement).blur();
  },
};
