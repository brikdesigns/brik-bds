import type { Meta, StoryObj } from '@storybook/react-vite';
import { CollapsibleCard } from './CollapsibleCard';

/**
 * CollapsibleCard — section card with an expandable body. Use for proposal
 * sections, settings panels, and FAQ-style accordion entries that need a
 * card-tier surface (vs `Accordion`'s flat row treatment).
 * @summary Section card with expandable body
 */
const meta: Meta<typeof CollapsibleCard> = {
  title: 'Components/Card/collapsible-card',
  component: CollapsibleCard,
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

/** Args-driven sandbox.
 *  @summary Live playground with all controls */
export const Playground: Story = {
  args: {
    sectionLabel: 'Section 01',
    title: 'Overview and Goals',
    defaultOpen: false,
    children: 'This is the collapsible content area. It can contain any content including text, lists, tables, or nested components.',
  },
};

/* ─── Open/close states ──────────────────────────────────────── */

/** Default collapsed state.
 *  @summary Collapsed by default */
export const Collapsed: Story = {
  args: {
    sectionLabel: 'Section 01',
    title: 'Overview and Goals',
    children: 'Strategic overview of the project objectives and expected outcomes.',
  },
};

/** Default open state — useful for the first section in a proposal stack.
 *  @summary Open by default */
export const Expanded: Story = {
  args: {
    sectionLabel: 'Section 02',
    title: 'Scope of Project',
    defaultOpen: true,
    children: 'Detailed breakdown of deliverables and service offerings.',
  },
};

/* ─── Header shapes ──────────────────────────────────────────── */

/** No section label — title only.
 *  @summary Title-only header */
export const NoSectionLabel: Story = {
  args: {
    title: 'Settings',
    defaultOpen: true,
    children: 'A collapsible card without a section label — useful for settings panels or standalone collapsible areas.',
  },
};

/* ─── Content shapes ─────────────────────────────────────────── */

/** Rich content body — children accepts any ReactNode.
 *  @summary Rich body content */
export const RichContent: Story = {
  args: {
    sectionLabel: 'Section 03',
    title: 'Project Timeline',
    defaultOpen: true,
    children: (
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
    ),
  },
};

/* ─── Composition recipes ────────────────────────────────────── */

/** Proposal sections — common stack of CollapsibleCards used to build a
 *  numbered-section proposal page.
 *  @summary Multi-section proposal stack */
export const ProposalSections: Story = {
  decorators: [(Story) => <div style={{ maxWidth: 640 }}><Story /></div>],
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>
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
    </div>
  ),
};
