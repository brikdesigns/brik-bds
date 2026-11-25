import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor } from 'storybook/test';
import {
  Breadcrumb,
  type BreadcrumbItem,
  type BreadcrumbSwitchFilter,
  type BreadcrumbSwitchOption,
} from './Breadcrumb';
import { type BdsLinkComponent } from '../NavItem';
import { SubNavigation } from '../SubNavigation/SubNavigation';
import { breadcrumbTrailFromNav, subNavItemsFromNav, type NavSection } from './navTrail';

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
        'Crumb trail in order. The last item renders as plain text with `aria-current="page"`; earlier items render as `<a>` when `href` is set. Any item can also carry its own `switcher` (`{ options, switchLabel, onNavigate?, filters?, scopeLabel?, searchThreshold? }`) to render a caret + sibling-record menu inline right after that crumb — two or more `options` required, same as the trailing switcher.',
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
    filters: {
      control: 'object',
      description:
        'Binary filters rendered as `FilterToggle`s above the list, off by default. Each is `{ id, label, facet, value }`; when on, options narrow to those where `option.facets[facet] === value`. The `current` option always stays visible.',
    },
    scopeLabel: {
      control: 'text',
      description: 'Text rendered above the list naming what it contains, e.g. `Clients with Online Business Listings`.',
    },
    searchThreshold: {
      control: 'number',
      description:
        'A labelled search box (filters options by label, case-insensitive) shows once the option count is greater than this. Default `8`; `0` always shows it.',
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
 * A deep record trail. It never wraps: when the trail does not fit its
 * container the first crumb and the last two stay and the middle crumbs fold
 * into a `More breadcrumbs` menu. Here the container is wide enough for all six.
 * @summary Deep trail that fits, so nothing folds
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

/* ═══════════════════════════════════════════════════════════════
   4. PER-CRUMB SWITCHER — a MIDDLE crumb (not just the trailing one) can
      carry its own `switcher`, rendered inline right after that crumb. E.g.
      the "client" crumb on an admin project page switching between clients,
      independent of a project-to-project trailing switcher on the same trail.
   ═══════════════════════════════════════════════════════════════ */

const SIBLING_CLIENTS = [
  { label: 'Acme Holdings', href: '#acme-holdings', current: true },
  { label: 'Beacon Group', href: '#beacon-group' },
  { label: 'Summit Partners', href: '#summit-partners' },
];

const SIBLING_PROJECTS = [
  { label: 'Brand Refresh', href: '#brand-refresh', current: true },
  { label: 'Site Rebuild', href: '#site-rebuild' },
];

/**
 * The "client" crumb carries its own `switcher` — a caret right after
 * "Acme Holdings" opens a menu of sibling clients, independent of the
 * trailing project-to-project switcher on "Brand Refresh" at the end of the
 * same trail. A trail can have neither, either, or both.
 * @summary Middle crumb with its own sibling-record switcher
 */
export const WithPerCrumbSwitcher: Story = {
  args: {
    items: [
      { label: 'Home', href: '#' },
      { label: 'Clients', href: '#' },
      {
        label: 'Acme Holdings',
        href: '#acme-holdings',
        switcher: {
          options: SIBLING_CLIENTS,
          switchLabel: 'Switch client',
          onNavigate: fn(),
        },
      },
      { label: 'Projects', href: '#' },
      { label: 'Brand Refresh' },
    ],
    options: SIBLING_PROJECTS,
    switchLabel: 'Switch project',
    onNavigate: fn(),
  },
};

/**
 * The per-crumb caret opens its menu on click, closes on Escape, and returns
 * focus to its own trigger — the same keyboard contract as the trailing
 * switcher, proven on a MIDDLE crumb.
 * @summary Asserts per-crumb switch keyboard open/close, focus return
 */
export const InteractionTestPerCrumbSwitchKeyboard: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: {
    items: [
      { label: 'Home', href: '#' },
      { label: 'Clients', href: '#' },
      {
        label: 'Acme Holdings',
        href: '#acme-holdings',
        switcher: {
          options: SIBLING_CLIENTS,
          switchLabel: 'Switch client',
          onNavigate: fn(),
        },
      },
      { label: 'Brand Refresh' },
    ],
  },
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: 'Switch client' });
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
 * Selecting a non-current option on the per-crumb switcher calls ITS OWN
 * `onNavigate` with its href — a middle crumb's switcher wires up the same as
 * the trailing one.
 * @summary Asserts onNavigate wiring on per-crumb switch option select
 */
