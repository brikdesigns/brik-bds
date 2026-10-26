import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
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
    media: {
      control: false,
      description:
        'Leading identity mark left of the title — `Avatar` for an entity, `<ServiceTag variant="icon">` for a service.',
    },
    badge: {
      control: false,
      description: 'Deprecated alias for `media`. Kept one release for non-breaking migration (#1705).',
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
    variant: {
      control: 'select',
      options: ['full', 'compact', 'tabs-only'],
      description:
        'Header shape, fixed per page. `compact` = small title + actions + tabs; `tabs-only` = tabs with a visually hidden `<h1>`. Default `full`.',
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
    editHref: {
      control: 'text',
      description:
        'Serializable equivalent of `onEdit` for server pages — renders the auto-rendered `[Edit]` button as a navigating `<a>`. Wins over `onEdit` when both are passed.',
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
    media: <ServiceTag category="brand" variant="icon" serviceName="Brand Identity Bundle" size="lg" />,
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
 * @summary Structured destructive / secondary / primary actions
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
        destructive={<Button variant="negative">Delete</Button>}
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
        border: '1px solid var(--bds-border-muted)',
        background: 'var(--bds-surface-primary)',
      }}
    >
      <PageHeader
        title="Project detail"
        subtitle="Scroll this container — the header stays pinned to the top."
        sticky
        actions={<Button variant="primary" size="sm">Action</Button>}
      />
      <div style={{ padding: 'var(--bds-padding-lg)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--bds-gap-md)' }}>
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
   3b. VARIANTS — full / compact / tabs-only, sticky under a shell
   ═══════════════════════════════════════════════════════════════ */

const sectionTabs = (
  <TabBar variant="tab" items={[
    { label: 'All', active: true, onClick: () => {} },
    { label: 'Active', active: false, onClick: () => {} },
    { label: 'Archived', active: false, onClick: () => {} },
  ]} />
);

const variantArgs = {
  title: 'Companies',
  subtitle: 'Every lead, prospect and client.',
  breadcrumbs: <Breadcrumb items={sampleBreadcrumbs} />,
  actions: <Button variant="primary" size="sm">New company</Button>,
  metadata: [{ label: 'Total', value: '42' }],
  tabs: sectionTabs,
};

/** Scrolls the nearest scroll container and returns the header height before and after. */
async function heightAcrossScroll(scroller: HTMLElement, header: HTMLElement) {
  const before = header.getBoundingClientRect().height;
  scroller.scrollTop = scroller.scrollHeight;
  await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
  return { before, after: header.getBoundingClientRect().height };
}

function StickyFrame({ children, shellOffset = false }: { children: ReactNode; shellOffset?: boolean }) {
  return (
    <div
      data-testid="scroller"
      style={{
        height: 320,
        overflowY: 'auto',
        background: 'var(--bds-surface-primary)',
        ...(shellOffset ? ({ '--bds-page-header-top': 'var(--bds-shell-top-bar-height)' } as CSSProperties) : {}),
      }}
    >
      {children}
      <div style={{ height: 1200, padding: 'var(--bds-padding-lg)' }}>Body content scrolls beneath the header.</div>
    </div>
  );
}

/**
 * Every slot renders. Sticky at the default `0px` offset; the header keeps its
 * height when the container scrolls.
 * @summary Full variant — every slot, sticky at the default offset
 */
export const VariantFull: Story = {
  tags: ['interaction-test'],
  args: { ...variantArgs, variant: 'full', sticky: true },
  render: (args) => (
    <StickyFrame>
      <PageHeader {...args} />
    </StickyFrame>
  ),
  play: async ({ canvasElement }) => {
    const header = canvasElement.querySelector('.bds-page-header') as HTMLElement;
    const style = getComputedStyle(header);
    await expect(style.position).toBe('sticky');
    await expect(style.top).toBe('0px');
    await expect(style.zIndex).toBe('20');
    await expect(style.transitionDuration).toBe('0s');
    await expect(style.animationName).toBe('none');
    await expect(within(header).getByText('Every lead, prospect and client.')).toBeInTheDocument();
    const { before, after } = await heightAcrossScroll(within(canvasElement).getByTestId('scroller'), header);
    await expect(after).toBe(before);
  },
};

/**
 * Small title, actions and tabs — breadcrumbs, subtitle and metadata are not
 * rendered. A shell with a top bar sets `--bds-page-header-top` on an ancestor,
 * so the header pins 64px down, below the bar.
 * @summary Compact variant — small title + tabs, pinned below a top bar
 */
export const VariantCompact: Story = {
  tags: ['interaction-test'],
  args: { ...variantArgs, variant: 'compact', sticky: true },
  render: (args) => (
    <StickyFrame shellOffset>
      <PageHeader {...args} />
    </StickyFrame>
  ),
  play: async ({ canvasElement }) => {
    const header = canvasElement.querySelector('.bds-page-header') as HTMLElement;
    const style = getComputedStyle(header);
    await expect(style.top).toBe('64px');
    await expect(style.transitionDuration).toBe('0s');
    await expect(style.animationName).toBe('none');
    const scoped = within(header);
    await expect(scoped.getByRole('heading', { level: 1, name: 'Companies' })).toBeVisible();
    await expect(scoped.getByRole('button', { name: 'New company' })).toBeInTheDocument();
    await expect(scoped.queryByText('Every lead, prospect and client.')).toBeNull();
    await expect(scoped.queryByText('Total')).toBeNull();
    await expect(header.querySelector('.bds-breadcrumb')).toBeNull();
    const { before, after } = await heightAcrossScroll(within(canvasElement).getByTestId('scroller'), header);
    await expect(after).toBe(before);
  },
};

/**
 * Only the tabs are visible. The title stays as a visually hidden `<h1>` so the
 * page keeps its heading.
 * @summary Tabs-only variant — tabs with a visually hidden h1
 */
export const VariantTabsOnly: Story = {
  tags: ['interaction-test'],
  args: { ...variantArgs, variant: 'tabs-only', sticky: true },
  render: (args) => (
    <StickyFrame>
      <PageHeader {...args} />
    </StickyFrame>
  ),
  play: async ({ canvasElement }) => {
    const header = canvasElement.querySelector('.bds-page-header') as HTMLElement;
    const style = getComputedStyle(header);
    await expect(style.position).toBe('sticky');
    await expect(style.transitionDuration).toBe('0s');
    await expect(style.animationName).toBe('none');
    const scoped = within(header);
    const h1 = scoped.getByRole('heading', { level: 1, name: 'Companies' });
    await expect(Math.round(h1.getBoundingClientRect().width)).toBe(1);
    await expect(scoped.queryByRole('button', { name: 'New company' })).toBeNull();
    await expect(scoped.getByRole('tab', { name: 'Active' })).toBeInTheDocument();
    const { before, after } = await heightAcrossScroll(within(canvasElement).getByTestId('scroller'), header);
    await expect(after).toBe(before);
  },
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
      ['--page-header-section-gap' as string]: 'var(--bds-gap-xl)',
      ['--page-header-content-gap' as string]: 'var(--bds-gap-md)',
      ['--page-header-actions-gap' as string]: 'var(--bds-gap-md)',
      ['--page-header-padding-bottom' as string]: 'var(--bds-padding-md)',
    } as CSSProperties,
  },
};

