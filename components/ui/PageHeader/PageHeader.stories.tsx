import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPalette } from '@fortawesome/free-solid-svg-icons';
import { PageHeader } from './PageHeader';
import { Breadcrumb } from '../Breadcrumb';
import { TabBar, type TabItem } from '../TabBar';
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

const Stack = ({ children, gap = 'var(--gap-xl)' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap }}>{children}</div>
);

/* ─── Helpers ─────────────────────────────────────────────────── */

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

const brandBadgeStyles: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 28,
  height: 28,
  backgroundColor: 'var(--background-brand-primary)',
  color: 'var(--text-inverse)',
  borderRadius: 'var(--border-radius-md)',
  fontSize: 'var(--label-sm)', // bds-lint-ignore — story decoration
};

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof PageHeader> = {
  title: 'Navigation/Secondary/page-header',
  component: PageHeader,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof PageHeader>;

/* ═══════════════════════════════════════════════════════════════
   1. PLAYGROUND — Args-based, use Controls panel to explore
   ═══════════════════════════════════════════════════════════════ */

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

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS — Different slot combinations
   ═══════════════════════════════════════════════════════════════ */

export const Variants: Story = {
  render: () => {
    const tabs = useInteractiveTabs(['Active', 'Latest', 'Product', 'Design System', 'Marketing']);
    const filterTabs = useInteractiveTabs(['All', 'Active', 'Archived']);

    return (
      <Stack gap="var(--gap-huge)">
        <div>
          <SectionLabel>Title only</SectionLabel>
          <PageHeader title="Dashboard" />
        </div>

        <div>
          <SectionLabel>Title + subtitle</SectionLabel>
          <PageHeader title="Team Members" subtitle="Manage your team and their permissions." />
        </div>

        <div>
          <SectionLabel>With breadcrumbs</SectionLabel>
          <PageHeader
            title="Design System"
            subtitle="Components, tokens, and documentation."
            breadcrumbs={
              <Breadcrumb items={[
                { label: 'Home', href: '#' },
                { label: 'Products', href: '#' },
                { label: 'Design System' },
              ]} />
            }
          />
        </div>

        <div>
          <SectionLabel>With actions</SectionLabel>
          <PageHeader
            title="Settings"
            subtitle="Configure your account preferences."
            actions={
              <>
                <Button variant="primary">Save Changes</Button>
                <Button variant="secondary">Cancel</Button>
              </>
            }
          />
        </div>

        <div>
          <SectionLabel>With tabs</SectionLabel>
          <PageHeader
            title="Projects"
            subtitle="Browse and manage all projects."
            tabs={<TabBar variant="tab" items={filterTabs} />}
          />
        </div>

        <div>
          <SectionLabel>With metadata</SectionLabel>
          <PageHeader
            title="Brand Design"
            subtitle="Service details and billing info."
            breadcrumbs={<Breadcrumb items={sampleBreadcrumbs} />}
            actions={
              <>
                <Button variant="primary" size="sm">Primary Button</Button>
                <Button variant="secondary" size="sm">Secondary Button</Button>
              </>
            }
            metadata={[
              {
                label: 'Category',
                value: (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={brandBadgeStyles}><FontAwesomeIcon icon={faPalette} /></span>
                    Brand Design
                  </span>
                ),
              },
              { label: 'Billing', value: 'One-time' },
              { label: 'Stripe Product', value: 'brand-design' },
            ]}
          />
        </div>

        <div>
          <SectionLabel>Full composition</SectionLabel>
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
        </div>
      </Stack>
    );
  },
};

/* ═══════════════════════════════════════════════════════════════
   3. PATTERNS — Real-world compositions
   ═══════════════════════════════════════════════════════════════ */

export const Patterns: Story = {
  render: () => {
    const reportTabs = useInteractiveTabs(['Overview', 'Revenue', 'Engagement', 'Retention']);

    return (
      <Stack gap="var(--gap-huge)">
        {/* Company detail page */}
        <div>
          <SectionLabel>Company detail page</SectionLabel>
          <PageHeader
            title="Acme Corp"
            subtitle="Enterprise client since 2024"
            breadcrumbs={
              <Breadcrumb items={[
                { label: 'Admin', href: '#' },
                { label: 'Companies', href: '#' },
                { label: 'Acme Corp' },
              ]} />
            }
            actions={<Button variant="primary" size="sm">Edit Company</Button>}
            metadata={[
              { label: 'Status', value: 'Active' },
              { label: 'Plan', value: 'Enterprise' },
              { label: 'MRR', value: '$12,400' },
            ]}
          />
        </div>

        {/* Analytics dashboard */}
        <div>
          <SectionLabel>Analytics dashboard</SectionLabel>
          <PageHeader
            title="Analytics"
            subtitle="Monitor key performance metrics."
            tabs={<TabBar variant="tab" items={reportTabs} />}
          />
        </div>
      </Stack>
    );
  },
};
