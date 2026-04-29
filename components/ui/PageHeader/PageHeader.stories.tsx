import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { PageHeader } from './PageHeader';
import { Breadcrumb } from '../Breadcrumb';
import { TabBar, type TabItem } from '../TabBar';
import { Button } from '../Button';
import { ServiceTag } from '../ServiceBadge';
import { CardSummary } from '../Card';

/**
 * PageHeader — top-of-page composition for entity/dashboard pages. Slots:
 * `breadcrumbs`, `title`, `subtitle`, `badge`, `metadata`, `actions`, `stats`,
 * `tabs`. Use whichever slots the page needs — all are optional.
 * @summary Top-of-page header composition
 */
const meta: Meta<typeof PageHeader> = {
  title: 'Components/Navigation/page-header',
  component: PageHeader,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof PageHeader>;

function useInteractiveTabs(labels: string[]): TabItem[] {
  const [activeIndex, setActiveIndex] = useState(0);
  return labels.map((label, i) => ({
    label,
    active: i === activeIndex,
    onClick: () => setActiveIndex(i),
  }));
}

const sampleBreadcrumbs = [
  { label: 'Show All', href: '#' },
  { label: 'Product', href: '#' },
  { label: 'Design System' },
];

/** Args-driven sandbox.
 *  @summary Live playground with all controls */
export const Playground: Story = {
  args: {
    title: 'My Account',
    subtitle: 'Manage your membership plan.',
    breadcrumbs: <Breadcrumb items={sampleBreadcrumbs} />,
    actions: (
      <>
        <Button variant="primary">Primary Button</Button>
        <Button variant="secondary">Secondary Button</Button>
      </>
    ),
  },
};

/* ─── Slot shapes ────────────────────────────────────────────── */

/** Title only — minimal page header.
 *  @summary Title only */
export const TitleOnly: Story = {
  args: { title: 'Dashboard' },
};

/** Title + subtitle — adds a context line below the title.
 *  @summary Title with subtitle */
export const TitleWithSubtitle: Story = {
  args: { title: 'Team Members', subtitle: 'Manage your team and their permissions.' },
};

/** With breadcrumbs — adds page-position context above the title.
 *  @summary Header with breadcrumbs */
export const WithBreadcrumbs: Story = {
  args: {
    title: 'Design System',
    subtitle: 'Components, tokens, and documentation.',
    breadcrumbs: (
      <Breadcrumb items={[
        { label: 'Home', href: '#' },
        { label: 'Products', href: '#' },
        { label: 'Design System' },
      ]} />
    ),
  },
};

/** With actions — primary + secondary CTAs in the header right slot.
 *  @summary Header with action buttons */
export const WithActions: Story = {
  args: {
    title: 'Settings',
    subtitle: 'Configure your account preferences.',
    actions: (
      <>
        <Button variant="primary">Save Changes</Button>
        <Button variant="secondary">Cancel</Button>
      </>
    ),
  },
};

/** With tabs — TabBar rendered below the header for sub-page navigation.
 *  @summary Header with tab navigation */
export const WithTabs: Story = {
  render: () => {
    const tabs = useInteractiveTabs(['All', 'Active', 'Archived']);
    return (
      <PageHeader
        title="Projects"
        subtitle="Browse and manage all projects."
        tabs={<TabBar variant="tab" items={tabs} />}
      />
    );
  },
};

/** With badge + metadata — service-detail-page shape.
 *  @summary Header with badge and metadata */
export const WithBadgeAndMetadata: Story = {
  args: {
    title: 'Brand Design',
    subtitle: 'Service details and billing info.',
    badge: <ServiceTag category="brand" variant="icon" serviceName="Brand Identity Bundle" size="lg" />,
    breadcrumbs: <Breadcrumb items={sampleBreadcrumbs} />,
    actions: (
      <>
        <Button variant="primary" size="sm">Primary Button</Button>
        <Button variant="secondary" size="sm">Secondary Button</Button>
      </>
    ),
    metadata: [
      { label: 'Category', value: 'Brand' },
      { label: 'Billing', value: 'One-time' },
      { label: 'Stripe Product', value: 'brand-design' },
    ],
  },
};

/** With stats — summary-card row above the tabs. Used on entity overview pages.
 *  @summary Header with summary stats */
export const WithStats: Story = {
  render: () => {
    const filterTabs = useInteractiveTabs(['All', 'Active', 'Archived']);
    return (
      <PageHeader
        title="Acme Corp"
        breadcrumbs={
          <Breadcrumb items={[
            { label: 'Admin', href: '#' },
            { label: 'Companies', href: '#' },
            { label: 'Acme Corp' },
          ]} />
        }
        metadata={[
          { label: 'Status', value: 'Active' },
          { label: 'Type', value: 'Client' },
          { label: 'Start Date', value: 'Jan 1, 2024' },
        ]}
        stats={
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--gap-lg)' }}>
            <CardSummary label="Services" value={4} />
            <CardSummary label="Projects" value={2} />
            <CardSummary label="Open Invoices" value={1} />
            <CardSummary label="Contacts" value={5} />
          </div>
        }
        tabs={<TabBar variant="tab" items={filterTabs} />}
      />
    );
  },
};

/** Full composition — every slot wired up. The kitchen-sink reference.
 *  @summary Every slot wired up */
export const FullComposition: Story = {
  render: () => {
    const tabs = useInteractiveTabs(['Active', 'Latest', 'Product', 'Design System', 'Marketing']);
    return (
      <PageHeader
        title="My Account"
        subtitle="Manage your membership plan."
        breadcrumbs={<Breadcrumb items={sampleBreadcrumbs} />}
        actions={
          <>
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
          </>
        }
        tabs={<TabBar variant="tab" items={tabs} />}
      />
    );
  },
};
