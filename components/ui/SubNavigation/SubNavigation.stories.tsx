import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { Icon } from '@iconify/react';
import { type BdsLinkComponent } from '../NavItem';
import { SubNavigation, type SubNavigationProps, type SubNavItem } from './SubNavigation';

/* ─── Sample data ─────────────────────────────────────────────── */

const itemsWithIcons: SubNavItem[] = [
  { label: 'Services',          href: '#settings/services',          icon: <Icon icon="ph:wrench" />,            active: true },
  { label: 'Service Lines',     href: '#settings/service-lines',     icon: <Icon icon="ph:tree-structure" /> },
  { label: 'Offerings',         href: '#settings/offerings',         icon: <Icon icon="ph:package" /> },
  { label: 'Service Plans',     href: '#settings/plans',             icon: <Icon icon="ph:list-checks" /> },
  { label: 'Customer Stories',  href: '#settings/customer-stories',  icon: <Icon icon="ph:quotes" /> },
  { label: 'Blogs',             href: '#settings/blog-posts',        icon: <Icon icon="ph:article" /> },
  { label: 'Industries',        href: '#settings/industries',        icon: <Icon icon="ph:buildings" /> },
];

const groupedItems: SubNavItem[] = [
  { label: 'Overview',        href: '#overview',        icon: <Icon icon="ph:house" />, active: true },
  { label: 'Services',        href: '#services',        icon: <Icon icon="ph:wrench" />,  group: 'Catalog' },
  { label: 'Offerings',       href: '#offerings',       icon: <Icon icon="ph:package" />, group: 'Catalog', dot: true },
  { label: 'Customer Stories', href: '#stories',        icon: <Icon icon="ph:quotes" />,  group: 'Content' },
  { label: 'Blogs',           href: '#blogs',           icon: <Icon icon="ph:article" />, group: 'Content', dot: 'warning' },
  { label: 'Archived',        href: '#archived',        icon: <Icon icon="ph:archive" />, group: 'Content', disabled: true },
];

/** Router-aware link stand-in, tagged so the injected path is observable. See ADR-012. */
const MockLink: BdsLinkComponent = ({ href, children, ...props }) => (
  <a href={href} data-link-component="mock" {...props}>
    {children}
  </a>
);

/* ─── Story wrapper with synthetic toggle controls ────────────── */

interface SubNavStoryProps
  extends Omit<SubNavigationProps, 'header' | 'footer'> {
  /** Story-only — toggles the `header` slot. */
  showHeader?: boolean;
  /** Story-only — toggles the `footer` slot. */
  showFooter?: boolean;
}

function SubNavigationStory({
  showHeader = false,
  showFooter = false,
  ...props
}: SubNavStoryProps) {
  return (
    <SubNavigation
      {...props}
      header={
        showHeader ? (
          <div style={{
            fontFamily: 'var(--bds-font-family-heading)',
            fontSize: 'var(--bds-heading-sm)',
            color: 'var(--bds-text-primary)',
          }}>
            Settings
          </div>
        ) : undefined
      }
      footer={
        showFooter ? (
          <div style={{ fontSize: 'var(--bds-body-sm)', color: 'var(--bds-text-muted)' }}>
            Last sync: 2 min ago
          </div>
        ) : undefined
      }
    />
  );
}

/* ─── Meta ────────────────────────────────────────────────────── */

const meta = {
  title: 'Navigation/sub-navigation',
  component: SubNavigationStory,
  tags: ['surface-product'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    items: {
      description: 'Nav entries — each renders as a `NavItem` internally.',
      control: false,
    },
    width: {
      description: 'Custom width (e.g. "240px"). Defaults to 194px.',
      control: 'text',
    },
    ariaLabel: {
      description: 'Accessible label for the nav landmark.',
      control: 'text',
    },
    bordered: {
      description: 'Draw the right-side panel/content divider. Default `true`; set `false` when the shell supplies its own separation.',
      control: 'boolean',
    },
    linkComponent: {
      description: 'Render each nav item with a router-aware component (Next.js `Link`, Remix `Link`) for client-side routing instead of the default `<a>`. See ADR-012.',
      control: false,
    },
    showHeader: {
      description: 'Story-only — toggles the `header` slot.',
      control: 'boolean',
    },
    showFooter: {
      description: 'Story-only — toggles the `footer` slot.',
      control: 'boolean',
    },
  },
} satisfies Meta<typeof SubNavigationStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ═══════════════════════════════════════════════════════════════
   Default — single story, rich controls
   ═══════════════════════════════════════════════════════════════ */

/** @summary Sub-nav with icons; toggle header / footer in Controls */
export const Default: Story = {
  args: {
    items: itemsWithIcons,
    showHeader: false,
    showFooter: false,
  },
};

/* ═══════════════════════════════════════════════════════════════
   Grouped items with dots
   ═══════════════════════════════════════════════════════════════ */

/**
 * Items sharing a `group` render under one header; `dot` adds an attention cue.
 * @summary Group headers and per-item dots
 */