export const InteractionTestPerCrumbSwitchNavigate: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: {
    items: [
      { label: 'Home', href: '#' },
      { label: 'Clients', href: '#' },
      {
        label: 'Acme Holdings',
        href: '#acme-holdings',
        switcher: {
          options: SIBLING_CLIENTS,
          switchLabel: 'Switch client',
          onNavigate: fn(),
        },
      },
      { label: 'Brand Refresh' },
    ],
  },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Switch client' }));
    await userEvent.click(await canvas.findByRole('menuitem', { name: 'Beacon Group' }));
    await expect((args.items[2] as BreadcrumbItem).switcher!.onNavigate).toHaveBeenCalledWith(
      '#beacon-group',
      { label: 'Beacon Group', href: '#beacon-group' }
    );
  },
};

/**
 * A middle crumb's switcher and the trailing switcher on the same trail are
 * fully independent — two distinct carets, each with its own accessible name
 * and its own open/close state. Opening one never opens or affects the other.
 * @summary Asserts a mid-trail and trailing switcher don't interfere
 */
export const InteractionTestMultipleSwitchersIndependent: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: {
    items: [
      { label: 'Home', href: '#' },
      { label: 'Clients', href: '#' },
      {
        label: 'Acme Holdings',
        href: '#acme-holdings',
        switcher: {
          options: SIBLING_CLIENTS,
          switchLabel: 'Switch client',
          onNavigate: fn(),
        },
      },
      { label: 'Projects', href: '#' },
      { label: 'Brand Refresh' },
    ],
    options: SIBLING_PROJECTS,
    switchLabel: 'Switch project',
    onNavigate: fn(),
  },
  play: async ({ canvas }) => {
    const clientTrigger = canvas.getByRole('button', { name: 'Switch client' });
    const projectTrigger = canvas.getByRole('button', { name: 'Switch project' });

    await userEvent.click(clientTrigger);
    await waitFor(() => expect(clientTrigger).toHaveAttribute('aria-expanded', 'true'));
    await expect(projectTrigger).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.getAllByRole('menu')).toHaveLength(1);

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(clientTrigger).toHaveAttribute('aria-expanded', 'false'));

    await userEvent.click(projectTrigger);
    await waitFor(() => expect(projectTrigger).toHaveAttribute('aria-expanded', 'true'));
    await expect(clientTrigger).toHaveAttribute('aria-expanded', 'false');
  },
};

/* ═══════════════════════════════════════════════════════════════
   5. SEARCH + FILTERS — a long switcher list narrows by a labelled search
      box (once the option count passes `searchThreshold`, default 8), by
      `FilterToggle` filters that match an option's `facets`, and carries an
      optional `scopeLabel` above the list. Both the trailing `options` and a
      per-crumb `switcher` take the same props.
   ═══════════════════════════════════════════════════════════════ */

