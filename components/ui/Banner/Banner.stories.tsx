import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Banner } from './Banner';
import { Button } from '../Button';

const meta: Meta<typeof Banner> = {
  title: 'Components/banner',
  component: Banner,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    title: { control: 'text', description: 'Bold title text' },
    description: { control: 'text', description: 'Description beside the title' },
  },
};

export default meta;
type Story = StoryObj<typeof Banner>;

export const Default: Story = {
  args: {
    title: 'Title goes here',
    description: 'Description goes here',
    action: <Button variant="secondary" size="sm">Learn more</Button>,
  },
};

export const TitleOnly: Story = {
  args: {
    title: 'New feature available',
  },
};

export const WithAction: Story = {
  args: {
    title: 'Limited time offer',
    description: 'Save 20% on all plans this month',
    action: <Button variant="secondary" size="sm">View plans</Button>,
  },
};

export const Dismissible: Story = {
  parameters: {
    docs: {
      source: {
        code: `const [visible, setVisible] = useState(true);

{visible && (
  <Banner
    title="Cookie notice"
    description="We use cookies to improve your experience"
    action={<Button variant="secondary" size="sm">Accept</Button>}
    onDismiss={() => setVisible(false)}
  />
)}`,
      },
    },
  },
  render: () => {
    const [visible, setVisible] = useState(true);

    if (!visible) {
      return (
        <button
          type="button"
          onClick={() => setVisible(true)}
          style={{
            fontFamily: 'var(--_typography---font-family--body)',
            fontSize: 'var(--_typography---body--sm)',
            color: 'var(--_color---text--muted)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          Show banner again
        </button>
      );
    }

    return (
      <Banner
        title="Cookie notice"
        description="We use cookies to improve your experience"
        action={<Button variant="secondary" size="sm">Accept</Button>}
        onDismiss={() => setVisible(false)}
      />
    );
  },
};

export const Announcement: Story = {
  args: {
    title: 'v2.0 is here',
    description: 'Check out the new features and improvements',
    action: <Button variant="secondary" size="sm">What&apos;s new</Button>,
  },
};
