import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { PageHeader } from './PageHeader';
import { Breadcrumb } from '../Breadcrumb';
import { TabBar, type TabItem } from '../TabBar';
import { Button } from '../Button';
import { ServiceTag } from '../ServiceBadge';
import { CardSummary } from '../Card';

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

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof PageHeader> = {
  title: 'Navigation/Secondary/page-header',
  component: PageHeader,
  tags: ['surface-product'],
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

/** @summary Interactive playground for prop tweaking */
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

/** @summary All variants side by side */
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
          <SectionLabel>With badge + metadata</SectionLabel>
          <PageHeader
            title="Brand Design"
            subtitle="Service details and billing info."
            badge={<ServiceTag category="brand" variant="icon" serviceName="Brand Identity Bundle" size="lg" />}
            breadcrumbs={<Breadcrumb items={sampleBreadcrumbs} />}
            actions={
              <>
                <Button variant="primary" size="sm">Primary Button</Button>
                <Button variant="secondary" size="sm">Secondary Button</Button>
              </>
            }
            metadata={[
              { label: 'Category', value: 'Brand' },
              { label: 'Billing', value: 'One-time' },
              { label: 'Stripe Product', value: 'brand-design' },
            ]}
          />
        </div>

        <div>
          <SectionLabel>With stats (summary cards above tabs)</SectionLabel>
          <PageHeader
            title="Acme Corp"
            breadcrumbs={<Breadcrumb items={[
              { label: 'Admin', href: '#' },
              { label: 'Companies', href: '#' },
              { label: 'Acme Corp' },
            ]} />}
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

/** @summary Common usage patterns */
export const Patterns: Story = {
  render: () => {
    const reportTabs = useInteractiveTabs(['Overview', 'Revenue', 'Engagement', 'Retention']);

    return (
      <Stack gap="var(--gap-huge)">
        {/* Service detail page */}
        <div>
          <SectionLabel>Service detail page</SectionLabel>
          <PageHeader
            title="Website Design"
            subtitle="Custom web development and design service."
            badge={<ServiceTag category="marketing" variant="icon" serviceName="Custom Standard Web Development and Design" size="lg" />}
            breadcrumbs={
              <Breadcrumb items={[
                { label: 'Admin', href: '#' },
                { label: 'Services', href: '#' },
                { label: 'Website Design' },
              ]} />
            }
            actions={<Button variant="primary" size="sm">Edit Service</Button>}
            metadata={[
              { label: 'Category', value: 'Marketing' },
              { label: 'Billing', value: 'Monthly' },
              { label: 'Status', value: 'Active' },
            ]}
          />
        </div>

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

/* ═══════════════════════════════════════════════════════════════
   4. TUNABLE SPACING — component-scoped CSS variables
   ═══════════════════════════════════════════════════════════════ */

/**
 * @summary Demonstrates the four CSS variables that tune internal rhythm —
 * defaults vs a roomier override (matching renew-pms's tuning).
 */
export const TunableSpacing: Story = {
  render: () => {
    return (
      <Stack gap="var(--gap-huge)">
        {/* Defaults */}
        <div>
          <SectionLabel>Defaults — gap-sm content gap, 0 divider padding</SectionLabel>
          <PageHeader
            title="Default Header"
            subtitle="Title↔subtitle gap = 6px (gap-sm). Subtitle sits flush above the divider."
            actions={<Button variant="primary" size="sm">Action</Button>}
          />
        </div>

        {/* Tuned for clinical density (renew-pms) */}
        <div>
          <SectionLabel>Tuned — wider content gap + divider breathing room</SectionLabel>
          <PageHeader
            title="Tuned Header"
            subtitle="Title↔subtitle gap bumped to 12px; 16px breathing room before the divider."
            actions={<Button variant="primary" size="sm">Action</Button>}
            style={{
              // bds-lint-ignore — component-scoped CSS variables, not design tokens
              ['--page-header-content-gap' as string]: 'var(--padding-sm)',
              ['--page-header-padding-bottom' as string]: 'var(--padding-md)',
            }}
          />
        </div>

        {/* Even roomier — shows the full knob set */}
        <div>
          <SectionLabel>Roomy — all four knobs at the higher end</SectionLabel>
          <PageHeader
            title="Roomy Header"
            subtitle="Each gap stepped up one tier — useful for marketing-shaped pages with breathing room."
            tabs={<TabBar variant="tab" items={[
              { label: 'Overview', active: true, onClick: () => {} },
              { label: 'Settings', active: false, onClick: () => {} },
            ]} />}
            actions={<Button variant="primary" size="sm">Action</Button>}
            style={{
              // bds-lint-ignore — component-scoped CSS variables, not design tokens
              ['--page-header-section-gap' as string]: 'var(--gap-xl)',
              ['--page-header-content-gap' as string]: 'var(--gap-md)',
              ['--page-header-actions-gap' as string]: 'var(--gap-md)',
              ['--page-header-padding-bottom' as string]: 'var(--padding-md)',
            }}
          />
        </div>
      </Stack>
    );
  },
};
