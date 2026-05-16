import type { Meta, StoryObj } from '@storybook/react-vite';
import { Form } from './Form';
import { TextInput } from '../TextInput';
import { TextArea } from '../TextArea';
import { Button } from '../Button';

/**
 * Form — structured form container with layout, header, footer, and inline messaging.
 * @summary Form container with layout and inline messaging
 */
const meta: Meta<typeof Form> = {
  title: 'Containers/form',
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

/** @summary Canonical Form — flip Controls to explore layout, gap, and inline messaging */
export const Default: Story = {
  args: {
    title: 'Contact Us',
    description: "We'll get back to you within 24 hours.",
    footer: <Button type="submit">Send Message</Button>,
  },
  render: (args) => (
    <div style={{ width: 400 }}>
      <Form {...args}>
        <TextInput label="Name" placeholder="Your name" fullWidth />
        <TextInput label="Email" type="email" placeholder="you@example.com" fullWidth />
        <TextArea label="Message" placeholder="How can we help?" fullWidth />
      </Form>
    </div>
  ),
};
