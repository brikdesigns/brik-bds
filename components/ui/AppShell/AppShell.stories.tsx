import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Icon } from '@iconify/react';
import { AppShell } from './AppShell';
import { SidebarNavigation, type SidebarNavItem } from '../SidebarNavigation';
import { SubNavigation, type SubNavItem } from '../SubNavigation/SubNavigation';
import { Page, PageContent } from '../Page';
import { PageHeader } from '../PageHeader';
import { TabBar } from '../TabBar';
import * as Icons from '../../icons';

/* ─── Shared fixtures ─────────────────────────────────────────── */

const BrikLogomark = () => (
  <div
    style={{
      width: 'var(--bds-size-1000)',
      height: 'var(--bds-size-1000)',
      borderRadius: 'var(--bds-border-radius-md)',
      background: 'var(--bds-background-brand-primary)',
      color: 'var(--bds-text-inverse)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--bds-font-family-heading)',
      fontWeight: 'var(--bds-font-weight-bold)' as unknown as number,
    }}
  >
    B
  </div>
);

const primaryItems: SidebarNavItem[] = [
  { label: 'Dashboard', href: '#dashboard', icon: <Icon icon={Icons.House} /> },
  { label: 'Projects', href: '#projects', icon: <Icon icon={Icons.Folder} /> },
  { label: 'Analytics', href: '#analytics', icon: <Icon icon={Icons.ChartBar} /> },
  { label: 'Settings', href: '#settings', icon: <Icon icon={Icons.Gear} />, active: true },
];

const subNavItems: SubNavItem[] = [
  { label: 'Services', href: '#settings/services', icon: <Icon icon="ph:wrench" />, active: true },
  { label: 'Service Lines', href: '#settings/service-lines', icon: <Icon icon="ph:tree-structure" /> },
  { label: 'Offerings', href: '#settings/offerings', icon: <Icon icon="ph:package" /> },
  { label: 'Service Plans', href: '#settings/plans', icon: <Icon icon="ph:list-checks" /> },
];

/** Stand-in for the consumer's top bar — AppShell supplies the sticky, sized wrapper. */
const TopBarFixture = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      height: '100%',
      padding: '0 var(--bds-padding-lg)',
      borderBottom: 'var(--bds-border-width-md) solid var(--bds-border-secondary)',
      fontFamily: 'var(--bds-font-family-heading)',
      fontSize: 'var(--bds-heading-sm)',
    }}
  >
    Brik Client Portal
  </div>
);

const nav = (
  <SidebarNavigation logo={<BrikLogomark />} navItems={primaryItems} position="sticky" />
);

const rail = <SubNavigation items={subNavItems} />;

/** A tall page so the WINDOW has something to scroll. */
const TallPage = () => (
  <Page>
    <PageHeader
      title="Services"
      subtitle="Everything the client can be sold, grouped by service line."
      sticky
      tabs={<TabBar items={[{ label: 'Draft', active: true }, { label: 'Published' }, { label: 'Archived' }]} />}
    />
    <PageContent>
      <p style={{ height: '300vh', color: 'var(--bds-text-secondary)', fontSize: 'var(--bds-body-md)' }}>
        Tall page body. The window scrolls; the header above stays pinned.
      </p>
    </PageContent>
  </Page>
);

/** Scroll the window and wait a frame so sticky layout settles. */
const scrollWindowTo = async (y: number) => {
  window.scrollTo(0, y);
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
};

/* ─── Meta ────────────────────────────────────────────────────── */

/**
 * App shell — the product layout frame: an optional sticky `topBar`, a primary
 * `nav` column, a section `rail` column and the `main` region. The WINDOW owns
 * vertical scroll (no shell element is a scroll container), so every sticky
 * descendant pins against the viewport.
 * @summary Product layout frame — top bar, nav, rail and main slots
 */
