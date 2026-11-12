import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { Tooltip } from './Tooltip';
import { Button } from '../Button';

/* ─── Meta ────────────────────────────────────────────── */

const meta: Meta<typeof Tooltip> = {
  title: 'Components/tooltip',
  component: Tooltip,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div style={{ padding: '80px' /* bds-lint-ignore — extra space for tooltip overflow */ }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    content: { control: 'text', description: 'Tooltip text revealed on hover / focus.' },
    placement: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
      description: 'Side the tooltip and its arrow anchor to.',
    },
    delay: {
      control: 'number',
      description: 'Delay in ms before showing the tooltip (default: 0 = instant).',
    },
    children: {
      control: false,
      description: 'Trigger element the tooltip is anchored to.',
    },
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof Tooltip>;

/* ═══════════════════════════════════════════════════════════════
   DEFAULT — args-driven sandbox
   ═══════════════════════════════════════════════════════════════ */

/**
 * Canonical tooltip. Edit `content` and switch `placement` via Controls;
 * the trigger is whatever you pass as `children`.
 *
 * @summary Contextual hover/focus tooltip with arrow
 */
export const Default: Story = {
  args: {
    content: 'This is a tooltip',
    placement: 'top',
    children: <Button variant="outline">Hover me</Button>,
  },
};

/* ═══════════════════════════════════════════════════════════════
   VARIANTS — placement axis gallery
   ═══════════════════════════════════════════════════════════════ */

/* `placement` is a Control on Default — the four-placement comparison lives
   in Tooltip.mdx as a docs-local demo (#1489). */

/* ═══════════════════════════════════════════════════════════════
   INTERACTION TESTS — describedby, Escape, reveal, delay (#3071).
   The bubble renders in a portal, so it is queried from `screen`.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Visible tooltip is linked to the trigger by aria-describedby */
export const InteractionTestDescribedBy: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: Default.args,
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Hover me' });
    await expect(trigger).not.toHaveAttribute('aria-describedby');

    await userEvent.hover(trigger);
    const bubble = await screen.findByRole('tooltip');
    await expect(bubble.id).not.toBe('');
    await expect(trigger).toHaveAttribute('aria-describedby', bubble.id);
  },
};

/** @summary Escape hides a visible tooltip; focus stays on the trigger */
export const InteractionTestEscapeDismisses: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: Default.args,
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Hover me' });
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await screen.findByRole('tooltip');

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
    await expect(trigger).toHaveFocus();
    await expect(trigger).not.toHaveAttribute('aria-describedby');
  },
};

/** @summary Keyboard focus reveals the tooltip and delay holds it back */
export const InteractionTestDelayedFocusReveal: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: { ...Default.args, delay: 300 },
  play: async () => {
    await userEvent.tab();
    await expect(screen.queryByRole('tooltip')).toBeNull();
    await screen.findByRole('tooltip');
  },
};
