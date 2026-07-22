import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { PageHeader } from './PageHeader';
import { PageHeaderActions } from './PageHeaderActions';
import { Breadcrumb } from '../Breadcrumb';
import { TabBar } from '../TabBar';
import { Button } from '../Button';
import { ServiceTag } from '../ServiceTag';

const sampleBreadcrumbs = [
  { label: 'Show All', href: '#' },
  { label: 'Product', href: '#' },
  { label: 'Design System' },
];

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof PageHeader> = {
  title: 'Navigation/page-header',
  component: PageHeader,
  tags: ['surface-product'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    badge: {
      control: false,
      description: 'Badge displayed left of the title, e.g. `<ServiceTag variant="icon">`.',
    },
    breadcrumbs: {
      control: false,
      description: 'Breadcrumb element (typically a `Breadcrumb` component) rendered above the title row.',
    },
    actions: {
      control: false,
      description:
        'Right-aligned action element(s) (primary Button, dropdown menu, etc.). Overrides any mode-driven auto-actions when set.',
    },
    tabs: {
      control: false,
      description: 'Optional `TabBar` (or equivalent) rendered at the bottom of the header — page-level navigation.',
    },
    metadata: {
      control: false,
      description: 'Key/value pairs rendered below the title row (e.g. Owner, Status, Updated).',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Title scale. Default `lg`.',
    },
    sticky: {
      control: 'boolean',
      description:
        'Pin the header to the top of its scroll container on scroll. Renders an opaque surface so content scrolls beneath it. Default `false`.',
    },
    mode: {
      control: 'select',
      options: ['read', 'edit'],
      description: 'Bimodal page state — drives auto-rendered actions. See the Read mode / Edit mode variants.',
    },
    onEdit: {
      control: false,
      description: 'Navigation handler in read mode. Wires the auto-rendered `[Edit]` button.',
    },
    onSave: {
      control: false,
      description: 'Submit handler in edit mode. Wires the auto-rendered `[Save]` button.',
    },
    onCancel: {
      control: false,
      description: 'Discard handler in edit mode. Wires the auto-rendered `[Cancel]` button.',
    },
    saveLoading: {
      control: 'boolean',
      description: 'Show loading state on the auto-rendered `[Save]` button.',
    },
    saveDisabled: {
      control: 'boolean',
      description: 'Disable the auto-rendered `[Save]` button (e.g. while the form is invalid).',
    },
    editLabel: { control: 'text', description: 'Label for the auto-rendered `[Edit]` button. Default `"Edit"`.' },
    saveLabel: { control: 'text', description: 'Label for the auto-rendered `[Save]` button. Default `"Save"`.' },
    cancelLabel: { control: 'text', description: 'Label for the auto-rendered `[Cancel]` button. Default `"Cancel"`.' },
  },
};

export default meta;
type Story = StoryObj<typeof PageHeader>;

/* ═══════════════════════════════════════════════════════════════
   1. DEFAULT — args-driven sandbox. Controls work.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive playground for prop tweaking */
export const Default: Story = {
  args: {
    title: 'My Account',
    subtitle: 'Manage your membership plan.',
    badge: <ServiceTag category="brand" variant="icon" serviceName="Brand Identity Bundle" size="lg" />,
    breadcrumbs: <Breadcrumb items={sampleBreadcrumbs} />,
    actions: (
      <>
        <Button variant="primary">Primary Button</Button>
        <Button variant="secondary">Secondary Button</Button>
      </>
    ),
    metadata: [
      { label: 'Category', value: 'Brand' },
      { label: 'Billing', value: 'One-time' },
      { label: 'Stripe Product', value: 'brand-design' },
    ],
  },
};

/* ═══════════════════════════════════════════════════════════════
   2. VARIANTS — Q3 semantic starting points
   ═══════════════════════════════════════════════════════════════ */

/**
 * Read mode auto-renders `[Edit]` (primary, pen icon) in the `actions`
 * slot. The `actions` prop, when supplied, always overrides mode-driven
 * actions — mirrors `Sheet`'s `footer` override.
 *
 * @summary Read mode — auto-renders [Edit]
 */
export const ReadMode: Story = {
  args: {
    title: 'Brand Identity Bundle',
    subtitle: 'Marketing · Active · Updated 2 days ago',
    breadcrumbs: (
      <Breadcrumb items={[
        { label: 'Settings', href: '#' },
        { label: 'Services', href: '#' },
        { label: 'Brand Identity Bundle' },
      ]} />
    ),
    mode: 'read',
    onEdit: fn(),
  },
};