const INDUSTRY_CLIENTS: BreadcrumbSwitchOption[] = [
  { label: 'Acme Dental', href: '#acme-dental', current: true, hint: 'Dental', facets: { industry: 'dental' } },
  { label: 'Beacon Orthodontics', href: '#beacon-ortho', hint: 'Dental', facets: { industry: 'dental' } },
  { label: 'Cedar Family Dentistry', href: '#cedar-family', hint: 'Dental', facets: { industry: 'dental' } },
  { label: 'Delta Chiropractic', href: '#delta-chiro', hint: 'Chiropractic', facets: { industry: 'chiropractic' } },
  { label: 'Elm Street Chiropractic', href: '#elm-street', hint: 'Chiropractic', facets: { industry: 'chiropractic' } },
  { label: 'Fern Veterinary', href: '#fern-vet', hint: 'Veterinary', facets: { industry: 'veterinary' } },
  { label: 'Grove Physical Therapy', href: '#grove-pt', hint: 'Physical therapy', facets: { industry: 'physical-therapy' } },
  { label: 'Harbor Dermatology', href: '#harbor-derm', hint: 'Dermatology', facets: { industry: 'dermatology' } },
  { label: 'Iris Optometry', href: '#iris-optometry', hint: 'Optometry', facets: { industry: 'optometry' } },
  { label: 'Juniper Pediatrics', href: '#juniper-peds', hint: 'Pediatrics', facets: { industry: 'pediatrics' } },
];

const SAME_INDUSTRY: BreadcrumbSwitchFilter[] = [
  { id: 'same-industry', label: 'Same industry', facet: 'industry', value: 'dental' },
];

const SEARCH_TRAIL: BreadcrumbItem[] = [
  { label: 'Home', href: '#' },
  { label: 'Clients', href: '#' },
  { label: 'Acme Dental' },
];

/**
 * Past eight options the menu gains a labelled search box (override with
 * `searchThreshold`). Options carry a secondary `hint`; a `FilterToggle`
 * narrows them by `facets` (off by default); `scopeLabel` names the list.
 * Opened on load so the controls are visible.
 * @summary Switcher with search, hints, filter and scope label
 */
export const WithSwitcherFilters: Story = {
  tags: ['no-visual'],
  args: {
    items: SEARCH_TRAIL,
    options: INDUSTRY_CLIENTS,
    switchLabel: 'Switch client',
    scopeLabel: 'Clients with Online Business Listings',
    filters: SAME_INDUSTRY,
    onNavigate: fn(),
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Switch client' }));
  },
};

/**
 * The per-crumb `switcher` accepts the same `scopeLabel`, `filters` and
 * `searchThreshold` as the trailing `options`.
 * @summary Per-crumb switcher with search, filter and scope
 */
export const WithSwitcherFiltersPerCrumb: Story = {
  tags: ['no-visual'],
  args: {
    items: [
      { label: 'Home', href: '#' },
      {
        label: 'Acme Dental',
        href: '#acme-dental',
        switcher: {
          options: INDUSTRY_CLIENTS,
          switchLabel: 'Switch client',
          scopeLabel: 'Clients with Online Business Listings',
          filters: SAME_INDUSTRY,
          onNavigate: fn(),
        },
      },
      { label: 'Listings' },
    ],
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Switch client' }));
  },
};

/* One declaration feeds both the rail and the trail. */
const SETTINGS_NAV: NavSection = {
  label: 'Settings',
  href: '/settings',
  items: [
    { label: 'Services', href: '/settings/services' },
    { label: 'Agreements', href: '/settings/agreements' },
  ],
};

/**
 * Declare the nav once as a `NavSection`, then derive the `SubNavigation` items
 * (`subNavItemsFromNav`) and the trail (`breadcrumbTrailFromNav`) from it — the
 * rail's active item and the last crumb can never disagree, and a label is
 * renamed in one place. Pure functions: call them from a server or client
 * component with the current pathname.
 * @summary Rail and breadcrumb derived from one nav declaration
 */
export const FromNavDeclaration: Story = {
  tags: ['no-visual'],
  render: () => {
    const pathname = '/settings/agreements';
    return (
      <>
        <Breadcrumb items={breadcrumbTrailFromNav(pathname, SETTINGS_NAV)} />
        <SubNavigation
          ariaLabel="Settings"
          items={subNavItemsFromNav(pathname, SETTINGS_NAV)}
        />
      </>
    );
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Agreements', { selector: '[aria-current="page"]' })).toBeVisible();
    await expect(canvas.getByRole('link', { name: 'Settings' })).toHaveAttribute('href', '/settings');
  },
};

