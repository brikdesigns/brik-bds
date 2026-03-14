import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Accordion } from './Accordion';

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

const Stack = ({ children, gap = 'var(--gap-xl)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap }}>{children}</div>
);

/* ─── Sample Data ─────────────────────────────────────────────── */

const faqItems = [
  { id: '1', title: 'What services do you offer?', content: 'We offer brand design, marketing design, product design, and web development services tailored to your business needs.' },
  { id: '2', title: 'How long does a typical project take?', content: 'Project timelines vary based on scope and complexity. A simple branding project may take 2-4 weeks, while a full website build typically takes 6-12 weeks.' },
  { id: '3', title: 'Do you offer ongoing support?', content: 'Yes, we offer monthly retainer packages for ongoing design and development support. This includes maintenance, updates, and new feature development.' },
  { id: '4', title: 'What is your pricing structure?', content: 'We offer project-based pricing and monthly retainers. Contact us for a custom quote based on your specific needs and budget.' },
  { id: '5', title: 'Can you work with our existing brand guidelines?', content: 'Absolutely. We frequently work within established brand systems and can extend your existing guidelines into new digital experiences.' },
  { id: '6', title: 'What is your revision process?', content: 'Each project includes defined revision rounds. We collaborate closely throughout the process to ensure the final deliverables meet your expectations.' },
];

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof Accordion> = {
  title: 'Displays/Accordion/accordion',
  component: Accordion,
  parameters: { layout: 'padded' },
  argTypes: {
    allowMultiple: { control: 'boolean', description: 'Allow multiple items open simultaneously' },
  },
};

export default meta;
type Story = StoryObj<typeof Accordion>;

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND — Args-based, use Controls panel to explore
   ═══════════════════════════════════════════════════════════════ */

export const Playground: Story = {
  args: {
    items: faqItems,
    allowMultiple: false,
  },
};

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS — Behavior modes, pre-opened, and rich content
   ═══════════════════════════════════════════════════════════════ */

export const Variants: Story = {
  render: () => (
    <Stack gap="var(--gap-huge)">
      <div>
        <SectionLabel>Single open (default)</SectionLabel>
        <Accordion items={faqItems.slice(0, 3)} defaultOpenItems={['1']} />
      </div>

      <div>
        <SectionLabel>Multiple open</SectionLabel>
        <Accordion items={faqItems.slice(0, 4)} allowMultiple defaultOpenItems={['1', '3']} />
      </div>

      <div>
        <SectionLabel>Rich content</SectionLabel>
        <Accordion
          items={[
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
          ]}
          defaultOpenItems={['rich-1']}
        />
      </div>
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   3. PATTERNS — Real-world compositions
   ═══════════════════════════════════════════════════════════════ */

export const Patterns: Story = {
  render: () => (
    <Stack gap="var(--gap-huge)">
      {/* FAQ section */}
      <div style={{ maxWidth: '640px' }}>
        <SectionLabel>FAQ section</SectionLabel>
        <Accordion items={faqItems} />
      </div>

      {/* Settings panel */}
      <div style={{ maxWidth: '600px' }}>
        <SectionLabel>Settings panel</SectionLabel>
        <Accordion
          allowMultiple
          defaultOpenItems={['s2']}
          items={[
            { id: 's1', title: 'Account settings', content: 'Manage your account name, email, and password.' },
            { id: 's2', title: 'Notification preferences', content: 'Choose which notifications you receive and how they are delivered.' },
            { id: 's3', title: 'Privacy & security', content: 'Two-factor authentication, session management, and data export options.' },
          ]}
        />
      </div>
    </Stack>
  ),
};