/**
 * Edit mode auto-renders `[Cancel] [Save]` ButtonGroup in the `actions`
 * slot. Toggle `saveLoading` / `saveDisabled` via Controls to see the
 * auto-rendered `[Save]` button's loading / disabled state.
 *
 * @summary Edit mode — auto-renders [Cancel] [Save]
 */
export const EditMode: Story = {
  args: {
    title: 'Edit Brand Identity Bundle',
    subtitle: 'Update the service catalog entry.',
    breadcrumbs: (
      <Breadcrumb items={[
        { label: 'Settings', href: '#' },
        { label: 'Services', href: '#' },
        { label: 'Brand Identity Bundle', href: '#' },
        { label: 'Edit' },
      ]} />
    ),
    mode: 'edit',
    onSave: fn(),
    onCancel: fn(),
  },
};

/**
 * `PageHeaderActions` replaces the hand-composed flex div consumers used to
 * pass into `actions`. It fixes the hierarchy — `destructive` (far left) ·
 * `secondary` · `primary` (far right) — and injects a single shared `size`
 * (default `md`) into every slotted button, so a group can't render
 * mismatched sizes side by side (BACKLOG-638).
 *
 * @summary Structured destructive / secondary / primary action hierarchy
 */
export const StructuredActions: Story = {
  args: {
    title: 'Acme Corp',
    subtitle: 'Enterprise client since 2024',
    breadcrumbs: (
      <Breadcrumb items={[
        { label: 'Admin', href: '#' },
        { label: 'Companies', href: '#' },
        { label: 'Acme Corp' },
      ]} />
    ),
    actions: (
      <PageHeaderActions
        destructive={<Button variant="destructive">Delete</Button>}
        secondary={<Button variant="outline">Edit</Button>}
        primary={<Button variant="primary">New Proposal</Button>}
      />
    ),
    metadata: [
      { label: 'Status', value: 'Active' },
      { label: 'Plan', value: 'Enterprise' },
    ],
  },
};

/* ═══════════════════════════════════════════════════════════════
   3. PATTERNS — Q4 irreducible: needs a scrollable ancestor container,
      not just a prop value, to demonstrate `sticky`.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Sticky header pinned to the top of a scroll container */
export const Sticky: Story = {
  render: () => (
    <div
      style={{
        height: 320,
        overflowY: 'auto',
        border: '1px solid var(--border-muted)',
        background: 'var(--surface-primary)',
      }}
    >
      <PageHeader
        title="Project detail"
        subtitle="Scroll this container — the header stays pinned to the top."
        sticky
        actions={<Button variant="primary" size="sm">Action</Button>}
      />
      <div style={{ padding: 'var(--padding-lg)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <p key={i}>
              Row {i + 1} — body content scrolls beneath the pinned header, which keeps
              its opaque surface so nothing shows through.
            </p>
          ))}
        </div>
      </div>
    </div>
  ),
};

/* ═══════════════════════════════════════════════════════════════
   4. CSS OVERRIDE API — tunable spacing demo
   ═══════════════════════════════════════════════════════════════ */

/**
 * Demonstrates the four CSS variables that tune internal rhythm — every
 * knob stepped up one tier from its default. Useful for marketing-shaped
 * pages that want more breathing room than the lean default rhythm.
 *
 * @summary Component-scoped CSS variables that tune internal rhythm
 */
export const TunableSpacing: Story = {
  args: {
    title: 'Roomy Header',
    subtitle: 'Each gap stepped up one tier — useful for marketing-shaped pages with breathing room.',
    tabs: (
      <TabBar variant="tab" items={[
        { label: 'Overview', active: true, onClick: () => {} },
        { label: 'Settings', active: false, onClick: () => {} },
      ]} />
    ),
    actions: <Button variant="primary" size="sm">Action</Button>,
    style: {
      // bds-lint-ignore — component-scoped CSS variables, not design tokens
      ['--page-header-section-gap' as string]: 'var(--gap-xl)',
      ['--page-header-content-gap' as string]: 'var(--gap-md)',
      ['--page-header-actions-gap' as string]: 'var(--gap-md)',
      ['--page-header-padding-bottom' as string]: 'var(--padding-md)',
    } as CSSProperties,
  },
};
