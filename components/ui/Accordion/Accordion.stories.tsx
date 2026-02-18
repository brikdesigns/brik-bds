import type { Meta, StoryObj } from '@storybook/react';
import { Accordion } from './Accordion';

const sampleItems = [
  {
    id: '1',
    title: 'What services do you offer?',
    content: 'We offer brand design, marketing design, product design, and web development services tailored to your business needs.',
  },
  {
    id: '2',
    title: 'How long does a typical project take?',
    content: 'Project timelines vary based on scope and complexity. A simple branding project may take 2-4 weeks, while a full website build typically takes 6-12 weeks.',
  },
  {
    id: '3',
    title: 'Do you offer ongoing support?',
    content: 'Yes, we offer monthly retainer packages for ongoing design and development support. This includes maintenance, updates, and new feature development.',
  },
  {
    id: '4',
    title: 'What is your pricing structure?',
    content: 'We offer project-based pricing and monthly retainers. Contact us for a custom quote based on your specific needs and budget.',
  },
  {
    id: '5',
    title: 'Can you work with our existing brand guidelines?',
    content: 'Absolutely. We frequently work within established brand systems and can extend your existing guidelines into new digital experiences.',
  },
  {
    id: '6',
    title: 'What is your revision process?',
    content: 'Each project includes defined revision rounds. We collaborate closely throughout the process to ensure the final deliverables meet your expectations.',
  },
];

const meta = {
  title: 'Components/accordion',
  component: Accordion,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    allowMultiple: {
      control: 'boolean',
      description: 'Allow multiple items to be open simultaneously',
    },
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default FAQ-style accordion with single-open behavior
 */
export const Default: Story = {
  args: {
    items: sampleItems,
  },
};

/**
 * Accordion with one item pre-opened
 */
export const WithDefaultOpen: Story = {
  args: {
    items: sampleItems,
    defaultOpenItems: ['1'],
  },
};

/**
 * Allow multiple items open at the same time
 */
export const MultipleOpen: Story = {
  args: {
    items: sampleItems,
    allowMultiple: true,
    defaultOpenItems: ['1', '3'],
  },
};

/**
 * Short accordion with just two items
 */
export const TwoItems: Story = {
  args: {
    items: sampleItems.slice(0, 2),
  },
};

/**
 * Accordion with rich content including paragraphs
 */
export const RichContent: Story = {
  args: {
    items: [
      {
        id: '1',
        title: 'Getting started',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--_space---gap--lg)' }}>
            <p style={{ margin: 0 }}>Follow these steps to get started with our platform:</p>
            <ol style={{ margin: 0, paddingLeft: 'var(--_space---xl)' }}>
              <li>Create your account</li>
              <li>Complete the onboarding questionnaire</li>
              <li>Schedule your kickoff call</li>
              <li>Review and approve the project brief</li>
            </ol>
          </div>
        ),
      },
      {
        id: '2',
        title: 'Billing and payments',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--_space---gap--lg)' }}>
            <p style={{ margin: 0 }}>We accept all major credit cards, ACH transfers, and invoicing for enterprise clients.</p>
            <p style={{ margin: 0 }}>Payments are due within 15 days of invoice date. Late payments may incur a 1.5% monthly fee.</p>
          </div>
        ),
      },
      {
        id: '3',
        title: 'Cancellation policy',
        content: 'You may cancel your subscription at any time. Refunds are available for unused portions of annual plans within the first 30 days.',
      },
    ],
  },
};

/**
 * Constrained width to show real-world settings panel usage
 */
export const ConstrainedWidth: Story = {
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '600px' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    items: sampleItems.slice(0, 4),
    defaultOpenItems: ['2'],
  },
};
