import type { Meta, StoryObj } from '@storybook/react-vite';
import { CardSummary } from './CardSummary';

/**
 * **Deprecated** — use `<Card preset="summary">` instead. Same prop names
 * (`label`, `value`, `type`, `textLink`), same layout, same number formatting.
 * This story remains only as a migration reference.
 * @summary [Deprecated] use Card preset="summary"
 */
const meta: Meta<typeof CardSummary> = {
  title: 'Deprecated/Card/card-summary',
  component: CardSummary,
  tags: ['!manifest'],
  parameters: { layout: 'centered' },
  argTypes: {
    type: { control: 'select', options: ['numeric', 'price'] },
    label: { control: 'text' },
    value: { control: 'text' },
  },
  decorators: [(Story) => <div style={{ width: 322 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof CardSummary>;

/** Args-driven sandbox. Kept for migration reference only. New code should use `Card preset="summary"`.
 *  @summary [Deprecated] live playground */
export const Playground: Story = {
  args: {
    label: 'Total',
    value: 0,
    type: 'numeric',
    textLink: { label: 'Text Link', href: '#' },
  },
};
