import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CollapsibleCard } from './CollapsibleCard';

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

/* ─── Meta ────────────────────────────────────────────── */

const meta: Meta<typeof CollapsibleCard> = {
  title: 'Displays/Card/collapsible-card',
  component: CollapsibleCard,
  tags: ['surface-shared'],
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div style={{ maxWidth: 640 }}><Story /></div>],
  argTypes: {
    sectionLabel: { control: 'text' },
    title: { control: 'text' },
    defaultOpen: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof CollapsibleCard>;

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND — Args-based, use Controls panel to explore
   ═══════════════════════════════════════════════════════════════ */

export const Playground: Story = {
  args: {
    sectionLabel: 'Section 01',
    title: 'Overview and Goals',
    defaultOpen: false,
    children: 'This is the collapsible content area. It can contain any content including text, lists, tables, or nested components.',
  },
};

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS — States, with/without section label, rich content
   ═══════════════════════════════════════════════════════════════ */

export const Variants: Story = {
  args: {
    title: 'Overview',
    children: 'Content',
  },
  render: () => (
    <Stack>
      <div>
        <SectionLabel>Collapsed (default)</SectionLabel>
        <CollapsibleCard
          sectionLabel="Section 01"
          title="Overview and Goals"
        >
          Strategic overview of the project objectives and expected outcomes.
        </CollapsibleCard>
      </div>

      <div>
        <SectionLabel>Expanded</SectionLabel>
        <CollapsibleCard
          sectionLabel="Section 02"
          title="Scope of Project"
          defaultOpen
        >
          Detailed breakdown of deliverables and service offerings.
        </CollapsibleCard>
      </div>

      <div>
        <SectionLabel>Without section label</SectionLabel>
        <CollapsibleCard
          title="Settings"
          defaultOpen
        >
          A collapsible card without a section label — useful for settings panels or standalone collapsible areas.
        </CollapsibleCard>
      </div>

      <div>
        <SectionLabel>With rich content</SectionLabel>
        <CollapsibleCard
          sectionLabel="Section 03"
          title="Project Timeline"
          defaultOpen
        >
          <div>
            <h4 style={{ margin: '0 0 var(--gap-md)', color: 'var(--text-primary)' }}>Phase 1: Discovery</h4>
            <ul style={{ margin: '0 0 var(--gap-lg)', paddingLeft: 'var(--padding-lg)', color: 'var(--text-secondary)' }}>
              <li>Stakeholder interviews</li>
              <li>Competitive analysis</li>
              <li>Requirements gathering</li>
            </ul>
            <h4 style={{ margin: '0 0 var(--gap-md)', color: 'var(--text-primary)' }}>Phase 2: Design</h4>
            <ul style={{ margin: 0, paddingLeft: 'var(--padding-lg)', color: 'var(--text-secondary)' }}>
              <li>Wireframes and prototypes</li>
              <li>Visual design</li>
              <li>Design review</li>
            </ul>
          </div>
        </CollapsibleCard>
      </div>
    </Stack>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   3. PATTERNS — Proposal sections (accordion layout)
   ═══════════════════════════════════════════════════════════════ */

export const Patterns: Story = {
  args: {
    title: 'Overview',
    children: 'Content',
  },
  render: () => (
    <Stack>
      <div>
        <SectionLabel>Proposal sections</SectionLabel>
        <Stack gap="var(--gap-lg)">
          <CollapsibleCard sectionLabel="Section 01" title="Overview and Goals">
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
              Strategic overview of the project objectives and expected outcomes.
            </p>
          </CollapsibleCard>
          <CollapsibleCard sectionLabel="Section 02" title="Scope of Project">
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
              Detailed breakdown of deliverables and service offerings.
            </p>
          </CollapsibleCard>
          <CollapsibleCard sectionLabel="Section 03" title="Project Timeline">
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
              Phased timeline with milestones and deliverable dates.
            </p>
          </CollapsibleCard>
          <CollapsibleCard sectionLabel="Section 04" title="Fee Summary">
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
              Pricing breakdown with service-level detail.
            </p>
          </CollapsibleCard>
        </Stack>
      </div>
    </Stack>
  ),
};
