import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Icon } from '@iconify/react';
import { AppBar } from './AppBar';
import { AppShell } from '../AppShell';
import { Avatar } from '../Avatar';
import { Breadcrumb } from '../Breadcrumb';
import { Button } from '../Button';
import { Bell, Palette, Plus } from '../../icons';

/* ─── Shared fixtures ─────────────────────────────────────────── */

const breadcrumbs = (
  <Breadcrumb
    items={[
      { label: 'Clients', href: '#clients' },
      { label: 'Acme Dental', href: '#clients/acme' },
      { label: 'Services' },
    ]}
  />
);

const actions = (
  <Button variant="primary" size="md" iconBefore={<Icon icon={Plus} />}>
    New project
  </Button>
);

const utilities = (
  <>
    <Button variant="secondary" size="md" icon={<Icon icon={Bell} />} label="Notifications" title="Notifications" />
    <Button variant="secondary" size="md" icon={<Icon icon={Palette} />} label="Toggle theme" title="Toggle theme" />
    <Avatar name="Nick Stanerson" size="md" />
  </>
);

/* ─── Meta ────────────────────────────────────────────────────── */

/**
 * AppBar — the product app-shell bar. It is the content of `AppShell`'s
 * `topBar` slot; the shell owns pinning, AppBar fills it. Not `TopNavigation`
 * (the marketing navbar).
 * @summary Product app-shell bar — breadcrumbs, actions, utilities
 */
const meta: Meta<typeof AppBar> = {
  title: 'Navigation/app-bar',
  component: AppBar,
  tags: ['surface-product'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    breadcrumbs: {
      control: false,
      description: 'Left slot — the page breadcrumb trail. Absent renders nothing; the right-hand clusters stay right-aligned.',
    },
    actions: {
      control: false,
      description: 'Primary actions, at the right before `utilities`. Absent renders nothing.',
    },
    utilities: {
      control: false,
      description: 'Far-right utility cluster — notifications, theme, profile. Absent renders nothing.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof AppBar>;

/* ─── Default ─────────────────────────────────────────────────── */

/** @summary Every slot filled */
export const Default: Story = {
  args: { breadcrumbs, actions, utilities },
};

/* ─── Slots toggled off ───────────────────────────────────────── */

/** @summary Breadcrumbs only — no right-hand clusters */
export const BreadcrumbsOnly: Story = {
  args: { breadcrumbs },
};

/** @summary Utilities only — stay right-aligned with no breadcrumbs */
export const UtilitiesOnly: Story = {
  args: { utilities },
};

/** @summary No slots — an empty bar at shell height */
export const Empty: Story = {
  args: {},
};

/* ═══════════════════════════════════════════════════════════════
   INTERACTION TESTS — Q5 play-only, hidden from MCP discovery
   ═══════════════════════════════════════════════════════════════ */

/**
 * Inside an `AppShell` the bar sits in the `topBar` slot, outside `<main>`. It
 * must add no banner landmark (the product-shell canon forbids one outside
 * `<main>`), so the page keeps exactly one `<main>` and no `banner`.
 * @summary Bar in the shell's topBar adds no banner landmark
 */
export const InteractionTestInsideShell: Story = {
  tags: ['!manifest', 'interaction-test'],
  render: () => (
    <AppShell
      topBar={<AppBar breadcrumbs={breadcrumbs} actions={actions} utilities={utilities} />}
      main={<p>Page content</p>}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bar = canvasElement.querySelector('.bds-app-bar') as HTMLElement;

    await expect(bar.tagName).toBe('DIV');
    await expect(canvas.queryByRole('banner')).toBeNull();
    await expect(canvas.getAllByRole('main')).toHaveLength(1);
    // The shell's wrapper owns the pin; the bar adds none of its own.
    await expect(getComputedStyle(bar).position).toBe('static');
    await expect(Math.round(bar.getBoundingClientRect().height)).toBe(64);
  },
};

/**
 * An absent slot renders nothing — no empty wrapper — and the utilities stay
 * right-aligned when the breadcrumbs are absent.
 * @summary Absent slots render no wrapper; utilities stay right
 */
export const InteractionTestAbsentSlots: Story = {
  tags: ['!manifest', 'interaction-test'],
  render: () => (
    <>
      <div data-case="empty">
        <AppBar />
      </div>
      <div data-case="breadcrumbs-only">
        <AppBar breadcrumbs={breadcrumbs} />
      </div>
      <div data-case="utilities-only">
        <AppBar utilities={utilities} />
      </div>
      <div data-case="actions-only">
        <AppBar actions={actions} />
      </div>
    </>
  ),
  play: async ({ canvasElement }) => {
    const slotsIn = (selector: string) =>
      Array.from(canvasElement.querySelector(selector)!.querySelectorAll('[class*="bds-app-bar__"]')).map((el) =>
        el.className.split(' ').find((c) => c.startsWith('bds-app-bar__')),
      );

    await expect(slotsIn('[data-case="empty"]')).toEqual([]);
    await expect(slotsIn('[data-case="breadcrumbs-only"]')).toEqual(['bds-app-bar__breadcrumbs']);
    await expect(slotsIn('[data-case="utilities-only"]')).toEqual(['bds-app-bar__end', 'bds-app-bar__utilities']);
    await expect(slotsIn('[data-case="actions-only"]')).toEqual(['bds-app-bar__end', 'bds-app-bar__actions']);

    // No breadcrumbs: the utilities cluster still reaches the bar's right edge.
    const bar = canvasElement.querySelector('[data-case="utilities-only"] .bds-app-bar') as HTMLElement;
    const end = bar.querySelector('.bds-app-bar__end') as HTMLElement;
    const barStyle = getComputedStyle(bar);
    const rightEdge = bar.getBoundingClientRect().right - parseFloat(barStyle.paddingRight);
    await expect(Math.round(end.getBoundingClientRect().right)).toBe(Math.round(rightEdge));
  },
};
