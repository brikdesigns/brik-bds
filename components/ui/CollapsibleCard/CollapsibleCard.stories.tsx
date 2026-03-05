import type { Meta, StoryObj } from '@storybook/react';
import { CollapsibleCard } from './CollapsibleCard';

const meta = {
  title: 'Components/collapsible-card',
  component: CollapsibleCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CollapsibleCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    sectionLabel: 'Section 01',
    title: 'Overview and Goals',
    defaultOpen: false,
    children: 'This is the collapsible content area. It can contain any content including text, lists, tables, or nested components.',
  },
};

export const Open: Story = {
  args: {
    sectionLabel: 'Section 02',
    title: 'Scope of Project',
    defaultOpen: true,
    children: 'This card starts in the open state, revealing its content immediately.',
  },
};

export const NoSectionLabel: Story = {
  args: {
    title: 'Settings',
    defaultOpen: true,
    children: 'A collapsible card without a section label — useful for settings panels or standalone collapsible areas.',
  },
};

export const WithRichContent: Story = {
  args: {
    sectionLabel: 'Section 03',
    title: 'Project Timeline',
    defaultOpen: true,
    children: (
      <div>
        <h4 style={{ margin: '0 0 8px', color: 'var(--_color---text--primary)' }}>Phase 1: Discovery</h4>
        <ul style={{ margin: '0 0 16px', paddingLeft: '24px', color: 'var(--_color---text--secondary)' }}>
          <li>Stakeholder interviews</li>
          <li>Competitive analysis</li>
          <li>Requirements gathering</li>
        </ul>
        <h4 style={{ margin: '0 0 8px', color: 'var(--_color---text--primary)' }}>Phase 2: Design</h4>
        <ul style={{ margin: 0, paddingLeft: '24px', color: 'var(--_color---text--secondary)' }}>
          <li>Wireframes and prototypes</li>
          <li>Visual design</li>
          <li>Design review</li>
        </ul>
      </div>
    ),
  },
};

export const MultipleSections: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <CollapsibleCard sectionLabel="Section 01" title="Overview and Goals">
        <p style={{ margin: 0, color: 'var(--_color---text--secondary)' }}>
          Strategic overview of the project objectives and expected outcomes.
        </p>
      </CollapsibleCard>
      <CollapsibleCard sectionLabel="Section 02" title="Scope of Project">
        <p style={{ margin: 0, color: 'var(--_color---text--secondary)' }}>
          Detailed breakdown of deliverables and service offerings.
        </p>
      </CollapsibleCard>
      <CollapsibleCard sectionLabel="Section 03" title="Project Timeline">
        <p style={{ margin: 0, color: 'var(--_color---text--secondary)' }}>
          Phased timeline with milestones and deliverable dates.
        </p>
      </CollapsibleCard>
      <CollapsibleCard sectionLabel="Section 04" title="Fee Summary">
        <p style={{ margin: 0, color: 'var(--_color---text--secondary)' }}>
          Pricing breakdown with service-level detail.
        </p>
      </CollapsibleCard>
    </div>
  ),
};