/**
 * The pre-#1705 `badge` prop still renders, so a consumer can bump the package
 * before migrating its call sites. Passing both prefers `media`.
 *
 * @summary Deprecated `badge` alias still fills the media slot
 */
export const DeprecatedBadgeAlias: Story = {
  args: {
    title: 'Brik Designs',
    subtitle: 'Rendered through the deprecated `badge` prop — pass `media` in new code.',
    badge: <ServiceTag category="brand" variant="icon" serviceName="Brand Identity Bundle" size="lg" />,
  },
};

/**
 * `editHref` is a wiring prop, not a visual one — it renders pixel-identically
 * to `ReadMode`, so it is an interaction assertion rather than a story
 * (story-shape consolidation rule 3). What matters is the *element*: a real
 * `<a href>`, which is what makes the affordance serializable across the RSC
 * boundary. `onEdit` cannot be, so a server page has only this path.
 *
 * @summary Interaction test — editHref renders a link
 */
export const InteractionTestEditHref: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: {
    title: 'Brand Identity Bundle',
    mode: 'read',
    editHref: '/services/brand-identity-bundle/edit',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const edit = await canvas.findByRole('link', { name: 'Edit' });
    await expect(edit).toHaveAttribute('href', '/services/brand-identity-bundle/edit');
    await expect(edit).toHaveClass('bds-button--primary');
    // Same slot as the `onEdit` path — not a second affordance elsewhere.
    await expect(edit.closest('.bds-page-header__actions')).not.toBeNull();
  },
};

/**
 * `editHref` wins when both are passed, so the rendered affordance is the
 * navigating link and never a `<button>` carrying a handler that a server
 * page could not have supplied in the first place.
 *
 * @summary Interaction test — editHref beats onEdit
 */
export const InteractionTestEditHrefPrecedence: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: {
    title: 'Brand Identity Bundle',
    mode: 'read',
    editHref: '/services/brand-identity-bundle/edit',
    onEdit: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByRole('link', { name: 'Edit' });
    await expect(canvas.queryByRole('button', { name: 'Edit' })).toBeNull();
  },
};
