import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Icon } from '@iconify/react';
import { TextInput, type TextInputProps } from './TextInput';

/* ─── Story-only args ─────────────────────────────────────────── */

/**
 * Default story extends TextInputProps with two story-only flags so the
 * Controls panel can toggle the sample icons. These flags are NOT real
 * component props — in production code, pass any ReactNode to
 * `iconBefore` / `iconAfter`. The flags are excluded from the MDX
 * `<ArgTypes>` block via the `exclude` prop on that block.
 */
type DefaultArgs = TextInputProps & {
  showLeadingIcon?: boolean;
  showTrailingIcon?: boolean;
};

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<DefaultArgs> = {
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
      description: 'Optional leading icon node. Use `showLeadingIcon` Control in Storybook to toggle a sample envelope icon.',
    },
    iconAfter: {
      control: false,
      description: 'Optional trailing icon node. Use `showTrailingIcon` Control in Storybook to toggle a sample lock icon.',
    },
    onChange: {
      action: 'changed',
      description: 'Native change handler.',
    },
    showLeadingIcon: {
      control: 'boolean',
      description: 'Story-only — toggle a sample envelope icon as `iconBefore`.',
      table: { category: 'Story-only' },
    },
    showTrailingIcon: {
      control: 'boolean',
      description: 'Story-only — toggle a sample lock icon as `iconAfter`.',
      table: { category: 'Story-only' },
    },
  },
};

export default meta;
type Story = StoryObj<DefaultArgs>;

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — single canonical story per ADR-010 §components without
   a variant axis. All variation (size, type, error, disabled,
   icons, helper text) is exposed via Controls.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Themed text input with label/helper/error */
export const Default: Story = {
  args: {
    label: 'Full name',
    placeholder: 'Enter your name',
    type: 'text',
    size: 'md',
    fullWidth: true,
    showLeadingIcon: false,
    showTrailingIcon: false,
  },
  render: ({ showLeadingIcon, showTrailingIcon, ...args }) => (
    <TextInput
      {...args}
      iconBefore={showLeadingIcon ? <Icon icon="ph:user" /> : undefined}
      iconAfter={showTrailingIcon ? <Icon icon="ph:check-circle" /> : undefined}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');

    await expect(input).toBeVisible();
    await userEvent.clear(input);
    await userEvent.type(input, 'Jane Doe');
    await expect(input).toHaveValue('Jane Doe');
  },
};

