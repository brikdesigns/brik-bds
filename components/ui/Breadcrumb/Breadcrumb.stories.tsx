import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor } from 'storybook/test';
import { Breadcrumb } from './Breadcrumb';
import { type BdsLinkComponent } from '../NavItem';

/* Story-only stand-in for a router `Link` (Next.js / Remix). Tags the rendered
 * anchor so the injected-routing path is visible in the DOM. */
const MockLink: BdsLinkComponent = ({ href, children, ...props }) => (
  <a href={href} data-link-component="mock" {...props}>
    {children}
  </a>
);

/* ─── Meta ────────────────────────────────────────────────────── */

const meta: Meta<typeof Breadcrumb> = {
  title: 'Navigation/breadcrumb',
  component: Breadcrumb,
  tags: ['surface-shared'],
  parameters: { layout: 'padded' },
  argTypes: {
    items: {
      control: 'object',
      description:
        'Crumb trail in order. The last item renders as plain text with `aria-current="page"`; earlier items render as `<a>` when `href` is set.',
    },
    separator: {
      control: 'select',
      options: ['slash', 'chevron'],
      description: 'Visual separator between crumbs. Default `slash` (`/`); `chevron` renders `›`.',
    },
    linkComponent: {
      description:
        'Render each linked crumb with a router-aware component (Next.js `Link`, Remix `Link`) for client-side routing instead of the default `<a>`. See ADR-012.',
      control: false,
    },
    options: {
      control: 'object',
      description:
        'Sibling records to switch between, including the current one. Two or more render a caret + menu after the trail; fewer render nothing.',
    },
    switchLabel: {
      control: 'text',
      description: 'Accessible label for the switch trigger, e.g. `Switch service`. Required when `options` is passed.',
    },
    onNavigate: {
      control: false,
      description:
        'Called with the selected href when a non-current option is chosen. Defaults to a full-page navigation — pass a router-aware handler for client-side routing.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

/* ═══════════════════════════════════════════════════════════════
   1. DEFAULT — args-driven sandbox. Controls work.
   ═══════════════════════════════════════════════════════════════ */

/** @summary Interactive playground for prop tweaking */
export const Default: Story = {
  args: {
    items: [
      { label: 'Home', href: '#' },
      { label: 'Products', href: '#' },
      { label: 'Design System' },
    ],
    separator: 'slash',
  },
};

/**
 * A deep record trail — the shape that outgrows a narrow container. Switch the
 * **Viewport** toolbar global to Mobile (375px) to see the intermediate crumbs
 * collapse to `Home / … / Amendment 4821`; at Tablet (768px) and above the full
 * trail shows and wraps rather than clipping. See #468.
 * @summary Deep trail exercising the narrow-viewport collapse
 */
export const LongTrail: Story = {
  args: {
    items: [
      { label: 'Home', href: '#' },
      { label: 'Clients', href: '#' },
      { label: 'Acme Holdings', href: '#' },
      { label: 'Contracts', href: '#' },
      { label: '2026 Renewal', href: '#' },
      { label: 'Amendment 4821' },
    ],
    separator: 'slash',
  },
};

/* ═══════════════════════════════════════════════════════════════
   2. INTERACTION TESTS — non-visual wiring assertions (rule 3)
   ═══════════════════════════════════════════════════════════════ */

/**
 * Injecting a router `Link` via `linkComponent` routes linked crumbs
 * client-side. The rendered output is visually identical to `Default` —
 * the only observable difference is the injected element — so this is a
 * play-only assertion, not a snapshot story (consolidation rule 3).
 * @summary Asserts injected linkComponent renders linked crumbs
 */
export const InteractionTestLinkComponent: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products' },
      { label: 'Design System' },
    ],
    linkComponent: MockLink,
  },
  play: async ({ canvas }) => {
    const links = canvas.getAllByRole('link');
    await expect(links.length).toBeGreaterThan(0);
    await expect(links[0]).toHaveAttribute('data-link-component', 'mock');
  },
};

/* ═══════════════════════════════════════════════════════════════
   3. SWITCHER — Q4: two or more `options` render a caret + sibling menu
      after the trail. Hook-driven open/close state args can't express.
   ═══════════════════════════════════════════════════════════════ */

const SIBLING_SERVICES = [
  { label: 'Brand strategy', href: '#brand-strategy', current: true },
  { label: 'Brand identity', href: '#brand-identity' },
  { label: 'Brand guidelines', href: '#brand-guidelines' },
];

/**
 * Passing two or more `options` renders a caret after the trail that opens a
 * menu of sibling records — jump between them without navigating back to an
 * index page. Fewer than two renders no caret.
 * @summary Trail with a sibling-record switcher menu
 */
export const WithSwitcher: Story = {
  args: {
    items: [
      { label: 'Home', href: '#' },
      { label: 'Services', href: '#' },
      { label: 'Brand strategy' },
    ],
    options: SIBLING_SERVICES,
    switchLabel: 'Switch service',
    onNavigate: fn(),
  },
};

/**
 * The caret opens the menu on click, closes on Escape, and returns focus to
 * the trigger — the keyboard open/close + focus-management contract.
 * @summary Asserts switch keyboard open/close and focus return
 */
export const InteractionTestSwitchKeyboard: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: {
    items: [
      { label: 'Home', href: '#' },
      { label: 'Services', href: '#' },
      { label: 'Brand strategy' },
    ],
    options: SIBLING_SERVICES,
    switchLabel: 'Switch service',
    onNavigate: fn(),
  },
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: 'Switch service' });
    await userEvent.click(trigger);
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));
    await expect(canvas.getByRole('menu')).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
    await expect(canvas.queryByRole('menu')).not.toBeInTheDocument();
    await expect(trigger).toHaveFocus();
  },
};

/**
 * Selecting a non-current option calls `onNavigate` with its href instead of
 * performing the default full-page navigation.
 * @summary Asserts onNavigate wiring on switch option select
 */
export const InteractionTestSwitchNavigate: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: {
    items: [
      { label: 'Home', href: '#' },
      { label: 'Services', href: '#' },
      { label: 'Brand strategy' },
    ],
    options: SIBLING_SERVICES,
    switchLabel: 'Switch service',
    onNavigate: fn(),
  },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Switch service' }));
    await userEvent.click(await canvas.findByRole('menuitem', { name: 'Brand identity' }));
    await expect(args.onNavigate).toHaveBeenCalledWith('#brand-identity', {
      label: 'Brand identity',
      href: '#brand-identity',
    });
  },
};