/**
 * Search appears only once the option count passes the threshold (default 8):
 * three options show no search box.
 * @summary Asserts no search box at or below the threshold
 */
export const InteractionTestSearchHiddenBelowThreshold: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: {
    items: SEARCH_TRAIL,
    options: SIBLING_CLIENTS,
    switchLabel: 'Switch client',
    onNavigate: fn(),
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Switch client' }));
    await canvas.findByRole('menu');
    await expect(canvas.queryByRole('searchbox')).not.toBeInTheDocument();
  },
};

/**
 * `searchThreshold` overrides the default: three options plus a threshold of
 * two shows the search box.
 * @summary Asserts searchThreshold overrides the default
 */
export const InteractionTestSearchThresholdOverride: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: {
    items: SEARCH_TRAIL,
    options: SIBLING_CLIENTS,
    switchLabel: 'Switch client',
    searchThreshold: 2,
    onNavigate: fn(),
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Switch client' }));
    await expect(await canvas.findByRole('searchbox', { name: 'Search options' })).toBeInTheDocument();
  },
};

/**
 * Typing narrows options by label, case-insensitively; clearing restores them;
 * a query with no match shows an empty message; Escape still closes the menu
 * from the search box and returns focus to the trigger.
 * @summary Asserts search narrows, empty state, focus return
 */
export const InteractionTestSearchNarrows: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: {
    items: SEARCH_TRAIL,
    options: INDUSTRY_CLIENTS,
    switchLabel: 'Switch client',
    onNavigate: fn(),
  },
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: 'Switch client' });
    await userEvent.click(trigger);
    const search = await canvas.findByRole('searchbox', { name: 'Search options' });
    await expect(canvas.getAllByRole('menuitem')).toHaveLength(INDUSTRY_CLIENTS.length);

    await userEvent.type(search, 'CHIRO');
    await waitFor(() => expect(canvas.getAllByRole('menuitem')).toHaveLength(2));
    await expect(canvas.getByRole('menuitem', { name: /Delta Chiropractic/ })).toBeInTheDocument();
    await expect(canvas.queryByRole('menuitem', { name: /Acme Dental/ })).not.toBeInTheDocument();

    await userEvent.clear(search);
    await waitFor(() => expect(canvas.getAllByRole('menuitem')).toHaveLength(INDUSTRY_CLIENTS.length));

    await userEvent.type(search, 'zzz-no-match');
    await expect(await canvas.findByText('0 results')).toBeInTheDocument();
    await expect(canvas.queryAllByRole('menuitem')).toHaveLength(0);

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
    await expect(canvas.queryByRole('menu')).not.toBeInTheDocument();
    await expect(trigger).toHaveFocus();
  },
};

/**
 * A filter renders as a `FilterToggle` with an accessible name, off by
 * default. Turning it on keeps only options whose `facets[facet] === value`
 * plus the current option (which carries no matching facet here); turning it
 * off restores the list. Selecting a filtered option still navigates.
 * @summary Asserts filter narrows by facet, keeps current
 */
export const InteractionTestFilterToggle: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: {
    items: SEARCH_TRAIL,
    // Current option has NO facets — it must stay visible regardless.
    options: INDUSTRY_CLIENTS.map((option) =>
      option.current ? { label: option.label, href: option.href, current: true } : option
    ),
    switchLabel: 'Switch client',
    filters: SAME_INDUSTRY,
    onNavigate: fn(),
  },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Switch client' }));
    const toggle = await canvas.findByRole('button', { name: 'Same industry' });
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(canvas.getAllByRole('menuitem')).toHaveLength(INDUSTRY_CLIENTS.length);

    await userEvent.click(toggle);
    await waitFor(() => expect(toggle).toHaveAttribute('aria-pressed', 'true'));
    // current (Acme Dental) + the two other dental clients.
    await expect(canvas.getAllByRole('menuitem')).toHaveLength(3);
    await expect(canvas.getByRole('menuitem', { name: /Acme Dental/ })).toBeInTheDocument();
    await expect(canvas.getByRole('menuitem', { name: /Beacon Orthodontics/ })).toBeInTheDocument();
    await expect(canvas.queryByRole('menuitem', { name: /Delta Chiropractic/ })).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('menuitem', { name: /Cedar Family Dentistry/ }));
    await expect(args.onNavigate).toHaveBeenCalledWith(
      '#cedar-family',
      INDUSTRY_CLIENTS[2]
    );
  },
};

