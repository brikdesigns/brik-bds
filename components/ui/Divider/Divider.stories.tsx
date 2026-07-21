import type { Meta, StoryObj } from '@storybook/react-vite';
import { Divider } from './Divider';

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof Divider> = {
  title: 'Components/divider',
  component: Divider,
  tags: ['surface-shared'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
    spacing: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
      description: '`none` 0px, `sm` 12px, `md` 16px, `lg` 24px margin.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Divider>;

const bodyText: React.CSSProperties = {
  fontFamily: 'var(--font-family-body)',
  fontSize: 'var(--body-md)', // bds-lint-ignore
  color: 'var(--text-primary)',
  margin: 0,
};

/* ─── Default ─────────────────────────────────────────────────── */

/** @summary Interactive playground for prop tweaking */
export const Default: Story = {
  args: {
    orientation: 'horizontal',
    spacing: 'none',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <p style={bodyText}>Content above the divider</p>
        <Story />
        <p style={bodyText}>Content below the divider</p>
      </div>
    ),
  ],
};