export const GroupedWithDots: Story = {
  args: { items: groupedItems },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('group', { name: 'Catalog' })).toBeInTheDocument();
    await expect(canvas.getByRole('group', { name: 'Content' })).toBeInTheDocument();
    // Ungrouped lead item sits outside any group.
    await expect(canvas.getByRole('link', { name: 'Overview' })).toHaveAttribute('aria-current', 'page');
  },
};

/* ═══════════════════════════════════════════════════════════════
   Sticky rail beside tall content
   ═══════════════════════════════════════════════════════════════ */

/**
 * The rail sticks flush to the top and fills the viewport height while the
 * content column scrolls. A shell with a top bar sets `--bds-subnav-top`.
 * @summary Sticky full-height rail beside tall page content
 */
export const StickyRail: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: { items: groupedItems },
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
      <SubNavigationStory {...args} />
      <div style={{ flex: 1, height: '300vh', padding: 'var(--bds-padding-lg)' }}>
        Tall page content — scroll to see the rail stay in place.
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const rail = canvasElement.querySelector('.bds-subnav') as HTMLElement;
    const style = getComputedStyle(rail);
    await expect(style.position).toBe('sticky');
    // Default offset is 0 — the canonical app shell has no top bar.
    await expect(style.top).toBe('0px');
    // Rail height is the viewport minus the offset (0), not the 300vh page height.
    await expect(Math.round(rail.getBoundingClientRect().height)).toBe(window.innerHeight);
  },
};

/**
 * A shell with a top bar sets `--bds-subnav-top` on an ancestor; the rail reads
 * it rather than shadowing it.
 * @summary Ancestor-set offset below a shell top bar
 */
export const StickyRailBelowTopBar: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: { items: groupedItems },
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', '--bds-subnav-top': 'var(--bds-shell-top-bar-height)' } as React.CSSProperties}>
      <SubNavigationStory {...args} />
      <div style={{ flex: 1, height: '300vh', padding: 'var(--bds-padding-lg)' }}>
        Tall page content below a 64px shell top bar.
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const rail = canvasElement.querySelector('.bds-subnav') as HTMLElement;
    // --bds-shell-top-bar-height is --bds-size-1600, 64px.
    await expect(getComputedStyle(rail).top).toBe('64px');
    await expect(Math.round(rail.getBoundingClientRect().height)).toBe(window.innerHeight - 64);
  },
};

/* ═══════════════════════════════════════════════════════════════
   Overflow scroll only when items overflow
   ═══════════════════════════════════════════════════════════════ */

/** @summary Many items scroll inside the rail, not the page */
export const ManyItemsScroll: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: {
    items: Array.from({ length: 40 }, (_, i) => ({ label: `Section ${i + 1}`, href: `#section-${i + 1}` })),
  },
  play: async ({ canvasElement }) => {
    const rail = canvasElement.querySelector('.bds-subnav') as HTMLElement;
    await expect(getComputedStyle(rail).overflowY).toBe('auto');
    await expect(rail.scrollHeight).toBeGreaterThan(rail.clientHeight);
  },
};

/* ═══════════════════════════════════════════════════════════════
   Routing hooks
   ═══════════════════════════════════════════════════════════════ */

/** @summary onSelect fires for enabled items only */
export const InteractionTestOnSelect: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: {
    items: groupedItems,
    onSelect: fn((_item, e) => e.preventDefault()),
  },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('link', { name: 'Services' }));
    await expect(args.onSelect).toHaveBeenCalledTimes(1);
    await expect(args.onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ href: '#services' }),
      expect.anything(),
    );
    // Disabled items never call onSelect.
    await userEvent.click(canvas.getByText('Archived'), { pointerEventsCheck: 0 });
    await expect(args.onSelect).toHaveBeenCalledTimes(1);
  },
};

/** @summary linkComponent renders every item with the injected link */
export const InteractionTestLinkComponent: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: { items: groupedItems, linkComponent: MockLink },
  play: async ({ canvas }) => {
    const links = canvas.getAllByRole('link');
    await expect(links.length).toBeGreaterThan(0);
    for (const link of links) await expect(link).toHaveAttribute('data-link-component', 'mock');
  },
};

/** @summary Flat items (no group, no dot) render without group wrappers */
export const InteractionTestFlatItems: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: { items: itemsWithIcons },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getAllByRole('link')).toHaveLength(itemsWithIcons.length);
    await expect(canvasElement.querySelector('.bds-subnav__group')).toBeNull();
  },
};

/* ═══════════════════════════════════════════════════════════════
   Below tablet — horizontal row
   ═══════════════════════════════════════════════════════════════ */

/**
 * Below the tablet breakpoint the rail is no longer sticky or full-height; its
 * items form one horizontally scrolling row.
 * @summary Mobile layout — single horizontally scrolling row
 */
export const Mobile: Story = {
  args: { items: groupedItems },
  globals: { viewport: { value: 'mobile', isRotated: false } },
  play: async ({ canvasElement }) => {
    const rail = canvasElement.querySelector('.bds-subnav') as HTMLElement;
    await expect(getComputedStyle(rail).position).toBe('static');
    // One row tall, never stretched to a flex-row parent's height.
    await expect(rail.getBoundingClientRect().height).toBeLessThan(window.innerHeight / 2);
  },
};