/**
 * Hints render as secondary text, and the scope label renders above the list.
 * @summary Asserts hint text and scope label render
 */
export const InteractionTestHintScopeLabel: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: {
    items: SEARCH_TRAIL,
    options: SIBLING_CLIENTS.map((option, i) => ({ ...option, hint: `Industry ${i}` })),
    switchLabel: 'Switch client',
    scopeLabel: 'Clients with Online Business Listings',
    onNavigate: fn(),
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Switch client' }));
    await expect(await canvas.findByText('Clients with Online Business Listings')).toBeInTheDocument();
    await expect(canvas.getByText('Industry 1')).toBeInTheDocument();
  },
};

/**
 * The per-crumb `switcher` supports search + filters too, independent of the
 * trailing switcher.
 * @summary Asserts per-crumb switcher search and filter
 */
export const InteractionTestPerCrumbSearchFilter: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: {
    items: [
      { label: 'Home', href: '#' },
      {
        label: 'Acme Dental',
        href: '#acme-dental',
        switcher: {
          options: INDUSTRY_CLIENTS,
          switchLabel: 'Switch client',
          scopeLabel: 'Clients with Online Business Listings',
          filters: SAME_INDUSTRY,
          onNavigate: fn(),
        },
      },
      { label: 'Listings' },
    ],
  },
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: 'Switch client' });
    await userEvent.click(trigger);
    await expect(await canvas.findByText('Clients with Online Business Listings')).toBeInTheDocument();
    await userEvent.type(await canvas.findByRole('searchbox', { name: 'Search options' }), 'grove');
    await waitFor(() => expect(canvas.getAllByRole('menuitem')).toHaveLength(1));

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
    await expect(trigger).toHaveFocus();

    // Reopen: query resets, filter is still off.
    await userEvent.click(trigger);
    await expect(await canvas.findByRole('searchbox', { name: 'Search options' })).toHaveValue('');
    await expect(canvas.getByRole('button', { name: 'Same industry' })).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(canvas.getByRole('button', { name: 'Same industry' }));
    await waitFor(() => expect(canvas.getAllByRole('menuitem')).toHaveLength(3));
  },
};

/* ═══════════════════════════════════════════════════════════════
   4. OVERFLOW — #3344. The trail never wraps; when it does not fit, the
      middle folds into a `More breadcrumbs` menu (Carbon).
   ═══════════════════════════════════════════════════════════════ */

const DEEP_TRAIL: BreadcrumbItem[] = [
  { label: 'Companies', href: '#companies' },
  { label: 'Acme Holdings International', href: '#acme' },
  { label: 'Service Agreements', href: '#agreements' },
  { label: '2026 Renewal Package', href: '#renewal' },
  { label: 'Amendment 4821', href: '#amendment' },
  { label: 'Signature Run 12' },
];

/** Story-only fixed-width container (the trail measures its container, not the viewport). */
const inContainer = (width: string): NonNullable<Story['decorators']> => [
  (Story) => (
    <div style={{ width }}>
      <Story />
    </div>
  ),
];

/**
 * Six crumbs in a narrow container render on one line as
 * `first / … / second-last / last`. The `…` is a real button named
 * `More breadcrumbs`; it opens a menu of the hidden crumbs as links.
 * @summary Six crumbs in a narrow container fold the middle into a menu
 */
export const OverflowNarrowContainer: Story = {
  args: { items: DEEP_TRAIL },
  decorators: inContainer('520px'),
};

