import type { Meta, StoryObj } from '@storybook/react-vite';
import { AlertBanner } from './AlertBanner';
import { Button } from '../Button';

const meta: Meta<typeof AlertBanner> = {
  title: 'Components/Feedback/alert-banner',
  component: AlertBanner,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    title: { control: 'text', description: 'Bold title text' },
    description: { control: 'text', description: 'Description text' },
    variant: {
      control: 'radio',
      options: ['warning', 'error', 'information'],
      description: 'Alert variant — determines badge color and icon',
    },
  },
};

export default meta;
type Story = StoryObj<typeof AlertBanner>;

export const Default: Story = {
  args: {
    title: 'Title goes here',
    description: 'Description goes here',
    variant: 'information',
    action: <Button variant="primary" size="sm">Primary button</Button>,
  },
};

export const Information: Story = {
  args: {
    variant: 'information',
    title: 'New update available',
    description: 'Version 2.1 includes performance improvements and bug fixes',
    action: <Button variant="primary" size="sm">Update</Button>,
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Storage almost full',
    description: 'You have used 90% of your available storage',
    action: <Button variant="primary" size="sm">Manage storage</Button>,
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    title: 'Connection failed',
    description: 'Unable to reach the server. Please check your internet connection.',
    action: <Button variant="primary" size="sm">Retry</Button>,
  },
};

export const TitleOnly: Story = {
  args: {
    variant: 'information',
    title: 'Your session will expire in 5 minutes',
  },
};

export const AllVariants: Story = {
  parameters: {
    docs: {
      source: {
        code: `<AlertBanner variant="information" title="Information" description="Informational message" />
<AlertBanner variant="warning" title="Warning" description="Warning message" />
<AlertBanner variant="error" title="Error" description="Error message" />`,
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>
      <AlertBanner variant="information" title="Information" description="Informational message for the user" />
      <AlertBanner variant="warning" title="Warning" description="Something needs your attention" />
      <AlertBanner variant="error" title="Error" description="Something went wrong, please try again" />
    </div>
  ),
};