const meta: Meta<typeof AppShell> = {
  title: 'Layouts/app-shell',
  component: AppShell,
  tags: ['surface-product'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    // The canvas decorator pads and centres every story; the shell is full-bleed.
    (Story) => (
      <div style={{ width: 'calc(100% + 2 * var(--bds-padding-md))', margin: 'calc(-1 * var(--bds-padding-md))' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    topBar: { control: false },
    nav: { control: false },
    rail: { control: false },
    main: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof AppShell>;

/* ─── Default ─────────────────────────────────────────────────── */

/** @summary Nav, section rail and main content */
export const Default: Story = {
  args: {
    nav,
    rail,
    main: (
      <PageContent padding="lg">
        <h1 style={{ fontSize: 'var(--bds-heading-xxl)', fontFamily: 'var(--bds-font-family-heading)' }}>
          Services
        </h1>
        <p style={{ fontSize: 'var(--bds-body-md)', color: 'var(--bds-text-secondary)' }}>
          Primary nav on the left, the section rail beside it, main content on the right. The active
          primary item ("Settings") determines which rail is shown.
        </p>
      </PageContent>
    ),
  },
};

/* ─── With Page ───────────────────────────────────────────────── */

/**
 * The shell composed with the `Page` primitives — the shape product pages
 * render, and the one to copy. The rail is a full-height sibling of the page
 * body, never a child of `PageContent` (brik-client-portal#3162); `main` is the
 * flex-column parent `Page` requires. Second-level drill-down is `PageHeader`'s
 * `tabs`, never a second rail.
 * @summary Shell composed with the Page primitives
 */
export const WithPage: Story = {
  args: {
    nav,
    rail,
    main: (
      <Page>
        <PageHeader
          title="Services"
          subtitle="Everything the client can be sold, grouped by service line."
          tabs={<TabBar items={[{ label: 'Draft', active: true }, { label: 'Published' }, { label: 'Archived' }]} />}
        />
        <PageContent>
          <p style={{ fontSize: 'var(--bds-body-md)', color: 'var(--bds-text-secondary)' }}>
            The rail is a sibling of this `Page`, not a child of `PageContent`.
          </p>
        </PageContent>
      </Page>
    ),
  },
};

/* ─── With top bar ────────────────────────────────────────────── */

/**
 * With a `topBar` the shell pins it to the top and sets the sticky offsets that
 * `SubNavigation` and `PageHeader` read, so neither slides under it. Scroll the
 * page: the top bar, the rail and the page header all stay in view.
 * @summary Sticky top bar with rail and page header pinned below it
 */
export const WithTopBar: Story = {
  args: {
    topBar: <TopBarFixture />,
    nav,
    rail,
    main: <TallPage />,
  },
};

/* ─── Mobile ──────────────────────────────────────────────────── */

/**
 * Below the tablet breakpoint the primary sidebar collapses to its icon-only
 * form on its own — no `collapsed` prop on `SidebarNavigation`. Labels move to
 * `aria-label`.
 * @summary Below tablet the sidebar collapses to icons automatically
 */
export const Mobile: Story = {
  args: { nav, rail, main: <TallPage /> },
  globals: { viewport: { value: 'mobile', isRotated: false } },
  play: async ({ canvasElement }) => {
    const sidebar = canvasElement.querySelector('.bds-sidebar-nav') as HTMLElement;
    await expect(sidebar).toHaveClass('bds-sidebar-nav--collapsed');
    await expect(sidebar.style.width).toBe('80px');
    // Icon-only: the label is the accessible name, not visible text.
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
    await expect(canvas.queryByText('Dashboard')).toBeNull();
  },
};

/* ═══════════════════════════════════════════════════════════════
   INTERACTION TESTS — Q5 play-only, hidden from MCP discovery
   ═══════════════════════════════════════════════════════════════ */

/**
 * An absent slot renders nothing — no empty wrapper, no empty landmark.
 * @summary Absent slots render no wrapper element
 */
export const InteractionTestAbsentSlots: Story = {
  tags: ['!manifest', 'interaction-test'],
  render: () => (
    <>
      <div data-case="main-only">
        <AppShell main={<p>Only main</p>} nav={null} rail={false} topBar={undefined} />
      </div>
      <div data-case="top-bar-only">
        <AppShell topBar={<TopBarFixture />} />
      </div>
    </>
  ),
  play: async ({ canvasElement }) => {
    const slotsIn = (selector: string) =>
      Array.from(canvasElement.querySelector(selector)!.querySelectorAll('[class*="bds-app-shell__"]')).map(
        (el) => el.className.split(' ').find((c) => c.startsWith('bds-app-shell__')),
      );

    // main only: the body row and main exist; no top bar, nav or rail wrapper.
    await expect(slotsIn('[data-case="main-only"]')).toEqual(['bds-app-shell__body', 'bds-app-shell__main']);
    // top bar only: just the top bar — not even an empty body row.
    await expect(slotsIn('[data-case="top-bar-only"]')).toEqual(['bds-app-shell__top-bar']);
  },
};

/**
 * The window owns vertical scroll. No shell element is a vertical scroll
 * container, horizontal overflow is `clip` (never `hidden`, which would make
 * the shell a scroll container and capture every sticky child), and a sticky
 * child inside `main` keeps its viewport position while the window scrolls.
 * @summary Window scrolls; sticky child in main stays pinned
 */
export const InteractionTestWindowScroll: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: { nav, rail, main: <TallPage /> },
  play: async ({ canvasElement }) => {
    const shell = canvasElement.querySelector('.bds-app-shell') as HTMLElement;
    for (const el of [shell, ...Array.from(shell.querySelectorAll<HTMLElement>('[class*="bds-app-shell__"]'))]) {
      const { overflowY } = getComputedStyle(el);
      await expect(['auto', 'scroll']).not.toContain(overflowY);
    }
    await expect(getComputedStyle(shell).overflowX).toBe('clip');

    const header = canvasElement.querySelector('.bds-page-header') as HTMLElement;
    // Once scrolled past its natural position the header pins; further
    // scrolling must not move it.
    await scrollWindowTo(300);
    const pinned = header.getBoundingClientRect().top;
    await expect(pinned).toBe(0);
    await scrollWindowTo(900);
    await expect(window.scrollY).toBeGreaterThan(300);
    await expect(header.getBoundingClientRect().top).toBe(pinned);
    await scrollWindowTo(0);
  },
};

/**
 * With a `topBar` the shell sets `--bds-subnav-top` and `--bds-pageheader-top`
 * to the top bar's height; `SubNavigation` and `PageHeader` read them, so both
 * pin just below the bar.
 * @summary Shell offset reaches SubNavigation and PageHeader
 */
export const InteractionTestShellOffset: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: { topBar: <TopBarFixture />, nav, rail, main: <TallPage /> },
  play: async ({ canvasElement }) => {
    const shell = canvasElement.querySelector('.bds-app-shell') as HTMLElement;
    const topBar = canvasElement.querySelector('.bds-app-shell__top-bar') as HTMLElement;
    const subnav = canvasElement.querySelector('.bds-subnav') as HTMLElement;
    const header = canvasElement.querySelector('.bds-page-header') as HTMLElement;

    // --bds-shell-top-bar-height is --bds-size-1600 (64px).
    await expect(getComputedStyle(subnav).top).toBe('64px');
    await expect(getComputedStyle(header).top).toBe('64px');
    await expect(Math.round(topBar.getBoundingClientRect().height)).toBe(64);

    await scrollWindowTo(600);
    await expect(Math.round(topBar.getBoundingClientRect().top)).toBe(0);
    await expect(Math.round(subnav.getBoundingClientRect().top)).toBe(64);
    await expect(Math.round(header.getBoundingClientRect().top)).toBe(64);
    await scrollWindowTo(0);

    // Without a top bar the offsets stay at their 0px defaults.
    await expect(shell).toHaveAttribute('data-top-bar', 'true');
  },
};