/**
 * On a small viewport only the overflow button and the last crumb remain
 * (`… / Signature Run 12`). Same trail as `OverflowNarrowContainer`, measured
 * against the 375px viewport.
 * @summary At 375px: the overflow button plus the last crumb
 */
export const OverflowMobile: Story = {
  args: { items: DEEP_TRAIL, separator: 'chevron' },
  globals: { viewport: { value: 'mobile', isRotated: false } },
};

/* Admin top-bar trails where every crumb but the page carries a switcher. */
const SECTION_SWITCHER = {
  switchLabel: 'Switch section',
  options: [
    { label: 'Companies', href: '#companies', current: true },
    { label: 'Contacts', href: '#contacts' },
  ],
};
const COMPANY_SWITCHER = { switchLabel: 'Switch company', options: SIBLING_CLIENTS };

const COMPANY_TAB_TRAIL: BreadcrumbItem[] = [
  { label: 'Companies', href: '#companies', switcher: SECTION_SWITCHER },
  { label: 'Acme Holdings International', href: '#acme', switcher: COMPANY_SWITCHER },
  {
    label: 'Service Agreements',
    switcher: {
      switchLabel: 'Switch tab',
      options: [
        { label: 'Overview', href: '#overview' },
        { label: 'Service Agreements', href: '#agreements', current: true },
      ],
    },
  },
];

const COMPANY_PROJECT_TRAIL: BreadcrumbItem[] = [
  { label: 'Companies', href: '#companies', switcher: SECTION_SWITCHER },
  { label: 'Acme Holdings International', href: '#acme', switcher: COMPANY_SWITCHER },
  {
    label: 'Projects',
    href: '#projects',
    switcher: {
      switchLabel: 'Switch tab',
      options: [
        { label: 'Overview', href: '#overview' },
        { label: 'Projects', href: '#projects', current: true },
      ],
    },
  },
  { label: 'Brand Refresh 2026 Signature Package' },
];

/**
 * A crumb with its own switcher never folds. `Companies / Company / Tab`, each
 * with a switcher, too wide for its container: nothing folds, the labels
 * ellipsise instead and every switcher stays reachable.
 * @summary Switcher crumbs never fold; their labels ellipsise
 */
export const OverflowSwitcherTrail: Story = {
  args: { items: COMPANY_TAB_TRAIL },
  decorators: inContainer('400px'),
};

/**
 * `Companies / Company / Projects / Project` with switchers on the first three:
 * the company crumb stays. The longest labels ellipsise first; short ones keep
 * their text.
 * @summary Four-crumb switcher trail keeps every crumb
 */
export const OverflowSwitcherProjectTrail: Story = {
  args: { items: COMPANY_PROJECT_TRAIL },
  decorators: inContainer('560px'),
};

/**
 * A label longer than the crumb's max width ends in an ellipsis. The full
 * label stays the link's accessible name and shows on hover and focus (`title`).
 * @summary A long label truncates with an ellipsis
 */
export const LongLabel: Story = {
  args: {
    items: [
      { label: 'Companies', href: '#companies' },
      {
        label:
          'Acme Holdings International Group of Dental and Orthodontic Practices Limited',
        href: '#acme',
      },
      { label: 'Signature Run 12' },
    ],
  },
};

const hiddenCrumbs = ['Service Agreements', '2026 Renewal Package'];

/**
 * Tab reaches the overflow button, Enter opens a menu of the folded crumbs as
 * links, Escape closes it and returns focus to the button.
 * @summary Asserts Tab reaches the overflow button; Enter opens it
 */
