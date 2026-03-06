import type { Meta, StoryObj } from '@storybook/react-vite';
import { Divider } from './Divider';

const meta: Meta<typeof Divider> = {
  title: 'Components/Structure/divider',
  component: Divider,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Orientation of the divider line',
    },
    spacing: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
      description: 'Spacing above and below (or left/right for vertical)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Divider>;

export const Default: Story = {
  args: {
    orientation: 'horizontal',
    spacing: 'none',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <p style={{
          fontFamily: 'var(--font-family-body)',
          fontSize: 'var(--body-md)',
          color: 'var(--text-primary)',
          margin: 0,
        }}>Content above the divider</p>
        <Story />
        <p style={{
          fontFamily: 'var(--font-family-body)',
          fontSize: 'var(--body-md)',
          color: 'var(--text-primary)',
          margin: 0,
        }}>Content below the divider</p>
      </div>
    ),
  ],
};

export const WithSpacing: Story = {
  args: {
    spacing: 'lg',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <p style={{
          fontFamily: 'var(--font-family-body)',
          fontSize: 'var(--body-md)',
          color: 'var(--text-primary)',
          margin: 0,
        }}>Content above</p>
        <Story />
        <p style={{
          fontFamily: 'var(--font-family-body)',
          fontSize: 'var(--body-md)',
          color: 'var(--text-primary)',
          margin: 0,
        }}>Content below</p>
      </div>
    ),
  ],
};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
    spacing: 'md',
  },
  decorators: [
    (Story) => (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        height: '48px',
        fontFamily: 'var(--font-family-body)',
        fontSize: 'var(--body-md)',
        color: 'var(--text-primary)',
      }}>
        <span>Left</span>
        <Story />
        <span>Right</span>
      </div>
    ),
  ],
};

export const AllSpacings: Story = {
  render: () => (
    <div style={{
      width: '400px',
      fontFamily: 'var(--font-family-body)',
      fontSize: 'var(--body-sm)',
      color: 'var(--text-secondary)',
    }}>
      <p style={{ margin: 0 }}>spacing="none"</p>
      <Divider spacing="none" />
      <p style={{ margin: 0 }}>spacing="sm"</p>
      <Divider spacing="sm" />
      <p style={{ margin: 0 }}>spacing="md"</p>
      <Divider spacing="md" />
      <p style={{ margin: 0 }}>spacing="lg"</p>
      <Divider spacing="lg" />
      <p style={{ margin: 0 }}>End</p>
    </div>
  ),
};
