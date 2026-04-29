import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Form } from './Form';
import { TextInput } from '../TextInput';
import { TextArea } from '../TextArea';
import { Select } from '../Select';
import { Button } from '../Button';

/**
 * Form — semantic `<form>` wrapper with title, description, layout (vertical or
 * horizontal), gap, error/success banner slots, and a footer slot for submit
 * actions. Pairs with TextInput, TextArea, Select, and similar field primitives.
 * @summary Form wrapper with header, error/success banners, and footer
 */
const meta: Meta<typeof Form> = {
  title: 'Components/Form/form',
  component: Form,
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 400 }}><Story /></div>],
  argTypes: {
    layout: { control: 'select', options: ['vertical', 'horizontal'] },
    gap: { control: 'select', options: ['sm', 'md', 'lg'] },
    title: { control: 'text' },
    description: { control: 'text' },
    error: { control: 'text' },
    success: { control: 'text' },
  },
} satisfies Meta<typeof Form>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleFields = (
  <>
    <TextInput label="Name" placeholder="Your name" fullWidth />
    <TextInput label="Email" type="email" placeholder="you@example.com" fullWidth />
    <TextArea label="Message" placeholder="How can we help?" fullWidth />
  </>
);

/** Args-driven sandbox.
 *  @summary Live playground with all controls */
export const Playground: Story = {
  args: {
    title: 'Contact us',
    description: "We'll get back to you within 24 hours.",
    footer: <Button type="submit">Send message</Button>,
    children: sampleFields,
  },
};

/* ─── Layouts ────────────────────────────────────────────────── */

/** Vertical layout (default) — fields stack top-to-bottom.
 *  @summary Vertical form layout */
export const Vertical: Story = {
  args: {
    title: 'Contact us',
    layout: 'vertical',
    footer: <Button type="submit">Submit</Button>,
    children: sampleFields,
  },
};

/** Horizontal layout — fields wrap inline. Use for compact filter or search bars.
 *  @summary Horizontal form layout */
export const Horizontal: Story = {
  args: {
    title: 'Quick search',
    layout: 'horizontal',
    gap: 'sm',
    footer: <Button type="submit" size="sm">Search</Button>,
  },
  decorators: [(Story) => <div style={{ width: 500 }}><Story /></div>],
  render: (args) => (
    <Form {...args}>
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
  ),
};

/* ─── Banner states ──────────────────────────────────────────── */

/** Error banner — `error` renders the form-level error treatment above the children.
 *  @summary Form with error banner */
export const WithError: Story = {
  args: {
    title: 'Sign up',
    error: 'Please fix the errors below and try again.',
    footer: <Button type="submit">Create account</Button>,
    children: (
      <>
        <TextInput label="Email" type="email" placeholder="you@example.com" error="Email is already in use." fullWidth />
        <TextInput label="Password" type="password" placeholder="Choose a password" fullWidth />
      </>
    ),
  },
};

/** Success banner — `success` renders the form-level success treatment.
 *  @summary Form with success banner */
export const WithSuccess: Story = {
  args: {
    title: 'Newsletter',
    success: "You've been subscribed successfully!",
    footer: <Button type="submit" disabled>Subscribed</Button>,
    children: <TextInput label="Email" type="email" value="user@example.com" readOnly fullWidth />,
  },
};

/* ─── Interactive ────────────────────────────────────────────── */

/** Interactive form with validation — `useState` drives the error/success banners
 *  on submit. Render is required for the controlled-state demo.
 *  @summary Interactive form with validation */
export const InteractiveValidation: Story = {
  render: () => {
    const Demo = () => {
      const [submitted, setSubmitted] = useState(false);
      const [error, setError] = useState('');
      return (
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
              <Button variant="ghost" type="reset" onClick={() => { setError(''); setSubmitted(false); }}>
                Reset
              </Button>
            </div>
          }
        >
          <TextInput label="Name" name="name" placeholder="Your name" fullWidth />
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
          <TextArea label="Comments" name="comments" placeholder="Tell us more..." fullWidth />
        </Form>
      );
    };
    return <Demo />;
  },
};