export const InteractionTestOverflowMenu: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: { items: DEEP_TRAIL },
  decorators: inContainer('520px'),
  play: async ({ canvas }) => {
    const more = await canvas.findByRole('button', { name: 'More breadcrumbs' });

    // One line, first + last two visible, folded crumbs not in the DOM yet.
    await expect(canvas.getByRole('link', { name: 'Companies' })).toBeInTheDocument();
    await expect(canvas.getByRole('link', { name: 'Amendment 4821' })).toBeInTheDocument();
    await expect(canvas.getByText('Signature Run 12')).toHaveAttribute('aria-current', 'page');
    for (const label of hiddenCrumbs) {
      await expect(canvas.queryByRole('link', { name: label })).not.toBeInTheDocument();
    }
    await expect(more).toHaveAttribute('aria-expanded', 'false');

    // Tab order: first crumb, then the overflow button.
    await userEvent.tab();
    await expect(canvas.getByRole('link', { name: 'Companies' })).toHaveFocus();
    await userEvent.tab();
    await expect(more).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(more).toHaveAttribute('aria-expanded', 'true'));
    const items = await canvas.findAllByRole('menuitem');
    await expect(items.map((item) => item.textContent)).toEqual(
      expect.arrayContaining(hiddenCrumbs),
    );
    await expect(items).toHaveLength(hiddenCrumbs.length + 1);
    for (const item of items) {
      await expect(item.tagName).toBe('A');
      await expect(item).toHaveAttribute('href');
    }

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(more).toHaveAttribute('aria-expanded', 'false'));
    await expect(more).toHaveFocus();
  },
};

/**
 * Folded crumbs are plain links in the menu and honour `linkComponent`.
 * @summary Asserts overflow menu links use the injected linkComponent
 */
export const InteractionTestOverflowLinkComponent: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: { items: DEEP_TRAIL, linkComponent: MockLink },
  decorators: inContainer('520px'),
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole('button', { name: 'More breadcrumbs' }));
    const items = await canvas.findAllByRole('menuitem');
    await expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      await expect(item).toHaveAttribute('data-link-component', 'mock');
    }
  },
};

/**
 * A crumb with its own switcher never folds: the switcher-less crumbs around
 * it fold, each run behind its own button, and both switchers keep working.
 * @summary Asserts switcher crumbs stay visible while others fold
 */
export const InteractionTestOverflowSwitchers: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: {
    items: DEEP_TRAIL.map((item) =>
      item.label === 'Service Agreements'
        ? {
            ...item,
            switcher: { options: SIBLING_SERVICES, switchLabel: 'Switch agreement' },
          }
        : item.label === 'Amendment 4821'
          ? {
              ...item,
              switcher: { options: SIBLING_SERVICES, switchLabel: 'Switch amendment' },
            }
          : item,
    ),
  },
  decorators: inContainer('520px'),
  play: async ({ canvas }) => {
    const more = await canvas.findAllByRole('button', { name: 'More breadcrumbs' });
    await expect(canvas.getByRole('link', { name: 'Service Agreements' })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Switch amendment' })).toBeInTheDocument();

    // No overflow menu lists a switcher crumb.
    for (const button of more) {
      await userEvent.click(button);
      const items = await canvas.findAllByRole('menuitem');
      await expect(items.map((item) => item.textContent)).not.toContain('Service Agreements');
      await expect(items.map((item) => item.textContent)).not.toContain('Amendment 4821');
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(button).toHaveAttribute('aria-expanded', 'false'));
    }

    await userEvent.click(canvas.getByRole('button', { name: 'Switch agreement' }));
    await expect(await canvas.findAllByRole('menuitem')).toHaveLength(SIBLING_SERVICES.length);
  },
};

/** Waits out the measure → decide → render passes (ResizeObserver, then a re-render). */
const settleLayout = async () => {
  for (let frame = 0; frame < 4; frame++) {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
};

/**
 * `Companies / Company / Tab`, each with a switcher, in a container too narrow
 * for it: no overflow button, all three switchers present, and the company
 * label ellipsises with its full text as name and `title`.
 * @summary Asserts an all-switcher trail never folds
 */
export const InteractionTestOverflowSwitcherTrail: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: { items: COMPANY_TAB_TRAIL },
  decorators: inContainer('400px'),
  play: async ({ canvas }) => {
    await settleLayout();
    const company = canvas.getByRole('link', { name: 'Acme Holdings International' });
    await expect(company.scrollWidth).toBeGreaterThan(company.clientWidth);
    await expect(canvas.queryByRole('button', { name: 'More breadcrumbs' })).not.toBeInTheDocument();
    for (const name of ['Switch section', 'Switch company', 'Switch tab']) {
      await expect(canvas.getByRole('button', { name })).toBeInTheDocument();
    }
    await expect(company).toHaveAttribute('title', 'Acme Holdings International');
    await expect(canvas.getByRole('link', { name: 'Companies' })).toBeInTheDocument();
    await expect(canvas.getByText('Service Agreements')).toHaveAttribute('aria-current', 'page');
  },
};

