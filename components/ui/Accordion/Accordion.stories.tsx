import type { Meta, StoryObj } from '@storybook/react-vite';
import { Accordion } from './Accordion';

/**
 * Accordion — collapsible item list. By default only one item is open at a
 * time; pass `allowMultiple` to let several open simultaneously. Items accept
 * `ReactNode` content for rich layouts.
 * @summary Collapsible item list
 */
const meta: Meta<typeof Accordion> = {
  title: 'Components/Container/accordion',
  component: Accordion,
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div style={{ maxWidth: '640px' }}><Story /></div>],
  argTypes: {
    allowMultiple: { control: 'boolean', description: 'Allow multiple items open simultaneously' },
  },
};

export default meta;
type Story = StoryObj<typeof Accordion>;

const faqItems = [
  { id: '1', title: 'What services do you offer?', content: 'We offer brand design, marketing design, product design, and web development services tailored to your business needs.' },
  { id: '2', title: 'How long does a typical project take?', content: 'Project timelines vary based on scope and complexity. A simple branding project may take 2-4 weeks, while a full website build typically takes 6-12 weeks.' },
  { id: '3', title: 'Do you offer ongoing support?', content: 'Yes, we offer monthly retainer packages for ongoing design and development support. This includes maintenance, updates, and new feature development.' },
  { id: '4', title: 'What is your pricing structure?', content: 'We offer project-based pricing and monthly retainers. Contact us for a custom quote based on your specific needs and budget.' },
  { id: '5', title: 'Can you work with our existing brand guidelines?', content: 'Absolutely. We frequently work within established brand systems and can extend your existing guidelines into new digital experiences.' },
  { id: '6', title: 'What is your revision process?', content: 'Each project includes defined revision rounds. We collaborate closely throughout the process to ensure the final deliverables meet your expectations.' },
];

/** Args-driven sandbox.
 *  @summary Live playground with all controls */
export const Playground: Story = {
  args: { items: faqItems, allowMultiple: false },
};

/** Single-open behavior (default) — opening one item closes the previously open one.
 *  @summary Single-open accordion */
export const SingleOpen: Story = {
  args: { items: faqItems.slice(0, 3), defaultOpenItems: ['1'] },
};

/** Multi-open behavior — `allowMultiple` lets several items stay open.
 *  @summary Multi-open accordion */
export const MultiOpen: Story = {
  args: { items: faqItems.slice(0, 4), allowMultiple: true, defaultOpenItems: ['1', '3'] },
};

/** Rich content — `content` accepts any ReactNode. Use for ordered lists,
 *  multi-paragraph copy, or embedded components.
 *  @summary Accordion with rich content */
export const RichContent: Story = {
  args: {
    items: [
      {
        id: 'rich-1',
        title: 'Getting started',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>
            <p style={{ margin: 0 }}>Follow these steps to get started with our platform:</p>
            <ol style={{ margin: 0, paddingLeft: 'var(--padding-xl)' }}>
              <li>Create your account</li>
              <li>Complete the onboarding questionnaire</li>
              <li>Schedule your kickoff call</li>
              <li>Review and approve the project brief</li>
            </ol>
          </div>
        ),
      },
      {
        id: 'rich-2',
        title: 'Billing and payments',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>
            <p style={{ margin: 0 }}>We accept all major credit cards, ACH transfers, and invoicing for enterprise clients.</p>
            <p style={{ margin: 0 }}>Payments are due within 15 days of invoice date.</p>
          </div>
        ),
      },
    ],
    defaultOpenItems: ['rich-1'],
  },
};
