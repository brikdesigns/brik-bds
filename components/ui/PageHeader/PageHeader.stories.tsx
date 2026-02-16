import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPalette } from '@fortawesome/free-solid-svg-icons';
import { PageHeader } from './PageHeader';
import { Breadcrumb } from '../Breadcrumb';
import { TabBar } from '../TabBar';
import { Button } from '../Button';

const meta: Meta<typeof PageHeader> = {
  title: 'Components/page-header',
  component: PageHeader,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof PageHeader>;

/**
 * Brand badge styles for metadata values
 */
const brandBadgeStyles: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 28,
  height: 28,
  backgroundColor: 'var(--_color---background--branding)',
  color: 'var(--_color---text--branding-dark)',
  borderRadius: 'var(--_border-radius---md)',
  fontSize: 14,
};

const sampleBreadcrumbs = [
  { label: 'Show All', href: '#' },
  { label: 'Product', href: '#' },
  { label: 'Design System' },
];

const sampleTabs = [
  { label: 'Active', active: true },
  { label: 'Latest' },
  { label: 'Product' },
  { label: 'Design System' },
  { label: 'Marketing' },
  { label: 'Other' },
];

// ─── Default (Tabbed) ────────────────────────────────────────────

/**
 * Default page header composing Breadcrumb, Button, and TabBar components.
 * No background — the component is transparent per the Figma spec.
 */
export const Default: Story = {
  parameters: {
    docs: {
      source: {
        code: `<PageHeader
  title="My Account"
  subtitle="Manage your membership plan."
  breadcrumbs={
    <Breadcrumb items={[
      { label: 'Show All', href: '#' },
      { label: 'Product', href: '#' },
      { label: 'Design System' },
    ]} />
  }
  actions={
    <>
      <Button variant="primary">Primary Button</Button>
      <Button variant="secondary">Secondary Button</Button>
    </>
  }
  tabs={
    <TabBar items={[
      { label: 'Active', active: true },
      { label: 'Latest' },
      { label: 'Product' },
      { label: 'Design System' },
      { label: 'Marketing' },
      { label: 'Other' },
    ]} />
  }
/>`,
      },
    },
  },
  args: {
    title: 'My Account',
    subtitle: 'Manage your membership plan.',
    breadcrumbs: <Breadcrumb items={sampleBreadcrumbs} />,
    tabs: <TabBar items={sampleTabs} />,
    actions: (
      <>
        <Button variant="primary">Primary Button</Button>
        <Button variant="secondary">Secondary Button</Button>
      </>
    ),
  },
};

// ─── With Metadata ───────────────────────────────────────────────

/**
 * Page header with metadata key-value pairs instead of tabs
 */
export const WithMetadata: Story = {
  parameters: {
    docs: {
      source: {
        code: `<PageHeader
  title="Brand Design"
  subtitle="Service details and billing info."
  breadcrumbs={
    <Breadcrumb items={[
      { label: 'Show All', href: '#' },
      { label: 'Product', href: '#' },
      { label: 'Design System' },
    ]} />
  }
  actions={
    <>
      <Button variant="primary" size="sm">Primary Button</Button>
      <Button variant="secondary" size="sm">Secondary Button</Button>
    </>
  }
  metadata={[
    { label: 'Category', value: 'Brand Design' },
    { label: 'Billing', value: 'One-time' },
    { label: 'Stripe Product', value: 'brand-design' },
  ]}
/>`,
      },
    },
  },
  args: {
    title: 'Brand Design',
    subtitle: 'Service details and billing info.',
    breadcrumbs: <Breadcrumb items={sampleBreadcrumbs} />,
    actions: (
      <>
        <Button variant="primary" size="sm">Primary Button</Button>
        <Button variant="secondary" size="sm">Secondary Button</Button>
      </>
    ),
    metadata: [
      {
        label: 'Category',
        value: (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={brandBadgeStyles}>
              <FontAwesomeIcon icon={faPalette} />
            </span>
            Brand Design
          </span>
        ),
      },
      { label: 'Billing', value: 'One-time' },
      { label: 'Stripe Product', value: 'brand-design' },
    ],
  },
};

// ─── Title Only ──────────────────────────────────────────────────

/**
 * Minimal page header — title only
 */
export const TitleOnly: Story = {
  parameters: {
    docs: {
      source: {
        code: `<PageHeader title="Dashboard" />`,
      },
    },
  },
  args: {
    title: 'Dashboard',
  },
};

// ─── With Subtitle ───────────────────────────────────────────────

/**
 * Title with subtitle
 */
export const WithSubtitle: Story = {
  parameters: {
    docs: {
      source: {
        code: `<PageHeader
  title="Team Members"
  subtitle="Manage your team and their permissions."
/>`,
      },
    },
  },
  args: {
    title: 'Team Members',
    subtitle: 'Manage your team and their permissions.',
  },
};

// ─── With Breadcrumbs ────────────────────────────────────────────

/**
 * Breadcrumb navigation above the title using the Breadcrumb component
 */
export const WithBreadcrumbs: Story = {
  parameters: {
    docs: {
      source: {
        code: `<PageHeader
  title="Design System"
  subtitle="Components, tokens, and documentation."
  breadcrumbs={
    <Breadcrumb items={[
      { label: 'Home', href: '#' },
      { label: 'Products', href: '#' },
      { label: 'Design System' },
    ]} />
  }
/>`,
      },
    },
  },
  args: {
    title: 'Design System',
    subtitle: 'Components, tokens, and documentation.',
    breadcrumbs: (
      <Breadcrumb
        items={[
          { label: 'Home', href: '#' },
          { label: 'Products', href: '#' },
          { label: 'Design System' },
        ]}
      />
    ),
  },
};

// ─── With Actions ────────────────────────────────────────────────

/**
 * Title row with action buttons aligned right using the Button component
 */
export const WithActions: Story = {
  parameters: {
    docs: {
      source: {
        code: `<PageHeader
  title="Settings"
  subtitle="Configure your account preferences."
  actions={
    <>
      <Button variant="primary">Save Changes</Button>
      <Button variant="secondary">Cancel</Button>
    </>
  }
/>`,
      },
    },
  },
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

// ─── Tabs Only ───────────────────────────────────────────────────

/**
 * Title with TabBar navigation and no actions
 */
export const TabsOnly: Story = {
  parameters: {
    docs: {
      source: {
        code: `<PageHeader
  title="Projects"
  subtitle="Browse and manage all projects."
  tabs={
    <TabBar items={[
      { label: 'All', active: true },
      { label: 'Active' },
      { label: 'Archived' },
    ]} />
  }
/>`,
      },
    },
  },
  args: {
    title: 'Projects',
    subtitle: 'Browse and manage all projects.',
    tabs: (
      <TabBar
        items={[
          { label: 'All', active: true },
          { label: 'Active' },
          { label: 'Archived' },
        ]}
      />
    ),
  },
};
