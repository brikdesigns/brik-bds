import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn, expect, userEvent, within } from 'storybook/test';
import { CloseButton } from './CloseButton';

const meta: Meta<typeof CloseButton> = {
  title: 'Components/close-button',
  component: CloseButton,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
  argTypes: {
    label: {
      control: 'text',
      description: 'Accessible label applied as `aria-label`. Defaults to `"Close"`.',
    },
    disabled: {
      control: 'boolean',
      description: 'Native disabled state — dims the glyph and blocks interaction.',
    },
    onClick: {
      action: 'clicked',
      description: 'Click handler — wire to the overlay\'s close/dismiss callback.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof CloseButton>;

/* ─── Playground ─────────────────────────────────────────────── */

/** @summary Interactive playground for prop tweaking */
export const Playground: Story = {
  args: {
    label: 'Close',
  },
};

/* ─── Interaction test (Q5 — hidden from MCP) ────────────────── */

/** @summary Verifies the click handler fires on activation */
export const InteractionTestClick: Story = {
  tags: ['!manifest'],
  args: {
    label: 'Close',
    onClick: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByLabelText('Close'));
    await expect(args.onClick).toHaveBeenCalled();
  },
};
