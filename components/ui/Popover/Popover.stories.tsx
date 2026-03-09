import type { Meta, StoryObj } from '@storybook/react-vite';
import { Popover } from './Popover';
import { Button } from '../Button';

const meta: Meta<typeof Popover> = {
  title: 'Components/Overlay/popover',
  component: Popover,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    placement: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
    },
    trigger: {
      control: 'select',
      options: ['click', 'hover'],
    },
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleContent = (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--gap-sm)',
    fontFamily: 'var(--font-family-body)',
    fontSize: 'var(--body-md)',
    color: 'var(--text-primary)',
  }}>
    <strong style={{ fontWeight: 'var(--font-weight-semi-bold)' as unknown as number }}>
      Popover title
    </strong>
    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
      This is some helpful content inside the popover panel.
    </p>
  </div>
);

export const Default: Story = {
  args: {
    content: sampleContent,
    placement: 'bottom',
    children: <Button variant="outline">Click me</Button>,
  },
};

export const TopPlacement: Story = {
  args: {
    content: sampleContent,
    placement: 'top',
    children: <Button variant="outline">Above</Button>,
  },
  decorators: [(Story) => <div style={{ marginTop: 200 }}><Story /></div>],
};

export const HoverTrigger: Story = {
  args: {
    content: sampleContent,
    placement: 'bottom',
    trigger: 'hover',
    children: <Button variant="ghost">Hover me</Button>,
  },
};

export const RichContent: Story = {
  args: {
    placement: 'bottom',
    children: <Button>Settings</Button>,
    content: (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--gap-md)',
        fontFamily: 'var(--font-family-body)',
        minWidth: 240,
      }}>
        <div style={{ fontSize: 'var(--label-md)', fontWeight: 'var(--font-weight-semi-bold)' as unknown as number, color: 'var(--text-primary)' }}>
          Notification settings
        </div>
        <label style={{ fontSize: 'var(--body-sm)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 'var(--gap-sm)' }}>
          <input type="checkbox" defaultChecked /> Push notifications
        </label>
        <label style={{ fontSize: 'var(--body-sm)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 'var(--gap-sm)' }}>
          <input type="checkbox" /> Email digest
        </label>
        <label style={{ fontSize: 'var(--body-sm)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 'var(--gap-sm)' }}>
          <input type="checkbox" defaultChecked /> Sound alerts
        </label>
      </div>
    ),
  },
};
