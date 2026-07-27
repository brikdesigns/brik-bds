import type { Meta, StoryObj } from '@storybook/react-vite';
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
