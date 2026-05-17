import type { Meta, StoryObj } from '@storybook/react-vite';
import { CardSummary } from './CardSummary';

const meta: Meta<typeof CardSummary> = {
  title: 'Deprecated/card-summary',
  component: CardSummary,
  tags: ['surface-shared', '!manifest'],
  parameters: { layout: 'centered' },
  argTypes: {
    label: {
      control: 'text',
      description: 'Stat label rendered above the value.',
    },
    value: {
      control: 'text',
      description: 'Stat value. Numbers format via `Intl.NumberFormat` based on `type`; strings render verbatim.',
    },
    type: {
      control: 'select',
      options: ['numeric', 'price'],
      description: '`numeric` (default) = locale integer; `price` = USD currency. Ignored when `value` is a string.',
    },
    textLink: {
      control: false,
      description: 'Optional secondary action — `{ label, href?, onClick? }`.',
    },
  },
  decorators: [(Story) => <div style={{ width: 322 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * @deprecated Use `<Card preset="summary">` instead — same props, same layout.
 * @summary Deprecated — use Card preset="summary"
 */
export const Playground: Story = {
  args: {
    label: 'Total',
    value: 0,
    type: 'numeric',
    textLink: { label: 'Text Link', href: '#' },
  },
};
