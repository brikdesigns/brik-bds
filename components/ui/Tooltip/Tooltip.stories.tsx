import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tooltip } from './Tooltip';
import { Button } from '../Button';

/**
 * Tooltip — small contextual hint anchored to a trigger element. Shown on
 * hover/focus, dismissed on blur/escape.
 * @summary Hover/focus tooltip with placement axis
 */
const meta: Meta<typeof Tooltip> = {
  title: 'Components/Feedback/tooltip',
  component: Tooltip,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div style={{ padding: '80px' /* bds-lint-ignore — extra space for tooltip overflow */ }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    content: { control: 'text' },
    placement: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
    },
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof Tooltip>;

/** Args-driven sandbox. Use Controls to flip placement and edit content.
 *  @summary Live playground with all controls */
export const Playground: Story = {
  args: {
    content: 'This is a tooltip',
    placement: 'top',
    children: <Button variant="outline">Hover me</Button>,
  },
};

/** Side-by-side comparison of all four placements. This is the documented
 *  exception in [ADR-006](../../docs/adrs/ADR-006-storybook-taxonomy-and-story-shape.md):
 *  one axis, comparison is the entire point, autodocs can't show it as clearly.
 *  @summary All four placements rendered together */
export const Placements: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--gap-xl)', alignItems: 'center', flexWrap: 'wrap' }}>
      <Tooltip content="Top placement" placement="top">
        <Button variant="outline" size="sm">Top</Button>
      </Tooltip>
      <Tooltip content="Bottom placement" placement="bottom">
        <Button variant="outline" size="sm">Bottom</Button>
      </Tooltip>
      <Tooltip content="Left placement" placement="left">
        <Button variant="outline" size="sm">Left</Button>
      </Tooltip>
      <Tooltip content="Right placement" placement="right">
        <Button variant="outline" size="sm">Right</Button>
      </Tooltip>
    </div>
  ),
};

/** Tooltip with a keyboard-shortcut hint — common content shape for actions.
 *  @summary Tooltip showing a keyboard shortcut */
export const WithKeyboardShortcut: Story = {
  args: {
    content: 'Save (Cmd+S)',
    placement: 'bottom',
    children: <Button size="sm">Save</Button>,
  },
};