/**
 * `Companies / Company / Projects / Project` with switchers on the first three
 * keeps the company crumb and its switcher in a narrow container.
 * @summary Asserts the four-crumb switcher trail never folds
 */
export const InteractionTestOverflowSwitcherProjectTrail: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: { items: COMPANY_PROJECT_TRAIL },
  decorators: inContainer('560px'),
  play: async ({ canvas }) => {
    await settleLayout();
    const company = canvas.getByRole('link', { name: 'Acme Holdings International' });
    await expect(company.scrollWidth).toBeGreaterThan(company.clientWidth);
    await expect(canvas.queryByRole('button', { name: 'More breadcrumbs' })).not.toBeInTheDocument();
    await expect(canvas.getAllByRole('link')).toHaveLength(3);
    // The longest labels shrink first; a short one keeps its text.
    const companies = canvas.getByRole('link', { name: 'Companies' });
    await expect(companies.scrollWidth).toBeLessThanOrEqual(companies.clientWidth);
    await userEvent.click(canvas.getByRole('button', { name: 'Switch company' }));
    await expect(await canvas.findAllByRole('menuitem')).toHaveLength(SIBLING_CLIENTS.length);
  },
};

/**
 * A short trail that fits its container shows every crumb and no overflow button.
 * @summary Asserts a three-crumb trail that fits has no overflow button
 */
export const InteractionTestFitsNoOverflow: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: {
    items: [
      { label: 'Home', href: '#' },
      { label: 'Products', href: '#' },
      { label: 'Design System' },
    ],
  },
  decorators: inContainer('520px'),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'Products' })).toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: 'More breadcrumbs' })).not.toBeInTheDocument();
  },
};

/**
 * At 375px the six-crumb trail is `… / last`: the overflow button holds every
 * other crumb.
 * @summary Asserts the 375px trail is the button plus the last crumb
 */
export const InteractionTestOverflowMobile: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: { items: DEEP_TRAIL },
  globals: { viewport: { value: 'mobile', isRotated: false } },
  play: async ({ canvas }) => {
    const more = await canvas.findByRole('button', { name: 'More breadcrumbs' });
    await expect(canvas.queryAllByRole('link')).toHaveLength(0);
    await expect(canvas.getByText('Signature Run 12')).toHaveAttribute('aria-current', 'page');
    await userEvent.click(more);
    await expect(await canvas.findAllByRole('menuitem')).toHaveLength(DEEP_TRAIL.length - 1);
  },
};

/**
 * A label past the max width truncates, and its full text is the link's
 * accessible name and its `title`.
 * @summary Asserts a long label truncates, keeping its full name
 */
export const InteractionTestLongLabel: Story = {
  tags: ['!manifest', 'interaction-test'],
  args: {
    items: [
      { label: 'Companies', href: '#companies' },
      {
        label:
          'Acme Holdings International Group of Dental and Orthodontic Practices Limited',
        href: '#acme',
      },
      { label: 'Signature Run 12' },
    ],
  },
  play: async ({ canvas }) => {
    const full = 'Acme Holdings International Group of Dental and Orthodontic Practices Limited';
    const link = await canvas.findByRole('link', { name: full });
    await expect(link).toHaveAttribute('title', full);
    await expect(getComputedStyle(link).textOverflow).toBe('ellipsis');
    await expect(link.scrollWidth).toBeGreaterThan(link.clientWidth);
  },
};
