import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Form } from './Form';
import { TextInput } from '../TextInput';
import { TextArea } from '../TextArea';
import { Select } from '../Select';
import { Button } from '../Button';

const meta: Meta<typeof Form> = {
  title: 'Displays/Form/form',
  component: Form,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    layout: {
      control: 'select',
      options: ['vertical', 'horizontal'],
    },
    gap: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof Form>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div style={{ width: 400 }}>
      <Form {...args}>
        <TextInput label="Name" placeholder="Your name" />
        <TextInput label="Email" type="email" placeholder="you@example.com" />
        <TextArea label="Message" placeholder="How can we help?" />
      </Form>
    </div>
  ),
  args: {
    title: 'Contact Us',
    description: "We'll get back to you within 24 hours.",
    footer: <Button type="submit">Send Message</Button>,
  },
};

export const WithError: Story = {
  render: () => (
    <div style={{ width: 400 }}>
      <Form
        title="Sign Up"
        error="Please fix the errors below and try again."
        footer={<Button type="submit">Create Account</Button>}
      >
        <TextInput label="Email" type="email" placeholder="you@example.com" error="Email is already in use." />
        <TextInput label="Password" type="password" placeholder="Choose a password" />
      </Form>
    </div>
  ),
};

export const WithSuccess: Story = {
  render: () => (
    <div style={{ width: 400 }}>
      <Form
        title="Newsletter"
        success="You've been subscribed successfully!"
        footer={<Button type="submit" disabled>Subscribed</Button>}
      >
        <TextInput label="Email" type="email" value="user@example.com" readOnly />
      </Form>
    </div>
  ),
};

export const HorizontalLayout: Story = {
  render: () => (
    <div style={{ width: 600 }}>
      <Form
        title="Quick Search"
        layout="horizontal"
        gap="sm"
        footer={<Button type="submit" size="sm">Search</Button>}
      >
        <div style={{ flex: '1 1 200px' }}>
          <TextInput placeholder="Search..." fullWidth />
        </div>
        <div style={{ flex: '0 1 160px' }}>
          <Select
            options={[
              { label: 'All', value: 'all' },
              { label: 'Products', value: 'products' },
              { label: 'Services', value: 'services' },
            ]}
            placeholder="Category"
          />
        </div>
      </Form>
    </div>
  ),
};

export const InteractiveForm: Story = {
  render: () => {
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    return (
      <div style={{ width: 400 }}>
        <Form
          title="Feedback"
          description="Help us improve our product."
          error={error}
          success={submitted ? 'Thank you for your feedback!' : undefined}
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            if (!data.get('name')) {
              setError('Name is required.');
              setSubmitted(false);
            } else {
              setError('');
              setSubmitted(true);
            }
          }}
          footer={
            <div style={{ display: 'flex', gap: 'var(--gap-md)' }}>
              <Button type="submit">Submit</Button>
              <Button variant="ghost" type="reset" onClick={() => { setError(''); setSubmitted(false); }}>Reset</Button>
            </div>
          }
        >
          <TextInput label="Name" name="name" placeholder="Your name" />
          <Select
            label="Rating"
            name="rating"
            options={[
              { label: 'Excellent', value: '5' },
              { label: 'Good', value: '4' },
              { label: 'Average', value: '3' },
              { label: 'Poor', value: '2' },
              { label: 'Terrible', value: '1' },
            ]}
            placeholder="Select a rating"
          />
          <TextArea label="Comments" name="comments" placeholder="Tell us more..." />
        </Form>
      </div>
    );
  },
};
