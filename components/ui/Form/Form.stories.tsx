import React from 'react';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Form } from './Form';
import { TextInput } from '../TextInput';
import { TextArea } from '../TextArea';
import { Select } from '../Select';
import { Button } from '../Button';

/* ─── Layout Helpers (story-only) ─────────────────────────────── */

const SectionLabel = ({ children }: { children: string }) => (
  <div style={{
    fontFamily: 'var(--font-family-label)',
    fontSize: 'var(--body-xs)', // bds-lint-ignore
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: 'var(--gap-md)',
    color: 'var(--text-muted)',
  }}>
    {children}
  </div>
);

const Row = ({ children, gap = 'var(--padding-sm)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', gap, flexWrap: 'wrap', alignItems: 'flex-start' }}>{children}</div>
);

const Stack = ({ children, gap = 'var(--gap-xl)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap }}>{children}</div>
);

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof Form> = {
  title: 'Components/Form/form',
  component: Form,
  tags: ['surface-shared'],
  parameters: { layout: 'centered' },
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

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND — Args-based, use Controls panel to explore
   ═══════════════════════════════════════════════════════════════ */

export const Playground: Story = {
  render: (args) => (
    <div style={{ width: 400 }}>
      <Form {...args}>
        <TextInput label="Name" placeholder="Your name" fullWidth />
        <TextInput label="Email" type="email" placeholder="you@example.com" fullWidth />
        <TextArea label="Message" placeholder="How can we help?" fullWidth />
      </Form>
    </div>
  ),
  args: {
    title: 'Contact Us',
    description: "We'll get back to you within 24 hours.",
    footer: <Button type="submit">Send Message</Button>,
  },
};

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS — Layouts, states, gap sizes
   ═══════════════════════════════════════════════════════════════ */

export const Variants: Story = {
  render: () => (
    <Row gap="var(--padding-xl)">
      <div style={{ width: 380 }}>
        <Stack>
          {/* Error state */}
          <div>
            <SectionLabel>With error</SectionLabel>
            <Form
              title="Sign Up"
              error="Please fix the errors below and try again."
              footer={<Button type="submit">Create Account</Button>}
            >
              <TextInput label="Email" type="email" placeholder="you@example.com" error="Email is already in use." fullWidth />
              <TextInput label="Password" type="password" placeholder="Choose a password" fullWidth />
            </Form>
          </div>

          {/* Success state */}
          <div>
            <SectionLabel>With success</SectionLabel>
            <Form
              title="Newsletter"
              success="You've been subscribed successfully!"
              footer={<Button type="submit" disabled>Subscribed</Button>}
            >
              <TextInput label="Email" type="email" value="user@example.com" readOnly fullWidth />
            </Form>
          </div>
        </Stack>
      </div>

      <div style={{ width: 500 }}>
        <Stack>
          {/* Horizontal layout */}
          <div>
            <SectionLabel>Horizontal layout</SectionLabel>
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
        </Stack>
      </div>
    </Row>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   3. PATTERNS — Interactive form with validation
   ═══════════════════════════════════════════════════════════════ */

export const Patterns: Story = {
  render: () => {
    function FeedbackForm() {
      const [submitted, setSubmitted] = useState(false);
      const [error, setError] = useState('');
      return (
        <div style={{ width: 400 }}>
          <SectionLabel>Interactive feedback form</SectionLabel>
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
        </div>
      );
    }

    return <FeedbackForm />;
  },
};
