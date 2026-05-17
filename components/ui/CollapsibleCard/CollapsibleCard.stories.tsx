import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CollapsibleCard } from './CollapsibleCard';

const Stack = ({ children, gap = 'var(--gap-xl)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap }}>{children}</div>
);

const meta: Meta<typeof CollapsibleCard> = {
  title: 'Containers/collapsible-card',
  component: CollapsibleCard,
  tags: ['surface-shared'],
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div style={{ maxWidth: 640 }}><Story /></div>],
  argTypes: {
    sectionLabel: {
      control: 'text',
      description: 'Optional section number or label rendered above the title in a muted style.',
    },
    title: {
      control: 'text',
      description: 'Clickable header text that toggles the panel.',
    },
    defaultOpen: {
      control: 'boolean',
      description: 'Initial open state (uncontrolled). Use `open` + `onOpenChange` for controlled mode.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof CollapsibleCard>;

/* ─── Playground ─────────────────────────────────────────────── */

/** @summary Interactive sandbox — toggle defaultOpen, sectionLabel via Controls */
export const Playground: Story = {
  args: {
    sectionLabel: 'Section 01',
    title: 'Overview and Goals',
    defaultOpen: false,
    children: 'This is the collapsible content area. It can contain any content including text, lists, tables, or nested components.',
  },
};

/* ─── Variants (Q3 — semantic starting points) ──────────────── */

/**
 * `defaultOpen={true}` — card starts expanded. Use when the section
 * content is immediately relevant and collapsing is secondary.
 *
 * @summary defaultOpen=true — starts expanded
 */
export const DefaultOpen: Story = {
  args: {
    sectionLabel: 'Section 01',
    title: 'Overview and Goals',
    defaultOpen: true,
    children: 'This section starts expanded. Users can collapse it once they have read the content.',
  },
};

/* ─── Patterns (Q4 — irreducible compositions) ───────────────── */

/**
 * Rich HTML content in the children slot — headings, lists, and
 * multiple content blocks that args can't express as a plain string.
 *
 * @summary Rich content slot — nested headings and lists
 */
export const WithRichContent: Story = {
  render: () => (
    <CollapsibleCard sectionLabel="Section 03" title="Project Timeline" defaultOpen>
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
  ),
};

/**
 * Four stacked CollapsibleCards forming a numbered proposal — the primary
 * real-world use case. Sections are independently collapsible.
 *
 * @summary Stacked proposal sections — accordion layout
 */
export const ProposalSections: Story = {
  render: () => (
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
  ),
};
