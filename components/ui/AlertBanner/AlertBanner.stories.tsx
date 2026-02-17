import type { Meta, StoryObj } from '@storybook/react';
import { AlertBanner } from './AlertBanner';
import { Button } from '../Button';

const meta: Meta<typeof AlertBanner> = {
  title: 'Components/alert-banner',
  component: AlertBanner,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    title: { control: 'text', description: 'Bold title text' },
    description: { control: 'text', description: 'Description text' },
    icon: {
      control: 'radio',
      options: ['info', 'warning', 'success', 'error'],
      description: 'Icon variant',
    },
  },
};

export default meta;
type Story = StoryObj<typeof AlertBanner>;

export const Default: Story = {
  args: {
    title: 'Title goes here',
    description: 'Description goes here',
    icon: 'info',
    action: <Button variant="primary" size="sm">Primary button</Button>,
  },
};

export const Info: Story = {
  args: {
    icon: 'info',
    title: 'New update available',
    description: 'Version 2.1 includes performance improvements and bug fixes',
    action: <Button variant="primary" size="sm">Update</Button>,
  },
};

export const Warning: Story = {
  args: {
    icon: 'warning',
    title: 'Storage almost full',
    description: 'You have used 90% of your available storage',
    action: <Button variant="primary" size="sm">Manage storage</Button>,
  },
};

export const Success: Story = {
  args: {
    icon: 'success',
    title: 'Payment received',
    description: 'Your invoice has been paid successfully',
  },
};

export const Error: Story = {
  args: {
    icon: 'error',
    title: 'Connection failed',
    description: 'Unable to reach the server. Please check your internet connection.',
    action: <Button variant="primary" size="sm">Retry</Button>,
  },
};

export const TitleOnly: Story = {
  args: {
    icon: 'info',
    title: 'Your session will expire in 5 minutes',
  },
};

export const AllIcons: Story = {
  parameters: {
    docs: {
      source: {
        code: `<AlertBanner icon="info" title="Info" description="Informational message" />
<AlertBanner icon="warning" title="Warning" description="Warning message" />
<AlertBanner icon="success" title="Success" description="Success message" />
<AlertBanner icon="error" title="Error" description="Error message" />`,
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <AlertBanner icon="info" title="Info" description="Informational message for the user" />
      <AlertBanner icon="warning" title="Warning" description="Something needs your attention" />
      <AlertBanner icon="success" title="Success" description="The operation completed successfully" />
      <AlertBanner icon="error" title="Error" description="Something went wrong, please try again" />
    </div>
  ),
};
