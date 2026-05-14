import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { TextArea } from './TextArea';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof TextArea> = {
  title: 'Components/Form/text-area',
  component: TextArea,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 420 }}><Story /></div>],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size token (sm=14px body, md=16px body, lg=18px body). Default `md`.',
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
    rows: {
      control: { type: 'number', min: 1, max: 20, step: 1 },
      description: 'Number of visible text rows. Default `4`.',
    },
    resize: {
      control: 'select',
      options: ['none', 'both', 'horizontal', 'vertical'],
      description: 'CSS resize behavior. Default `vertical`. `disabled` forces `none`.',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Stretch to fill container width.',
    },
    disabled: {
      control: 'boolean',
      description: 'Locks the field — non-interactive, muted appearance, resize disabled.',
    },
    onChange: {
      action: 'changed',
      description: 'Native change handler.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof TextArea>;

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — single canonical story per ADR-010 §components without
   a variant axis. All variation (size, rows, resize, error,
   disabled, helper text) is exposed via Controls.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Themed multi-line text input with label/helper/error */
export const Default: Story = {
  args: {
    label: 'Description',
    placeholder: 'Enter your text here...',
    rows: 4,
    size: 'md',
    fullWidth: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole('textbox');

    await expect(textarea).toBeVisible();
    await userEvent.clear(textarea);
    await userEvent.type(textarea, 'A short description.');
    await expect(textarea).toHaveValue('A short description.');
  },
};
